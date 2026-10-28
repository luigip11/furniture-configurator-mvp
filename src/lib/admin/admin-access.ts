// Protezione minima dell'area admin per l'MVP: credenziali condivise via HTTP Basic, senza account né sessioni.
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_AUTH_REALM = "Area admin";
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

const MAX_AUTHORIZATION_LENGTH = 1024;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export type AdminCredentials = { username: string; password: string };

export type AdminAccessDenial = {
  status: 401 | 403 | 503;
  message: string;
};

type AdminEnvironment = Record<string, string | undefined>;

// Legge le credenziali dal server: valori assenti o deboli lasciano l'area chiusa, mai aperta.
export function readAdminCredentials(
  env: AdminEnvironment = process.env,
): AdminCredentials | null {
  const username = env.ADMIN_USERNAME?.trim();
  const password = env.ADMIN_PASSWORD;
  // Il protocollo Basic separa utente e password con i due punti: un utente che li contiene non è verificabile.
  if (!username || username.includes(":")) return null;
  if (!password || password.length < ADMIN_PASSWORD_MIN_LENGTH) return null;
  return { username, password };
}

// Decodifica l'intestazione Basic; formati inattesi valgono come credenziali assenti.
export function parseBasicAuthorization(
  header: string | null,
): AdminCredentials | null {
  if (!header || header.length > MAX_AUTHORIZATION_LENGTH) return null;
  const match = /^Basic\s+([A-Za-z0-9+/]+={0,2})\s*$/i.exec(header);
  if (!match) return null;
  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator < 0) return null;
  return {
    username: decoded.slice(0, separator),
    password: decoded.slice(separator + 1),
  };
}

// Confronta digest a lunghezza fissa: i tempi di risposta non rivelano quanti caratteri coincidono.
function safeEqual(supplied: string, expected: string) {
  return timingSafeEqual(
    createHash("sha256").update(supplied).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

// Valuta sempre entrambi i campi, senza uscire al primo valore errato.
export function matchesAdminCredentials(
  supplied: AdminCredentials,
  expected: AdminCredentials,
) {
  const usernameMatches = safeEqual(supplied.username, expected.username);
  const passwordMatches = safeEqual(supplied.password, expected.password);
  return usernameMatches && passwordMatches;
}

// Il browser allega da solo le credenziali Basic: una scrittura partita da un altro sito va rifiutata.
export function isCrossSiteMutation(
  method: string,
  headers: Pick<Headers, "get">,
) {
  if (SAFE_METHODS.has(method.toUpperCase())) return false;
  const site = headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

// Decide l'accesso senza produrre risposte, così proxy, route e pagine condividono la stessa regola.
export function checkAdminAccess(
  method: string,
  headers: Pick<Headers, "get">,
  env: AdminEnvironment = process.env,
): AdminAccessDenial | null {
  const expected = readAdminCredentials(env);
  if (!expected)
    return { status: 503, message: "Area admin non configurata." };
  const supplied = parseBasicAuthorization(headers.get("authorization"));
  if (!supplied || !matchesAdminCredentials(supplied, expected))
    return { status: 401, message: "Accesso riservato." };
  if (isCrossSiteMutation(method, headers))
    return { status: 403, message: "Richiesta non consentita." };
  return null;
}

// Traduce il rifiuto in risposta HTTP: JSON per le API lette dai form, testo semplice per le pagine.
export function adminAccessResponse(
  denial: AdminAccessDenial,
  format: "json" | "text",
) {
  const headers = new Headers({ "Cache-Control": "no-store" });
  // Solo il 401 chiede le credenziali: con 403 e 503 riproporre il popup non risolverebbe nulla.
  if (denial.status === 401)
    headers.set(
      "WWW-Authenticate",
      `Basic realm="${ADMIN_AUTH_REALM}", charset="UTF-8"`,
    );
  if (format === "json")
    return Response.json(
      { message: denial.message },
      { status: denial.status, headers },
    );
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(denial.message, { status: denial.status, headers });
}

// Secondo livello per le route API: ripete il controllo del proxy accanto alle scritture con service role.
export function rejectUnauthorizedAdmin(
  request: Request,
  env: AdminEnvironment = process.env,
) {
  const denial = checkAdminAccess(request.method, request.headers, env);
  return denial ? adminAccessResponse(denial, "json") : null;
}
