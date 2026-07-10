import type { ConfiguratorItem, SceneMode } from "@/types/configurator";

export const CONFIGURATOR_GRID_SIZE = 0.25;
export const CONFIGURATOR_SCENE_SCALE = 700;
export const CONFIGURATOR_GRID_HALF_SIZE = 7;

// Arrotonda un valore alla griglia del configuratore mantenendo precisione stabile.
export function snapToGrid(value: number) {
  return Number(
    (
      Math.round(value / CONFIGURATOR_GRID_SIZE) * CONFIGURATOR_GRID_SIZE
    ).toFixed(2)
  );
}

// Normalizza la rotazione entro il range 0-359 per evitare accumuli fuori scala.
export function normalizeRotation(rotationY: number) {
  return ((rotationY % 360) + 360) % 360;
}

// Applica lo snap solo sugli assi manipolabili dal piano di lavoro.
export function snapPosition(
  position: [number, number, number]
): [number, number, number] {
  return [snapToGrid(position[0]), position[1], snapToGrid(position[2])];
}

// Converte la larghezza millimetrica nella scala usata dalla scena 3D.
export function getItemSceneWidth(item: Pick<ConfiguratorItem, "widthMm">) {
  return item.widthMm / CONFIGURATOR_SCENE_SCALE;
}

export function getItemFootprintMm(
  item: Pick<ConfiguratorItem, "widthMm" | "depthMm" | "rotationY">
) {
  const normalizedRotation = normalizeRotation(item.rotationY || 0);
  const rotated = normalizedRotation === 90 || normalizedRotation === 270;

  return {
    widthMm: rotated ? item.depthMm : item.widthMm,
    depthMm: rotated ? item.widthMm : item.depthMm,
  };
}

export function getItemFootprintScene(
  item: Pick<ConfiguratorItem, "widthMm" | "depthMm" | "rotationY">
) {
  const footprint = getItemFootprintMm(item);

  return {
    width: footprint.widthMm / CONFIGURATOR_SCENE_SCALE,
    depth: footprint.depthMm / CONFIGURATOR_SCENE_SCALE,
  };
}

// Mantiene il modulo interamente dentro il piano quadrettato visibile.
export function clampItemPositionToGridBounds(
  item: Pick<ConfiguratorItem, "widthMm" | "depthMm" | "rotationY">,
  position: [number, number, number]
): [number, number, number] {
  const footprint = getItemFootprintScene(item);
  const maxX = Math.max(0, CONFIGURATOR_GRID_HALF_SIZE - footprint.width / 2);
  const maxZ = Math.max(0, CONFIGURATOR_GRID_HALF_SIZE - footprint.depth / 2);

  return snapPosition([
    Math.min(maxX, Math.max(-maxX, position[0])),
    position[1],
    Math.min(maxZ, Math.max(-maxZ, position[2])),
  ]);
}

export function getAlignedPositionForSceneMode(
  item: ConfiguratorItem,
  sceneMode: SceneMode
): [number, number, number] {
  if (sceneMode === "open") {
    return clampItemPositionToGridBounds(item, item.position);
  }

  const footprint = getItemFootprintScene(item);
  const [x, y] = item.position;
  const z =
    sceneMode === "wall" ? footprint.depth / 2 : -footprint.depth / 2;

  return clampItemPositionToGridBounds(item, [x, y, z]);
}

// Calcola la prossima posizione libera affiancando il nuovo modulo a quelli esistenti.
export function getNextPosition(
  items: ConfiguratorItem[],
  widthMm: number
): [number, number, number] {
  if (items.length === 0) return [0, 0, 0];

  const rightEdge = Math.max(
    ...items.map((item) => item.position[0] + getItemSceneWidth(item) / 2)
  );
  const width = widthMm / CONFIGURATOR_SCENE_SCALE;

  return clampItemPositionToGridBounds(
    { widthMm, depthMm: 0, rotationY: 0 },
    [snapToGrid(rightEdge + width / 2), 0, 0]
  );
}
