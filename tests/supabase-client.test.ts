import assert from "node:assert/strict";
import test from "node:test";
import { loadPublishedCatalog } from "../src/lib/catalog/load-catalog.ts";
import { getSupabaseClient } from "../src/lib/supabase/client.ts";

// Rimuove temporaneamente le variabili Supabase, ripristinandole a fine test.
function withoutSupabaseEnv(t: test.TestContext) {
  const saved = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  t.after(() => {
    if (saved.url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = saved.url;
    if (saved.key !== undefined)
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = saved.key;
  });
}

test("senza configurazione l'errore nasce all'uso, non all'import del modulo", (t) => {
  withoutSupabaseEnv(t);
  assert.throws(() => getSupabaseClient(), /NEXT_PUBLIC_SUPABASE_URL/);
});

test("il configuratore mostra catalogo non disponibile invece di andare in crash", async (t) => {
  withoutSupabaseEnv(t);
  assert.deepEqual(
    await loadPublishedCatalog(() =>
      getSupabaseClient().from("products").select("*"),
    ),
    { products: [], failed: true },
  );
});
