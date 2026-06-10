import { create } from "zustand";
import { ConfiguratorItem, Locale, Product } from "@/types/configurator";

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
  moveItem: (itemId: string, axis: "x" | "z", value: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
};

const getNextPosition = (itemsLength: number): [number, number, number] => {
  const spacing = 1.05;
  return [itemsLength * spacing, 0, 0];
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
      position: getNextPosition(currentItems.length),
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
        item.id === itemId ? { ...item, ...data } : item
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
          position: axis === "x" ? [value, y, z] : [x, y, value],
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
