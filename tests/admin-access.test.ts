import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_AUTH_REALM,
  adminAccessResponse,
  checkAdminAccess,
  parseBasicAuthorization,
  readAdminCredentials,
  rejectUnauthorizedAdmin,
} from "../src/lib/admin/admin-access.ts";

const env = { ADMIN_USERNAME: "committente", ADMIN_PASSWORD: "password-demo-sicura" };

// Costruisce l'intestazione come farebbe il browser dopo il popup di accesso.
function basic(username: string, password: string) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

// Simula le intestazioni di una richiesta senza dipendere da Next.
function requestHeaders(values: Record<string, string>) {
  return new Headers(values);
}

test("credenziali assenti, deboli o ambigue lasciano l'area chiusa", () => {
  assert.equal(readAdminCredentials({}), null);
  assert.equal(readAdminCredentials({ ADMIN_USERNAME: "admin" }), null);
  assert.equal(readAdminCredentials({ ADMIN_PASSWORD: "password-lunga-ok" }), null);
  assert.equal(
    readAdminCredentials({ ADMIN_USERNAME: "admin", ADMIN_PASSWORD: "corta" }),
    null,
  );
  assert.equal(
    readAdminCredentials({ ADMIN_USERNAME: "ad:min", ADMIN_PASSWORD: "password-lunga-ok" }),
    null,
  );
  assert.equal(
    readAdminCredentials({ ADMIN_USERNAME: "   ", ADMIN_PASSWORD: "password-lunga-ok" }),
    null,
  );
  assert.deepEqual(
    readAdminCredentials({ ADMIN_USERNAME: " admin ", ADMIN_PASSWORD: "password-lunga-ok" }),
    { username: "admin", password: "password-lunga-ok" },
  );
});

test("l'intestazione Basic viene letta solo se ben formata", () => {
  assert.deepEqual(parseBasicAuthorization(basic("utente", "pass:con:due-punti")), {
    username: "utente",
    password: "pass:con:due-punti",
  });
  assert.deepEqual(
    parseBasicAuthorization("basic " + Buffer.from("a:b").toString("base64")),
    { username: "a", password: "b" },
  );
  for (const header of [
    null,
    "",
    "Bearer token",
    "Basic",
    "Basic ***",
    "Basic " + Buffer.from("senza-separatore").toString("base64"),
    "Basic " + "A".repeat(2000),
  ])
    assert.equal(parseBasicAuthorization(header), null, String(header));
});

test("l'accesso richiede configurazione e credenziali esatte", () => {
  assert.deepEqual(
    checkAdminAccess("GET", requestHeaders({ authorization: basic("x", "y") }), {}),
    { status: 503, message: "Area admin non configurata." },
  );
  assert.equal(checkAdminAccess("GET", requestHeaders({}), env)?.status, 401);
  assert.equal(
    checkAdminAccess(
      "GET",
      requestHeaders({ authorization: basic("committente", "password-sbagliata") }),
      env,
    )?.status,
    401,
  );
  assert.equal(
    checkAdminAccess(
      "GET",
      requestHeaders({ authorization: basic("altro", env.ADMIN_PASSWORD) }),
      env,
    )?.status,
    401,
  );
  assert.equal(
    checkAdminAccess(
      "GET",
      requestHeaders({ authorization: basic(env.ADMIN_USERNAME, env.ADMIN_PASSWORD) }),
      env,
    ),
    null,
  );
});

test("le scritture avviate da altri siti sono rifiutate anche con credenziali valide", () => {
  const authorization = basic(env.ADMIN_USERNAME, env.ADMIN_PASSWORD);
  for (const site of ["cross-site", "same-site"])
    assert.equal(
      checkAdminAccess(
        "POST",
        requestHeaders({ authorization, "sec-fetch-site": site }),
        env,
      )?.status,
      403,
    );
  // La navigazione da un altro sito resta possibile: solo le mutazioni sono a rischio.
  assert.equal(
    checkAdminAccess(
      "GET",
      requestHeaders({ authorization, "sec-fetch-site": "cross-site" }),
      env,
    ),
    null,
  );
  for (const headers of [
    { authorization, "sec-fetch-site": "same-origin" },
    { authorization },
  ] as Record<string, string>[])
    assert.equal(
      checkAdminAccess("DELETE", requestHeaders(headers), env),
      null,
    );
});

test("solo il 401 chiede le credenziali al browser, nel formato richiesto", async () => {
  const unauthorized = adminAccessResponse(
    { status: 401, message: "Accesso riservato." },
    "text",
  );
  assert.equal(unauthorized.status, 401);
  assert.match(
    unauthorized.headers.get("www-authenticate") || "",
    new RegExp(`^Basic realm="${ADMIN_AUTH_REALM}"`),
  );
  assert.equal(unauthorized.headers.get("cache-control"), "no-store");
  assert.equal(await unauthorized.text(), "Accesso riservato.");

  const forbidden = adminAccessResponse(
    { status: 403, message: "Richiesta non consentita." },
    "json",
  );
  assert.equal(forbidden.headers.get("www-authenticate"), null);
  assert.deepEqual(await forbidden.json(), {
    message: "Richiesta non consentita.",
  });
});

test("le route API ripetono il controllo sulla richiesta completa", async () => {
  const url = "http://localhost/api/admin/products";
  const denied = rejectUnauthorizedAdmin(new Request(url, { method: "POST" }), env);
  assert.equal(denied?.status, 401);
  assert.deepEqual(await denied?.json(), { message: "Accesso riservato." });
  assert.equal(
    rejectUnauthorizedAdmin(
      new Request(url, {
        method: "POST",
        headers: { authorization: basic(env.ADMIN_USERNAME, env.ADMIN_PASSWORD) },
      }),
      env,
    ),
    null,
  );
});
