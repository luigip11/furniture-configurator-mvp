#!/usr/bin/env node
/**
 * Carica il manifest catalogo su Supabase Storage e aggiorna le tabelle catalogo.
 *
 * Di default esegue solo una simulazione. Usare `--apply` con
 * SUPABASE_SERVICE_ROLE_KEY in .env.local per scrivere davvero su Supabase,
 * lasciando i nuovi prodotti in bozza come indicato dal manifest.
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DEFAULT_MANIFEST = path.join(
  ROOT,
  "incoming/catalogo-committente/audit/catalog-products.generated.json"
);
const BUCKET = "product-assets";

// Legge un file .env semplice senza dipendenze aggiuntive.
async function readDotEnv(filePath) {
  const content = await readFile(filePath, "utf8");
  const values = new Map();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    values.set(key, rawValue.replace(/^["']|["']$/g, ""));
  }

  return values;
}

// Restituisce content-type coerenti per gli asset caricati nello storage.
function getContentType(filePath) {
  if (filePath.toLowerCase().endsWith(".glb")) return "model/gltf-binary";
  if (filePath.toLowerCase().endsWith(".gltf")) return "model/gltf+json";
  return "application/octet-stream";
}

// Carica un singolo GLB e ritorna l'URL pubblico da salvare sul prodotto.
async function uploadModel({ product, supabase, apply }) {
  const absoluteModelPath = path.join(ROOT, product.local_model_path);
  const storagePath = product.storage_model_path;

  if (apply) {
    const fileBuffer = await readFile(absoluteModelPath);
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
      cacheControl: "3600",
      contentType: getContentType(absoluteModelPath),
      upsert: true,
    });

    if (error) {
      throw new Error(`Upload fallito per ${product.code}: ${formatSupabaseError(error)}`);
    }
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// Inserisce o aggiorna una categoria usando lo slug come chiave stabile.
async function upsertCategory({ category, supabase, apply }) {
  if (!apply) return;

  const { error } = await supabase.from("categories").upsert(category, {
    onConflict: "slug",
  });

  if (error) {
    throw new Error(`Upsert categoria fallito per ${category.slug}: ${formatSupabaseError(error)}`);
  }
}

// Inserisce o aggiorna un prodotto usando il code come chiave stabile.
async function upsertProduct({ product, supabase, apply }) {
  if (!apply) return;

  const { data: existingProduct, error: lookupError } = await supabase
    .from("products")
    .select("id")
    .eq("code", product.code)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Lookup prodotto fallito per ${product.code}: ${formatSupabaseError(lookupError)}`);
  }

  const { error } = existingProduct?.id
    ? await supabase.from("products").update(product).eq("id", existingProduct.id)
    : await supabase.from("products").insert(product);

  if (error) {
    throw new Error(`Upsert prodotto fallito per ${product.code}: ${formatSupabaseError(error)}`);
  }
}

// Espone anche la causa tecnica degli errori fetch, utile quando DNS o rete falliscono.
function formatSupabaseError(error) {
  const cause = error?.cause;
  const causeDetails = cause?.code || cause?.message ? ` (${cause?.code || "no_code"}: ${cause?.message || "no message"})` : "";
  return `${error?.message || String(error)}${causeDetails}`;
}

// Esegue l'import completo del manifest generato dall'audit.
async function run() {
  const apply = process.argv.includes("--apply");
  const manifestArgIndex = process.argv.indexOf("--manifest");
  const manifestPath =
    manifestArgIndex >= 0 ? path.resolve(process.argv[manifestArgIndex + 1]) : DEFAULT_MANIFEST;
  const env = await readDotEnv(path.join(ROOT, ".env.local"));
  const supabaseUrl = env.get("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRoleKey = env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseAnonKey = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabaseKey = apply ? supabaseServiceRoleKey : supabaseServiceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      apply
        ? "NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local."
        : "NEXT_PUBLIC_SUPABASE_URL o una chiave Supabase mancante in .env.local."
    );
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const supabase = createClient(supabaseUrl, supabaseKey);
  const categories = new Map();

  for (const product of manifest) {
    categories.set(product.category_slug, {
      name: product.category_name,
      slug: product.category_slug,
      description: null,
      sort_order: null,
    });
  }

  console.log(`${apply ? "APPLY" : "DRY RUN"}: ${manifest.length} prodotti, ${categories.size} categorie`);

  for (const category of categories.values()) {
    await upsertCategory({ category, supabase, apply });
  }

  for (const manifestProduct of manifest) {
    const modelUrl = await uploadModel({
      product: manifestProduct,
      supabase,
      apply,
    });
    const { data: category } = apply
      ? await supabase
          .from("categories")
          .select("id")
          .eq("slug", manifestProduct.category_slug)
          .single()
      : { data: { id: "dry-run-category-id" } };

    if (!category?.id) {
      throw new Error(`Categoria non trovata per ${manifestProduct.code}: ${manifestProduct.category_slug}`);
    }

    await upsertProduct({
      apply,
      supabase,
      product: {
        category_id: category.id,
        name_it: manifestProduct.name_it,
        name_en: manifestProduct.name_en,
        code: manifestProduct.code,
        width_mm: manifestProduct.width_mm,
        height_mm: manifestProduct.height_mm,
        depth_mm: manifestProduct.depth_mm,
        thickness_mm: manifestProduct.thickness_mm,
        price: manifestProduct.price,
        preview_image_url: manifestProduct.preview_image_url,
        model_url: modelUrl,
        technical_file_url: manifestProduct.technical_file_url,
        is_published: manifestProduct.is_published,
      },
    });

    console.log(`${apply ? "importato" : "simulato"} ${manifestProduct.code}`);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
