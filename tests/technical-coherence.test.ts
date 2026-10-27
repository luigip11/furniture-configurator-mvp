import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { createConfiguratorStore } from "../src/store/configurator-store.ts";
import {
  getCompositionFootprint,
  getItemInstalledBounds,
} from "../src/lib/configurator/module-envelope.ts";
import { getEffectiveDoorConfiguration } from "../src/lib/configurator/module-capabilities.ts";
import { getParametricPreviewPanels } from "../src/lib/configurator/parametric-preview.ts";
import { getItemBillOfMaterials } from "../src/lib/configurator/module-technical-catalog.ts";
import { hasParametricBillOfMaterials } from "../src/lib/configurator/parametric-bom.ts";
import { fitGltfScene } from "../src/lib/configurator/gltf-scene-fit.ts";
import {
  createTechnicalSheetPdf,
  createAggregatedTechnicalSheetPdf,
} from "../src/lib/configurator/technical-sheet-pdf.ts";
import { getTechnicalIssue } from "../src/lib/configurator/technical-validation.ts";
import { getComponentQuantity } from "../src/lib/configurator/aggregated-bom.ts";
import {
  getAlignedPositionForSceneMode,
  clampItemPositionToGridBounds,
} from "../src/store/configurator-calculations.ts";
import type { Product, ConfiguratorItem } from "../src/types/configurator.ts";

const date = new Date("2026-10-27T12:00:00Z");

// Costruisce un record minimo senza leggere o scrivere il catalogo del cliente.
function product(
  code = "BASE_CON_2_FIANCHI_INTERNI",
  overrides: Partial<Product> = {},
): Product {
  return {
    id: code,
    code,
    category_id: null,
    name_it: code,
    name_en: null,
    width_mm: 700,
    height_mm: 880,
    depth_mm: 665,
    thickness_mm: 19.5,
    price: null,
    preview_image_url: null,
    technical_file_url: null,
    model_url: null,
    is_published: true,
    ...overrides,
  };
}

// Ogni prova usa uno store nuovo per non condividere storico o configurazioni.
function withItem(p = product()) {
  const store = createConfiguratorStore();
  store.getState().addProduct(p);
  return store;
}

test("una variante statica conserva le quote catalogo anche chiamando direttamente lo store", () => {
  const store = withItem(
    product("COLONNA_MISTA_IMPIANTO_ALTO_NON_A_VISTA", { height_mm: 2282 }),
  );
  const before = store.getState();
  store.getState().updateItem(before.selectedItemId!, { widthMm: 1400 });
  assert.equal(store.getState().configurationError, "dimensionsLocked");
  assert.equal(store.getState().items, before.items);
  assert.equal(store.getState().past, before.past);
  assert.equal(getTechnicalIssue(before.items[0]), null);
});

test("nessuna distinta statica viene riutilizzata dopo una modifica esterna delle quote", () => {
  const item = withItem(
    product("COLONNA_MISTA_IMPIANTO_ALTO_NON_A_VISTA", { height_mm: 2282 }),
  ).getState().items[0];
  const changed = { ...item, widthMm: 1400 };
  assert.deepEqual(getItemBillOfMaterials(changed), []);
  assert.equal(getTechnicalIssue(changed), "dimensions");
  assert.throws(
    () => createTechnicalSheetPdf([changed], "it", date),
    /non esportabile/,
  );
  assert.throws(
    () => createAggregatedTechnicalSheetPdf([changed], "it", date),
    /non esportabile/,
  );
});

for (const code of [
  "BASE_CON_2_FIANCHI_INTERNI",
  "BASE_SOTTOLAVELLO_CON_2_FIANCHI_INTERNI",
  "PENSILE_ORIZZONTALE_A_VISTA_DX",
  "PENSILE_ORIZZONTALE_A_VISTA_SX",
  "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX_E_DX",
  "BASE_SOTTOLAVATOIO_CON_1_FIANCHIA_VISTA_1_INTERNO",
]) {
  test(`quote e vista parametrica seguono le formule disponibili: ${code}`, () => {
    const store = withItem(product(code));
    const id = store.getState().selectedItemId!;
    store
      .getState()
      .updateItem(id, { widthMm: 1400, heightMm: 2400, depthMm: 800 });
    const item = store.getState().items[0];
    assert.equal(hasParametricBillOfMaterials(code), true);
    assert.equal(store.getState().configurationError, null);
    assert.equal(getTechnicalIssue(item), null);
    const panels = getParametricPreviewPanels(item)!;
    assert.ok(panels.length > 0);
    assert.ok(
      panels.every((panel) =>
        panel.sizeMm.every((v) => Number.isFinite(v) && v > 0),
      ),
    );
    assert.ok(
      panels
        .filter(
          (panel) =>
            panel.code.startsWith("FI") || panel.code.startsWith("FAV"),
        )
        .every((panel) => panel.sizeMm[0] === 19.5),
    );
    assert.ok(
      getItemBillOfMaterials(item).some(
        (row) => row.widthMm === 1361 || row.heightMm === 2400,
      ),
    );
  });
}

test("top e ante nominali hanno una sola fonte per stato, vista e distinta", () => {
  const store = withItem();
  const id = store.getState().selectedItemId!;
  assert.equal(
    getEffectiveDoorConfiguration(store.getState().items[0]),
    undefined,
  );
  store
    .getState()
    .updateDoorConfiguration(id, { count: "two", coating: "mgr_basin_handle" });
  assert.equal(
    store.getState().items[0].baseFinishConfiguration?.doorCount,
    "two",
  );
  assert.equal(
    getItemBillOfMaterials(store.getState().items[0]).find(
      (r) => r.code === "ANTAB",
    )?.quantity,
    2,
  );
  store
    .getState()
    .updateBaseFinishConfiguration(id, { doorCount: "one", hasTop: true });
  assert.equal(
    getEffectiveDoorConfiguration(store.getState().items[0])?.count,
    "one",
  );
  assert.equal(
    getEffectiveDoorConfiguration(store.getState().items[0])?.coating,
    "mgr_basin_handle",
  );
  store
    .getState()
    .updateBaseFinishConfiguration(id, { doorCount: "none", hasTop: false });
  assert.equal(
    getEffectiveDoorConfiguration(store.getState().items[0]),
    undefined,
  );
  assert.ok(
    !getParametricPreviewPanels(store.getState().items[0])!.some((p) =>
      ["ANTAB", "TOPB", "RIPINT"].includes(p.code),
    ),
  );
  store.getState().undo();
  assert.equal(
    getEffectiveDoorConfiguration(store.getState().items[0])?.count,
    "one",
  );
});

test("pannelli opzionali e ingombro installato coincidono senza scalare gli spessori", () => {
  const store = withItem();
  store
    .getState()
    .updateBaseFinishConfiguration(store.getState().selectedItemId!, {
      hasTop: true,
      doorCount: "two",
    });
  const item = store.getState().items[0];
  const panels = getParametricPreviewPanels(item)!;
  const bounds = getItemInstalledBounds(item);
  assert.equal(panels.filter((p) => p.code === "ANTAB").length, 2);
  assert.equal(
    Math.max(...panels.map((p) => p.positionMm[1] + p.sizeMm[1] / 2)),
    bounds.maxY,
  );
  assert.equal(
    Math.max(...panels.map((p) => p.positionMm[2] + p.sizeMm[2] / 2)),
    bounds.maxZ,
  );
  assert.deepEqual(getCompositionFootprint([item]), {
    count: 1,
    widthMm: 700,
    heightMm: 899.5,
    depthMm: 684.5,
  });
});

test("le sporgenze del top e delle ante rispettano il filo dopo ogni rotazione", () => {
  const store = withItem();
  store
    .getState()
    .updateBaseFinishConfiguration(store.getState().selectedItemId!, {
      hasTop: true,
      doorCount: "two",
    });
  for (const rotationY of [0, 90, 180, 270]) {
    const item = { ...store.getState().items[0], rotationY };
    for (const mode of ["wall", "front"] as const) {
      const aligned = {
        ...item,
        position: getAlignedPositionForSceneMode(item, mode),
      };
      const bounds = getItemInstalledBounds(aligned);
      assert.ok(Math.abs(mode === "wall" ? bounds.minZ : bounds.maxZ) < 1e-6);
    }
    const clamped = {
      ...item,
      position: clampItemPositionToGridBounds(item, [100, 0, -100]),
    };
    const bounds = getItemInstalledBounds(clamped);
    assert.ok(bounds.maxX <= 4900 + 1e-6 && bounds.minZ >= -4900 - 1e-6);
  }
});

test("gli optional vengono rifiutati se rendono troppo larga una fila ruotata", () => {
  const store = createConfiguratorStore();
  for (let i = 0; i < 14; i++) {
    store.getState().addProduct(product(undefined, { depth_mm: 700 }));
    store.getState().rotateItem(store.getState().selectedItemId!);
  }
  const before = store.getState();
  store
    .getState()
    .updateBaseFinishConfiguration(before.selectedItemId!, { hasTop: true });
  assert.equal(store.getState().configurationError, "capacityExceeded");
  assert.equal(store.getState().items, before.items);
  assert.equal(store.getState().past, before.past);
});

test("il cambio a una variante statica richiede il ripristino delle quote nominali", () => {
  const store = createConfiguratorStore();
  const left = product("PENSILE_ORIZZONTALE_A_VISTA_SX", {
    height_mm: 439,
    depth_mm: 350,
  });
  const full = product("PENSILE_ORIZZONTALE_A_VISTA_SX_E_DX", {
    height_mm: 439,
    depth_mm: 350,
  });
  store
    .getState()
    .addProduct(left, { visible_left: left, two_visible_sides: full });
  const id = store.getState().selectedItemId!;
  store.getState().updateItem(id, { widthMm: 1000 });
  const before = store.getState();
  store.getState().updateVariant(id, "two_visible_sides");
  assert.equal(store.getState().configurationError, "dimensionsLocked");
  assert.equal(store.getState().items, before.items);
  store.getState().updateItem(id, { ...before.items[0].catalogDimensions! });
  store.getState().updateVariant(id, "two_visible_sides");
  assert.equal(store.getState().items[0].code, full.code);
});

test("i GLB conservano le trasformazioni sorgenti e coincidono con il volume richiesto", () => {
  const source = new THREE.Group();
  source.scale.set(2, 3, 4);
  source.position.set(10, 20, -30);
  source.add(new THREE.Mesh(new THREE.BoxGeometry(2, 4, 6)));
  const original = source.toJSON();
  for (const code of [
    "BASE_CON_2_FIANCHIA_VISTA",
    "PENSILE_VERTICALE_A_VISTA_SX",
  ]) {
    const fitted = fitGltfScene(source, code, {
      width: 1,
      height: 2.4,
      depth: 0.8,
    });
    const bounds = new THREE.Box3().setFromObject(fitted);
    const size = bounds.getSize(new THREE.Vector3());
    assert.ok(
      Math.abs(size.x - 1) < 1e-6 &&
        Math.abs(size.y - 2.4) < 1e-6 &&
        Math.abs(size.z - 0.8) < 1e-6,
    );
    assert.ok(Math.abs(bounds.min.y) < 1e-6);
    assert.ok(
      Math.abs(bounds.min.x + bounds.max.x) < 1e-6 &&
        Math.abs(bounds.min.z + bounds.max.z) < 1e-6,
    );
  }
  assert.deepEqual(source.toJSON(), original);
  assert.throws(
    () =>
      fitGltfScene(new THREE.Group(), null, { width: 1, height: 1, depth: 1 }),
    /volume/,
  );
});

test("PDF e scena includono i 1400 mm di montaggio del pensile", () => {
  const item = withItem(
    product("PENSILE_ORIZZONTALE_A_VISTA_DX", {
      height_mm: 439,
      depth_mm: 350,
    }),
  ).getState().items[0];
  assert.equal(getCompositionFootprint([item]).heightMm, 1839);
  const pdf = createTechnicalSheetPdf([item], "it", date);
  assert.match(pdf, /Altezza Massima: 1839 mm/);
  assert.doesNotMatch(pdf, /NaN|Infinity/);
});

test("il PDF conserva i decimali del top e identifica le quantità non definite", () => {
  const store = withItem();
  store
    .getState()
    .updateBaseFinishConfiguration(store.getState().selectedItemId!, {
      hasTop: true,
      doorCount: "two",
    });
  const items = store.getState().items;
  const detail = createTechnicalSheetPdf(items, "it", date);
  const aggregate = createAggregatedTechnicalSheetPdf(items, "it", date);
  assert.match(detail, /Altezza Massima: 899.5 mm/);
  assert.match(detail, /Top incluso - 2 ante/);
  assert.match(detail, /Distinta preliminare/);
  assert.match(aggregate, /Qta da definire/);
  assert.match(aggregate, /ANTAB/);
});

test("le opzioni documentali non alterano di nascosto la distinta statica", () => {
  const store = withItem(
    product("COLONNA_MISTA_IMPIANTO_ALTO_NON_A_VISTA", { height_mm: 2282 }),
  );
  const before = getItemBillOfMaterials(store.getState().items[0]);
  store.getState().updateDoorConfiguration(store.getState().selectedItemId!, {
    count: "two",
    machining: "h10_vents",
  });
  const item = store.getState().items[0];
  assert.deepEqual(getItemBillOfMaterials(item), before);
  const pdf = createTechnicalSheetPdf([item], "it", date);
  assert.match(pdf, /specifiche documentali/);
  assert.equal(getParametricPreviewPanels(item), null);
});

test("l'export rifiuta anche quote di distinta negative o un codice senza distinta", () => {
  const base = withItem().getState().items[0];
  const invalid: ConfiguratorItem = { ...base, widthMm: 30 };
  assert.equal(getTechnicalIssue(invalid), "invalidBom");
  assert.throws(
    () => createTechnicalSheetPdf([invalid], "it", date),
    /non esportabile/,
  );
  const custom = withItem(product("CUSTOM_SENZA_DISTINTA")).getState().items[0];
  assert.equal(getTechnicalIssue(custom), "missingBom");
  assert.throws(
    () => createAggregatedTechnicalSheetPdf([custom], "it", date),
    /non esportabile/,
  );
});

test("gli optional della base non spariscono passando a una variante che non li supporta", () => {
  const store = createConfiguratorStore();
  const base = product();
  const fixed = product("BASE_CON_2_FIANCHIA_VISTA");
  store
    .getState()
    .addProduct(base, { two_internal_sides: base, two_visible_sides: fixed });
  const id = store.getState().selectedItemId!;
  store
    .getState()
    .updateBaseFinishConfiguration(id, { hasTop: true, doorCount: "two" });
  const before = store.getState();
  store.getState().updateVariant(id, "two_visible_sides");
  assert.equal(store.getState().configurationError, "unsupportedFinish");
  assert.equal(store.getState().items, before.items);
  assert.equal(store.getState().past, before.past);
  store
    .getState()
    .updateBaseFinishConfiguration(id, { hasTop: false, doorCount: "none" });
  store.getState().updateVariant(id, "two_visible_sides");
  assert.equal(store.getState().items[0].code, fixed.code);
  const fixedState = store.getState();
  store.getState().updateBaseFinishConfiguration(id, { hasTop: true });
  assert.equal(store.getState().configurationError, "unsupportedFinish");
  assert.equal(store.getState().items, fixedState.items);
});

test("la paginazione conserva le specifiche lunghe e l'aggregato distingue quote differenti", () => {
  const first = withItem().getState().items[0];
  const second = {
    ...first,
    id: "second",
    widthMm: 1400,
    nameIt: "Modulo con nome molto lungo ".repeat(12),
  };
  const pdf = createTechnicalSheetPdf([first, second], "it", date);
  assert.match(pdf, /Continuazione elenco moduli/);
  assert.doesNotMatch(pdf, /NaN|Infinity/);
  const aggregate = createAggregatedTechnicalSheetPdf(
    [first, second],
    "it",
    date,
  );
  assert.match(aggregate, /L 661/);
  assert.match(aggregate, /L 1361/);
  assert.ok(aggregate.endsWith("%%EOF"));
});

test("coordinate corrotte non possono produrre quote NaN nei documenti", () => {
  const item = withItem().getState().items[0];
  for (const position of [
    [NaN, 0, 0],
    [0, Infinity, 0],
    [0, -1, 0],
  ] as [number, number, number][]) {
    assert.throws(
      () => createTechnicalSheetPdf([{ ...item, position }], "it", date),
      /non esportabile/,
    );
  }
  assert.throws(
    () =>
      createTechnicalSheetPdf([{ ...item, rotationY: Infinity }], "it", date),
    /non esportabile/,
  );
  for (const quantity of [null, undefined, "da definire", "", Infinity])
    assert.equal(
      getComponentQuantity({ code: "RIPINT", name: "Ripiano", quantity }),
      null,
    );
  assert.equal(
    getComponentQuantity({ code: "TEST", name: "Pannello", quantity: "2" }),
    2,
  );
});
