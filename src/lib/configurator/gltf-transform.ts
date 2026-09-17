export type ModelDimensions = {
  depth: number;
  height: number;
  width: number;
};

export type GltfScaleMode = "proportional" | "independent";

export type GltfTransformPreset = {
  rotationX: number;
  scaleMode: GltfScaleMode;
};

const Z_UP_ROTATION_X = -Math.PI / 2;

// Identifica i GLB esportati con asse Z verticale anziche con asse Y verticale.
function usesZUpAxis(code?: string | null) {
  const normalizedCode = (code || "").trim().toUpperCase();

  return (
    normalizedCode.startsWith("PENSILE_") ||
    normalizedCode.startsWith("COLONNA_MISTA_IMPIANTO_")
  );
}

// Restituisce la normalizzazione necessaria per rendere coerenti gli asset eterogenei.
export function getGltfTransformPreset(
  code?: string | null
): GltfTransformPreset {
  const normalizedCode = (code || "").trim().toUpperCase();

  if (normalizedCode === "PORTALE_BASI_LAVATRICE_ASCIUGATRICE") {
    return { rotationX: 0, scaleMode: "independent" };
  }

  return {
    rotationX: usesZUpAxis(code) ? Z_UP_ROTATION_X : 0,
    scaleMode: "proportional",
  };
}

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

// Calcola una scala per asse quando il rapporto del GLB non coincide col prodotto reale.
export function getIndependentModelScale(
  source: ModelDimensions,
  target: ModelDimensions
): ModelDimensions {
  return {
    width: getSafeDimension(target.width) / getSafeDimension(source.width),
    height: getSafeDimension(target.height) / getSafeDimension(source.height),
    depth: getSafeDimension(target.depth) / getSafeDimension(source.depth),
  };
}

// Evita scale non finite o nulle quando un asset o un prodotto contiene dati incompleti.
function getSafeDimension(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}
