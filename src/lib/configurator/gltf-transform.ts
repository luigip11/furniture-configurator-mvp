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
  const sourceWidth = source.width > 0 ? source.width : 1;
  const sourceHeight = source.height > 0 ? source.height : 1;
  const sourceDepth = source.depth > 0 ? source.depth : 1;

  return Math.min(
    target.width / sourceWidth,
    target.height / sourceHeight,
    target.depth / sourceDepth
  );
}
