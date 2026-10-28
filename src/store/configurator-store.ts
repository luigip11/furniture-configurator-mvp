import { create } from "zustand";
import {
  DEFAULT_CONFIGURATOR_SETTINGS,
  DEFAULT_BASE_FINISH_CONFIGURATION,
  DEFAULT_DOOR_CONFIGURATION,
  getTechnicalVariantKey,
} from "../types/configurator.ts";
import type {
  ConfiguratorItem,
  BaseFinishConfiguration,
  ConfiguratorSettings,
  DoorConfiguration,
  Locale,
  ProductVariantKey,
  Product,
  ProductVariantProducts,
  SceneMode,
} from "../types/configurator.ts";
import {
  getDockedItemsAfterMove,
  getNextPosition,
  getWallUnitSceneBottom,
  isWallUnitProduct,
  normalizeRotation,
  shouldDockComposition,
} from "./configurator-calculations.ts";
import {
  getAvailableModuleVariants,
  getSafeModuleVariant,
  hasConfigurableModuleVariants,
} from "../lib/configurator/module-technical-catalog.ts";
import {
  getProductVariantKey,
  getProductVariantKeys,
} from "../lib/configurator/product-variants.ts";
import {
  findAvailablePosition,
  resolveComposition,
} from "../lib/configurator/composition-constraints.ts";
import type { ConfigurationError } from "../lib/configurator/composition-constraints.ts";

import { canConfigureBaseFinish } from "../lib/configurator/parametric-bom.ts";
export {
  CONFIGURATOR_GRID_SIZE,
  snapToGrid,
} from "./configurator-calculations.ts";

const CONFIGURATOR_SETTINGS_STORAGE_KEY = "furniture-configurator-settings";
const CONFIGURATOR_LOCALE_STORAGE_KEY = "furniture-configurator-locale";
// Limita la memoria usata da annulla/ripeti nelle sessioni lunghe; i passi più vecchi vengono scartati.
export const CONFIGURATOR_HISTORY_LIMIT = 100;

type ConfiguratorHistorySnapshot = {
  items: ConfiguratorItem[];
  selectedItemId: string | null;
  sceneMode: SceneMode;
  settings: ConfiguratorSettings;
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
  configurationError: ConfigurationError | null;
  dismissConfigurationError: () => void;

  commitHistory: () => void;
  hydrateLocale: () => void;
  hydrateSettings: () => void;
  updateSettings: (settings: Partial<ConfiguratorSettings>) => void;
  setLocale: (locale: Locale) => void;
  setSceneMode: (sceneMode: SceneMode) => void;
  addProduct: (
    product: Product,
    variantProducts?: ProductVariantProducts,
  ) => void;
  addProductAtPosition: (
    product: Product,
    position: [number, number, number],
    variantProducts?: ProductVariantProducts,
  ) => void;
  selectItem: (itemId: string | null) => void;
  updateItem: (
    itemId: string,
    data: Partial<
      Pick<ConfiguratorItem, "widthMm" | "heightMm" | "depthMm" | "position">
    >,
  ) => void;
  updateDoorConfiguration: (
    itemId: string,
    data: Partial<DoorConfiguration>,
  ) => void;
  updateVariant: (itemId: string, variantKey: ProductVariantKey) => void;
  updateBaseFinishConfiguration: (
    itemId: string,
    data: Partial<BaseFinishConfiguration>,
  ) => void;
  updatePosition: (
    itemId: string,
    position: [number, number, number],
    options?: { recordHistory?: boolean },
  ) => void;
  duplicateItem: (itemId: string) => void;
  rotateItem: (itemId: string) => void;
  moveItem: (itemId: string, axis: "x" | "z", value: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  redo: () => void;
  undo: () => void;
};

// Crea uno store isolabile nei test, applicando ogni modifica geometrica in modo atomico.
export function createConfiguratorStore() {
  return create<ConfiguratorStore>((set, get) => {
    let gestureSnapshot: ConfiguratorHistorySnapshot | null = null;

    // Valida il candidato prima di cambiare elementi, modalità, impostazioni o storico.
    function commit(
      changes: Partial<
        Pick<
          ConfiguratorStore,
          "items" | "sceneMode" | "settings" | "selectedItemId"
        >
      >,
      recordHistory = true,
    ) {
      const state = get();
      const candidate = { ...state, ...changes };
      const result = resolveComposition(
        candidate.items,
        candidate.sceneMode,
        candidate.settings,
      );
      if (result.error) {
        set({ configurationError: result.error });
        return;
      }
      const next = {
        items: result.items,
        sceneMode: candidate.sceneMode,
        settings: candidate.settings,
        selectedItemId: candidate.selectedItemId,
      };
      if (
        JSON.stringify(cloneSnapshot(state)) ===
        JSON.stringify(cloneSnapshot(next))
      ) {
        set({ configurationError: null });
        return;
      }
      const snapshot = recordHistory ? cloneSnapshot(state) : gestureSnapshot;
      gestureSnapshot = null;
      set({
        ...next,
        configurationError: null,
        future: [],
        canRedo: false,
        ...(snapshot
          ? {
              past: limitHistory([...state.past, snapshot]),
              canUndo: true,
            }
          : {}),
      });
    }

    // Inserisce un nuovo modulo solo se trova una composizione geometricamente valida.
    function insert(item: ConfiguratorItem) {
      const state = get();
      const single = resolveComposition(
        [item],
        state.sceneMode,
        state.settings,
      );
      if (single.error) {
        set({ configurationError: single.error });
        return;
      }
      if (!shouldDockComposition(state.sceneMode, state.settings)) {
        const position = findAvailablePosition(item, state.items);
        if (!position) {
          set({ configurationError: "capacityExceeded" });
          return;
        }
        item = { ...item, position };
      }
      commit({ items: [...state.items, item], selectedItemId: item.id });
    }

    // Usa lo stesso percorso per campi numerici, pulsanti e trascinamento, preservando la quota Y.
    function move(
      itemId: string,
      position: [number, number, number],
      recordHistory = true,
    ) {
      const state = get();
      const item = state.items.find((item) => item.id === itemId);
      if (!item) return;
      if (!position.every(Number.isFinite)) {
        set({ configurationError: "invalidCoordinates" });
        return;
      }
      const desired: [number, number, number] = [
        position[0],
        item.position[1],
        position[2],
      ];
      const items = shouldDockComposition(state.sceneMode, state.settings)
        ? getDockedItemsAfterMove(state.items, itemId, desired, state.sceneMode)
        : state.items.map((item) =>
            item.id === itemId ? { ...item, position: desired } : item,
          );
      commit({ items }, recordHistory);
    }

    // Aggiorna solo il modulo esistente e lascia intatto lo storico delle operazioni rifiutate.
    function changeItem(
      itemId: string,
      change: (item: ConfiguratorItem) => ConfiguratorItem,
    ) {
      if (!get().items.some((item) => item.id === itemId)) return;
      commit({
        items: get().items.map((item) =>
          item.id === itemId ? change(item) : item,
        ),
      });
    }

    // Ripristina insieme geometria, modalità e impostazioni che influenzano i vincoli.
    function restore(direction: "undo" | "redo") {
      const state = get();
      const source = direction === "undo" ? state.past : state.future;
      const snapshot = source.at(-1);
      if (!snapshot) return;
      const past =
        direction === "undo"
          ? state.past.slice(0, -1)
          : limitHistory([...state.past, cloneSnapshot(state)]);
      const future =
        direction === "redo"
          ? state.future.slice(0, -1)
          : limitHistory([...state.future, cloneSnapshot(state)]);
      gestureSnapshot = null;
      writeStoredSettings(snapshot.settings);
      set({
        ...cloneSnapshot(snapshot),
        past,
        future,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        configurationError: null,
      });
    }

    return {
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
      configurationError: null,
      // Prepara un solo snapshot per gesto; lo registra al primo movimento valido.
      commitHistory: () => {
        gestureSnapshot = cloneSnapshot(get());
      },
      dismissConfigurationError: () => set({ configurationError: null }),
      hydrateSettings: () => {
        if (get().settingsHydrated) return;
        const settings = readStoredSettings();
        const result = resolveComposition(
          get().items,
          get().sceneMode,
          settings,
        );
        set(
          result.error
            ? { settingsHydrated: true, configurationError: result.error }
            : { settings, items: result.items, settingsHydrated: true },
        );
      },
      hydrateLocale: () => {
        if (!get().localeHydrated)
          set({ locale: readStoredLocale(), localeHydrated: true });
      },
      updateSettings: (settings) => {
        commit({ settings: { ...get().settings, ...settings } });
        writeStoredSettings(get().settings);
        set({ settingsHydrated: true });
      },
      setLocale: (locale) => {
        writeStoredLocale(locale);
        set({ locale, localeHydrated: true });
      },
      setSceneMode: (sceneMode) => commit({ sceneMode }),
      addProduct: (product, variants) =>
        insert(
          createConfiguratorItem(
            product,
            getNextPosition(get().items, product.width_mm),
            variants,
          ),
        ),
      addProductAtPosition: (product, position, variants) =>
        insert(createConfiguratorItem(product, position, variants)),
      selectItem: (selectedItemId) =>
        set({
          selectedItemId: get().items.some((item) => item.id === selectedItemId)
            ? selectedItemId
            : null,
        }),
      updateItem: (id, data) =>
        changeItem(id, (item) => ({
          ...item,
          ...data,
          position: data.position
            ? [data.position[0], item.position[1], data.position[2]]
            : item.position,
        })),
      updateDoorConfiguration: (id, data) =>
        changeItem(id, (item) =>
          !hasConfigurableModuleVariants(item.code) &&
          getProductVariantKeys(item.variantProducts).length <= 1
            ? item
            : {
                ...item,
                ...(canConfigureBaseFinish(item.code)
                  ? {
                      baseFinishConfiguration: {
                        ...(item.baseFinishConfiguration ||
                          DEFAULT_BASE_FINISH_CONFIGURATION),
                        doorCount:
                          data.count ||
                          item.baseFinishConfiguration?.doorCount ||
                          "one",
                      },
                    }
                  : {}),
                doorConfiguration: {
                  ...(item.doorConfiguration || DEFAULT_DOOR_CONFIGURATION),
                  ...data,
                },
              },
        ),
      updateBaseFinishConfiguration: (id, data) => {
        const selected = get().items.find((item) => item.id === id);
        if (!selected) return;
        if (!canConfigureBaseFinish(selected.code)) {
          set({ configurationError: "unsupportedFinish" });
          return;
        }
        changeItem(id, (item) => ({
          ...item,
          ...(data.doorCount
            ? {
                doorConfiguration:
                  data.doorCount === "none"
                    ? undefined
                    : {
                        ...(item.doorConfiguration ||
                          DEFAULT_DOOR_CONFIGURATION),
                        count: data.doorCount,
                      },
              }
            : {}),
          baseFinishConfiguration: {
            ...(item.baseFinishConfiguration ||
              DEFAULT_BASE_FINISH_CONFIGURATION),
            ...data,
          },
        }));
      },
      updateVariant: (id, key) => {
        const item = get().items.find((item) => item.id === id);
        if (!item) return;
        const product = item.variantProducts?.[key];
        if (
          product &&
          !canConfigureBaseFinish(product.code) &&
          canConfigureBaseFinish(item.code) &&
          (item.baseFinishConfiguration?.hasTop ||
            (item.baseFinishConfiguration?.doorCount &&
              item.baseFinishConfiguration.doorCount !== "none"))
        ) {
          set({ configurationError: "unsupportedFinish" });
          return;
        }
        if (
          getProductVariantKeys(item.variantProducts).length > 0 &&
          !product
        ) {
          set({ configurationError: "variantUnavailable" });
          return;
        }
        if (
          !product &&
          (key === "visible_left" ||
            key === "visible_right" ||
            !getAvailableModuleVariants(item.code).includes(
              getTechnicalVariantKey(key),
            ))
        ) {
          set({ configurationError: "variantUnavailable" });
          return;
        }
        changeItem(id, (item) =>
          product
            ? createItemFromVariantProduct(item, product, key)
            : {
                ...item,
                variantKey: getSafeModuleVariant(
                  item.code,
                  getTechnicalVariantKey(key),
                ),
                productVariantKey: key,
              },
        );
      },
      updatePosition: (id, position, options) =>
        move(id, position, options?.recordHistory !== false),
      moveItem: (id, axis, value) => {
        const item = get().items.find((item) => item.id === id);
        if (item)
          move(
            id,
            axis === "x"
              ? [value, item.position[1], item.position[2]]
              : [item.position[0], item.position[1], value],
          );
      },
      duplicateItem: (id) => {
        const item = get().items.find((item) => item.id === id);
        if (item)
          insert({
            ...item,
            id: crypto.randomUUID(),
            position: [
              getNextPosition(get().items, item.widthMm)[0],
              item.position[1],
              item.position[2],
            ],
          });
      },
      rotateItem: (id) =>
        changeItem(id, (item) => ({
          ...item,
          rotationY: normalizeRotation(item.rotationY + 90),
        })),
      removeItem: (id) => {
        const state = get();
        commit({
          items: state.items.filter((item) => item.id !== id),
          selectedItemId:
            state.selectedItemId === id ? null : state.selectedItemId,
        });
      },
      clear: () => commit({ items: [], selectedItemId: null }),
      undo: () => restore("undo"),
      redo: () => restore("redo"),
    };
  });
}

export const useConfiguratorStore = createConfiguratorStore();

// Conserva solo gli snapshot più recenti entro il limite della cronologia.
function limitHistory(history: ConfiguratorHistorySnapshot[]) {
  return history.length > CONFIGURATOR_HISTORY_LIMIT
    ? history.slice(-CONFIGURATOR_HISTORY_LIMIT)
    : history;
}

// Clona gli snapshot per evitare che undo/redo condividano riferimenti mutabili.
function cloneSnapshot(
  snapshot: ConfiguratorHistorySnapshot,
): ConfiguratorHistorySnapshot {
  return {
    items: snapshot.items.map((item) => ({
      ...item,
      ...(item.doorConfiguration
        ? { doorConfiguration: { ...item.doorConfiguration } }
        : {}),
      ...(item.baseFinishConfiguration
        ? { baseFinishConfiguration: { ...item.baseFinishConfiguration } }
        : {}),
      position: [...item.position],
      ...(item.variantProducts
        ? { variantProducts: { ...item.variantProducts } }
        : {}),
    })),
    selectedItemId: snapshot.selectedItemId,
    sceneMode: snapshot.sceneMode,
    settings: { ...snapshot.settings },
  };
}

// Crea un elemento scena a partire da un prodotto mantenendo coerenti variante e asset 3D.
function createConfiguratorItem(
  product: Product,
  position: [number, number, number],
  variantProducts?: ProductVariantProducts,
): ConfiguratorItem {
  const initialPosition: [number, number, number] = [
    position[0],
    isWallUnitProduct(product) ? getWallUnitSceneBottom() : position[1],
    position[2],
  ];

  return {
    id: crypto.randomUUID(),
    productId: product.id,
    nameIt: product.name_it,
    nameEn: product.name_en,
    code: product.code,
    widthMm: product.width_mm,
    heightMm: product.height_mm,
    depthMm: product.depth_mm,
    catalogDimensions: {
      widthMm: product.width_mm,
      heightMm: product.height_mm,
      depthMm: product.depth_mm,
    },
    price: product.price,
    modelUrl: product.model_url,
    position: initialPosition,
    rotationY: 0,
    variantKey: getSafeModuleVariant(
      product.code,
      getTechnicalVariantKey(getProductVariantKey(product, variantProducts)),
    ),
    productVariantKey: getProductVariantKey(product, variantProducts),
    variantProducts:
      getProductVariantKeys(variantProducts).length > 0
        ? variantProducts
        : undefined,
    doorConfiguration:
      !canConfigureBaseFinish(product.code) &&
      (getProductVariantKeys(variantProducts).length > 1 ||
        hasConfigurableModuleVariants(product.code))
        ? { ...DEFAULT_DOOR_CONFIGURATION }
        : undefined,
    color: "#d8d3c7",
  };
}

// Sostituisce i dati tecnici e l'asset dell'elemento senza perdere posizione, rotazione e finitura scelte.
function createItemFromVariantProduct(
  item: ConfiguratorItem,
  product: Product,
  variantKey: ProductVariantKey,
): ConfiguratorItem {
  return {
    ...item,
    productId: product.id,
    nameIt: product.name_it,
    nameEn: product.name_en,
    code: product.code,
    price: product.price,
    modelUrl: product.model_url,
    variantKey: getTechnicalVariantKey(variantKey),
    productVariantKey: variantKey,
    catalogDimensions: {
      widthMm: product.width_mm,
      heightMm: product.height_mm,
      depthMm: product.depth_mm,
    },
  };
}

// Legge i setting salvati localmente mantenendo default robusti se il payload non e valido.
function readStoredSettings(): ConfiguratorSettings {
  if (typeof window === "undefined") return DEFAULT_CONFIGURATOR_SETTINGS;

  try {
    const storedSettings = window.localStorage.getItem(
      CONFIGURATOR_SETTINGS_STORAGE_KEY,
    );
    const parsedSettings = storedSettings
      ? (JSON.parse(storedSettings) as Partial<ConfiguratorSettings>)
      : null;

    return {
      ...DEFAULT_CONFIGURATOR_SETTINGS,
      allowFreeMovementInOpenScene: Boolean(
        parsedSettings?.allowFreeMovementInOpenScene,
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

  let storedLocale: string | null = null;
  try {
    storedLocale = window.localStorage.getItem(CONFIGURATOR_LOCALE_STORAGE_KEY);
  } catch {
    return "it";
  }

  return storedLocale === "en" || storedLocale === "fr" || storedLocale === "it"
    ? storedLocale
    : "it";
}

// Salva i setting lato browser senza impattare dati catalogo o composizione corrente.
function writeStoredSettings(settings: ConfiguratorSettings) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      CONFIGURATOR_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch {
    /* Il blocco dello storage non deve interrompere le modifiche in memoria. */
  }
}

// Salva la lingua in modo che resti disponibile in tutte le sezioni dell'app.
function writeStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CONFIGURATOR_LOCALE_STORAGE_KEY, locale);
  } catch {
    /* La lingua resta utilizzabile nella sessione corrente. */
  }
}
