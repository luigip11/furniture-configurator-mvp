import assert from "node:assert/strict";
import test from "node:test";

import { getItemBillOfMaterials } from "../src/lib/configurator/module-technical-catalog.ts";
import type { ConfiguratorItem } from "../src/types/configurator.ts";

// Crea un modulo essenziale per verificare le formule della distinta parametrica.
function createItem(
  code: string,
  widthMm: number,
  heightMm: number,
  depthMm: number
): ConfiguratorItem {
  return {
    id: code,
    productId: code,
    nameIt: code,
    code,
    widthMm,
    heightMm,
    depthMm,
    position: [0, 0, 0],
    rotationY: 0,
    variantKey: "two_internal_sides",
  };
}

test("calcola base, top e due ante dalle quote correnti", () => {
  const item = createItem("BASE_CON_2_FIANCHI_INTERNI", 1400, 800, 600);
  item.baseFinishConfiguration = { hasTop: true, doorCount: "two" };

  const bom = getItemBillOfMaterials(item);

  assert.deepEqual(
    bom.map((component) => [
      component.code,
      component.quantity,
      component.widthMm,
      component.heightMm,
      component.depthMm,
    ]),
    [
      ["FIB", 2, null, 720, 600],
      ["RFV", 1, 1361, 54, null],
      ["SCHB", 1, 1361, 700.5, null],
      ["SOTTOBC", 1, 1361, null, 575],
      ["RIPINT", null, 1360.5, null, 545.5],
      ["TOPB", 1, 1400, null, 615],
      ["ANTAB", 2, 700, 720, null],
    ]
  );
});

test("mantiene lo schienale della colonna bassa a altezza meno 119 mm", () => {
  const item = createItem(
    "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX_E_DX",
    700,
    2282,
    665
  );

  const back = getItemBillOfMaterials(item).find(
    (component) => component.code === "SCHC"
  );

  assert.equal(back?.widthMm, 661);
  assert.equal(back?.heightMm, 2163);
});

test("ricalcola le quote del pensile orizzontale senza fissarle al campione 700 mm", () => {
  const item = createItem("PENSILE_ORIZZONTALE_A_VISTA_DX", 1400, 439, 350);
  const back = getItemBillOfMaterials(item).find(
    (component) => component.code === "SCHPVO"
  );

  assert.equal(back?.widthMm, 1361);
  assert.equal(back?.heightMm, 400);
});
