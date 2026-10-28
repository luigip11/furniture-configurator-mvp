import assert from "node:assert/strict";
import test from "node:test";
import { deleteAdminRecord } from "../src/lib/admin/admin-delete-client.ts";

// Sostituisce fetch per la durata del test e registra le chiamate effettuate.
function stubFetch(t: test.TestContext, implementation: typeof fetch) {
  const calls: { url: string; method?: string }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), method: init?.method });
    return implementation(input, init);
  }) as typeof fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  return calls;
}

test("la cancellazione passa dall'API protetta con il metodo DELETE", async (t) => {
  const calls = stubFetch(t, async () => Response.json({ id: "abc" }));
  assert.deepEqual(await deleteAdminRecord("products", "abc"), { ok: true });
  assert.deepEqual(calls, [{ url: "/api/admin/products/abc", method: "DELETE" }]);
});

test("l'identificativo viene codificato e non può cambiare percorso", async (t) => {
  const calls = stubFetch(t, async () => Response.json({}, { status: 400 }));
  await deleteAdminRecord("categories", "../products/x");
  assert.equal(calls[0].url, "/api/admin/categories/..%2Fproducts%2Fx");
});

test("il messaggio del server viene mostrato quando disponibile", async (t) => {
  stubFetch(t, async () =>
    Response.json({ message: "Categoria usata da uno o più prodotti." }, { status: 409 }),
  );
  assert.deepEqual(await deleteAdminRecord("categories", "abc"), {
    ok: false,
    message: "Categoria usata da uno o più prodotti.",
  });
});

test("risposte non JSON ed errori di rete non lanciano eccezioni", async (t) => {
  let fail = false;
  stubFetch(t, async () => {
    if (fail) throw new TypeError("Failed to fetch");
    return new Response("Errore interno", { status: 500 });
  });
  assert.deepEqual(await deleteAdminRecord("products", "abc"), {
    ok: false,
    message: null,
  });
  fail = true;
  assert.deepEqual(await deleteAdminRecord("products", "abc"), {
    ok: false,
    message: null,
  });
});
