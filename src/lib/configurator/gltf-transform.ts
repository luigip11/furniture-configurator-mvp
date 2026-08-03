export type ModelDimensions = {
  depth: number;
  height: number;
  width: number;
};

// Calcola una scala uniforme per preservare le proporzioni del GLB entro l'ingombro dichiarato.
export function getProportionalModelScale(
  source: ModelDimensions,
  target: ModelDimensions
) {
  const sourceWidth = getSafeDimension(source.width);
  const sourceHeight = getSafeDimension(source.height);
  const sourceDepth = getSafeDimension(source.depth);
  const targetWidth = getSafeDimension(target.width);
  const targetHeight = getSafeDimension(target.height);
  const targetDepth = getSafeDimension(target.depth);

  return Math.min(
    targetWidth / sourceWidth,
    targetHeight / sourceHeight,
    targetDepth / sourceDepth
  );
}

// Evita scale non finite o nulle quando un asset o un prodotto contiene dati incompleti.
function getSafeDimension(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}
