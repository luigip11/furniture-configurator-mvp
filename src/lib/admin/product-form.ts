import type { Product } from "@/types/configurator";

import { optionalNumber, optionalText, requiredNumber } from "./shared-form.ts";

export type ProductFormValues = {
  category_id: string;
  name_it: string;
  name_en: string;
  code: string;
  width_mm: string;
  height_mm: string;
  depth_mm: string;
  thickness_mm: string;
  price: string;
  preview_image_url: string;
  model_url: string;
  technical_file_url: string;
  is_published: boolean;
};

export type ProductPayload = Omit<Product, "id">;

export const emptyProductForm: ProductFormValues = {
  category_id: "",
  name_it: "",
  name_en: "",
  code: "",
  width_mm: "",
  height_mm: "",
  depth_mm: "",
  thickness_mm: "",
  price: "",
  preview_image_url: "",
  model_url: "",
  technical_file_url: "",
  is_published: false,
};

// Trasforma un prodotto esistente nei valori modificabili dal form.
export function productToForm(product: Product): ProductFormValues {
  return {
    category_id: product.category_id || "",
    name_it: product.name_it,
    name_en: product.name_en || "",
    code: product.code || "",
    width_mm: String(product.width_mm),
    height_mm: String(product.height_mm),
    depth_mm: String(product.depth_mm),
    thickness_mm:
      product.thickness_mm === null || product.thickness_mm === undefined
        ? ""
        : String(product.thickness_mm),
    price:
      product.price === null || product.price === undefined
        ? ""
        : String(product.price),
    preview_image_url: product.preview_image_url || "",
    model_url: product.model_url || "",
    technical_file_url: product.technical_file_url || "",
    is_published: product.is_published,
  };
}

// Costruisce il payload Supabase validando obbligatorieta, numeri e campi vuoti.
export function buildProductPayload(form: ProductFormValues): ProductPayload {
  const nameIt = form.name_it.trim();

  if (!nameIt) {
    throw new Error("Nome IT obbligatorio.");
  }

  return {
    category_id: optionalText(form.category_id),
    name_it: nameIt,
    name_en: optionalText(form.name_en),
    code: optionalText(form.code),
    width_mm: requiredNumber(form.width_mm, "Larghezza"),
    height_mm: requiredNumber(form.height_mm, "Altezza"),
    depth_mm: requiredNumber(form.depth_mm, "Profondita"),
    thickness_mm: optionalNumber(form.thickness_mm, "Spessore"),
    price: optionalNumber(form.price, "Prezzo"),
    preview_image_url: optionalText(form.preview_image_url),
    model_url: optionalText(form.model_url),
    technical_file_url: optionalText(form.technical_file_url),
    is_published: form.is_published,
  };
}
