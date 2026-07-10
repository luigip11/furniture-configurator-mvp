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

test("le formule dimensionali dell'Excel restano esplicite nella distinta tecnica", () => {
  const bom = getModuleBillOfMaterials(
    "CONTENITORE_IMPIANTI_CON_2_FIANCHI_A_VISTA",
    "two_visible_sides"
  );
  const top = bom.find((component) => component.name.includes("TOP COPERTURA"));

  assert.equal(top?.depthMm, "665+19,5+15");
  assert.equal(top?.thicknessMm, 19.5);
});

test("un prodotto non censito mantiene le tre varianti standard", () => {
  assert.deepEqual(getAvailableModuleVariants("CUSTOM"), [
    "two_visible_sides",
    "one_visible_one_internal",
    "two_internal_sides",
  ]);
});
