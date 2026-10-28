// Regole condivise dai form e dai confini API: i valori sconosciuti non vengono convertiti implicitamente.
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Accetta soltanto oggetti JSON semplici e campi esplicitamente previsti.
export function validatedRecord(value: unknown, fields: readonly string[]) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !fields.includes(key))
  )
    throw new Error("Payload non valido.");
  return value as Record<string, unknown>;
}

// Normalizza testo opzionale e applica limiti prima di salvarlo.
export function validatedText(
  value: unknown,
  label: string,
  maxLength: number,
  required = false,
): string | null {
  if (value === null || value === undefined) {
    if (required) throw new Error(`${label} obbligatorio.`);
    return null;
  }
  if (
    typeof value !== "string" ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  )
    throw new Error(`${label} non valido.`);
  const text = value.trim();
  if ((!text && required) || text.length > maxLength)
    throw new Error(`${label} non valido o troppo lungo.`);
  return text || null;
}

// Mantiene null per gli opzionali e rifiuta identificatori non compatibili con il database.
export function validatedUuid(
  value: unknown,
  label = "Identificatore",
): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !UUID_PATTERN.test(value))
    throw new Error(`${label} non valido.`);
  return value;
}

// Rifiuta URL eseguibili, credenziali incorporate e valori che il browser non può aprire come risorse HTTP.
export function validatedAssetUrl(value: unknown): string | null {
  const text = validatedText(value, "URL asset", 2048);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error();
    return text;
  } catch {
    throw new Error(
      "URL asset non valido: usa http o https senza credenziali.",
    );
  }
}
