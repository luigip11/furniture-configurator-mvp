import assert from "node:assert/strict";
import test from "node:test";
import { loadPublishedCatalog } from "../src/lib/catalog/load-catalog.ts";
import type { Product } from "../src/types/configurator.ts";

test("un catalogo effettivamente vuoto è un caricamento riuscito", async () => {
  assert.deepEqual(
    await loadPublishedCatalog(async () => ({ data: [], error: null })),
    { products: [], failed: false },
  );
});

test("un errore Supabase non viene mostrato come catalogo vuoto", async () => {
  assert.deepEqual(
    await loadPublishedCatalog(async () => ({
      data: null,
      error: { message: "unavailable" },
    })),
    { products: [], failed: true },
  );
});

test("eccezioni di rete e risultati non validi sono errori recuperabili", async () => {
  assert.equal(
    (
      await loadPublishedCatalog(async () => {
        throw new Error("network");
      })
    ).failed,
    true,
  );
  assert.equal(
    (await loadPublishedCatalog(async () => ({ data: null, error: null })))
      .failed,
    true,
  );
});

test("i record caricati restano disponibili senza modificarli", async () => {
  const data = [{ id: "test" }] as Product[];
  const result = await loadPublishedCatalog(async () => ({
    data,
    error: null,
  }));
  assert.equal(result.failed, false);
  assert.equal(result.products, data);
});
