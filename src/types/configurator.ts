export type Locale = "it" | "en";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort_order?: number | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  created_at?: string | null;
  name_it: string;
  name_en: string | null;
  code: string | null;
  width_mm: number;
  height_mm: number;
  depth_mm: number;
  thickness_mm: number | null;
  price: number | null;
  preview_image_url: string | null;
  model_url: string | null;
  technical_file_url: string | null;
  is_published: boolean;
};

export type ModuleVariantKey =
  | "two_visible_sides"
  | "one_visible_one_internal"
  | "two_internal_sides";

export type SceneMode = "open" | "wall" | "front";

export const SCENE_MODE_OPTIONS = [
  {
    key: "open",
    labelIt: "Aperta",
    labelEn: "Open",
  },
  {
    key: "wall",
    labelIt: "Filo parete",
    labelEn: "Wall aligned",
  },
  {
    key: "front",
    labelIt: "Filo fronte",
    labelEn: "Front aligned",
  },
] satisfies {
  key: SceneMode;
  labelIt: string;
  labelEn: string;
}[];

export const DEFAULT_MODULE_VARIANT: ModuleVariantKey = "two_visible_sides";

export const MODULE_VARIANT_OPTIONS = [
  {
    key: "two_visible_sides",
    labelIt: "2 fianchi a vista",
    labelEn: "2 visible sides",
  },
  {
    key: "one_visible_one_internal",
    labelIt: "1 fianco a vista / 1 fianco interno",
    labelEn: "1 visible side / 1 internal side",
  },
  {
    key: "two_internal_sides",
    labelIt: "2 fianchi interni",
    labelEn: "2 internal sides",
  },
] satisfies {
  key: ModuleVariantKey;
  labelIt: string;
  labelEn: string;
}[];

export function getModuleVariantLabel(
  variantKey: ModuleVariantKey,
  locale: Locale
) {
  const option =
    MODULE_VARIANT_OPTIONS.find((variant) => variant.key === variantKey) ||
    MODULE_VARIANT_OPTIONS[0];

  return locale === "it" ? option.labelIt : option.labelEn;
}

export type ConfiguratorItem = {
  id: string;
  productId: string;
  nameIt: string;
  nameEn?: string | null;
  code?: string | null;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  price?: number | null;
  modelUrl?: string | null;
  position: [number, number, number];
  rotationY: number;
  variantKey: ModuleVariantKey;
  color?: string;
};
