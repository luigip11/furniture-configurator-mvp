import type { ConfiguratorItem } from "@/types/configurator";

export const CONFIGURATOR_GRID_SIZE = 0.25;

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
  return item.widthMm / 700;
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
  const width = widthMm / 700;

  return [snapToGrid(rightEdge + width / 2), 0, 0];
}
