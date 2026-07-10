import assert from "node:assert/strict";
import test from "node:test";

import { filterAndSortAdminProducts } from "../src/lib/admin/product-list.ts";
import type { Product } from "../src/types/configurator.ts";

const baseProduct = {
  category_id: null,
  code: null,
  depth_mm: 1,
  height_mm: 1,
  is_published: true,
  model_url: null,
  name_en: null,
  preview_image_url: null,
  price: null,
  technical_file_url: null,
  thickness_mm: null,
  width_mm: 1,
} satisfies Omit<Product, "id" | "name_it">;

test("filterAndSortAdminProducts ordina i prodotti dal più recente", () => {
  const products: Product[] = [
    {
      ...baseProduct,
      created_at: "2026-07-01T10:00:00.000Z",
      id: "old",
      name_it: "Vecchio",
    },
    {
      ...baseProduct,
      created_at: "2026-07-10T10:00:00.000Z",
      id: "new",
      name_it: "Nuovo",
    },
  ];

  assert.deepEqual(
    filterAndSortAdminProducts(products, {
      searchText: "",
      sortOrder: "newest",
    }).map((product) => product.id),
    ["new", "old"]
  );
});

test("filterAndSortAdminProducts cerca anche in codice e categoria", () => {
  const products: Product[] = [
    {
      ...baseProduct,
      category_id: "cat-1",
      code: "PENSILE_VERTICALE_A_VISTA_SX",
      id: "pensile",
      name_it: "Pensile verticale",
    },
    {
      ...baseProduct,
      category_id: "cat-2",
      code: "BASE_CON_2_FIANCHI",
      id: "base",
      name_it: "Base",
    },
  ];
  const categoryNameById = new Map([
    ["cat-1", "Pensili"],
    ["cat-2", "Basi"],
  ]);

  assert.deepEqual(
    filterAndSortAdminProducts(products, {
      categoryNameById,
      searchText: "vista sx",
      sortOrder: "oldest",
    }).map((product) => product.id),
    ["pensile"]
  );

  assert.deepEqual(
    filterAndSortAdminProducts(products, {
      categoryNameById,
      searchText: "basi",
      sortOrder: "oldest",
    }).map((product) => product.id),
    ["base"]
  );
});
