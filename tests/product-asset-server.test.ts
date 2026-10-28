import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import {
  removeUnusedUploads,
  verifyUploadedAssets,
} from "../src/lib/admin/product-asset-server.ts";
import { signUploadReceipt } from "../src/lib/admin/upload-receipt.ts";
import {
  buildProductPayload,
  emptyProductForm,
} from "../src/lib/admin/product-form.ts";
import { productWriteError } from "../src/lib/admin/product-submission.ts";

const secret = "synthetic-server-test-key";
const path = "technical/test/1-unique-schema.pdf";
const origin = "https://synthetic-storage.invalid";
const publicUrl = `${origin}/storage/v1/object/public/product-assets/${path}`;
const bytes = new TextEncoder().encode("%PDF-1.7\nTest");

test("errori di connessione o transazione incerta non autorizzano la pulizia", async () => {
  for (const code of [undefined, "08006", "08007", "PGRST001", "PGRST116"]) {
    assert.equal((await productWriteError({ code }).json()).outcome, "unknown");
  }
  assert.equal(
    (await productWriteError({ code: "23514" }).json()).outcome,
    "rejected",
  );
});

// Tutte le chiamate SDK vengono intercettate in memoria: nessun database o storage reale.
function setup(
  t: TestContext,
  options: {
    referenced?: boolean;
    readError?: boolean;
    wrongSize?: boolean;
    badHeader?: boolean;
    referenceBeyondFirstPage?: boolean;
  } = {},
) {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = origin;
  process.env.SUPABASE_SERVICE_ROLE_KEY = secret;
  t.after(() => {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
  });
  const calls: { method: string; path: string; body: unknown }[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
      );
      const method = init?.method || "GET";
      calls.push({ method, path: url.pathname, body: init?.body });
      if (
        url.pathname.includes("/rest/v1/products") &&
        options.referenceBeyondFirstPage
      ) {
        return Response.json(
          url.searchParams.get("offset") === "500"
            ? [{ model_url: publicUrl }]
            : Array.from({ length: 500 }, () => ({ model_url: null })),
        );
      }
      if (url.pathname.includes("/rest/v1/products"))
        return Response.json(
          options.readError
            ? { message: "offline" }
            : options.referenced
              ? [{ technical_file_url: publicUrl + "?download=1" }]
              : [],
          { status: options.readError ? 400 : 200 },
        );
      if (url.pathname.includes("/object/info/"))
        return Response.json({
          name: path,
          size: options.wrongSize ? 100 : bytes.length,
        });
      if (url.pathname.includes("/object/public/"))
        return new Response(options.badHeader ? "not PDF" : bytes, {
          status: 206,
        });
      if (method === "DELETE") return Response.json([{ name: path }]);
      throw new Error("Unexpected synthetic request: " + url.pathname);
    },
  );
  const token = signUploadReceipt(
    {
      path,
      field: "technical_file_url",
      name: "schema.pdf",
      size: bytes.length,
      expiresAt: Date.now() + 60000,
    },
    secret,
  );
  return { calls, token };
}

test("la pulizia rimuove soltanto il percorso nuovo della ricevuta", async (t) => {
  const { calls, token } = setup(t);
  await removeUnusedUploads([token]);
  const writes = calls.filter((call) => call.method === "DELETE");
  assert.equal(writes.length, 1);
  assert.deepEqual(JSON.parse(String(writes[0].body)), { prefixes: [path] });
});

test("un asset già associato a qualsiasi prodotto non viene eliminato", async (t) => {
  const { calls, token } = setup(t, { referenced: true });
  await removeUnusedUploads([token]);
  assert.equal(calls.filter((call) => call.method === "DELETE").length, 0);
});

test("errori leggendo i riferimenti bloccano ogni cancellazione", async (t) => {
  const { calls, token } = setup(t, { readError: true });
  await assert.rejects(() => removeUnusedUploads([token]), /verificare/);
  assert.equal(calls.filter((call) => call.method === "DELETE").length, 0);
});

test("ricevute alterate non effettuano neppure richieste storage", async (t) => {
  const { calls } = setup(t);
  await assert.rejects(() => removeUnusedUploads(["forged"]));
  assert.equal(calls.length, 0);
});

test("verifica file effettivo prima dell'associazione al prodotto", async (t) => {
  const { token } = setup(t);
  const payload = buildProductPayload({
    ...emptyProductForm,
    name_it: "Base",
    width_mm: "700",
    height_mm: "880",
    depth_mm: "665",
    technical_file_url: publicUrl,
  });
  await verifyUploadedAssets([token], payload);
  await assert.rejects(
    () =>
      verifyUploadedAssets([token], {
        ...payload,
        technical_file_url: "https://other.invalid/old.pdf",
      }),
    /associato/,
  );
});

for (const option of ["wrongSize", "badHeader"] as const) {
  test(`l'associazione rifiuta ${option} letto realmente da Storage`, async (t) => {
    const { token } = setup(t, { [option]: true });
    const payload = buildProductPayload({
      ...emptyProductForm,
      name_it: "Base",
      width_mm: "700",
      height_mm: "880",
      depth_mm: "665",
      technical_file_url: publicUrl,
    });
    await assert.rejects(() => verifyUploadedAssets([token], payload));
  });
}

test("la pulizia controlla i riferimenti anche oltre la prima pagina del catalogo", async (t) => {
  const { calls, token } = setup(t, { referenceBeyondFirstPage: true });
  await removeUnusedUploads([token]);
  assert.equal(
    calls.filter((call) => call.path.includes("/rest/v1/products")).length,
    2,
  );
  assert.equal(calls.filter((call) => call.method === "DELETE").length, 0);
});
