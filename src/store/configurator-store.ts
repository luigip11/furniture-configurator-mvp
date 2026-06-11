import { create } from "zustand";
import {
  ConfiguratorItem,
  DEFAULT_MODULE_VARIANT,
  Locale,
  ModuleVariantKey,
  Product,
} from "@/types/configurator";

export const CONFIGURATOR_GRID_SIZE = 0.25;

export const snapToGrid = (value: number) =>
  Number((Math.round(value / CONFIGURATOR_GRID_SIZE) * CONFIGURATOR_GRID_SIZE).toFixed(2));

const snapPosition = (
  position: [number, number, number]
): [number, number, number] => [
  snapToGrid(position[0]),
  position[1],
  snapToGrid(position[2]),
];

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
  moveItem: (itemId: string, axis: "x" | "z", value: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
};

const getItemSceneWidth = (item: Pick<ConfiguratorItem, "widthMm">) =>
  item.widthMm / 700;

const getNextPosition = (
  items: ConfiguratorItem[],
  widthMm: number
): [number, number, number] => {
  if (items.length === 0) return [0, 0, 0];

  const rightEdge = Math.max(
    ...items.map((item) => item.position[0] + getItemSceneWidth(item) / 2)
  );
  const width = widthMm / 700;

  return [snapToGrid(rightEdge + width / 2), 0, 0];
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
