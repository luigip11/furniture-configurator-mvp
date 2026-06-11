import { create } from "zustand";
import {
  ConfiguratorItem,
  DEFAULT_MODULE_VARIANT,
  Locale,
  ModuleVariantKey,
  Product,
} from "@/types/configurator";
import {
  getItemSceneWidth,
  getNextPosition,
  normalizeRotation,
  snapPosition,
} from "@/store/configurator-calculations";

export { CONFIGURATOR_GRID_SIZE, snapToGrid } from "@/store/configurator-calculations";

type ConfiguratorStore = {
  locale: Locale;
  items: ConfiguratorItem[];
  selectedItemId: string | null;

  setLocale: (locale: Locale) => void;
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
  selectedItemId: null,

  setLocale: (locale) => set({ locale }),

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
      variantKey: DEFAULT_MODULE_VARIANT,
      color: "#d8d3c7",
    };

    set({
      items: [...currentItems, item],
      selectedItemId: item.id,
    });
  },

  selectItem: (itemId) => {
    set({ selectedItemId: itemId });
  },

  updateItem: (itemId, data) => {
    set({
      items: get().items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...data,
              position: data.position ? snapPosition(data.position) : item.position,
            }
          : item
      ),
    });
  },

  updateVariant: (itemId, variantKey) => {
    set({
      items: get().items.map((item) =>
        item.id === itemId ? { ...item, variantKey } : item
      ),
    });
  },

  updatePosition: (itemId, position) => {
    set({
      items: get().items.map((item) =>
        item.id === itemId ? { ...item, position: snapPosition(position) } : item
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

    set({
      items: [...get().items, duplicatedItem],
      selectedItemId: duplicatedItem.id,
    });
  },

  rotateItem: (itemId) => {
    set({
      items: get().items.map((item) =>
        item.id === itemId
          ? { ...item, rotationY: normalizeRotation((item.rotationY || 0) + 90) }
          : item
      ),
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
              ? snapPosition([value, y, z])
              : snapPosition([x, y, value]),
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
