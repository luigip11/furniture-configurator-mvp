// Inventario di sola lettura: segnala oggetti non referenziati, senza cancellare o modificare dati.
import { existsSync } from "node:fs";
import { getSupabaseAdmin } from "../src/lib/supabase/admin.ts";
import { PRODUCT_ASSET_BUCKET } from "../src/lib/admin/product-assets.ts";
import {
  isProductAssetReferenced,
  type ProductAssetReferences,
} from "../src/lib/admin/asset-references.ts";

// Usa l'ambiente locale di sviluppo se disponibile, senza esporre le credenziali nel report.
async function main() {
  for (const file of [".env.local", ".env"])
    if (existsSync(file)) process.loadEnvFile(file);
  const client = getSupabaseAdmin();
  const products: ProductAssetReferences[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("products")
      .select("preview_image_url,model_url,technical_file_url")
      .range(offset, offset + 499);
    if (error || !data)
      throw new Error(
        "Impossibile leggere tutti i riferimenti prodotti: report interrotto.",
      );
    products.push(...data);
    if (data.length < 500) break;
  }
  const bucket = client.storage.from(PRODUCT_ASSET_BUCKET);
  const unreferenced: {
    path: string;
    createdAt: string | null;
    recent: boolean;
  }[] = [];
  let scanned = 0;
  // Pagina le cartelle e tratta anche oggetti storici; quelli recenti possono appartenere a salvataggi in corso.
  async function scan(prefix = "", depth = 0) {
    if (depth > 10)
      throw new Error("Struttura storage troppo profonda: report interrotto.");
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await bucket.list(prefix, {
        limit: 1000,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error || !data)
        throw new Error("Impossibile completare l’inventario storage.");
      for (const entry of data) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (!entry.id && !entry.metadata) {
          await scan(path, depth + 1);
          continue;
        }
        scanned++;
        if (
          !isProductAssetReferenced(
            bucket.getPublicUrl(path).data.publicUrl,
            products,
          )
        ) {
          const created = entry.created_at ? Date.parse(entry.created_at) : NaN;
          unreferenced.push({
            path,
            createdAt: entry.created_at || null,
            recent:
              !Number.isFinite(created) || Date.now() - created < 86400000,
          });
        }
      }
      if (data.length < 1000) break;
    }
  }
  await scan();
  console.log(
    JSON.stringify(
      {
        readOnly: true,
        scanned,
        unreferenced,
        note: "Nessun file eliminato. Verificare salvataggi in corso e riferimenti esterni prima di qualsiasi pulizia manuale.",
      },
      null,
      2,
    ),
  );
}

main().catch(() => {
  console.error(
    "Inventario non completato. Verifica configurazione e accesso a Supabase; nessun file è stato modificato.",
  );
  process.exitCode = 1;
});
