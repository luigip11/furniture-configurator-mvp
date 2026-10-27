import assert from "node:assert/strict";
import test from "node:test";

import {
  getProductForVariant,
  getProductVariantKeys,
  getSafeProductVariant,
  groupProductsIntoFamilies,
  searchCatalogFamilies,
  getCatalogGroupId,
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
    "visible_right",
    "two_internal_sides",
  ]);
  assert.equal(
    families[0]?.product.code,
    "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_SX_E_DX",
  );
});

test("usa una variante disponibile quando la selezione richiesta non esiste", () => {
  const variants = {
    one_visible_one_internal: createProduct("PENSILE_A_VISTA_DX"),
    two_internal_sides: createProduct("PENSILE_NON_A_VISTA"),
  };

  assert.equal(
    getSafeProductVariant(variants, "two_visible_sides"),
    "one_visible_one_internal",
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
    "two_internal_sides",
  );

  assert.equal(selectedProduct?.id, internalProduct.id);
  assert.equal(selectedProduct?.model_url, internalProduct.model_url);
});

test("conserva distintamente SX, DX e SX+DX nella stessa famiglia", () => {
  const products = ["SX", "DX", "SX_E_DX"].map((side) =>
    createProduct(`PENSILE_ORIZZONTALE_A_VISTA_${side}`),
  );
  const family = groupProductsIntoFamilies(products)[0];
  assert.equal(Object.keys(family.variantProducts).length, 3);
  assert.equal(
    family.variantProducts.visible_left?.id,
    "PENSILE_ORIZZONTALE_A_VISTA_SX",
  );
  assert.equal(
    family.variantProducts.visible_right?.id,
    "PENSILE_ORIZZONTALE_A_VISTA_DX",
  );
  assert.equal(
    family.variantProducts.two_visible_sides?.id,
    "PENSILE_ORIZZONTALE_A_VISTA_SX_E_DX",
  );
});

test("la ricerca del codice SX esatto non inserisce SX+DX e mantiene le altre varianti", () => {
  for (const prefix of [
    "COLONNA_MISTA_IMPIANTO_ALTO",
    "COLONNA_MISTA_IMPIANTO_BASSO",
    "PENSILE_ORIZZONTALE",
    "PENSILE_VERTICALE",
  ]) {
    const products = ["SX", "DX", "SX_E_DX"].map((side) =>
      createProduct(`${prefix}_A_VISTA_${side}`),
    );
    const [family] = searchCatalogFamilies(products, `${prefix}_A_VISTA_SX`);
    assert.equal(family.product.id, `${prefix}_A_VISTA_SX`);
    assert.equal(Object.keys(family.variantProducts).length, 3);
  }
});

test("ricerca non presente produce un catalogo vuoto senza alterare il catalogo sorgente", () => {
  const products = [createProduct("BASE_CON_2_FIANCHI_INTERNI")];
  assert.deepEqual(searchCatalogFamilies(products, "inesistente"), []);
  assert.equal(searchCatalogFamilies(products, "  ").length, 1);
  assert.equal(products[0].code, "BASE_CON_2_FIANCHI_INTERNI");
});

test("le basi con fianchi portanti appartengono alla lavanderia e non ai portali", () => {
  assert.equal(
    getCatalogGroupId(
      createProduct("BASE_LAVATRICE_ASCIUGATRICE_FIANCHI_PORTANTI_2"),
    ),
    "laundry",
  );
  assert.equal(
    getCatalogGroupId(createProduct("PORTALE_BASI_LAVATRICE_ASCIUGATRICE")),
    "portal",
  );
  assert.equal(getCatalogGroupId(createProduct("PORTALE-FIL")), "portal");
  assert.equal(
    getCatalogGroupId(createProduct("PENSILE_VERTICALE_NON_A_VISTA")),
    "wallUnits",
  );
});
