import assert from "node:assert/strict";
import test from "node:test";
import {
  CONFIGURATOR_HISTORY_LIMIT,
  createConfiguratorStore,
} from "../src/store/configurator-store.ts";
import {
  getProductVariantKeys,
  searchCatalogFamilies,
} from "../src/lib/configurator/product-variants.ts";
import {
  isInsideScene,
  itemsOverlap,
} from "../src/lib/configurator/composition-constraints.ts";
import type { Product } from "../src/types/configurator.ts";

// Crea un prodotto di prova senza dipendenze da Supabase o dai dati del cliente.
function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "base",
    category_id: "base",
    name_it: "Base",
    name_en: null,
    code: "BASE_CON_2_FIANCHI_INTERNI",
    width_mm: 700,
    height_mm: 880,
    depth_mm: 665,
    thickness_mm: 19.5,
    price: null,
    preview_image_url: null,
    model_url: null,
    technical_file_url: null,
    is_published: true,
    ...overrides,
  };
}

// Prepara una scena libera con due moduli validi, per confrontare percorsi di movimento diversi.
function freeStore() {
  const store = createConfiguratorStore();
  store.getState().updateSettings({ allowFreeMovementInOpenScene: true });
  store.getState().addProduct(product());
  store.getState().addProduct(product({ id: "second" }));
  return store;
}

for (const value of [-50, 0, NaN, Infinity, 1e100, 39]) {
  test(`rifiuta larghezza ${value} senza cambiare geometria o storico`, () => {
    const store = createConfiguratorStore();
    store.getState().addProduct(product());
    const before = store.getState();
    store.getState().updateItem(before.selectedItemId!, { widthMm: value });
    assert.equal(store.getState().configurationError, "invalidDimensions");
    assert.equal(store.getState().items, before.items);
    assert.equal(store.getState().past, before.past);
  });
}

test("applica quote decimali valide senza false collisioni nella fila", () => {
  const store = createConfiguratorStore();
  for (const width_mm of [700, 1000.5, 665, 431.2])
    store.getState().addProduct(product({ width_mm }));
  assert.equal(store.getState().configurationError, null);
  assert.equal(store.getState().items.length, 4);
});

test("rifiuta la quindicesima base oltre il piano, senza sovrapposizioni o perdita di moduli", () => {
  const store = createConfiguratorStore();
  for (let i = 0; i < 14; i++) store.getState().addProduct(product());
  const before = store.getState();
  store.getState().addProduct(product());
  assert.equal(store.getState().configurationError, "capacityExceeded");
  assert.equal(store.getState().items, before.items);
  assert.equal(store.getState().past, before.past);
  assert.ok(before.items.every(isInsideScene));
  assert.ok(
    before.items.every((item, i) =>
      before.items.slice(i + 1).every((other) => !itemsOverlap(item, other)),
    ),
  );
});

test("dimensionamento e duplicazione non possono saturare silenziosamente la fila", () => {
  const store = createConfiguratorStore();
  store.getState().addProduct(product({ width_mm: 4900 }));
  store.getState().duplicateItem(store.getState().selectedItemId!);
  assert.equal(store.getState().items.length, 2);
  const before = store.getState();
  store.getState().updateItem(before.selectedItemId!, { widthMm: 5000 });
  assert.equal(store.getState().configurationError, "capacityExceeded");
  store.getState().duplicateItem(before.selectedItemId!);
  assert.equal(store.getState().items, before.items);
});

test("rifiuta una rotazione che renderebbe la fila troppo larga", () => {
  const store = createConfiguratorStore();
  for (let i = 0; i < 7; i++)
    store.getState().addProduct(product({ width_mm: 1400, depth_mm: 2100 }));
  const before = store.getState();
  store.getState().rotateItem(before.selectedItemId!);
  assert.equal(store.getState().configurationError, "capacityExceeded");
  assert.equal(store.getState().items, before.items);
});

test("undo e redo ripristinano insieme modalità, quote, selezione e posizioni", () => {
  const store = createConfiguratorStore();
  store.getState().addProduct(product());
  const open = store.getState();
  store.getState().setSceneMode("wall");
  const wall = store.getState();
  store.getState().setSceneMode("front");
  store.getState().undo();
  assert.equal(store.getState().sceneMode, "wall");
  assert.deepEqual(store.getState().items, wall.items);
  store.getState().undo();
  assert.equal(store.getState().sceneMode, "open");
  assert.deepEqual(store.getState().items, open.items);
  assert.equal(store.getState().selectedItemId, open.selectedItemId);
  store.getState().redo();
  assert.equal(store.getState().sceneMode, "wall");
  assert.deepEqual(store.getState().items, wall.items);
});

test("undo delle impostazioni ripristina anche il comportamento della scena libera", () => {
  const store = freeStore();
  store.getState().moveItem(store.getState().selectedItemId!, "z", 2);
  const before = store.getState();
  store.getState().updateSettings({ allowFreeMovementInOpenScene: false });
  store.getState().undo();
  assert.equal(store.getState().settings.allowFreeMovementInOpenScene, true);
  assert.deepEqual(store.getState().items, before.items);
});

test("campi numerici e trascinamento applicano gli stessi limiti al bordo", () => {
  const numeric = createConfiguratorStore();
  const drag = createConfiguratorStore();
  for (const store of [numeric, drag]) {
    store.getState().updateSettings({ allowFreeMovementInOpenScene: true });
    store.getState().addProduct(product({ width_mm: 500 }));
  }
  numeric.getState().moveItem(numeric.getState().selectedItemId!, "x", 100);
  drag.getState().updatePosition(drag.getState().selectedItemId!, [100, 99, 0]);
  assert.deepEqual(
    numeric.getState().items[0].position,
    drag.getState().items[0].position,
  );
  assert.ok(isInsideScene(numeric.getState().items[0]));
  assert.equal(numeric.getState().items[0].position[1], 0);
});

test("rifiuta collisioni in movimento libero da campi e trascinamento", () => {
  for (const mode of ["numeric", "drag"]) {
    const store = freeStore();
    const first = store.getState().items[0];
    const second = store.getState().items[1];
    const before = store.getState();
    if (mode === "numeric")
      store.getState().moveItem(second.id, "x", first.position[0]);
    else store.getState().updatePosition(second.id, first.position);
    assert.equal(store.getState().configurationError, "collision");
    assert.equal(store.getState().items, before.items);
    assert.equal(store.getState().past, before.past);
  }
});

test("un inserimento libero trova uno spazio alternativo invece di sovrapporre i moduli", () => {
  const store = createConfiguratorStore();
  store.getState().updateSettings({ allowFreeMovementInOpenScene: true });
  store.getState().addProductAtPosition(product(), [0, 0, 0]);
  store.getState().addProductAtPosition(product(), [0, 0, 0]);
  assert.equal(store.getState().items.length, 2);
  const [first, second] = store.getState().items;
  assert.equal(itemsOverlap(first, second), false);
});

test("i moduli in quota non collidono con una base sottostante e conservano la quota", () => {
  const store = createConfiguratorStore();
  store.getState().updateSettings({ allowFreeMovementInOpenScene: true });
  store.getState().addProductAtPosition(product(), [0, 0, 0]);
  store.getState().addProductAtPosition(
    product({
      code: "PENSILE_ORIZZONTALE_A_VISTA_DX",
      height_mm: 439,
      depth_mm: 350,
    }),
    [0, 0, 0],
  );
  assert.equal(store.getState().configurationError, null);
  store.getState().updatePosition(store.getState().selectedItemId!, [1, 0, 2]);
  assert.equal(store.getState().items[1].position[1], 2);
});

test("rifiuta coordinate e prodotti non finiti anche durante l'inserimento libero", () => {
  const store = createConfiguratorStore();
  store.getState().updateSettings({ allowFreeMovementInOpenScene: true });
  store.getState().addProductAtPosition(product(), [NaN, 0, 0]);
  assert.equal(store.getState().items.length, 0);
  assert.equal(store.getState().configurationError, "invalidCoordinates");
  store.getState().addProduct(product({ depth_mm: Infinity }));
  assert.equal(store.getState().items.length, 0);
  assert.equal(store.getState().configurationError, "invalidDimensions");
});

test("un gesto di trascinamento produce un solo undo e i gesti rifiutati non consumano lo storico", () => {
  const store = freeStore();
  const item = store.getState().items[1];
  const before = store.getState();
  store.getState().commitHistory();
  store.getState().updatePosition(item.id, store.getState().items[0].position, {
    recordHistory: false,
  });
  assert.equal(store.getState().past.length, before.past.length);
  store.getState().updatePosition(item.id, [2, 0, 2], { recordHistory: false });
  store.getState().updatePosition(item.id, [3, 0, 3], { recordHistory: false });
  assert.equal(store.getState().past.length, before.past.length + 1);
  store.getState().undo();
  assert.deepEqual(store.getState().items, before.items);
  store.getState().redo();
  assert.deepEqual(store.getState().items[1].position, [3, 0, 3]);
});

test("un'operazione rifiutata conserva la possibilità di redo", () => {
  const store = createConfiguratorStore();
  store.getState().addProduct(product());
  store.getState().duplicateItem(store.getState().selectedItemId!);
  store.getState().undo();
  store
    .getState()
    .updateItem(store.getState().selectedItemId!, { heightMm: -1 });
  assert.equal(store.getState().canRedo, true);
  store.getState().redo();
  assert.equal(store.getState().items.length, 2);
});

test("non modifica Z nelle viste vincolate e permette il riordino da campo numerico", () => {
  const store = createConfiguratorStore();
  store.getState().addProduct(product());
  store.getState().addProduct(product());
  store.getState().setSceneMode("wall");
  const id = store.getState().selectedItemId!;
  store.getState().moveItem(id, "z", 100);
  assert.equal(
    store.getState().items.find((item) => item.id === id)!.position[2],
    665 / 700 / 2,
  );
  store.getState().moveItem(id, "x", -100);
  assert.equal(store.getState().items[0].id, id);
});

test("cambio variante SX/DX mantiene tutte le quote, finiture e il record modello esatto", () => {
  const products = ["DX", "SX", "SX_E_DX"].map((side) =>
    product({
      id: side,
      code: `PENSILE_ORIZZONTALE_A_VISTA_${side}`,
      model_url: `${side}.glb`,
      height_mm: 439,
      depth_mm: 350,
    }),
  );
  const family = searchCatalogFamilies(
    products,
    "PENSILE_ORIZZONTALE_A_VISTA_SX",
  )[0];
  const store = createConfiguratorStore();
  store.getState().addProduct(family.product, family.variantProducts);
  assert.equal(store.getState().items[0].productId, "SX");
  const id = store.getState().selectedItemId!;
  store
    .getState()
    .updateItem(id, { widthMm: 1000, heightMm: 500, depthMm: 450 });
  store.getState().updateDoorConfiguration(id, { count: "two" });
  const before = store.getState().items[0];
  store.getState().updateVariant(id, "visible_right");
  const after = store.getState().items[0];
  assert.equal(after.modelUrl, "DX.glb");
  assert.equal(after.productId, "DX");
  assert.equal(after.variantKey, "one_visible_one_internal");
  assert.equal(after.productVariantKey, "visible_right");
  assert.deepEqual(
    [after.widthMm, after.heightMm, after.depthMm],
    [1000, 500, 450],
  );
  assert.deepEqual(after.doorConfiguration, before.doorConfiguration);
  assert.deepEqual(after.position, before.position);
  assert.equal(getProductVariantKeys(after.variantProducts).length, 3);
});

test("una variante non disponibile viene rifiutata senza sostituire silenziosamente il prodotto", () => {
  const store = createConfiguratorStore();
  const p = product();
  store.getState().addProduct(p, { two_internal_sides: p });
  const before = store.getState();
  store.getState().updateVariant(before.selectedItemId!, "visible_left");
  assert.equal(store.getState().configurationError, "variantUnavailable");
  assert.equal(store.getState().items, before.items);
});

// Nelle sessioni lunghe la cronologia resta limitata: si perdono solo i passi più vecchi.
test("annulla/ripeti conserva al massimo gli ultimi passi previsti dal limite", () => {
  const store = createConfiguratorStore();
  const extraSteps = 5;
  for (let step = 0; step < CONFIGURATOR_HISTORY_LIMIT + extraSteps; step++)
    store.getState().updateSettings({
      allowFreeMovementInOpenScene: step % 2 === 0,
    });
  assert.equal(store.getState().past.length, CONFIGURATOR_HISTORY_LIMIT);

  for (let step = 0; step < CONFIGURATOR_HISTORY_LIMIT; step++)
    store.getState().undo();
  assert.equal(store.getState().canUndo, false);
  assert.equal(store.getState().future.length, CONFIGURATOR_HISTORY_LIMIT);
  // Il passo più vecchio rimasto corrisponde allo stato dopo i primi cinque cambi scartati.
  assert.equal(
    store.getState().settings.allowFreeMovementInOpenScene,
    (extraSteps - 1) % 2 === 0,
  );

  store.getState().redo();
  assert.equal(store.getState().canUndo, true);
  assert.equal(store.getState().future.length, CONFIGURATOR_HISTORY_LIMIT - 1);
});
