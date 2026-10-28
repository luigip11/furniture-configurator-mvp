// Controllo informativo sul codice prodotto: il configuratore collega distinta e varianti tramite il codice.
import { hasTechnicalDefinition } from "../configurator/module-technical-catalog.ts";

export type ProductCodeStatus = "missing" | "unknown" | "recognized";

// Non blocca il salvataggio: segnala in anticipo un codice che farebbe perdere la distinta tecnica.
export function getProductCodeStatus(
  code: string | null | undefined,
): ProductCodeStatus {
  if (!code?.trim()) return "missing";
  return hasTechnicalDefinition(code) ? "recognized" : "unknown";
}
