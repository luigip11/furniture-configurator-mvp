import { create } from "zustand";
import {
  ConfiguratorItem,
  DEFAULT_MODULE_VARIANT,
  Locale,
  ModuleVariantKey,
  Product,
  SceneMode,
} from "@/types/configurator";
import {
  getItemSceneWidth,
  getAlignedPositionForSceneMode,
  getNextPosition,
  normalizeRotation,
  snapPosition,
} from "@/store/configurator-calculations";
import {
  getSafeModuleVariant,
  hasConfigurableModuleVariants,
} from "@/lib/configurator/module-technical-catalog";

export { CONFIGURATOR_GRID_SIZE, snapToGrid } from "@/store/configurator-calculations";

type ConfiguratorStore = {
  locale: Locale;
  items: ConfiguratorItem[];
  sceneMode: SceneMode;
  selectedItemId: string | null;

  setLocale: (locale: Locale) => void;
  setSceneMode: (sceneMode: SceneMode) => void;
  addProduct: (product: Product) => void;
  selectItem: (itemId: string | null) => void;
  updateItem: (
    itemId: string,
    data: Partial<
      Pick<ConfiguratorItem, "widthMm" | "heightMm" | "depthMm" | "position">
    >
  ) => void;
  updateVariant: (itemId: string, variantKey: ModuleVariantKey) => void;
  updatePosition: (
    itemId: string,
    position: [number, number, number]
  ) => void;
  duplicateItem: (itemId: string) => void;
  rotateItem: (itemId: string) => void;
  moveItem: (itemId: string, axis: "x" | "z", value: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
};

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  locale: "it",
  items: [],
  sceneMode: "open",
  selectedItemId: null,

  setLocale: (locale) => set({ locale }),

  setSceneMode: (sceneMode) => {
    set({
      sceneMode,
      items: get().items.map((item) => ({
        ...item,
        position: getAlignedPositionForSceneMode(item, sceneMode),
      })),
    });
  },

  addProduct: (product) => {
    const currentItems = get().items;

    const item: ConfiguratorItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      nameIt: product.name_it,
      nameEn: product.name_en,
      code: product.code,
      widthMm: product.width_mm,
      heightMm: product.height_mm,
      depthMm: product.depth_mm,
      price: product.price,
      position: getNextPosition(currentItems, product.width_mm),
      rotationY: 0,
      variantKey: getSafeModuleVariant(product.code, DEFAULT_MODULE_VARIANT),
      color: "#d8d3c7",
    };
    const alignedItem: ConfiguratorItem = {
      ...item,
      position: getAlignedPositionForSceneMode(item, get().sceneMode),
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
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;

        const updatedItem = {
          ...item,
          ...data,
          position: data.position ? snapPosition(data.position) : item.position,
        };

        return {
          ...updatedItem,
          position: getAlignedPositionForSceneMode(
            updatedItem,
            get().sceneMode
          ),
        };
      }),
    });
  },

  updateVariant: (itemId, variantKey) => {
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

  updatePosition: (itemId, position) => {
    set({
      items: get().items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              position: getAlignedPositionForSceneMode(
                { ...item, position: snapPosition(position) },
                get().sceneMode
              ),
            }
          : item
      ),
    });
  },

  duplicateItem: (itemId) => {
    const sourceItem = get().items.find((item) => item.id === itemId);

    if (!sourceItem) return;

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
      position: getAlignedPositionForSceneMode(duplicatedItem, get().sceneMode),
    };

    set({
      items: [...get().items, alignedDuplicatedItem],
      selectedItemId: alignedDuplicatedItem.id,
    });
  },

  rotateItem: (itemId) => {
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;

        const rotatedItem = {
          ...item,
          rotationY: normalizeRotation((item.rotationY || 0) + 90),
        };

        return {
          ...rotatedItem,
          position: getAlignedPositionForSceneMode(
            rotatedItem,
            get().sceneMode
          ),
        };
      }),
    });
  },

  moveItem: (itemId, axis, value) => {
    set({
      items: get().items.map((item) => {
        if (item.id !== itemId) return item;

        const [x, y, z] = item.position;

        return {
          ...item,
          position:
            axis === "x"
              ? getAlignedPositionForSceneMode(
                  { ...item, position: snapPosition([value, y, z]) },
                  get().sceneMode
                )
              : getAlignedPositionForSceneMode(
                  { ...item, position: snapPosition([x, y, value]) },
                  get().sceneMode
                ),
        };
      }),
    });
  },

  removeItem: (itemId) => {
    const items = get().items.filter((item) => item.id !== itemId);
    const selectedItemId =
      get().selectedItemId === itemId ? null : get().selectedItemId;

    set({ items, selectedItemId });
  },

  clear: () => set({ items: [], selectedItemId: null }),
}));
