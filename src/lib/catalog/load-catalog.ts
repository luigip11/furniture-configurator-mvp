import type { Product } from "../../types/configurator.ts";

export type CatalogResult = { products: Product[]; failed: boolean };

// Distingue un risultato vuoto riuscito da errori restituiti o eccezioni di rete.
export async function loadPublishedCatalog(
  query: () => PromiseLike<{ data: Product[] | null; error: unknown }>,
): Promise<CatalogResult> {
  try {
    const { data, error } = await query();
    return error || !Array.isArray(data)
      ? { products: [], failed: true }
      : { products: data, failed: false };
  } catch {
    return { products: [], failed: true };
  }
}
