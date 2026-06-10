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
  position: [number, number, number];
  color?: string;
};
