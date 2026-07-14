import type {
  ConfiguratorItem,
  ConfiguratorSettings,
  SceneMode,
} from "@/types/configurator";

export const CONFIGURATOR_GRID_SIZE = 0.25;
export const CONFIGURATOR_SCENE_SCALE = 700;
export const CONFIGURATOR_GRID_HALF_SIZE = 7;
export const WALL_UNIT_DEFAULT_BOTTOM_MM = 1400;

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

// Converte la quota inferiore standard dei pensili nella scala della scena.
export function getWallUnitSceneBottom() {
  return WALL_UNIT_DEFAULT_BOTTOM_MM / CONFIGURATOR_SCENE_SCALE;
}

// Decide se la scena deve mantenere i moduli agganciati o lasciare movimento libero.
export function shouldDockComposition(
  sceneMode: SceneMode,
  settings: Pick<ConfiguratorSettings, "allowFreeMovementInOpenScene">
) {
  return sceneMode !== "open" || !settings.allowFreeMovementInOpenScene;
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

// Ricompone i moduli in una fila continua, rispettando l'ordine logico corrente.
export function getDockedCompositionItems(
  items: ConfiguratorItem[],
  sceneMode: SceneMode
) {
  const sortedItems = [...items].sort((firstItem, secondItem) => {
    const firstX = firstItem.position[0];
    const secondX = secondItem.position[0];

    if (firstX !== secondX) return firstX - secondX;

    return items.indexOf(firstItem) - items.indexOf(secondItem);
  });

  return positionItemsFromLeft(sortedItems, sceneMode);
}

// Sposta un modulo nella sequenza in base alla X desiderata e richiude la composizione.
export function getDockedItemsAfterMove(
  items: ConfiguratorItem[],
  itemId: string,
  desiredPosition: [number, number, number],
  sceneMode: SceneMode
) {
  const movingItem = items.find((item) => item.id === itemId);

  if (!movingItem) return items;

  const desiredX = snapToGrid(desiredPosition[0]);
  const stableItems = items.filter((item) => item.id !== itemId);
  const insertIndex = stableItems.filter((item) => item.position[0] < desiredX)
    .length;
  const nextItems = [
    ...stableItems.slice(0, insertIndex),
    {
      ...movingItem,
      position: [
        desiredX,
        movingItem.position[1],
        desiredPosition[2],
      ] satisfies [number, number, number],
    },
    ...stableItems.slice(insertIndex),
  ];

  return positionItemsFromLeft(nextItems, sceneMode);
}

// Allinea il modulo nelle viste tecniche e lo sposta al primo spazio laterale libero.
export function getNonOverlappingAlignedPosition(
  item: ConfiguratorItem,
  items: ConfiguratorItem[],
  sceneMode: SceneMode
): [number, number, number] {
  const alignedPosition = getAlignedPositionForSceneMode(item, sceneMode);

  if (sceneMode === "open") return alignedPosition;

  const footprint = getItemFootprintScene(item);
  const halfWidth = footprint.width / 2;
  const [, y, z] = alignedPosition;
  const occupiedIntervals = items
    .filter((currentItem) => currentItem.id !== item.id)
    .map((currentItem) => {
      const currentFootprint = getItemFootprintScene(currentItem);
      const centerX = currentItem.position[0];

      return {
        left: centerX - currentFootprint.width / 2,
        right: centerX + currentFootprint.width / 2,
      };
    })
    .sort((a, b) => a.left - b.left);

  const desiredX = snapToGrid(alignedPosition[0]);

  if (!hasHorizontalOverlap(desiredX, halfWidth, occupiedIntervals)) {
    return [desiredX, y, z];
  }

  const candidateX = occupiedIntervals
    .flatMap((interval) => [
      snapToGrid(interval.left - halfWidth),
      snapToGrid(interval.right + halfWidth),
    ])
    .filter(
      (candidate, index, candidates) =>
        candidates.indexOf(candidate) === index &&
        !hasHorizontalOverlap(candidate, halfWidth, occupiedIntervals)
    )
    .sort((a, b) => Math.abs(a - desiredX) - Math.abs(b - desiredX))[0];

  if (candidateX !== undefined) return [candidateX, y, z];

  const rightEdge = occupiedIntervals.reduce(
    (maxRight, interval) => Math.max(maxRight, interval.right),
    0
  );

  return [snapToGrid(rightEdge + halfWidth), y, z];
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

// Stabilisce se un prodotto deve nascere alla quota pensile invece che a terra.
export function isWallUnitProduct(product: {
  code?: string | null;
  name_it?: string | null;
  name_en?: string | null;
}) {
  const text = [product.code, product.name_it, product.name_en]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("pensile") || text.includes("wall unit");
}

// Allinea una sequenza partendo dal bordo sinistro e preservando quota e profondita dei moduli.
function positionItemsFromLeft(items: ConfiguratorItem[], sceneMode: SceneMode) {
  if (items.length === 0) return [];

  const alignedItems = items.map((item) => ({
    ...item,
    position: getAlignedCompositionPosition(item, sceneMode),
  }));
  const totalWidth = alignedItems.reduce(
    (sum, item) => sum + getItemFootprintScene(item).width,
    0
  );
  let leftEdge = -totalWidth / 2;

  return alignedItems.map((item) => {
    const footprint = getItemFootprintScene(item);
    const centerX = Number((leftEdge + footprint.width / 2).toFixed(4));
    const maxX = Math.max(0, CONFIGURATOR_GRID_HALF_SIZE - footprint.width / 2);
    const [, y, z] = item.position;

    leftEdge += footprint.width;

    return {
      ...item,
      position: [
        Math.min(maxX, Math.max(-maxX, centerX)),
        y,
        z,
      ] satisfies [number, number, number],
    };
  });
}

// Blocca la profondita della composizione e delega alle viste tecniche l'allineamento dedicato.
function getAlignedCompositionPosition(
  item: ConfiguratorItem,
  sceneMode: SceneMode
): [number, number, number] {
  if (sceneMode !== "open") {
    return getAlignedPositionForSceneMode(item, sceneMode);
  }

  const [x, y] = item.position;

  return clampItemPositionToGridBounds(item, [x, y, 0]);
}

// Verifica la collisione sull'asse orizzontale nelle viste a filo.
function hasHorizontalOverlap(
  centerX: number,
  halfWidth: number,
  intervals: { left: number; right: number }[]
) {
  const epsilon = 0.001;
  const left = centerX - halfWidth;
  const right = centerX + halfWidth;

  return intervals.some(
    (interval) => right > interval.left + epsilon && left < interval.right - epsilon
  );
}
