import { create } from "zustand";
import {
  ConfiguratorItem,
  ConfiguratorSettings,
  DEFAULT_CONFIGURATOR_SETTINGS,
  DEFAULT_DOOR_CONFIGURATION,
  DEFAULT_MODULE_VARIANT,
  DoorConfiguration,
  Locale,
  ModuleVariantKey,
  Product,
  SceneMode,
} from "@/types/configurator";
import {
  clampItemPositionToGridBounds,
  getDockedCompositionItems,
  getDockedItemsAfterMove,
  getNextPosition,
  getWallUnitSceneBottom,
  isWallUnitProduct,
  normalizeRotation,
  shouldDockComposition,
  snapPosition,
} from "@/store/configurator-calculations";
import {
  getSafeModuleVariant,
  hasConfigurableModuleVariants,
} from "@/lib/configurator/module-technical-catalog";

export { CONFIGURATOR_GRID_SIZE, snapToGrid } from "@/store/configurator-calculations";

const CONFIGURATOR_SETTINGS_STORAGE_KEY = "furniture-configurator-settings";
const CONFIGURATOR_LOCALE_STORAGE_KEY = "furniture-configurator-locale";

type ConfiguratorHistorySnapshot = {
  items: ConfiguratorItem[];
  selectedItemId: string | null;
};

type ConfiguratorStore = {
  settings: ConfiguratorSettings;
  settingsHydrated: boolean;
  locale: Locale;
  localeHydrated: boolean;
  items: ConfiguratorItem[];
  past: ConfiguratorHistorySnapshot[];
  future: ConfiguratorHistorySnapshot[];
  sceneMode: SceneMode;
  selectedItemId: string | null;
  canRedo: boolean;
  canUndo: boolean;

  commitHistory: () => void;
  hydrateLocale: () => void;
  hydrateSettings: () => void;
  updateSettings: (settings: Partial<ConfiguratorSettings>) => void;
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
  settings: DEFAULT_CONFIGURATOR_SETTINGS,
  settingsHydrated: false,
  locale: "it",
  localeHydrated: false,
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

  hydrateSettings: () => {
    if (get().settingsHydrated) return;

    set({
      settings: readStoredSettings(),
      settingsHydrated: true,
    });
  },

  hydrateLocale: () => {
    if (get().localeHydrated) return;

    set({
      locale: readStoredLocale(),
      localeHydrated: true,
    });
  },

  updateSettings: (settings) => {
    const nextSettings = {
      ...get().settings,
      ...settings,
    };
    const shouldRealign =
      get().settings.allowFreeMovementInOpenScene &&
      !nextSettings.allowFreeMovementInOpenScene;

    writeStoredSettings(nextSettings);

    set({
      settings: nextSettings,
      settingsHydrated: true,
      items: shouldRealign
        ? getDockedCompositionItems(get().items, get().sceneMode)
        : get().items,
    });
  },

  setLocale: (locale) => {
    writeStoredLocale(locale);
    set({ locale, localeHydrated: true });
  },

  setSceneMode: (sceneMode) => {
    get().commitHistory();
    const alignedItems = shouldDockComposition(sceneMode, get().settings)
      ? getDockedCompositionItems(get().items, sceneMode)
      : get().items;

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
    const nextRawItems = [...currentItems, item];
    const nextItems = shouldDockComposition(get().sceneMode, get().settings)
      ? getDockedCompositionItems(nextRawItems, get().sceneMode)
      : nextRawItems;
    const alignedItem = nextItems.find((currentItem) => currentItem.id === item.id);

    set({
      items: nextItems,
      selectedItemId: alignedItem?.id || item.id,
    });
  },

  addProductAtPosition: (product, position) => {
    const currentItems = get().items;
    get().commitHistory();

    const item = createConfiguratorItem(product, snapPosition(position));
    const nextRawItems = [...currentItems, item];
    const nextItems = shouldDockComposition(get().sceneMode, get().settings)
      ? getDockedCompositionItems(nextRawItems, get().sceneMode)
      : nextRawItems;
    const alignedItem = nextItems.find((currentItem) => currentItem.id === item.id);

    set({
      items: nextItems,
      selectedItemId: alignedItem?.id || item.id,
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

        const updatedItem: ConfiguratorItem = {
          ...item,
          ...data,
          position: data.position ? snapPosition(data.position) : item.position,
        };

        return updatedItem;
      }),
    });
    if (shouldDockComposition(get().sceneMode, get().settings)) {
      set({ items: getDockedCompositionItems(get().items, get().sceneMode) });
    }
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
      items: shouldDockComposition(get().sceneMode, get().settings)
        ? getDockedItemsAfterMove(
            get().items,
            itemId,
            snapPosition(position),
            get().sceneMode
          )
        : get().items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  position: getFreeMovementPosition(
                    item,
                    snapPosition(position)
                  ),
                }
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
      position: [
        getNextPosition(get().items, sourceItem.widthMm)[0],
        sourceItem.position[1],
        sourceItem.position[2],
      ],
    };
    const nextRawItems = [...get().items, duplicatedItem];
    const nextItems = shouldDockComposition(get().sceneMode, get().settings)
      ? getDockedCompositionItems(nextRawItems, get().sceneMode)
      : nextRawItems;
    const alignedDuplicatedItem = nextItems.find(
      (item) => item.id === duplicatedItem.id
    );

    set({
      items: nextItems,
      selectedItemId: alignedDuplicatedItem?.id || duplicatedItem.id,
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

        return rotatedItem;
      }),
    });
    if (shouldDockComposition(get().sceneMode, get().settings)) {
      set({ items: getDockedCompositionItems(get().items, get().sceneMode) });
    }
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

        return movedItem;
      }),
    });
    if (shouldDockComposition(get().sceneMode, get().settings)) {
      set({ items: getDockedCompositionItems(get().items, get().sceneMode) });
    }
  },

  removeItem: (itemId) => {
    get().commitHistory();
    const items = get().items.filter((item) => item.id !== itemId);
    const selectedItemId =
      get().selectedItemId === itemId ? null : get().selectedItemId;

    set({
      items: shouldDockComposition(get().sceneMode, get().settings)
        ? getDockedCompositionItems(items, get().sceneMode)
        : items,
      selectedItemId,
    });
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

// Crea un elemento scena a partire da un prodotto mantenendo coerenti variante e asset 3D.
function createConfiguratorItem(
  product: Product,
  position: [number, number, number]
): ConfiguratorItem {
  const initialPosition = snapPosition([
    position[0],
    isWallUnitProduct(product) ? getWallUnitSceneBottom() : position[1],
    position[2],
  ]);

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
    position: initialPosition,
    rotationY: 0,
    variantKey: getSafeModuleVariant(product.code, DEFAULT_MODULE_VARIANT),
    doorConfiguration: hasConfigurableModuleVariants(product.code)
      ? { ...DEFAULT_DOOR_CONFIGURATION }
      : undefined,
    color: "#d8d3c7",
  };
}

// Legge i setting salvati localmente mantenendo default robusti se il payload non e valido.
function readStoredSettings(): ConfiguratorSettings {
  if (typeof window === "undefined") return DEFAULT_CONFIGURATOR_SETTINGS;

  try {
    const storedSettings = window.localStorage.getItem(
      CONFIGURATOR_SETTINGS_STORAGE_KEY
    );
    const parsedSettings = storedSettings
      ? (JSON.parse(storedSettings) as Partial<ConfiguratorSettings>)
      : null;

    return {
      ...DEFAULT_CONFIGURATOR_SETTINGS,
      allowFreeMovementInOpenScene: Boolean(
        parsedSettings?.allowFreeMovementInOpenScene
      ),
      showSceneDataOnStart: Boolean(parsedSettings?.showSceneDataOnStart),
    };
  } catch {
    return DEFAULT_CONFIGURATOR_SETTINGS;
  }
}

// Legge la lingua scelta dall'utente e usa l'italiano per valori assenti o non validi.
function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "it";

  const storedLocale = window.localStorage.getItem(CONFIGURATOR_LOCALE_STORAGE_KEY);

  return storedLocale === "en" || storedLocale === "fr" || storedLocale === "it"
    ? storedLocale
    : "it";
}

// Salva i setting lato browser senza impattare dati catalogo o composizione corrente.
function writeStoredSettings(settings: ConfiguratorSettings) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    CONFIGURATOR_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings)
  );
}

// Salva la lingua in modo che resti disponibile in tutte le sezioni dell'app.
function writeStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CONFIGURATOR_LOCALE_STORAGE_KEY, locale);
}

// Applica il movimento libero solo al piano X/Z e preserva la quota verticale del modulo.
function getFreeMovementPosition(
  item: ConfiguratorItem,
  position: [number, number, number]
) {
  return clampItemPositionToGridBounds(item, [
    position[0],
    item.position[1],
    position[2],
  ]);
}
