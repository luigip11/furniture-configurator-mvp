"use client";

import { Canvas } from "@react-three/fiber";
import { Edges, Grid, OrbitControls } from "@react-three/drei";
import { useConfiguratorStore } from "@/store/configurator-store";
import { ConfiguratorItem } from "@/types/configurator";
import { dictionary } from "@/lib/i18n/dictionary";

function ModuleBox({ item }: { item: ConfiguratorItem }) {
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const selectItem = useConfiguratorStore((state) => state.selectItem);

  const isSelected = selectedItemId === item.id;

  const width = item.widthMm / 700;
  const height = item.heightMm / 700;
  const depth = item.depthMm / 700;

  const thickness = 0.035;

  const baseColor = item.color || "#d8d3c7";
  const selectedColor = "#b7c4d6";

  return (
    <group
      position={[item.position[0], 0, item.position[2]]}
      onPointerDown={(event) => {
        event.stopPropagation();
        selectItem(item.id);
      }}
    >
      {/* corpo trasparente leggero */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isSelected ? selectedColor : baseColor}
          transparent
          opacity={0.22}
          roughness={0.65}
        />
        <Edges color={isSelected ? "#111827" : "#4b5563"} />
      </mesh>

      {/* fianco sinistro */}
      <mesh position={[-width / 2 + thickness / 2, height / 2, 0]}>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color={isSelected ? selectedColor : baseColor} />
        <Edges color="#374151" />
      </mesh>

      {/* fianco destro */}
      <mesh position={[width / 2 - thickness / 2, height / 2, 0]}>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color={isSelected ? selectedColor : baseColor} />
        <Edges color="#374151" />
      </mesh>

      {/* fondo */}
      <mesh position={[0, thickness / 2, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color={isSelected ? selectedColor : baseColor} />
        <Edges color="#374151" />
      </mesh>

      {/* top */}
      <mesh position={[0, height - thickness / 2, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color={isSelected ? selectedColor : baseColor} />
        <Edges color="#374151" />
      </mesh>

      {/* schienale */}
      <mesh position={[0, height / 2, -depth / 2 + thickness / 2]}>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color="#c9c2b5" />
        <Edges color="#374151" />
      </mesh>

      {/* ripiano interno */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width - thickness * 2, thickness, depth * 0.9]} />
        <meshStandardMaterial color="#ece7dd" />
        <Edges color="#6b7280" />
      </mesh>

      {/* basetta di selezione */}
      {isSelected ? (
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[width + 0.08, 0.02, depth + 0.08]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ) : null}
    </group>
  );
}

export function ConfiguratorScene() {
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const selectItem = useConfiguratorStore((state) => state.selectItem);

  const t = dictionary[locale];

  return (
    <section className="relative h-full min-h-[520px] overflow-hidden rounded-2xl border bg-gray-100 shadow-sm">
      <div className="absolute left-4 top-4 z-10 rounded-xl bg-white/90 px-3 py-2 text-xs text-gray-600 shadow-sm">
        {t.sceneHint}
      </div>

      <Canvas
        camera={{ position: [3.5, 2.8, 4.2], fov: 45 }}
        onPointerMissed={() => selectItem(null)}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.3} />

        <Grid
          args={[14, 14]}
          cellSize={0.25}
          cellThickness={0.4}
          sectionSize={1}
          sectionThickness={1}
          fadeDistance={18}
          fadeStrength={1}
        />

        {items.map((item) => (
          <ModuleBox key={item.id} item={item} />
        ))}

        <OrbitControls makeDefault />
      </Canvas>
    </section>
  );
}
