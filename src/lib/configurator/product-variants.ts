import { DEFAULT_MODULE_VARIANT } from "../../types/configurator.ts";
import type {
  ModuleVariantKey,
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
  variantKey: ModuleVariantKey;
};

const VARIANT_SUFFIXES: VariantSuffix[] = [
  { suffix: "_A_VISTA_SX_E_DX", variantKey: "two_visible_sides" },
  { suffix: "_CON_2_FIANCHI_INTERNI", variantKey: "two_internal_sides" },
  { suffix: "_CON_2_FIANCHI_A_VISTA", variantKey: "two_visible_sides" },
  { suffix: "_CON_2_FIANCHIA_VISTA", variantKey: "two_visible_sides" },
  {
    suffix: "_CON_1_FIANCO_INTERNO_1_FIANCO_VISTA",
    variantKey: "one_visible_one_internal",
  },
  {
    suffix: "_CON_1_FIANCHIA_VISTA_1_FIANCO_INTERNO",
    variantKey: "one_visible_one_internal",
  },
  {
    suffix: "_1_FIANCO_INTERNO_1_FIANCO_A_VISTA_2",
    variantKey: "one_visible_one_internal",
  },
  { suffix: "_FIANCHI_PORTANTI_2", variantKey: "two_visible_sides" },
  { suffix: "_A_VISTA_DX", variantKey: "one_visible_one_internal" },
  { suffix: "_A_VISTA_SX", variantKey: "one_visible_one_internal" },
  { suffix: "_NON_A_VISTA", variantKey: "two_internal_sides" },
];

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

// Riunisce i record Supabase equivalenti in una card catalogo con le varianti disponibili.
export function groupProductsIntoFamilies(products: Product[]): CatalogProductFamily[] {
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
      family.variantProducts.one_visible_one_internal ||
      family.variantProducts.two_internal_sides ||
      family.product;

    return { ...family, product: defaultProduct };
  });
}

// Restituisce le sole varianti realmente disponibili per una famiglia inserita in scena.
export function getProductVariantKeys(
  variantProducts: ProductVariantProducts | undefined
): ModuleVariantKey[] {
  if (!variantProducts) return [];

  return ([
    "two_visible_sides",
    "one_visible_one_internal",
    "two_internal_sides",
  ] as ModuleVariantKey[]).filter((variantKey) => Boolean(variantProducts[variantKey]));
}

// Seleziona una variante valida, mantenendo una scelta predefinita stabile per dati incompleti.
export function getSafeProductVariant(
  variantProducts: ProductVariantProducts | undefined,
  requestedVariant: ModuleVariantKey
): ModuleVariantKey | null {
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
  requestedVariant: ModuleVariantKey
): Product | null {
  const safeVariant = getSafeProductVariant(variantProducts, requestedVariant);

  return safeVariant ? variantProducts?.[safeVariant] || null : null;
}
