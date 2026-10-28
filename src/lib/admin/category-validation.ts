import type { CategoryPayload } from "./category-form.ts";
import { validatedRecord, validatedText } from "./input-validation.ts";

// Protegge form e API categorie con le stesse regole, inclusi slug e interi PostgreSQL.
export function validateCategoryPayload(input: unknown): CategoryPayload {
  const data = validatedRecord(input, [
    "name",
    "slug",
    "description",
    "sort_order",
  ]);
  const name = validatedText(data.name, "Nome categoria", 200, true)!;
  const slug = validatedText(data.slug, "Slug categoria", 200, true)!;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(
      "Slug non valido: usa lettere minuscole, numeri e trattini.",
    );
  const order = data.sort_order ?? null;
  if (
    order !== null &&
    (typeof order !== "number" ||
      !Number.isInteger(order) ||
      order < -2147483648 ||
      order > 2147483647)
  )
    throw new Error("Ordine deve essere un intero valido.");
  return {
    name,
    slug,
    description: validatedText(data.description, "Descrizione", 2000),
    sort_order: order as number | null,
  };
}
