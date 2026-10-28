import assert from "node:assert/strict";
import test from "node:test";
import { loadAdminRows } from "../src/lib/admin/admin-query.ts";

// Silenzia i log attesi e permette di verificare che l'errore venga comunque registrato.
function muteConsoleError(t: test.TestContext) {
  return t.mock.method(console, "error", () => {});
}

test("un elenco vuoto riuscito non è un errore", async (t) => {
  const log = muteConsoleError(t);
  assert.deepEqual(
    await loadAdminRows("products", async () => ({ data: [], error: null })),
    { rows: [], failed: false },
  );
  assert.equal(log.mock.callCount(), 0);
});

test("errori restituiti e risultati non validi vengono segnalati e registrati", async (t) => {
  const log = muteConsoleError(t);
  for (const result of [
    { data: null, error: { message: "unavailable" } },
    { data: [{ id: "a" }], error: { message: "partial" } },
    { data: null, error: null },
  ])
    assert.deepEqual(
      await loadAdminRows("products", async () => result),
      { rows: [], failed: true },
    );
  assert.equal(log.mock.callCount(), 3);
});

test("eccezioni sincrone e asincrone diventano un errore recuperabile", async (t) => {
  muteConsoleError(t);
  assert.equal(
    (
      await loadAdminRows("categories", () => {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
      })
    ).failed,
    true,
  );
  assert.equal(
    (
      await loadAdminRows("categories", async () => {
        throw new Error("network");
      })
    ).failed,
    true,
  );
});

test("le righe caricate restano invariate", async () => {
  const data = [{ id: "a" }, { id: "b" }];
  const result = await loadAdminRows("products", async () => ({
    data,
    error: null,
  }));
  assert.equal(result.rows, data);
  assert.equal(result.failed, false);
});
