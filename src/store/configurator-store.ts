import { create } from "zustand";
import {
  ConfiguratorItem,
  DEFAULT_DOOR_CONFIGURATION,
  DEFAULT_MODULE_VARIANT,
  DoorConfiguration,
  Locale,
  ModuleVariantKey,
  Product,
  SceneMode,
} from "@/types/configurator";
import {
  getItemSceneWidth,
  getAlignedPositionForSceneMode,
  getNextPosition,
  getNonOverlappingAlignedPosition,
  normalizeRotation,
  snapPosition,
} from "@/store/configurator-calculations";
import {
  getSafeModuleVariant,
  hasConfigurableModuleVariants,
} from "@/lib/configurator/module-technical-catalog";

export { CONFIGURATOR_GRID_SIZE, snapToGrid } from "@/store/configurator-calculations";

type ConfiguratorHistorySnapshot = {
  items: ConfiguratorItem[];
  selectedItemId: string | null;
};

type ConfiguratorStore = {
  locale: Locale;
  items: ConfiguratorItem[];
  past: ConfiguratorHistorySnapshot[];
  future: ConfiguratorHistorySnapshot[];
  sceneMode: SceneMode;
  selectedItemId: string | null;
  canRedo: boolean;
  canUndo: boolean;

  commitHistory: () => void;
  setLocale: (locale: Locale) => void;
  setSceneMode: (sceneMode: SceneMode) => void;
  addProduct: (product: Product) => void;
  addProductAtPosition: (
    product: Product,
    position: [number, number, number]
  ) => void;
  selectItem: (itemId: string | null) => void;
  updateItem: (
    itemId: string,
    data: Partial<
      Pick<ConfiguratorItem, "widthMm" | "heightMm" | "depthMm" | "position">
    >
  ) => void;
  updateDoorConfiguration: (
    itemId: string,
    data: Partial<DoorConfiguration>
  ) => void;
  updateVariant: (itemId: string, variantKey: ModuleVariantKey) => void;
  updatePosition: (
    itemId: string,
    position: [number, number, number],
    options?: { recordHistory?: boolean }
  ) => void;
  duplicateItem: (itemId: string) => void;
  rotateItem: (itemId: string) => void;
  moveItem: (itemId: string, axis: "x" | "z", value: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  redo: () => void;
  undo: () => void;
};

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  locale: "it",
  items: [],
  past: [],
  future: [],
  sceneMode: "open",
  selectedItemId: null,
  canRedo: false,
  canUndo: false,

  commitHistory: () => {
    const { items, past, selectedItemId } = get();

    set({
      past: [...past, cloneSnapshot({ items, selectedItemId })],
      future: [],
      canUndo: true,
      canRedo: false,
    });
  },

  setLocale: (locale) => set({ locale }),

  setSceneMode: (sceneMode) => {
    get().commitHistory();
    const alignedItems = get().items.reduce<ConfiguratorItem[]>(
      (currentItems, item) => {
        const alignedItem = {
          ...item,
          position: getNonOverlappingAlignedPosition(
            item,
            currentItems,
            sceneMode
          ),
        };

        return [...currentItems, alignedItem];
      },
      []
    );

    set({
      sceneMode,
      items: alignedItems,
    });
  },

  addProduct: (product) => {
    const currentItems = get().items;
    get().commitHistory();

    const item = createConfiguratorItem(
      product,
      getNextPosition(currentItems, product.width_mm)
    );
    const alignedItem: ConfiguratorItem = {
      ...item,
      position: getNonOverlappingAlignedPosition(
        item,
        currentItems,
        get().sceneMode
      ),
    };

    set({
      items: [...currentItems, alignedItem],
      selectedItemId: alignedItem.id,
    });
  },

  addProductAtPosition: (product, position) => {
    const currentItems = get().items;
    get().commitHistory();

    const item = createConfiguratorItem(product, snapPosition(position));
    const alignedItem: ConfiguratorItem = {
      ...item,
      position: getNonOverlappingAlignedPosition(
        item,
        currentItems,
        get().sceneMode
      ),
    };

    set({
      items: [...currentItems, alignedItem],
      selectedItemId: alignedItem.id,
    });
  },

  selectItem: (itemId) => {
    set({ selectedItemId: itemId });
  },

  updateItem: (itemId, data) => {
    get().commitHistory();
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;

        const updatedItem = {
          ...item,
          ...data,
          position: data.position ? snapPosition(data.position) : item.position,
        };

        const alignedItem = {
          ...updatedItem,
          position: getAlignedPositionForSceneMode(
            updatedItem,
            get().sceneMode
          ),
        };

        return {
          ...alignedItem,
          position: getNonOverlappingAlignedPosition(
            alignedItem,
            get().items,
            get().sceneMode
          ),
        };
      }),
    });
  },

  // Aggiorna solo le scelte anta dei moduli che possono avere una configurazione tecnica.
  updateDoorConfiguration: (itemId, data) => {
    get().commitHistory();
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;
        if (!hasConfigurableModuleVariants(item.code)) return item;

        return {
          ...item,
          doorConfiguration: {
            ...(item.doorConfiguration || DEFAULT_DOOR_CONFIGURATION),
            ...data,
          },
        };
      }),
    });
  },

  updateVariant: (itemId, variantKey) => {
    get().commitHistory();
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;
        if (!hasConfigurableModuleVariants(item.code)) return item;

        return {
          ...item,
          variantKey: getSafeModuleVariant(item.code, variantKey),
        };
      }),
    });
  },

  updatePosition: (itemId, position, options = { recordHistory: true }) => {
    if (options.recordHistory !== false) {
      get().commitHistory();
    }

    set({
      items: get().items.map((item) =>
        item.id === itemId
          ? getItemWithResolvedPosition(
              { ...item, position: snapPosition(position) },
              get().items,
              get().sceneMode
            )
          : item
      ),
    });
  },

  duplicateItem: (itemId) => {
    const sourceItem = get().items.find((item) => item.id === itemId);

    if (!sourceItem) return;
    get().commitHistory();

    const duplicatedItem: ConfiguratorItem = {
      ...sourceItem,
      id: crypto.randomUUID(),
      position: snapPosition([
        sourceItem.position[0] + getItemSceneWidth(sourceItem),
        sourceItem.position[1],
        sourceItem.position[2],
      ]),
    };
    const alignedDuplicatedItem = {
      ...duplicatedItem,
      position: getNonOverlappingAlignedPosition(
        duplicatedItem,
        get().items,
        get().sceneMode
      ),
    };

    set({
      items: [...get().items, alignedDuplicatedItem],
      selectedItemId: alignedDuplicatedItem.id,
    });
  },

  rotateItem: (itemId) => {
    get().commitHistory();
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;

        const rotatedItem = {
          ...item,
          rotationY: normalizeRotation((item.rotationY || 0) + 90),
        };

        const alignedItem = {
          ...rotatedItem,
          position: getAlignedPositionForSceneMode(
            rotatedItem,
            get().sceneMode
          ),
        };

        return getItemWithResolvedPosition(
          alignedItem,
          get().items,
          get().sceneMode
        );
      }),
    });
  },

  moveItem: (itemId, axis, value) => {
    get().commitHistory();
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;

        const [x, y, z] = item.position;

        const movedItem = {
          ...item,
          position: snapPosition(axis === "x" ? [value, y, z] : [x, y, value]),
        };

        return getItemWithResolvedPosition(
          movedItem,
          get().items,
          get().sceneMode
        );
      }),
    });
  },

  removeItem: (itemId) => {
    get().commitHistory();
    const items = get().items.filter((item) => item.id !== itemId);
    const selectedItemId =
      get().selectedItemId === itemId ? null : get().selectedItemId;

    set({ items, selectedItemId });
  },

  clear: () => {
    if (get().items.length === 0) return;
    get().commitHistory();
    set({ items: [], selectedItemId: null });
  },

  undo: () => {
    const { future, items, past, selectedItemId } = get();
    const previousSnapshot = past[past.length - 1];

    if (!previousSnapshot) return;

    const nextPast = past.slice(0, -1);

    set({
      items: previousSnapshot.items,
      selectedItemId: previousSnapshot.selectedItemId,
      past: nextPast,
      future: [...future, cloneSnapshot({ items, selectedItemId })],
      canUndo: nextPast.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { future, items, past, selectedItemId } = get();
    const nextSnapshot = future[future.length - 1];

    if (!nextSnapshot) return;

    const nextFuture = future.slice(0, -1);

    set({
      items: nextSnapshot.items,
      selectedItemId: nextSnapshot.selectedItemId,
      past: [...past, cloneSnapshot({ items, selectedItemId })],
      future: nextFuture,
      canUndo: true,
      canRedo: nextFuture.length > 0,
    });
  },
}));

// Clona gli snapshot per evitare che undo/redo condividano riferimenti mutabili.
function cloneSnapshot(
  snapshot: ConfiguratorHistorySnapshot
): ConfiguratorHistorySnapshot {
  return {
    items: snapshot.items.map((item) => ({
      ...item,
      doorConfiguration: item.doorConfiguration
        ? { ...item.doorConfiguration }
        : undefined,
      position: [...item.position],
    })),
    selectedItemId: snapshot.selectedItemId,
  };
}

// Risolve la posizione finale applicando allineamento e regola anti-sovrapposizione.
function getItemWithResolvedPosition(
  item: ConfiguratorItem,
  items: ConfiguratorItem[],
  sceneMode: SceneMode
) {
  const alignedItem = {
    ...item,
    position: getAlignedPositionForSceneMode(item, sceneMode),
  };

  return {
    ...alignedItem,
    position: getNonOverlappingAlignedPosition(alignedItem, items, sceneMode),
  };
}

// Crea un elemento scena a partire da un prodotto mantenendo coerenti variante e asset 3D.
function createConfiguratorItem(
  product: Product,
  position: [number, number, number]
): ConfiguratorItem {
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    nameIt: product.name_it,
    nameEn: product.name_en,
    code: product.code,
    widthMm: product.width_mm,
    heightMm: product.height_mm,
    depthMm: product.depth_mm,
    price: product.price,
    modelUrl: product.model_url,
    position,
    rotationY: 0,
    variantKey: getSafeModuleVariant(product.code, DEFAULT_MODULE_VARIANT),
    doorConfiguration: hasConfigurableModuleVariants(product.code)
      ? { ...DEFAULT_DOOR_CONFIGURATION }
      : undefined,
    color: "#d8d3c7",
  };
}
