import assert from "node:assert/strict";
import test from "node:test";
import { createConfiguratorStore } from "../src/store/configurator-store.ts";
import { DEFAULT_DOOR_CONFIGURATION } from "../src/types/configurator.ts";
import type { Product } from "../src/types/configurator.ts";
import {
  getCatalogPrice,
  getItemPrice,
  getQuotePricing,
  formatQuoteMoney,
} from "../src/lib/configurator/quote-pricing.ts";
import {
  createDemoQuoteRequest,
  isValidQuoteContact,
} from "../src/lib/configurator/quote-request.ts";

// Genera dati sintetici attraverso lo stesso percorso usato dal catalogo, senza servizi remoti.
function fixture(price: number | null = 100) {
  const product: Product = {
    id: "base",
    category_id: null,
    name_it: "Base",
    name_en: "Cabinet",
    code: "BASE_CON_2_FIANCHI_INTERNI",
    width_mm: 700,
    height_mm: 880,
    depth_mm: 665,
    thickness_mm: 19.5,
    price,
    preview_image_url: null,
    model_url: null,
    technical_file_url: null,
    is_published: true,
  };
  const store = createConfiguratorStore();
  store.getState().addProduct(product);
  return { item: store.getState().items[0], store };
}

const contact = {
  name: "Mario Test",
  email: "test@example.test",
  phone: "",
  message: "",
  confirmed: true,
};

test("prezzo zero valido distinto da dati mancanti o corrotti", () => {
  assert.equal(getCatalogPrice(0), 0);
  for (const value of [null, undefined, "10", -1, NaN, Infinity, 1e20])
    assert.equal(getCatalogPrice(value), null);
  assert.equal(getItemPrice(fixture(0).item).status, "catalog");
  assert.equal(getQuotePricing([fixture(0).item]).partial, false);
  assert.match(formatQuoteMoney(0, "it"), /0,00/);
});

test("totale misto parziale, moduli senza prezzo esclusi e conteggi coerenti", () => {
  assert.deepEqual(
    getQuotePricing([fixture(100).item, fixture(null).item, fixture(0).item]),
    {
      totalCents: 10000,
      pendingCount: 1,
      pricedCount: 2,
      partial: true,
    },
  );
  assert.equal(getQuotePricing([fixture(null).item]).totalCents, 0);
  assert.equal(getQuotePricing([]).pricedCount, 0);
});

test("somma in centesimi senza errori di virgola mobile", () => {
  assert.equal(
    getQuotePricing([fixture(0.1).item, fixture(0.2).item]).totalCents,
    30,
  );
});

test("le misure personalizzate non ereditano un prezzo definitivo né supplementi inventati", () => {
  const { item, store } = fixture();
  store.getState().updateItem(item.id, { widthMm: 1000 });
  const current = store.getState().items[0];
  assert.deepEqual(getItemPrice(current), {
    status: "custom",
    catalogPrice: 100,
    amountCents: null,
  });
  assert.equal(getQuotePricing([current]).partial, true);
  store.getState().updateItem(item.id, { widthMm: 700 });
  assert.equal(getItemPrice(store.getState().items[0]).status, "catalog");
});

test("top e ante aggiunte richiedono quotazione anche a dimensioni nominali", () => {
  const { item } = fixture();
  for (const baseFinishConfiguration of [
    { hasTop: true, doorCount: "none" as const },
    { hasTop: false, doorCount: "two" as const },
  ]) {
    assert.equal(
      getItemPrice({ ...item, baseFinishConfiguration }).status,
      "custom",
    );
  }
});

test("rivestimento, posa e lavorazione non acquisiscono un prezzo senza listino", () => {
  const { item } = fixture();
  const code = "PENSILE_ORIZZONTALE_A_VISTA_SX";
  assert.equal(
    getItemPrice({
      ...item,
      code,
      doorConfiguration: { ...DEFAULT_DOOR_CONFIGURATION },
    }).status,
    "catalog",
  );
  for (const configuration of [
    { ...DEFAULT_DOOR_CONFIGURATION, count: "two" as const },
    { ...DEFAULT_DOOR_CONFIGURATION, mount: "visible_plinth" as const },
    { ...DEFAULT_DOOR_CONFIGURATION, coating: "sa_painting" as const },
    { ...DEFAULT_DOOR_CONFIGURATION, machining: "h10_vents" as const },
  ])
    assert.equal(
      getItemPrice({ ...item, code, doorConfiguration: configuration }).status,
      "custom",
    );
});

test("spostamento e rotazione mantengono il prezzo; una variante usa il suo record", () => {
  const { item } = fixture();
  assert.equal(
    getItemPrice({ ...item, position: [2, 0, 1], rotationY: 90 }).amountCents,
    10000,
  );
  assert.equal(
    getItemPrice({ ...item, productId: "altro", price: 200 }).amountCents,
    20000,
  );
  assert.equal(getItemPrice({ ...item, price: null }).status, "missing");
  assert.equal(
    getItemPrice({ ...item, catalogDimensions: undefined }).status,
    "custom",
  );
  assert.equal(
    getItemPrice({
      ...item,
      catalogDimensions: { ...item.catalogDimensions!, widthMm: NaN },
    }).status,
    "custom",
  );
});

test("la simulazione accetta prezzi mancanti e conserva misure, posizione e opzioni", () => {
  const { item } = fixture(null);
  item.widthMm = 1000;
  item.position = [1, 2, 3];
  item.baseFinishConfiguration = { hasTop: true, doorCount: "two" };
  const request = createDemoQuoteRequest(
    { ...contact, name: " Mario Test " },
    [item],
    "it",
  );
  assert.equal(request.mode, "demo");
  assert.equal(request.contact.name, "Mario Test");
  assert.deepEqual(request.items[0].positionMm, [700, 1400, 2100]);
  assert.equal(request.items[0].dimensionsMm.width, 1000);
  assert.equal(request.items[0].baseFinish?.hasTop, true);
  assert.equal(request.items[0].doors?.count, "two");
  assert.equal(request.pricing.partial, true);
  item.position[0] = 100;
  item.baseFinishConfiguration.hasTop = false;
  assert.equal(request.items[0].positionMm[0], 700);
  assert.equal(request.items[0].baseFinish?.hasTop, true);
  assert.ok(!("modelUrl" in request.items[0]));
  assert.ok(!("variantProducts" in request.items[0]));
});

test("contatti malformati o non confermati non producono una simulazione riuscita", () => {
  for (const change of [
    { name: " " },
    { name: "A" },
    { name: "Test\nBcc: other" },
    { email: "non-email" },
    { email: "a@b.test\r\nBcc:c@d.test" },
    { phone: "abc" },
    { message: "a".repeat(2001) },
    { confirmed: false },
  ]) {
    assert.equal(isValidQuoteContact({ ...contact, ...change }), false);
    assert.throws(() =>
      createDemoQuoteRequest({ ...contact, ...change }, [fixture().item], "it"),
    );
  }
});

test("composizione vuota o numeri non validi sono rifiutati senza modificare i contatti", () => {
  assert.throws(() => createDemoQuoteRequest(contact, [], "it"));
  const { item } = fixture();
  for (const change of [
    { widthMm: -1 },
    { heightMm: NaN },
    { rotationY: Infinity },
    { position: [0, NaN, 0] as [number, number, number] },
  ]) {
    assert.throws(() =>
      createDemoQuoteRequest(contact, [{ ...item, ...change }], "it"),
    );
  }
  assert.equal(contact.name, "Mario Test");
});
