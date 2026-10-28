import type { ProductPayload } from "./product-form.ts";
import { hasValidModuleDimensions } from "../configurator/composition-constraints.ts";
import {
  validatedAssetUrl,
  validatedRecord,
  validatedText,
  validatedUuid,
} from "./input-validation.ts";

export const PRODUCT_PAYLOAD_FIELDS = [
  "category_id",
  "name_it",
  "name_en",
  "code",
  "width_mm",
  "height_mm",
  "depth_mm",
  "thickness_mm",
  "price",
  "preview_image_url",
  "model_url",
  "technical_file_url",
  "is_published",
] as const;

// Valida e ricostruisce lo stesso payload nei form e nelle API, senza inoltrare campi arbitrari a Supabase.
export function validateProductPayload(input: unknown): ProductPayload {
  const data = validatedRecord(input, PRODUCT_PAYLOAD_FIELDS);
  const name = validatedText(data.name_it, "Nome IT", 200, true)!;
  const code = validatedText(data.code, "Codice", 120);
  for (const [key, label] of [
    ["width_mm", "Larghezza"],
    ["height_mm", "Altezza"],
    ["depth_mm", "Profondita"],
  ] as const) {
    if (typeof data[key] !== "number" || !Number.isFinite(data[key]))
      throw new Error(`${label} deve essere un numero valido.`);
  }
  const dimensions = {
    code,
    widthMm: data.width_mm as number,
    heightMm: data.height_mm as number,
    depthMm: data.depth_mm as number,
  };
  if (!hasValidModuleDimensions(dimensions))
    throw new Error("Dimensioni fuori dai limiti del configuratore.");
  const thickness = data.thickness_mm ?? null;
  if (
    thickness !== null &&
    (typeof thickness !== "number" ||
      !Number.isFinite(thickness) ||
      thickness <= 0 ||
      thickness >
        Math.min(dimensions.widthMm, dimensions.heightMm, dimensions.depthMm))
  )
    throw new Error("Spessore non valido.");
  const price = data.price ?? null;
  if (
    price !== null &&
    (typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(Math.round(price * 100)))
  )
    throw new Error("Prezzo non valido.");
  if (typeof data.is_published !== "boolean")
    throw new Error("Stato pubblicazione non valido.");
  return {
    name_it: name,
    name_en: validatedText(data.name_en, "Nome EN", 200),
    code,
    category_id: validatedUuid(data.category_id, "Categoria"),
    width_mm: dimensions.widthMm,
    height_mm: dimensions.heightMm,
    depth_mm: dimensions.depthMm,
    thickness_mm: thickness as number | null,
    price: price as number | null,
    preview_image_url: validatedAssetUrl(data.preview_image_url),
    model_url: validatedAssetUrl(data.model_url),
    technical_file_url: validatedAssetUrl(data.technical_file_url),
    is_published: data.is_published,
  };
}
