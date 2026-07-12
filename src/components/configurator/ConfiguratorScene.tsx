"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Edges, Grid, OrbitControls } from "@react-three/drei";
import {
  Eye,
  EyeOff,
  Info,
  Minus,
  Plus,
  Redo2,
  RotateCw,
  Trash2,
  Undo2,
} from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ProductModel } from "@/components/configurator/ProductModel";
import {
  CONFIGURATOR_GRID_SIZE,
  useConfiguratorStore,
} from "@/store/configurator-store";
import {
  CONFIGURATOR_SCENE_SCALE,
  getItemFootprintMm,
} from "@/store/configurator-calculations";
import {
  ConfiguratorItem,
  Product,
  SCENE_MODE_OPTIONS,
  SceneMode,
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

type CatalogDropRequest = {
  clientX: number;
  clientY: number;
  id: number;
  productId: string;
};

type ViewCommandType = "zoom-in" | "zoom-out" | "rotate";

type ViewCommand = {
  id: number;
  type: ViewCommandType;
};

const CAMERA_MIN_DISTANCE = 1.2;
const CAMERA_DEFAULT_MAX_DISTANCE = 11;
const CAMERA_MAX_DISTANCE_CAP = 15;
const CAMERA_DISTANCE_LIMIT_EPSILON = 0.04;
const CAMERA_ROTATION_STEP = Math.PI / 8;

function SceneContent({
  catalogDropRequest,
  labelsVisible,
  onZoomOutLimitChange,
  products,
  sceneMode,
  viewCommand,
}: {
  catalogDropRequest: CatalogDropRequest | null;
  labelsVisible: boolean;
  onZoomOutLimitChange: (isAtLimit: boolean) => void;
  products: Product[];
  sceneMode: SceneMode;
  viewCommand: ViewCommand | null;
}) {
  const items = useConfiguratorStore((state) => state.items);
  const addProductAtPosition = useConfiguratorStore(
    (state) => state.addProductAtPosition
  );
  const selectItem = useConfiguratorStore((state) => state.selectItem);
  const updatePosition = useConfiguratorStore((state) => state.updatePosition);
  const commitHistory = useConfiguratorStore((state) => state.commitHistory);
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
  const maxCameraDistance = useMemo(() => getMaxCameraDistance(items), [items]);

  const updateZoomOutLimit = useCallback(() => {
    const target = controlsRef.current?.target || new THREE.Vector3(0, 0, 0);
    const distance = camera.position.distanceTo(target);

    onZoomOutLimitChange(
      distance >= maxCameraDistance - CAMERA_DISTANCE_LIMIT_EPSILON
    );
  }, [camera.position, maxCameraDistance, onZoomOutLimitChange]);

  const getGroundPoint = useCallback(
    (clientX: number, clientY: number) => {
      const bounds = gl.domElement.getBoundingClientRect();

      pointerRef.current.set(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        -((clientY - bounds.top) / bounds.height) * 2 + 1
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

      updatePosition(
        currentDrag.itemId,
        [point.x + currentDrag.offsetX, 0, point.z + currentDrag.offsetZ],
        { recordHistory: false }
      );
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

      const point = getGroundPoint(event.clientX, event.clientY);

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
    if (!catalogDropRequest) return;

    const product = products.find(
      (currentProduct) => currentProduct.id === catalogDropRequest.productId
    );
    const point = getGroundPoint(
      catalogDropRequest.clientX,
      catalogDropRequest.clientY
    );

    if (!product || !point) return;

    addProductAtPosition(product, [point.x, 0, point.z]);
  }, [addProductAtPosition, catalogDropRequest, getGroundPoint, products]);

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
        maxCameraDistance
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
    updateZoomOutLimit();
  }, [camera, maxCameraDistance, updateZoomOutLimit, verticalAxis, viewCommand]);

  useEffect(() => {
    const target = controlsRef.current?.target || new THREE.Vector3(0, 0, 0);
    const cameraOffset = camera.position.clone().sub(target);

    if (cameraOffset.length() <= maxCameraDistance) {
      updateZoomOutLimit();
      return;
    }

    cameraOffset.setLength(maxCameraDistance);
    camera.position.copy(target).add(cameraOffset);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    controlsRef.current?.update();
    updateZoomOutLimit();
  }, [camera, maxCameraDistance, updateZoomOutLimit]);

  const handleDragStart = (
    item: ConfiguratorItem,
    event: ThreeEvent<PointerEvent>
  ) => {
    commitHistory();
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

      {sceneMode !== "open" ? <SceneAlignmentGuide sceneMode={sceneMode} /> : null}

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
        <ProductModel
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
        minDistance={CAMERA_MIN_DISTANCE}
        maxDistance={maxCameraDistance}
        onChange={updateZoomOutLimit}
      />
    </>
  );
}

function SceneAlignmentGuide({ sceneMode }: { sceneMode: SceneMode }) {
  if (sceneMode === "wall") {
    return (
      <group>
        <mesh position={[0, 1.05, 0]}>
          <planeGeometry args={[12, 2.1]} />
          <meshStandardMaterial
            color="#93c5fd"
            opacity={0.18}
            transparent
            roughness={0.8}
          />
          <Edges color="#60a5fa" />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[12, 0.035, 0.035]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[0, 0.02, 0]}>
      <boxGeometry args={[12, 0.035, 0.045]} />
      <meshStandardMaterial color="#0f766e" />
    </mesh>
  );
}

function SceneHint({
  compact,
  mobileVisible,
  text,
}: {
  compact: boolean;
  mobileVisible: boolean;
  text: string;
}) {
  const sentences = text
    .split(".")
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (compact || sentences.length < 2) {
    return (
      <p
        className={`absolute left-3 right-3 top-20 z-10 text-center text-xs font-medium text-gray-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)] sm:left-4 sm:right-auto sm:top-4 sm:block sm:whitespace-nowrap sm:text-left ${
          mobileVisible ? "block" : "hidden"
        }`}
      >
        {sentences[0] ? `${sentences[0]}.` : text}
      </p>
    );
  }

  return (
    <p
      className={`absolute left-3 right-3 top-20 z-10 text-center text-xs font-medium leading-5 text-gray-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)] sm:left-4 sm:right-auto sm:top-4 sm:block sm:max-w-[220px] sm:text-left ${
        mobileVisible ? "block" : "hidden"
      }`}
    >
      <span className="block">{sentences[0]}.</span>
      <span className="block">{sentences.slice(1).join(". ")}.</span>
    </p>
  );
}

type ConfiguratorSceneProps = {
  compactHint?: boolean;
  products: Product[];
};

export function ConfiguratorScene({
  compactHint = false,
  products,
}: ConfiguratorSceneProps) {
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const sceneMode = useConfiguratorStore((state) => state.sceneMode);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const setSceneMode = useConfiguratorStore((state) => state.setSceneMode);
  const selectItem = useConfiguratorStore((state) => state.selectItem);
  const removeItem = useConfiguratorStore((state) => state.removeItem);
  const canRedo = useConfiguratorStore((state) => state.canRedo);
  const canUndo = useConfiguratorStore((state) => state.canUndo);
  const redo = useConfiguratorStore((state) => state.redo);
  const undo = useConfiguratorStore((state) => state.undo);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [mobileHintVisible, setMobileHintVisible] = useState(false);
  const [viewCommand, setViewCommand] = useState<ViewCommand | null>(null);
  const [zoomOutDisabled, setZoomOutDisabled] = useState(false);
  const [catalogDropRequest, setCatalogDropRequest] =
    useState<CatalogDropRequest | null>(null);
  const viewCommandIdRef = useRef(0);
  const catalogDropIdRef = useRef(0);

  const t = dictionary[locale];
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const selectedItemName = selectedItem
    ? locale === "it"
      ? selectedItem.nameIt
      : selectedItem.nameEn || selectedItem.nameIt
    : "";
  const footprintSummary = useMemo(() => getFootprintSummary(items), [items]);
  const showFootprintSummary = sceneMode !== "open" && footprintSummary.count > 0;

  const sendViewCommand = (type: ViewCommandType) => {
    viewCommandIdRef.current += 1;
    setViewCommand({ id: viewCommandIdRef.current, type });
  };

  // Traduce il drop HTML del catalogo in una richiesta che la scena 3D converte in coordinate mondo.
  function handleCatalogDrop(event: React.DragEvent<HTMLElement>) {
    const productId = event.dataTransfer.getData(
      "application/x-configurator-product-id"
    );

    if (!productId) return;

    event.preventDefault();
    catalogDropIdRef.current += 1;
    setCatalogDropRequest({
      clientX: event.clientX,
      clientY: event.clientY,
      id: catalogDropIdRef.current,
      productId,
    });
  }

  return (
    <section
      className="configurator-scene relative h-[520px] w-full overflow-hidden rounded-2xl border bg-gray-100 shadow-sm lg:h-full lg:min-h-0"
      onDragOver={(event) => {
        if (
          event.dataTransfer.types.includes(
            "application/x-configurator-product-id"
          )
        ) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={handleCatalogDrop}
    >
      <button
        type="button"
        aria-expanded={mobileHintVisible}
        aria-label={
          mobileHintVisible ? t.hideSceneInstructions : t.showSceneInstructions
        }
        title={
          mobileHintVisible ? t.hideSceneInstructions : t.showSceneInstructions
        }
        onClick={() => setMobileHintVisible((visible) => !visible)}
        className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-800 shadow-sm ring-1 ring-black/10 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:hidden"
      >
        <Info size={18} aria-hidden="true" />
      </button>

      <SceneHint
        compact={compactHint}
        mobileVisible={mobileHintVisible}
        text={t.sceneHint}
      />

      <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 rounded-lg bg-white/90 p-1 shadow-sm ring-1 ring-black/10 backdrop-blur-sm">
        {SCENE_MODE_OPTIONS.map((modeOption) => (
          <button
            key={modeOption.key}
            type="button"
            aria-pressed={sceneMode === modeOption.key}
            onClick={() => setSceneMode(modeOption.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              sceneMode === modeOption.key
                ? "bg-gray-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {locale === "it" ? modeOption.labelIt : modeOption.labelEn}
          </button>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 sm:flex-row">
          {selectedItem ? (
            <button
              type="button"
              aria-label={`${t.remove}: ${selectedItemName}`}
              title={t.removeSelectedItem}
              onClick={() => removeItem(selectedItem.id)}
              className="order-2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 sm:order-1"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          ) : null}

          <button
            type="button"
            aria-pressed={labelsVisible}
            aria-label={labelsVisible ? t.hideLabels : t.showLabels}
            title={labelsVisible ? t.hideLabels : t.showLabels}
            onClick={() => setLabelsVisible((visible) => !visible)}
            className="order-1 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-800 shadow-sm ring-1 ring-black/10 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:order-2"
          >
            {labelsVisible ? (
              <Eye size={18} aria-hidden="true" />
            ) : (
              <EyeOff size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      ) : null}

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 rounded-lg bg-white/95 p-1 shadow-md ring-1 ring-black/10">
        <MapControlButton
          label={t.zoomIn}
          onClick={() => sendViewCommand("zoom-in")}
        >
          <Plus size={18} aria-hidden="true" />
        </MapControlButton>
        <MapControlButton
          disabled={zoomOutDisabled}
          label={t.zoomOut}
          onClick={() => sendViewCommand("zoom-out")}
        >
          <Minus size={18} aria-hidden="true" />
        </MapControlButton>
        <MapControlButton
          label={t.rotateMap}
          onClick={() => sendViewCommand("rotate")}
        >
          <RotateCw size={18} aria-hidden="true" />
        </MapControlButton>
      </div>

      <div
        className={`absolute left-4 z-20 flex flex-col gap-2 rounded-lg bg-white/95 p-1 shadow-md ring-1 ring-black/10 ${
          showFootprintSummary ? "bottom-36 sm:bottom-4" : "bottom-4"
        }`}
      >
        <MapControlButton
          disabled={!canUndo}
          label={locale === "it" ? "Annulla" : "Undo"}
          onClick={undo}
        >
          <Undo2 size={18} aria-hidden="true" />
        </MapControlButton>
        <MapControlButton
          disabled={!canRedo}
          label={locale === "it" ? "Ripristina" : "Redo"}
          onClick={redo}
        >
          <Redo2 size={18} aria-hidden="true" />
        </MapControlButton>
      </div>

      {showFootprintSummary ? (
        <div className="absolute bottom-4 left-4 z-10 w-[calc(100%-96px)] rounded-xl bg-white/92 p-3 shadow-md ring-1 ring-black/10 backdrop-blur-sm sm:left-1/2 sm:w-[min(520px,calc(100%-120px))] sm:-translate-x-1/2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              {sceneMode === "wall" ? t.wallFootprint : t.frontFootprint}
            </p>
            <p className="text-xs font-medium text-gray-500">
              {footprintSummary.count} {t.modules}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <FootprintValue
              label={t.width.toUpperCase()}
              value={footprintSummary.widthMm}
            />
            <FootprintValue
              label={t.height.toUpperCase()}
              value={footprintSummary.heightMm}
            />
            <FootprintValue
              label={t.depth.toUpperCase()}
              value={footprintSummary.depthMm}
            />
          </div>
        </div>
      ) : null}

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
        <SceneContent
          catalogDropRequest={catalogDropRequest}
          labelsVisible={labelsVisible}
          onZoomOutLimitChange={setZoomOutDisabled}
          products={products}
          sceneMode={sceneMode}
          viewCommand={viewCommand}
        />
      </Canvas>
    </section>
  );
}

// Adatta il limite di zoom-out all'ingombro reale dei moduli in scena.
function getMaxCameraDistance(items: ConfiguratorItem[]) {
  if (items.length === 0) return CAMERA_DEFAULT_MAX_DISTANCE;

  const footprint = getFootprintSummary(items);
  const largestFootprintSceneUnits =
    Math.max(footprint.widthMm, footprint.depthMm) / CONFIGURATOR_SCENE_SCALE;

  return THREE.MathUtils.clamp(
    largestFootprintSceneUnits * 2.2 + 5.5,
    CAMERA_DEFAULT_MAX_DISTANCE,
    CAMERA_MAX_DISTANCE_CAP
  );
}

type FootprintSummary = {
  count: number;
  depthMm: number;
  heightMm: number;
  widthMm: number;
};

function getFootprintSummary(items: ConfiguratorItem[]): FootprintSummary {
  if (items.length === 0) {
    return {
      count: 0,
      depthMm: 0,
      heightMm: 0,
      widthMm: 0,
    };
  }

  const boxes = items.map((item) => {
    const footprint = getItemFootprintMm(item);
    const centerX = item.position[0] * CONFIGURATOR_SCENE_SCALE;
    const centerZ = item.position[2] * CONFIGURATOR_SCENE_SCALE;

    return {
      heightMm: item.heightMm,
      maxX: centerX + footprint.widthMm / 2,
      maxZ: centerZ + footprint.depthMm / 2,
      minX: centerX - footprint.widthMm / 2,
      minZ: centerZ - footprint.depthMm / 2,
    };
  });

  return {
    count: items.length,
    depthMm: Math.round(
      Math.max(...boxes.map((box) => box.maxZ)) -
        Math.min(...boxes.map((box) => box.minZ))
    ),
    heightMm: Math.round(Math.max(...boxes.map((box) => box.heightMm))),
    widthMm: Math.round(
      Math.max(...boxes.map((box) => box.maxX)) -
        Math.min(...boxes.map((box) => box.minX))
    ),
  };
}

function FootprintValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-lg bg-gray-100 px-2 py-2">
      <p
        className="truncate text-[10px] font-semibold uppercase text-gray-500"
        title={label}
      >
        {label}
      </p>
      <p className="text-sm font-bold text-gray-950">{value} mm</p>
    </div>
  );
}

type MapControlButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

function MapControlButton({
  children,
  disabled = false,
  label,
  onClick,
}: MapControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
