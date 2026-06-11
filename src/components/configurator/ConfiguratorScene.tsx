"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Edges, Grid, Html, OrbitControls } from "@react-three/drei";
import { Eye, EyeOff, Minus, Plus, RotateCw } from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  CONFIGURATOR_GRID_SIZE,
  useConfiguratorStore,
} from "@/store/configurator-store";
import {
  ConfiguratorItem,
  DEFAULT_MODULE_VARIANT,
  ModuleVariantKey,
} from "@/types/configurator";
import { dictionary } from "@/lib/i18n/dictionary";

type DragState = {
  itemId: string;
  pointerId: number;
};

type DragRefState = DragState & {
  offsetX: number;
  offsetZ: number;
};

type ViewCommandType = "zoom-in" | "zoom-out" | "rotate";

type ViewCommand = {
  id: number;
  type: ViewCommandType;
};

type ModuleBoxProps = {
  item: ConfiguratorItem;
  isDragging: boolean;
  labelsVisible: boolean;
  onDragStart: (
    item: ConfiguratorItem,
    event: ThreeEvent<PointerEvent>
  ) => void;
};

type PanelProps = {
  args: [number, number, number];
  color: string;
  edgeColor?: string;
  position: [number, number, number];
};

const SCENE_SCALE = 700;
const PANEL_THICKNESS = 0.04;
const EXTERIOR_COLOR = "#d8d3c7";
const INTERIOR_COLOR = "#eee8dc";
const BACK_PANEL_COLOR = "#c9c2b5";
const SHELF_COLOR = "#f4efe6";
const SELECTED_EDGE_COLOR = "#2563eb";
const EDGE_COLOR = "#4b5563";
const CAMERA_MIN_DISTANCE = 1.2;
const CAMERA_MAX_DISTANCE = 12;
const CAMERA_ROTATION_STEP = Math.PI / 8;

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

function ModuleBox({
  item,
  isDragging,
  labelsVisible,
  onDragStart,
}: ModuleBoxProps) {
  const locale = useConfiguratorStore((state) => state.locale);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const selectItem = useConfiguratorStore((state) => state.selectItem);

  const isSelected = selectedItemId === item.id;
  const name = locale === "it" ? item.nameIt : item.nameEn || item.nameIt;
  const variantKey = item.variantKey || DEFAULT_MODULE_VARIANT;
  const dimensionsLabel = `${item.widthMm} x ${item.heightMm} x ${item.depthMm} mm`;

  const width = item.widthMm / SCENE_SCALE;
  const height = item.heightMm / SCENE_SCALE;
  const depth = item.depthMm / SCENE_SCALE;

  const thickness = Math.min(PANEL_THICKNESS, width / 5, depth / 5);
  const sideColors = getSideColors(variantKey);
  const panelColor = item.color || EXTERIOR_COLOR;
  const leftSideColor = sideColors.left;
  const rightSideColor = sideColors.right;
  const edgeColor = isSelected ? SELECTED_EDGE_COLOR : EDGE_COLOR;

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
        >
          <div className={labelClassName}>
            <div>{name}</div>
            <div className="text-[10px] font-normal opacity-80">
              {dimensionsLabel}
            </div>
          </div>
        </Html>
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

      {/* hitbox trasparente: rende selezione e drag più facili */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={panelColor}
          transparent
          opacity={isDragging ? 0.18 : 0.08}
          roughness={0.65}
        />
      </mesh>

      <CabinetPanel
        args={[thickness, height, depth]}
        color={leftSideColor}
        edgeColor={edgeColor}
        position={[-width / 2 + thickness / 2, height / 2, 0]}
      />

      <CabinetPanel
        args={[thickness, height, depth]}
        color={rightSideColor}
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
        edgeColor={isSelected ? SELECTED_EDGE_COLOR : "#6b7280"}
        position={[0, height * 0.52, thickness / 2]}
      />

      {isSelected ? (
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[width + 0.12, 0.024, depth + 0.12]} />
          <meshStandardMaterial color={SELECTED_EDGE_COLOR} />
        </mesh>
      ) : null}
    </group>
  );
}

function SceneContent({
  labelsVisible,
  viewCommand,
}: {
  labelsVisible: boolean;
  viewCommand: ViewCommand | null;
}) {
  const items = useConfiguratorStore((state) => state.items);
  const selectItem = useConfiguratorStore((state) => state.selectItem);
  const updatePosition = useConfiguratorStore((state) => state.updatePosition);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const dragRef = useRef<DragRefState | null>(null);
  const lastViewCommandIdRef = useRef(0);
  const { camera, gl } = useThree();
  const groundPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );
  const planePointRef = useRef(new THREE.Vector3());
  const pointerRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());
  const verticalAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const getGroundPoint = useCallback(
    (event: PointerEvent) => {
      const bounds = gl.domElement.getBoundingClientRect();

      pointerRef.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      return raycasterRef.current.ray.intersectPlane(
        groundPlane,
        planePointRef.current
      );
    },
    [camera, gl.domElement, groundPlane]
  );

  const moveDraggedItem = useCallback(
    (point: THREE.Vector3) => {
      const currentDrag = dragRef.current;

      if (!currentDrag) return;

      updatePosition(currentDrag.itemId, [
        point.x + currentDrag.offsetX,
        0,
        point.z + currentDrag.offsetZ,
      ]);
    },
    [updatePosition]
  );

  const stopDragging = useCallback(
    (pointerId?: number) => {
      const currentDrag = dragRef.current;

      if (!currentDrag) return;
      if (pointerId !== undefined && pointerId !== currentDrag.pointerId) return;

      gl.domElement.releasePointerCapture?.(currentDrag.pointerId);
      dragRef.current = null;
      setDragState(null);
    },
    [gl.domElement]
  );

  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      const currentDrag = dragRef.current;

      if (!currentDrag || event.pointerId !== currentDrag.pointerId) return;

      const point = getGroundPoint(event);

      if (point) moveDraggedItem(point);
    };

    const handleWindowPointerUp = (event: PointerEvent) => {
      stopDragging(event.pointerId);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [getGroundPoint, moveDraggedItem, stopDragging]);

  useEffect(() => {
    if (!viewCommand || viewCommand.id === lastViewCommandIdRef.current) return;

    lastViewCommandIdRef.current = viewCommand.id;

    const target = controlsRef.current?.target || new THREE.Vector3(0, 0, 0);
    const cameraOffset = camera.position.clone().sub(target);

    if (viewCommand.type === "zoom-in" || viewCommand.type === "zoom-out") {
      const zoomFactor = viewCommand.type === "zoom-in" ? 0.82 : 1.18;
      const nextDistance = THREE.MathUtils.clamp(
        cameraOffset.length() * zoomFactor,
        CAMERA_MIN_DISTANCE,
        CAMERA_MAX_DISTANCE
      );

      cameraOffset.setLength(nextDistance);
    }

    if (viewCommand.type === "rotate") {
      cameraOffset.applyAxisAngle(verticalAxis, CAMERA_ROTATION_STEP);
    }

    camera.position.copy(target).add(cameraOffset);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    controlsRef.current?.update();
  }, [camera, verticalAxis, viewCommand]);

  const handleDragStart = (
    item: ConfiguratorItem,
    event: ThreeEvent<PointerEvent>
  ) => {
    const point =
      event.ray.intersectPlane(groundPlane, planePointRef.current) ||
      event.point;

    gl.domElement.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      itemId: item.id,
      pointerId: event.pointerId,
      offsetX: item.position[0] - point.x,
      offsetZ: item.position[2] - point.z,
    };

    setDragState({ itemId: item.id, pointerId: event.pointerId });
  };

  const handlePlanePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current) return;

    const point =
      event.ray.intersectPlane(groundPlane, planePointRef.current) ||
      event.point;

    moveDraggedItem(point);
  };

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.3} />

      <Grid
        args={[14, 14]}
        cellSize={CONFIGURATOR_GRID_SIZE}
        cellThickness={0.4}
        sectionSize={1}
        sectionThickness={1}
        fadeDistance={18}
        fadeStrength={1}
      />

      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(event) => {
          if (dragRef.current) return;

          event.stopPropagation();
          selectItem(null);
        }}
        onPointerMove={handlePlanePointerMove}
      >
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          depthWrite={false}
          transparent
          opacity={0}
        />
      </mesh>

      {items.map((item) => (
        <ModuleBox
          key={item.id}
          item={item}
          isDragging={dragState?.itemId === item.id}
          labelsVisible={labelsVisible}
          onDragStart={handleDragStart}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={dragState === null}
      />
    </>
  );
}

export function ConfiguratorScene() {
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const selectItem = useConfiguratorStore((state) => state.selectItem);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [viewCommand, setViewCommand] = useState<ViewCommand | null>(null);
  const viewCommandIdRef = useRef(0);

  const t = dictionary[locale];

  const sendViewCommand = (type: ViewCommandType) => {
    viewCommandIdRef.current += 1;
    setViewCommand({ id: viewCommandIdRef.current, type });
  };

  return (
    <section className="configurator-scene relative h-[520px] w-full overflow-hidden rounded-2xl border bg-gray-100 shadow-sm lg:h-full lg:min-h-0">
      <div className="absolute left-4 top-4 z-10 rounded-xl bg-white/90 px-3 py-2 text-xs text-gray-600 shadow-sm">
        {t.sceneHint}
      </div>

      {items.length > 0 ? (
        <button
          type="button"
          aria-pressed={labelsVisible}
          aria-label={labelsVisible ? "Nascondi etichette" : "Mostra etichette"}
          title={labelsVisible ? "Nascondi etichette" : "Mostra etichette"}
          onClick={() => setLabelsVisible((visible) => !visible)}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-800 shadow-sm ring-1 ring-black/10 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {labelsVisible ? (
            <Eye size={18} aria-hidden="true" />
          ) : (
            <EyeOff size={18} aria-hidden="true" />
          )}
        </button>
      ) : null}

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 rounded-lg bg-white/95 p-1 shadow-md ring-1 ring-black/10">
        <MapControlButton
          label="Zoom avanti"
          onClick={() => sendViewCommand("zoom-in")}
        >
          <Plus size={18} aria-hidden="true" />
        </MapControlButton>
        <MapControlButton
          label="Zoom indietro"
          onClick={() => sendViewCommand("zoom-out")}
        >
          <Minus size={18} aria-hidden="true" />
        </MapControlButton>
        <MapControlButton
          label="Ruota mappa"
          onClick={() => sendViewCommand("rotate")}
        >
          <RotateCw size={18} aria-hidden="true" />
        </MapControlButton>
      </div>

      <Canvas
        camera={{ position: [3.5, 2.8, 4.2], fov: 45 }}
        onCreated={({ gl }) => {
          const parent = gl.domElement.parentElement;

          if (!parent) return;

          const syncCanvasSize = () => {
            gl.domElement.style.height = "100%";
            gl.domElement.style.width = "100%";
            gl.setSize(parent.clientWidth, parent.clientHeight, false);
          };

          syncCanvasSize();
          requestAnimationFrame(syncCanvasSize);
        }}
        shadows
        style={{ height: "100%", width: "100%" }}
        onPointerMissed={() => selectItem(null)}
      >
        <SceneContent labelsVisible={labelsVisible} viewCommand={viewCommand} />
      </Canvas>
    </section>
  );
}

type MapControlButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
};

function MapControlButton({
  children,
  label,
  onClick,
}: MapControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      {children}
    </button>
  );
}
