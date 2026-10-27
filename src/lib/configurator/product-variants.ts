import { DEFAULT_MODULE_VARIANT } from "../../types/configurator.ts";
import type {
  ProductVariantKey,
  Product,
  ProductVariantProducts,
} from "../../types/configurator.ts";

export type CatalogProductFamily = {
  key: string;
  product: Product;
  variantProducts: ProductVariantProducts;
};

type VariantSuffix = {
  suffix: string;
  variantKey: ProductVariantKey;
};

const VARIANT_SUFFIXES: VariantSuffix[] = [
  { suffix: "_A_VISTA_SX_E_DX", variantKey: "two_visible_sides" },
  { suffix: "_CON_2_FIANCHI_INTERNI", variantKey: "two_internal_sides" },
  { suffix: "_CON_2_FIANCHI_A_VISTA", variantKey: "two_visible_sides" },
  { suffix: "_CON_2_FIANCHIA_VISTA", variantKey: "two_visible_sides" },
  {
    suffix: "_CON_1_FIANCO_INTERNO_1_FIANCO_VISTA",
    variantKey: "visible_right",
  },
  {
    suffix: "_CON_1_FIANCHIA_VISTA_1_FIANCO_INTERNO",
    variantKey: "visible_left",
  },
  {
    suffix: "_1_FIANCO_INTERNO_1_FIANCO_A_VISTA_2",
    variantKey: "one_visible_one_internal",
  },
  { suffix: "_FIANCHI_PORTANTI_2", variantKey: "two_visible_sides" },
  { suffix: "_A_VISTA_DX", variantKey: "visible_right" },
  { suffix: "_A_VISTA_SX", variantKey: "visible_left" },
  { suffix: "_NON_A_VISTA", variantKey: "two_internal_sides" },
];

// Mantiene tutte le varianti disponibili e privilegia il codice esatto cercato.
export function searchCatalogFamilies(
  products: Product[],
  query: string,
): CatalogProductFamily[] {
  const search = query.trim().toLowerCase();
  return groupProductsIntoFamilies(products).flatMap((family) => {
    if (!search) return [family];
    const matches = [
      family.product,
      ...Object.values(family.variantProducts),
    ].filter((product) =>
      `${product.code || ""} ${product.name_it} ${product.name_en || ""}`
        .toLowerCase()
        .includes(search),
    );
    const product =
      matches.find((product) => product.code?.toLowerCase() === search) ||
      matches[0];
    return product ? [{ ...family, product }] : [];
  });
}

// Classifica il prodotto senza confondere i fianchi portanti con un portale.
export function getCatalogGroupId(product: Product) {
  const text =
    `${product.code || ""} ${product.name_it} ${product.name_en || ""}`.toLowerCase();
  if (text.includes("colonna") || text.includes("column")) return "columns";
  if (/(?:^|[\s_-])portal(?:e|i)?(?:$|[\s_-])/.test(text)) return "portal";
  if (text.includes("pensile") || text.includes("wall unit"))
    return "wallUnits";
  if (text.includes("impiant") || text.includes("contenitore"))
    return "systems";
  if (text.includes("lavatrice") || text.includes("asciug")) return "laundry";
  if (text.includes("sottolavatoio")) return "washbasin";
  if (text.includes("sottolav")) return "sink";
  return "standard";
}

// Ricava la famiglia e la variante laterale dal codice pubblicato nel catalogo.
function getVariantDescriptor(product: Product) {
  const code = product.code?.trim().toUpperCase();

  if (!code) return null;

  const match = VARIANT_SUFFIXES.find(({ suffix }) => code.endsWith(suffix));

  return match
    ? {
        familyCode: code.slice(0, -match.suffix.length),
        variantKey: match.variantKey,
      }
    : null;
}

// Riconosce il record selezionato anche quando la ricerca mostra una singola variante.
export function getProductVariantKey(
  product: Product,
  variants?: ProductVariantProducts,
): ProductVariantKey {
  return (
    getProductVariantKeys(variants).find(
      (key) => variants?.[key]?.id === product.id,
    ) ||
    getVariantDescriptor(product)?.variantKey ||
    DEFAULT_MODULE_VARIANT
  );
}

// Riunisce i record Supabase equivalenti in una card catalogo con le varianti disponibili.
export function groupProductsIntoFamilies(
  products: Product[],
): CatalogProductFamily[] {
  const families = new Map<string, CatalogProductFamily>();

  [...products]
    .sort((left, right) => left.code?.localeCompare(right.code || "") || 0)
    .forEach((product) => {
      const descriptor = getVariantDescriptor(product);
      const familyKey = descriptor
        ? `${product.category_id || "uncategorized"}:${descriptor.familyCode}`
        : `product:${product.id}`;
      const existing = families.get(familyKey);

      if (!existing) {
        families.set(familyKey, {
          key: familyKey,
          product,
          variantProducts: descriptor
            ? { [descriptor.variantKey]: product }
            : {},
        });
        return;
      }

      if (descriptor && !existing.variantProducts[descriptor.variantKey]) {
        existing.variantProducts[descriptor.variantKey] = product;
      }
    });

  return [...families.values()].map((family) => {
    const defaultProduct =
      family.variantProducts[DEFAULT_MODULE_VARIANT] ||
      family.variantProducts.visible_right ||
      family.variantProducts.visible_left ||
      family.variantProducts.one_visible_one_internal ||
      family.variantProducts.two_internal_sides ||
      family.product;

    return { ...family, product: defaultProduct };
  });
}

// Restituisce le sole varianti realmente disponibili per una famiglia inserita in scena.
export function getProductVariantKeys(
  variantProducts: ProductVariantProducts | undefined,
): ProductVariantKey[] {
  if (!variantProducts) return [];

  return (
    [
      "two_visible_sides",
      "visible_left",
      "visible_right",
      "one_visible_one_internal",
      "two_internal_sides",
    ] as ProductVariantKey[]
  ).filter((variantKey) => Boolean(variantProducts[variantKey]));
}

// Seleziona una variante valida, mantenendo una scelta predefinita stabile per dati incompleti.
export function getSafeProductVariant(
  variantProducts: ProductVariantProducts | undefined,
  requestedVariant: ProductVariantKey,
): ProductVariantKey | null {
  const availableVariants = getProductVariantKeys(variantProducts);

  if (availableVariants.length === 0) return null;
  if (availableVariants.includes(requestedVariant)) return requestedVariant;
  if (availableVariants.includes(DEFAULT_MODULE_VARIANT)) {
    return DEFAULT_MODULE_VARIANT;
  }

  return availableVariants[0];
}

// Restituisce il record sorgente della variante richiesta, incluso il suo URL GLB dedicato.
export function getProductForVariant(
  variantProducts: ProductVariantProducts | undefined,
  requestedVariant: ProductVariantKey,
): Product | null {
  const safeVariant = getSafeProductVariant(variantProducts, requestedVariant);

  return safeVariant ? variantProducts?.[safeVariant] || null : null;
}
