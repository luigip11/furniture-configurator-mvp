import type { Category } from "@/types/configurator";

import { optionalText } from "./shared-form.ts";

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  sort_order: string;
};

export type CategoryPayload = Omit<Category, "id">;

export const emptyCategoryForm: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  sort_order: "",
};

// Genera uno slug stabile partendo dal nome inserito dall'utente.
export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Trasforma una categoria esistente nei valori modificabili dal form.
export function categoryToForm(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    sort_order:
      category.sort_order === null || category.sort_order === undefined
        ? ""
        : String(category.sort_order),
  };
}

// Costruisce il payload Supabase validando i campi obbligatori e gli edge case.
export function buildCategoryPayload(
  form: CategoryFormValues
): CategoryPayload {
  const name = form.name.trim();
  const slug = form.slug.trim() || slugify(name);
  const sortOrder = form.sort_order.trim();

  if (!name) {
    throw new Error("Nome categoria obbligatorio.");
  }

  if (!slug) {
    throw new Error("Slug categoria obbligatorio.");
  }

  if (sortOrder.length > 0 && !Number.isFinite(Number(sortOrder))) {
    throw new Error("Ordine deve essere un numero valido.");
  }

  return {
    name,
    slug,
    description: optionalText(form.description),
    sort_order: sortOrder.length > 0 ? Number(sortOrder) : null,
  };
}
