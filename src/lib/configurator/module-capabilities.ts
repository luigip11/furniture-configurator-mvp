// Mantiene coerenti le quote consentite e la configurazione ante tra store, vista e documenti.
import type {
  ConfiguratorItem,
  DoorConfiguration,
} from "../../types/configurator.ts";
import { DEFAULT_DOOR_CONFIGURATION } from "../../types/configurator.ts";
import {
  canConfigureBaseFinish,
  hasParametricBillOfMaterials,
} from "./parametric-bom.ts";

// Le famiglie prive di formule restano alle quote del record catalogo selezionato.
export function hasSupportedDimensions(item: ConfiguratorItem) {
  if (hasParametricBillOfMaterials(item.code)) return true;
  const nominal = item.catalogDimensions;
  return (
    !!nominal &&
    (["widthMm", "heightMm", "depthMm"] as const).every(
      (axis) =>
        Number.isFinite(nominal[axis]) &&
        Math.abs(item[axis] - nominal[axis]) < 1e-7,
    )
  );
}

// Per la base nominale il conteggio ante ha una sola fonte, inclusa l'assenza di ante.
export function getEffectiveDoorConfiguration(
  item: ConfiguratorItem,
): DoorConfiguration | undefined {
  if (!canConfigureBaseFinish(item.code)) return item.doorConfiguration;
  const count = item.baseFinishConfiguration?.doorCount || "none";
  return count === "none"
    ? undefined
    : { ...(item.doorConfiguration || DEFAULT_DOOR_CONFIGURATION), count };
}
