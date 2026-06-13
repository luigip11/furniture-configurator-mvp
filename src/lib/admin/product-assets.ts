import type { ProductFormValues } from "@/lib/admin/product-form";

export const PRODUCT_ASSET_BUCKET = "produce-assets";

export type ProductAssetField = Extract<
  keyof ProductFormValues,
  "preview_image_url" | "model_url" | "technical_file_url"
>;

type ProductAssetConfig = {
  acceptedExtensions: string[];
  folder: string;
  maxSizeMb: number;
};

type ProductAssetFileLike = {
  name: string;
  size: number;
  type?: string;
};

const PRODUCT_ASSET_CONFIG: Record<ProductAssetField, ProductAssetConfig> = {
  preview_image_url: {
    acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    folder: "previews",
    maxSizeMb: 8,
  },
  model_url: {
    acceptedExtensions: [".glb", ".gltf"],
    folder: "models",
    maxSizeMb: 80,
  },
  technical_file_url: {
    acceptedExtensions: [".rfa", ".pdf", ".dwg", ".zip"],
    folder: "technical",
    maxSizeMb: 180,
  },
};

// Restituisce la lista di estensioni accettate dal campo asset del form.
export function getProductAssetAccept(field: ProductAssetField) {
  return PRODUCT_ASSET_CONFIG[field].acceptedExtensions.join(",");
}

// Valida estensione e dimensione prima di inviare file pesanti a Supabase Storage.
export function validateProductAssetFile(
  field: ProductAssetField,
  file: ProductAssetFileLike
) {
  const config = PRODUCT_ASSET_CONFIG[field];
  const fileName = file.name.trim().toLowerCase();
  const hasAcceptedExtension = config.acceptedExtensions.some((extension) =>
    fileName.endsWith(extension)
  );

  if (!hasAcceptedExtension) {
    throw new Error(
      `Formato non supportato. Usa: ${config.acceptedExtensions.join(", ")}.`
    );
  }

  if (file.size > config.maxSizeMb * 1024 * 1024) {
    throw new Error(`File troppo grande. Limite: ${config.maxSizeMb} MB.`);
  }
}

// Genera un percorso stabile e leggibile per raggruppare gli asset per codice prodotto.
export function buildProductAssetPath({
  field,
  fileName,
  productCode,
  randomSuffix,
  timestamp,
}: {
  field: ProductAssetField;
  fileName: string;
  productCode?: string | null;
  randomSuffix: string;
  timestamp: number;
}) {
  const config = PRODUCT_ASSET_CONFIG[field];
  const productFolder = slugifyStorageSegment(productCode || "senza-codice");
  const safeFileName = sanitizeStorageFileName(fileName);

  return `${config.folder}/${productFolder}/${timestamp}-${randomSuffix}-${safeFileName}`;
}

// Carica un asset prodotto e restituisce l'URL pubblico da salvare nel database.
export async function uploadProductAsset({
  field,
  file,
  productCode,
}: {
  field: ProductAssetField;
  file: File;
  productCode?: string | null;
}) {
  validateProductAssetFile(field, file);
  const { supabase } = await import("@/lib/supabase/client");

  const path = buildProductAssetPath({
    field,
    fileName: file.name,
    productCode,
    randomSuffix: crypto.randomUUID().slice(0, 8),
    timestamp: Date.now(),
  });
  const { error } = await supabase.storage
    .from(PRODUCT_ASSET_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(PRODUCT_ASSET_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

// Normalizza il nome file evitando caratteri problematici nei path storage.
function sanitizeStorageFileName(fileName: string) {
  const fallbackName = "asset";
  const normalizedName = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return normalizedName || fallbackName;
}

// Normalizza il codice prodotto in una cartella leggibile.
function slugifyStorageSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "senza-codice"
  );
}
