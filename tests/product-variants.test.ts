import assert from "node:assert/strict";
import test from "node:test";

import {
  getProductForVariant,
  getProductVariantKeys,
  getSafeProductVariant,
  groupProductsIntoFamilies,
} from "../src/lib/configurator/product-variants.ts";
import type { Product } from "../src/types/configurator.ts";

// Crea dati catalogo minimali per verificare l'unione delle varianti senza dipendere da Supabase.
function createProduct(code: string, id = code): Product {
  return {
    id,
    category_id: "columns",
    name_it: code,
    name_en: null,
    code,
    width_mm: 600,
    height_mm: 2100,
    depth_mm: 650,
    thickness_mm: 19.5,
    price: null,
    preview_image_url: null,
    model_url: `${code}.glb`,
    technical_file_url: null,
    is_published: true,
  };
}

test("riunisce le tre varianti di una colonna in una sola card catalogo", () => {
  const families = groupProductsIntoFamilies([
    createProduct("COLONNA_MISTA_IMPIANTO_ALTO_NON_A_VISTA"),
    createProduct("COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_DX"),
    createProduct("COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_SX_E_DX"),
  ]);

  assert.equal(families.length, 1);
  assert.deepEqual(getProductVariantKeys(families[0]?.variantProducts), [
    "two_visible_sides",
    "one_visible_one_internal",
    "two_internal_sides",
  ]);
  assert.equal(
    families[0]?.product.code,
    "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_SX_E_DX"
  );
});

test("usa una variante disponibile quando la selezione richiesta non esiste", () => {
  const variants = {
    one_visible_one_internal: createProduct("PENSILE_A_VISTA_DX"),
    two_internal_sides: createProduct("PENSILE_NON_A_VISTA"),
  };

  assert.equal(
    getSafeProductVariant(variants, "two_visible_sides"),
    "one_visible_one_internal"
  );
});

test("la variante selezionata conserva il GLB del suo record prodotto", () => {
  const visibleProduct = createProduct("COLONNA_A_VISTA_SX_E_DX");
  const internalProduct = createProduct("COLONNA_NON_A_VISTA");
  internalProduct.model_url = "https://cdn.example.test/colonna-interna.glb";

  const selectedProduct = getProductForVariant(
    {
      two_visible_sides: visibleProduct,
      two_internal_sides: internalProduct,
    },
    "two_internal_sides"
  );

  assert.equal(selectedProduct?.id, internalProduct.id);
  assert.equal(selectedProduct?.model_url, internalProduct.model_url);
});
