export type Locale = "it" | "en" | "fr";

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

export type DoorCountKey = "one" | "two";

export type DoorMountKey = "flush_floor" | "visible_plinth";

export type DoorCoatingKey =
  | "spv_basin"
  | "gs_no_basin"
  | "sa_painting"
  | "mgr_basin_handle";

export type DoorMachiningKey =
  | "smooth"
  | "protruding_shutter"
  | "inward_shutter"
  | "h10_vents";

export type DoorConfiguration = {
  count: DoorCountKey;
  mount: DoorMountKey;
  coating: DoorCoatingKey;
  machining: DoorMachiningKey;
};

export type SceneMode = "open" | "wall" | "front";

export type ConfiguratorSettings = {
  allowFreeMovementInOpenScene: boolean;
  showSceneDataOnStart: boolean;
};

export const DEFAULT_CONFIGURATOR_SETTINGS: ConfiguratorSettings = {
  allowFreeMovementInOpenScene: false,
  showSceneDataOnStart: false,
};

export const SCENE_MODE_OPTIONS = [
  {
    key: "open",
    labelIt: "Aperta",
    labelEn: "Open",
    labelFr: "Ouverte",
  },
  {
    key: "wall",
    labelIt: "Filo parete",
    labelEn: "Wall aligned",
    labelFr: "Aligné au mur",
  },
  {
    key: "front",
    labelIt: "Filo fronte",
    labelEn: "Front aligned",
    labelFr: "Aligné en façade",
  },
] satisfies {
  key: SceneMode;
  labelIt: string;
  labelEn: string;
  labelFr: string;
}[];

export const DEFAULT_MODULE_VARIANT: ModuleVariantKey = "two_visible_sides";

export const DEFAULT_DOOR_CONFIGURATION: DoorConfiguration = {
  count: "one",
  mount: "flush_floor",
  coating: "spv_basin",
  machining: "smooth",
};

export const MODULE_VARIANT_OPTIONS = [
  {
    key: "two_visible_sides",
    labelIt: "2 fianchi a vista",
    labelEn: "2 visible sides",
    labelFr: "2 côtés visibles",
  },
  {
    key: "one_visible_one_internal",
    labelIt: "1 fianco a vista / 1 fianco interno",
    labelEn: "1 visible side / 1 internal side",
    labelFr: "1 côté visible / 1 côté intérieur",
  },
  {
    key: "two_internal_sides",
    labelIt: "2 fianchi interni",
    labelEn: "2 internal sides",
    labelFr: "2 côtés intérieurs",
  },
] satisfies {
  key: ModuleVariantKey;
  labelIt: string;
  labelEn: string;
  labelFr: string;
}[];

export function getModuleVariantLabel(
  variantKey: ModuleVariantKey,
  locale: Locale
) {
  const option =
    MODULE_VARIANT_OPTIONS.find((variant) => variant.key === variantKey) ||
    MODULE_VARIANT_OPTIONS[0];

  return getLocalizedOptionLabel(option, locale);
}

export const DOOR_COUNT_OPTIONS = [
  {
    key: "one",
    labelIt: "1 anta",
    labelEn: "Single door",
    labelFr: "1 porte",
  },
  {
    key: "two",
    labelIt: "2 ante",
    labelEn: "Double doors",
    labelFr: "2 portes",
  },
] satisfies {
  key: DoorCountKey;
  labelIt: string;
  labelEn: string;
  labelFr: string;
}[];

export const DOOR_MOUNT_OPTIONS = [
  {
    key: "flush_floor",
    labelIt: "Anta a sfioro pavimento (SP)",
    labelEn: "Flush-to-floor door panel (SP)",
    labelFr: "Porte affleurante au sol (SP)",
  },
  {
    key: "visible_plinth",
    labelIt: "Zoccolo a vista (ZV)",
    labelEn: "Visible plinth (ZV)",
    labelFr: "Plinthe visible (ZV)",
  },
] satisfies {
  key: DoorMountKey;
  labelIt: string;
  labelEn: string;
  labelFr: string;
}[];

export const DOOR_COATING_OPTIONS = [
  {
    key: "spv_basin",
    labelIt: "SPV - con vasca",
    labelEn: "SPV - with basin",
    labelFr: "SPV - avec vasque",
  },
  {
    key: "gs_no_basin",
    labelIt: "GS - senza vasca",
    labelEn: "GS - without basin",
    labelFr: "GS - sans vasque",
  },
  {
    key: "sa_painting",
    labelIt: "SA - predisposizione per essere tinteggiata",
    labelEn: "SA - predisposition for painting",
    labelFr: "SA - prête à être peinte",
  },
  {
    key: "mgr_basin_handle",
    labelIt: "MGR - predisposizione per rivestimento con vasca e maniglia gola",
    labelEn: "MGR - predisposition for coating with basin and throat handle",
    labelFr: "MGR - prête au revêtement avec vasque et poignée gorge",
  },
] satisfies {
  key: DoorCoatingKey;
  labelIt: string;
  labelEn: string;
  labelFr: string;
}[];

export const DOOR_MACHINING_OPTIONS = [
  {
    key: "smooth",
    labelIt: "Liscia",
    labelEn: "Smooth",
    labelFr: "Lisse",
  },
  {
    key: "protruding_shutter",
    labelIt: "Persiana sporgente",
    labelEn: "Protruding shutter",
    labelFr: "Porte en saillie",
  },
  {
    key: "inward_shutter",
    labelIt: "Persiana rivolta verso l'interno",
    labelEn: "Shutter facing inward",
    labelFr: "Porte tournée vers l'intérieur",
  },
  {
    key: "h10_vents",
    labelIt: "Asole H10 mm",
    labelEn: "H10 mm vent slots",
    labelFr: "Fentes d'aération H10 mm",
  },
] satisfies {
  key: DoorMachiningKey;
  labelIt: string;
  labelEn: string;
  labelFr: string;
}[];

// Recupera la label localizzata da una lista di opzioni configurabili.
function getOptionLabel<Key extends string>(
  options: { key: Key; labelIt: string; labelEn: string; labelFr: string }[],
  key: Key,
  locale: Locale
) {
  const option = options.find((currentOption) => currentOption.key === key);
  const safeOption = option || options[0];

  return getLocalizedOptionLabel(safeOption, locale);
}

// Restituisce la label nella lingua scelta mantenendo un unico criterio per tutte le opzioni.
function getLocalizedOptionLabel(
  option: { labelIt: string; labelEn: string; labelFr: string },
  locale: Locale
) {
  if (locale === "it") return option.labelIt;
  if (locale === "fr") return option.labelFr;

  return option.labelEn;
}

// Restituisce le quattro scelte anta in forma leggibile per riepilogo e PDF.
export function getDoorConfigurationSummary(
  configuration: DoorConfiguration | undefined,
  locale: Locale
) {
  if (!configuration) return [];

  return [
    getOptionLabel(DOOR_COUNT_OPTIONS, configuration.count, locale),
    getOptionLabel(DOOR_MOUNT_OPTIONS, configuration.mount, locale),
    getOptionLabel(DOOR_COATING_OPTIONS, configuration.coating, locale),
    getOptionLabel(DOOR_MACHINING_OPTIONS, configuration.machining, locale),
  ];
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
  doorConfiguration?: DoorConfiguration;
  color?: string;
};
