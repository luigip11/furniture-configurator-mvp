// Impedisce esportazioni con distinte obsolete, assenti o quote numeriche non valide.
import type { ConfiguratorItem } from "../../types/configurator.ts";
import { hasSupportedDimensions } from "./module-capabilities.ts";
import { getItemBillOfMaterials } from "./module-technical-catalog.ts";

// Restituisce un motivo operativo senza presumere formule o quantità non documentate.
export function getTechnicalIssue(
  item: ConfiguratorItem,
): "dimensions" | "missingBom" | "invalidBom" | null {
  if (
    !item.position.every(Number.isFinite) ||
    item.position[1] < 0 ||
    !Number.isFinite(item.rotationY) ||
    [item.widthMm, item.heightMm, item.depthMm].some(
      (value) => !Number.isFinite(value) || value <= 0,
    )
  )
    return "invalidBom";
  if (!hasSupportedDimensions(item)) return "dimensions";
  const bom = getItemBillOfMaterials(item);
  if (!bom.length) return "missingBom";
  if (
    bom.some((row) =>
      [
        row.widthMm,
        row.heightMm,
        row.depthMm,
        row.thicknessMm,
        row.quantity,
      ].some(
        (value) =>
          typeof value === "number" && (!Number.isFinite(value) || value <= 0),
      ),
    )
  )
    return "invalidBom";
  return null;
}

// Anche chiamando direttamente l'export non si può produrre una distinta incoerente.
export function assertTechnicalExport(items: ConfiguratorItem[]) {
  if (items.some((item) => getTechnicalIssue(item)))
    throw new Error(
      "Distinta non esportabile: verifica le quote e i dati tecnici dei moduli.",
    );
}
