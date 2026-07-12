"use client";

import {
  Component,
  type ErrorInfo,
  Suspense,
  useMemo,
  type ReactNode,
} from "react";
import { Edges, Html, Line, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useConfiguratorStore } from "@/store/configurator-store";
import {
  ConfiguratorItem,
  DEFAULT_MODULE_VARIANT,
  ModuleVariantKey,
} from "@/types/configurator";

type ProductModelProps = {
  item: ConfiguratorItem;
  isDragging: boolean;
  labelsVisible: boolean;
  onDragStart: (
    item: ConfiguratorItem,
    event: ThreeEvent<PointerEvent>
  ) => void;
};

type GltfProductBodyProps = {
  item: ConfiguratorItem;
  modelUrl: string;
};

type ProductModelErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  resetKey: string;
};

type ProductModelErrorBoundaryState = {
  hasError: boolean;
};

type PanelProps = {
  args: [number, number, number];
  color: string;
  edgeColor?: string;
  position: [number, number, number];
};

type DimensionAxis = "x" | "y" | "z";

type DimensionDirection = "x+" | "x-" | "y+" | "y-" | "z+" | "z-";

type DimensionPoint = [number, number, number];

const SCENE_SCALE = 700;
const PANEL_THICKNESS = 0.04;
const EXTERIOR_COLOR = "#d8d3c7";
const INTERIOR_COLOR = "#eee8dc";
const BACK_PANEL_COLOR = "#c9c2b5";
const SHELF_COLOR = "#f4efe6";
const SELECTED_EDGE_COLOR = "#2563eb";
const EDGE_COLOR = "#4b5563";

// Gestisce un errore di caricamento GLB e mantiene il modulo parametrico operativo.
class ProductModelErrorBoundary extends Component<
  ProductModelErrorBoundaryProps,
  ProductModelErrorBoundaryState
> {
  state: ProductModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ProductModelErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: ProductModelErrorBoundaryProps) {
    if (
      previousProps.resetKey !== this.props.resetKey &&
      this.state.hasError
    ) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Impossibile caricare il modello GLB del prodotto.", {
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) return this.props.fallback;

    return this.props.children;
  }
}

// Renderizza un prodotto configurato scegliendo tra modello GLB e fallback parametrico.
export function ProductModel({
  item,
  isDragging,
  labelsVisible,
  onDragStart,
}: ProductModelProps) {
  const locale = useConfiguratorStore((state) => state.locale);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const selectItem = useConfiguratorStore((state) => state.selectItem);

  const isSelected = selectedItemId === item.id;
  const name = locale === "it" ? item.nameIt : item.nameEn || item.nameIt;
  const modelUrl = item.modelUrl?.trim() || "";
  const width = item.widthMm / SCENE_SCALE;
  const height = item.heightMm / SCENE_SCALE;
  const depth = item.depthMm / SCENE_SCALE;
  const edgeColor = isSelected ? SELECTED_EDGE_COLOR : EDGE_COLOR;
  const fallbackModel = <ParametricModule item={item} edgeColor={edgeColor} />;

  const labelClassName = isSelected
    ? "whitespace-nowrap rounded-md border border-blue-300/70 bg-blue-600/75 px-2 py-1 text-center text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm"
    : "whitespace-nowrap rounded-md border border-white/60 bg-white/65 px-2 py-1 text-center text-[11px] font-medium text-gray-800 shadow-sm backdrop-blur-sm";

  return (
    <group
      position={[item.position[0], 0, item.position[2]]}
      rotation={[0, THREE.MathUtils.degToRad(item.rotationY || 0), 0]}
      onPointerDown={(event) => {
        event.stopPropagation();
        selectItem(item.id);
        onDragStart(item, event);
      }}
    >
      {labelsVisible ? (
        <Html
          center
          distanceFactor={9}
          position={[0, height + 0.34, 0]}
          style={{ pointerEvents: "none" }}
          zIndexRange={[1, 0]}
        >
          <div className={labelClassName}>{name}</div>
        </Html>
      ) : null}

      {labelsVisible ? (
        <ModuleDimensions
          depth={depth}
          depthMm={item.depthMm}
          height={height}
          heightMm={item.heightMm}
          isSelected={isSelected}
          width={width}
          widthMm={item.widthMm}
        />
      ) : null}

      {isSelected ? (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width + 0.08, height + 0.08, depth + 0.08]} />
          <meshBasicMaterial
            color={SELECTED_EDGE_COLOR}
            transparent
            opacity={0.08}
          />
          <Edges color={SELECTED_EDGE_COLOR} />
        </mesh>
      ) : null}

      {/* Hitbox trasparente: resta stabile anche quando il GLB ha geometrie complesse. */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={item.color || EXTERIOR_COLOR}
          transparent
          opacity={isDragging ? 0.18 : 0.08}
          roughness={0.65}
        />
      </mesh>

      {modelUrl ? (
        <ProductModelErrorBoundary fallback={fallbackModel} resetKey={modelUrl}>
          <Suspense fallback={fallbackModel}>
            <GltfProductBody item={item} modelUrl={modelUrl} />
          </Suspense>
        </ProductModelErrorBoundary>
      ) : (
        fallbackModel
      )}

      {isSelected ? (
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[width + 0.12, 0.024, depth + 0.12]} />
          <meshStandardMaterial color={SELECTED_EDGE_COLOR} />
        </mesh>
      ) : null}
    </group>
  );
}

// Carica il GLB e lo adatta al bounding box dimensionale del prodotto.
function GltfProductBody({ item, modelUrl }: GltfProductBodyProps) {
  const gltf = useGLTF(modelUrl);
  const targetSize = useMemo(
    () =>
      new THREE.Vector3(
        item.widthMm / SCENE_SCALE,
        item.heightMm / SCENE_SCALE,
        item.depthMm / SCENE_SCALE
      ),
    [item.depthMm, item.heightMm, item.widthMm]
  );

  const fittedModel = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeSize = new THREE.Vector3(
      size.x || 1,
      size.y || 1,
      size.z || 1
    );
    const scale = new THREE.Vector3(
      targetSize.x / safeSize.x,
      targetSize.y / safeSize.y,
      targetSize.z / safeSize.z
    );
    const position = new THREE.Vector3(
      -center.x * scale.x,
      -box.min.y * scale.y,
      -center.z * scale.z
    );

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return { position, scale, scene };
  }, [gltf.scene, targetSize]);

  return (
    <primitive
      object={fittedModel.scene}
      position={fittedModel.position}
      scale={fittedModel.scale}
    />
  );
}

// Disegna il modulo parametrico usato dall'MVP e come fallback dei modelli esterni.
function ParametricModule({
  edgeColor,
  item,
}: {
  edgeColor: string;
  item: ConfiguratorItem;
}) {
  const variantKey = item.variantKey || DEFAULT_MODULE_VARIANT;
  const width = item.widthMm / SCENE_SCALE;
  const height = item.heightMm / SCENE_SCALE;
  const depth = item.depthMm / SCENE_SCALE;
  const thickness = Math.min(PANEL_THICKNESS, width / 5, depth / 5);
  const sideColors = getSideColors(variantKey);
  const panelColor = item.color || EXTERIOR_COLOR;

  return (
    <>
      <CabinetPanel
        args={[thickness, height, depth]}
        color={sideColors.left}
        edgeColor={edgeColor}
        position={[-width / 2 + thickness / 2, height / 2, 0]}
      />

      <CabinetPanel
        args={[thickness, height, depth]}
        color={sideColors.right}
        edgeColor={edgeColor}
        position={[width / 2 - thickness / 2, height / 2, 0]}
      />

      <CabinetPanel
        args={[width, thickness, depth]}
        color={panelColor}
        edgeColor={edgeColor}
        position={[0, thickness / 2, 0]}
      />

      <CabinetPanel
        args={[width, thickness, depth]}
        color={panelColor}
        edgeColor={edgeColor}
        position={[0, height - thickness / 2, 0]}
      />

      <CabinetPanel
        args={[width - thickness * 2, height, thickness]}
        color={BACK_PANEL_COLOR}
        edgeColor={edgeColor}
        position={[0, height / 2, -depth / 2 + thickness / 2]}
      />

      <CabinetPanel
        args={[width - thickness * 2, thickness, depth - thickness * 2]}
        color={SHELF_COLOR}
        edgeColor={edgeColor === SELECTED_EDGE_COLOR ? edgeColor : "#6b7280"}
        position={[0, height * 0.52, thickness / 2]}
      />
    </>
  );
}

// Disegna un pannello del modulo parametrico con materiale e bordi coerenti.
function CabinetPanel({
  args,
  color,
  edgeColor = EDGE_COLOR,
  position,
}: PanelProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.72} />
      <Edges color={edgeColor} />
    </mesh>
  );
}

// Determina i colori dei fianchi in base alla variante tecnica del modulo.
function getSideColors(variantKey: ModuleVariantKey) {
  if (variantKey === "one_visible_one_internal") {
    return {
      left: EXTERIOR_COLOR,
      right: INTERIOR_COLOR,
    };
  }

  if (variantKey === "two_internal_sides") {
    return {
      left: INTERIOR_COLOR,
      right: INTERIOR_COLOR,
    };
  }

  return {
    left: EXTERIOR_COLOR,
    right: EXTERIOR_COLOR,
  };
}

// Mostra le quote principali del modulo nello spazio 3D.
function ModuleDimensions({
  depth,
  depthMm,
  height,
  heightMm,
  isSelected,
  width,
  widthMm,
}: {
  depth: number;
  depthMm: number;
  height: number;
  heightMm: number;
  isSelected: boolean;
  width: number;
  widthMm: number;
}) {
  const color = isSelected ? SELECTED_EDGE_COLOR : "#374151";
  const frontOffset = depth / 2 + 0.18;
  const sideOffset = width / 2 + 0.18;
  const heightX = -width / 2 - 0.16;
  const heightZ = -depth / 2 - 0.12;

  return (
    <group>
      <DimensionLine
        axis="x"
        color={color}
        end={[width / 2, 0.06, frontOffset]}
        endDirection="x+"
        label={`L ${widthMm} mm`}
        labelPosition={[0, 0.16, frontOffset]}
        start={[-width / 2, 0.06, frontOffset]}
        startDirection="x-"
      />

      <DimensionLine
        axis="z"
        color={color}
        end={[sideOffset, 0.06, depth / 2]}
        endDirection="z+"
        label={`P ${depthMm} mm`}
        labelPosition={[sideOffset + 0.1, 0.16, 0]}
        start={[sideOffset, 0.06, -depth / 2]}
        startDirection="z-"
      />

      <DimensionLine
        axis="y"
        color={color}
        end={[heightX, height, heightZ]}
        endDirection="y+"
        label={`A ${heightMm} mm`}
        labelPosition={[heightX - 0.08, height / 2, heightZ]}
        start={[heightX, 0, heightZ]}
        startDirection="y-"
      />
    </group>
  );
}

// Compone una linea quota con estensioni, frecce e label HTML.
function DimensionLine({
  axis,
  color,
  end,
  endDirection,
  label,
  labelPosition,
  start,
  startDirection,
}: {
  axis: DimensionAxis;
  color: string;
  end: DimensionPoint;
  endDirection: DimensionDirection;
  label: string;
  labelPosition: DimensionPoint;
  start: DimensionPoint;
  startDirection: DimensionDirection;
}) {
  return (
    <group>
      <Line color={color} lineWidth={1.4} points={[start, end]} />
      <DimensionExtension axis={axis} color={color} position={start} />
      <DimensionExtension axis={axis} color={color} position={end} />
      <DimensionArrow
        color={color}
        direction={startDirection}
        position={start}
      />
      <DimensionArrow color={color} direction={endDirection} position={end} />
      <Html
        center
        distanceFactor={8}
        position={labelPosition}
        style={{ pointerEvents: "none" }}
        zIndexRange={[1, 0]}
      >
        <span className="whitespace-nowrap px-1 text-[10px] font-semibold text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
          {label}
        </span>
      </Html>
    </group>
  );
}

// Aggiunge il piccolo tratto perpendicolare agli estremi di una quota.
function DimensionExtension({
  axis,
  color,
  position,
}: {
  axis: DimensionAxis;
  color: string;
  position: DimensionPoint;
}) {
  const tickLength = 0.08;
  const halfTick = tickLength / 2;
  const points: [DimensionPoint, DimensionPoint] =
    axis === "y"
      ? [
          [position[0] - halfTick, position[1], position[2]],
          [position[0] + halfTick, position[1], position[2]],
        ]
      : [
          [position[0], position[1], position[2] - halfTick],
          [position[0], position[1], position[2] + halfTick],
        ];

  return <Line color={color} lineWidth={1.2} points={points} />;
}

// Renderizza una freccia orientata lungo l'asse della quota.
function DimensionArrow({
  color,
  direction,
  position,
}: {
  color: string;
  direction: DimensionDirection;
  position: DimensionPoint;
}) {
  return (
    <mesh position={position} rotation={getArrowRotation(direction)}>
      <coneGeometry args={[0.025, 0.075, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Restituisce la rotazione della freccia per ciascuna direzione di quota.
function getArrowRotation(direction: DimensionDirection) {
  if (direction === "x+") return [0, 0, -Math.PI / 2] as const;
  if (direction === "x-") return [0, 0, Math.PI / 2] as const;
  if (direction === "y-") return [0, 0, Math.PI] as const;
  if (direction === "z+") return [Math.PI / 2, 0, 0] as const;
  if (direction === "z-") return [-Math.PI / 2, 0, 0] as const;

  return [0, 0, 0] as const;
}
