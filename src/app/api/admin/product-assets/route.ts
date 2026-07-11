import {
  buildProductAssetPath,
  PRODUCT_ASSET_BUCKET,
  validateProductAssetFile,
  type ProductAssetField,
} from "@/lib/admin/product-assets";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const PRODUCT_ASSET_FIELDS: ProductAssetField[] = [
  "preview_image_url",
  "model_url",
  "technical_file_url",
];

// Carica asset admin da server per evitare i blocchi RLS dello storage pubblico.
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const field = formData.get("field");
  const productCode = formData.get("productCode");

  if (!(file instanceof File)) {
    return Response.json({ message: "File mancante." }, { status: 400 });
  }

  if (!isProductAssetField(field)) {
    return Response.json({ message: "Campo asset non valido." }, { status: 400 });
  }

  try {
    validateProductAssetFile(field, file);
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "File asset non valido.",
      },
      { status: 400 }
    );
  }

  const path = buildProductAssetPath({
    field,
    fileName: file.name,
    productCode: typeof productCode === "string" ? productCode : null,
    randomSuffix: crypto.randomUUID().slice(0, 8),
    timestamp: Date.now(),
  });
  const { error } = await getSupabaseAdmin()
    .storage
    .from(PRODUCT_ASSET_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  const { data } = getSupabaseAdmin()
    .storage
    .from(PRODUCT_ASSET_BUCKET)
    .getPublicUrl(path);

  return Response.json({ publicUrl: data.publicUrl });
}

function isProductAssetField(value: FormDataEntryValue | null): value is ProductAssetField {
  return (
    typeof value === "string" &&
    PRODUCT_ASSET_FIELDS.includes(value as ProductAssetField)
  );
}
