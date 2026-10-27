// Vincoli geometrici condivisi da inserimento, proprietà, rotazioni e movimento.
import type {
  ConfiguratorItem,
  ConfiguratorSettings,
  SceneMode,
} from "../../types/configurator.ts";
import {
  clampItemPositionToGridBounds,
  CONFIGURATOR_GRID_HALF_SIZE,
  CONFIGURATOR_SCENE_SCALE,
  CONFIGURATOR_GRID_SIZE,
  getDockedCompositionItems,
  getItemFootprintScene,
  shouldDockComposition,
} from "../../store/configurator-calculations.ts";

export type ConfigurationError =
  | "invalidDimensions"
  | "invalidCoordinates"
  | "capacityExceeded"
  | "collision"
  | "variantUnavailable";
export type CompositionResult =
  | { items: ConfiguratorItem[]; error?: never }
  | { error: ConfigurationError; items?: never };
const EPSILON = 1e-7;
// Limite geometrico del piano, separato dalle quote commerciali del produttore.
export const MAX_MODULE_DIMENSION_MM =
  CONFIGURATOR_GRID_HALF_SIZE * 2 * CONFIGURATOR_SCENE_SCALE;

// Deriva le soglie dalle sottrazioni già presenti nelle formule; non definisce nuovi limiti commerciali.
export function getModuleDimensionMinimums(code?: string | null) {
  switch (code?.trim().toUpperCase()) {
    case "BASE_CON_2_FIANCHI_INTERNI":
      return { widthMm: 40, heightMm: 100, depthMm: 55 };
    case "BASE_SOTTOLAVELLO_CON_2_FIANCHI_INTERNI":
    case "BASE_SOTTOLAVATOIO_CON_1_FIANCHIA_VISTA_1_INTERNO":
      return { widthMm: 40, heightMm: 81, depthMm: 41 };
    case "PENSILE_ORIZZONTALE_A_VISTA_DX":
    case "PENSILE_ORIZZONTALE_A_VISTA_SX":
      return { widthMm: 40, heightMm: 40, depthMm: 30 };
    case "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX_E_DX":
      return { widthMm: 40, heightMm: 120, depthMm: 55 };
    default:
      return { widthMm: 1, heightMm: 1, depthMm: 1 };
  }
}

// Esclude valori non finiti e quote che produrrebbero componenti nulli o negativi nelle formule note.
export function hasValidModuleDimensions(
  item: Pick<ConfiguratorItem, "code" | "widthMm" | "heightMm" | "depthMm">,
) {
  const minimums = getModuleDimensionMinimums(item.code);
  return (Object.keys(minimums) as (keyof typeof minimums)[]).every(
    (key) =>
      Number.isFinite(item[key]) &&
      item[key] >= minimums[key] &&
      item[key] <= MAX_MODULE_DIMENSION_MM,
  );
}

// Considera il volume in quota: un pensile può stare sopra una base senza collidere.
export function itemsOverlap(
  first: ConfiguratorItem,
  second: ConfiguratorItem,
) {
  const a = getItemFootprintScene(first);
  const b = getItemFootprintScene(second);
  return (
    Math.abs(first.position[0] - second.position[0]) <
      (a.width + b.width) / 2 - EPSILON &&
    Math.abs(first.position[2] - second.position[2]) <
      (a.depth + b.depth) / 2 - EPSILON &&
    first.position[1] <
      second.position[1] +
        second.heightMm / CONFIGURATOR_SCENE_SCALE -
        EPSILON &&
    second.position[1] <
      first.position[1] + first.heightMm / CONFIGURATOR_SCENE_SCALE - EPSILON
  );
}

// Verifica l'ingombro completo, inclusa la profondità delle viste a filo.
export function isInsideScene(item: ConfiguratorItem) {
  const size = getItemFootprintScene(item);
  return (
    Math.abs(item.position[0]) + size.width / 2 <=
      CONFIGURATOR_GRID_HALF_SIZE + EPSILON &&
    Math.abs(item.position[2]) + size.depth / 2 <=
      CONFIGURATOR_GRID_HALF_SIZE + EPSILON
  );
}

// Valida prima di applicare la mutazione, senza comprimere una fila oltre la sua capienza.
export function resolveComposition(
  items: ConfiguratorItem[],
  sceneMode: SceneMode,
  settings: ConfiguratorSettings,
): CompositionResult {
  if (items.some((item) => !hasValidModuleDimensions(item)))
    return { error: "invalidDimensions" };
  if (
    items.some(
      (item) =>
        !item.position.every(Number.isFinite) ||
        item.position[1] < 0 ||
        !Number.isFinite(item.rotationY),
    )
  )
    return { error: "invalidCoordinates" };
  const next = shouldDockComposition(sceneMode, settings)
    ? getDockedCompositionItems(items, sceneMode)
    : items.map((item) => ({
        ...item,
        position: clampItemPositionToGridBounds(item, item.position),
      }));
  if (next.some((item) => !isInsideScene(item)))
    return { error: "capacityExceeded" };
  if (
    next.some((item, index) =>
      next.slice(index + 1).some((other) => itemsOverlap(item, other)),
    )
  )
    return { error: "collision" };
  return { items: next };
}

// Cerca un posto libero sulla griglia solo durante l'inserimento, lasciando il trascinamento prevedibile.
export function findAvailablePosition(
  item: ConfiguratorItem,
  others: ConfiguratorItem[],
): [number, number, number] | null {
  const desired = clampItemPositionToGridBounds(item, item.position);
  const candidate = { ...item, position: desired };
  if (
    isInsideScene(candidate) &&
    !others.some((other) => itemsOverlap(candidate, other))
  )
    return desired;
  const positions: [number, number, number][] = [];
  for (
    let x = -CONFIGURATOR_GRID_HALF_SIZE;
    x <= CONFIGURATOR_GRID_HALF_SIZE;
    x += CONFIGURATOR_GRID_SIZE
  ) {
    for (
      let z = -CONFIGURATOR_GRID_HALF_SIZE;
      z <= CONFIGURATOR_GRID_HALF_SIZE;
      z += CONFIGURATOR_GRID_SIZE
    )
      positions.push([x, item.position[1], z]);
  }
  positions.sort(
    (a, b) =>
      (a[0] - desired[0]) ** 2 +
      (a[2] - desired[2]) ** 2 -
      (b[0] - desired[0]) ** 2 -
      (b[2] - desired[2]) ** 2,
  );
  return (
    positions.find((position) => {
      const placed = { ...item, position };
      return (
        isInsideScene(placed) &&
        !others.some((other) => itemsOverlap(placed, other))
      );
    }) || null
  );
}
