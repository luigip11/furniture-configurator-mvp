import assert from "node:assert/strict";
import test from "node:test";

import {
  getAvailableModuleVariants,
  getModuleBillOfMaterials,
  getSafeModuleVariant,
  hasConfigurableModuleVariants,
} from "../src/lib/configurator/module-technical-catalog.ts";

test("il contenitore impianti espone solo le varianti previste dalla legenda", () => {
  assert.deepEqual(getAvailableModuleVariants("CONT-IMP"), [
    "two_visible_sides",
    "one_visible_one_internal",
  ]);
  assert.equal(
    getSafeModuleVariant("CONT-IMP", "two_internal_sides"),
    "two_visible_sides"
  );
});

test("il portale FIL non usa varianti fianchi configurabili", () => {
  assert.equal(hasConfigurableModuleVariants("PORT-FIL"), false);
  assert.deepEqual(getAvailableModuleVariants("PORT-FIL"), []);
});

test("i pensili hanno distinta tecnica per le tre varianti", () => {
  assert.equal(
    getModuleBillOfMaterials("PENSILE-VERTICALE", "two_visible_sides").length,
    5
  );
  assert.equal(
    getModuleBillOfMaterials("PENSILE-ORIZZONTALE", "two_internal_sides")[0]
      .code,
    "FIP0"
  );
});

test("i prodotti importati usano le misure decimali esatte della legenda Excel", () => {
  const bom = getModuleBillOfMaterials(
    "PENSILE_VERTICALE_A_VISTA_SX",
    "one_visible_one_internal"
  );

  assert.equal(bom[0]?.code, "FAVPV");
  assert.equal(bom[0]?.heightMm, 878);
  assert.equal(bom[0]?.depthMm, 350);
  assert.equal(bom[0]?.thicknessMm, 19.5);
});

test("il top opzionale del contenitore usa le misure calcolate nel configuratore aggiornato", () => {
  const bom = getModuleBillOfMaterials(
    "CONTENITORE_IMPIANTI_CON_2_FIANCHI_A_VISTA",
    "two_visible_sides"
  );
  const top = bom.find((component) => component.name.includes("TOP COPERTURA"));

  assert.equal(top?.widthMm, 730);
  assert.equal(top?.depthMm, 699.5);
  assert.equal(top?.thicknessMm, 19.5);
});

test("le colonne libera alto e basso mantengono distinte tecniche differenti", () => {
  const alto = getModuleBillOfMaterials(
    "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_DX",
    "one_visible_one_internal"
  );
  const basso = getModuleBillOfMaterials(
    "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_DX",
    "one_visible_one_internal"
  );

  assert.equal(alto.some((component) => component.code === "RFVP"), true);
  assert.equal(basso.some((component) => component.code === "RRAVR"), true);
  assert.equal(basso.some((component) => component.code === "SOTTOBC"), false);
});

test("la variante mista del sottolavatoio conserva un fianco per ciascun tipo", () => {
  const bom = getModuleBillOfMaterials(
    "BASE_SOTTOLAVATOIO_CON_1_FIANCHIA_VISTA_1_INTERNO",
    "one_visible_one_internal"
  );

  assert.deepEqual(
    bom.slice(0, 2).map((component) => [component.code, component.quantity]),
    [["FAVSOTTOLAV", 1], ["FISOTTOLAV", 1]]
  );
});

test("un prodotto non censito mantiene le tre varianti standard", () => {
  assert.deepEqual(getAvailableModuleVariants("CUSTOM"), [
    "two_visible_sides",
    "one_visible_one_internal",
    "two_internal_sides",
  ]);
});
