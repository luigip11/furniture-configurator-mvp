import type { Product } from "@/types/configurator";

export type ProductSortOrder = "newest" | "oldest";

type ProductListOptions = {
  categoryNameById?: Map<string, string>;
  searchText: string;
  sortOrder: ProductSortOrder;
};

// Filtra e ordina i prodotti admin senza modificare l'array sorgente ricevuto dal server.
export function filterAndSortAdminProducts(
  products: Product[],
  { categoryNameById, searchText, sortOrder }: ProductListOptions
) {
  const normalizedSearchText = normalizeProductSearchText(searchText);

  return products
    .filter((product) => {
      if (!normalizedSearchText) return true;

      const categoryName = product.category_id
        ? categoryNameById?.get(product.category_id)
        : null;
      const searchableText = [
        product.name_it,
        product.name_en,
        product.code,
        categoryName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return normalizeProductSearchText(searchableText).includes(
        normalizedSearchText
      );
    })
    .toSorted((firstProduct, secondProduct) => {
      const firstDate = getProductCreatedTime(firstProduct);
      const secondDate = getProductCreatedTime(secondProduct);

      return sortOrder === "newest"
        ? secondDate - firstDate
        : firstDate - secondDate;
    });
}

// Rende la ricerca tollerante a underscore, slash e altri separatori nei codici prodotto.
function normalizeProductSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9àèéìòù]+/gi, " ")
    .replace(/\s+/g, " ");
}

// Usa created_at quando presente e ripiega su 0 per prodotti legacy senza timestamp serializzato.
function getProductCreatedTime(product: Product) {
  const createdAt = product.created_at;

  if (!createdAt) return 0;

  const timestamp = Date.parse(createdAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
