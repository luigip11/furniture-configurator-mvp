"use client";

import { Edges } from "@react-three/drei";
import type { PreviewPanel } from "@/lib/configurator/parametric-preview";
import { CONFIGURATOR_SCENE_SCALE } from "@/lib/configurator/scene-scale";

// Renderizza le dimensioni reali dei pannelli senza scalare spessori e ferramenta del GLB.
export function ParametricProductBody({
  panels,
  edgeColor,
}: {
  panels: PreviewPanel[];
  edgeColor: string;
}) {
  const colors = {
    internal: "#eee8dc",
    external: "#d8d3c7",
    back: "#c9c2b5",
    front: "#d8d3c7",
  };
  return (
    <group>
      {panels.map((panel, index) => (
        <mesh
          key={`${panel.code}-${index}`}
          position={
            panel.positionMm.map((v) => v / CONFIGURATOR_SCENE_SCALE) as [
              number,
              number,
              number,
            ]
          }
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={
              panel.sizeMm.map((v) => v / CONFIGURATOR_SCENE_SCALE) as [
                number,
                number,
                number,
              ]
            }
          />
          <meshStandardMaterial
            color={colors[panel.surface]}
            roughness={0.72}
          />
          <Edges color={edgeColor} />
        </mesh>
      ))}
    </group>
  );
}
