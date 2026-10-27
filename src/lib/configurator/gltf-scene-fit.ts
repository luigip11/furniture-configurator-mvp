// Adatta una copia del GLB alle quote di catalogo, preservando le trasformazioni originali dei nodi.
import * as THREE from "three";
import {
  getGltfTransformPreset,
  getIndependentModelScale,
} from "./gltf-transform.ts";
import type { ModelDimensions } from "./gltf-transform.ts";

// Applica normalizzazione, scala e centratura su gruppi distinti, senza sovrascrivere la scala del file.
export function fitGltfScene(
  source: THREE.Object3D,
  code: string | null | undefined,
  target: ModelDimensions,
) {
  const normalized = new THREE.Group();
  normalized.add(source.clone(true));
  normalized.rotation.x = getGltfTransformPreset(code).rotationX;
  normalized.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(normalized);
  const size = bounds.getSize(new THREE.Vector3());
  if (
    [size.x, size.y, size.z, target.width, target.height, target.depth].some(
      (v) => !Number.isFinite(v) || v <= 0,
    )
  )
    throw new Error("Modello 3D senza un volume dimensionale valido.");
  const scale = getIndependentModelScale(
    { width: size.x, height: size.y, depth: size.z },
    target,
  );
  const center = bounds.getCenter(new THREE.Vector3());
  const fitted = new THREE.Group();
  fitted.add(normalized);
  fitted.scale.set(scale.width, scale.height, scale.depth);
  fitted.position.set(
    -center.x * scale.width,
    -bounds.min.y * scale.height,
    -center.z * scale.depth,
  );
  fitted.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  fitted.updateMatrixWorld(true);
  return fitted;
}
