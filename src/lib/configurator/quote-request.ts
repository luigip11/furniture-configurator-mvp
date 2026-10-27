// Prepara una fotografia commerciale della composizione, senza persistere né inviare dati.
import type { ConfiguratorItem, Locale } from "../../types/configurator.ts";
import { getEffectiveDoorConfiguration } from "./module-capabilities.ts";
import { getCompositionFootprint } from "./module-envelope.ts";
import { hasValidModuleDimensions } from "./composition-constraints.ts";
import { getItemPrice, getQuotePricing } from "./quote-pricing.ts";
import { CONFIGURATOR_SCENE_SCALE } from "./scene-scale.ts";

export type QuoteContact = {
  name: string;
  email: string;
  phone: string;
  message: string;
  confirmed: boolean;
};

// La stessa validazione copre il modulo e la costruzione diretta dell'allegato dimostrativo.
export function isValidQuoteContact(contact: QuoteContact) {
  return (
    typeof contact.name === "string" &&
    contact.name.trim().length >= 2 &&
    contact.name.trim().length <= 120 &&
    typeof contact.email === "string" &&
    contact.email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim()) &&
    typeof contact.phone === "string" &&
    contact.phone.length <= 40 &&
    (!contact.phone.trim() || /^[+\d\s()./-]{3,40}$/.test(contact.phone)) &&
    typeof contact.message === "string" &&
    contact.message.length <= 2000 &&
    !/[\r\n\u0000]/.test(contact.name + contact.email + contact.phone) &&
    contact.confirmed === true
  );
}

// Copia solo dati utili al preventivo; non include asset remoti, stato dello store o mappe del catalogo.
export function createDemoQuoteRequest(
  contact: QuoteContact,
  items: ConfiguratorItem[],
  locale: Locale,
) {
  if (
    !isValidQuoteContact(contact) ||
    !items.length ||
    items.length > 500 ||
    items.some(
      (item) =>
        !hasValidModuleDimensions(item) ||
        !item.position.every(Number.isFinite) ||
        !Number.isFinite(item.rotationY),
    )
  ) {
    throw new Error("invalidQuoteRequest");
  }
  return {
    schemaVersion: 1,
    mode: "demo" as const,
    createdAt: new Date().toISOString(),
    locale,
    contact: {
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      message: contact.message.trim(),
    },
    pricing: { currency: "EUR", ...getQuotePricing(items), indicative: true },
    footprint: getCompositionFootprint(items),
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      code: item.code ?? null,
      name: locale === "it" ? item.nameIt : item.nameEn || item.nameIt,
      dimensionsMm: {
        width: item.widthMm,
        height: item.heightMm,
        depth: item.depthMm,
      },
      catalogDimensions: item.catalogDimensions
        ? { ...item.catalogDimensions }
        : null,
      positionMm: item.position.map(
        (value) => value * CONFIGURATOR_SCENE_SCALE,
      ),
      rotationY: item.rotationY,
      variant: item.productVariantKey || item.variantKey,
      baseFinish: item.baseFinishConfiguration
        ? { ...item.baseFinishConfiguration }
        : null,
      doors: getEffectiveDoorConfiguration(item)
        ? { ...getEffectiveDoorConfiguration(item)! }
        : null,
      price: getItemPrice(item),
    })),
  };
}

export type DemoQuoteRequest = ReturnType<typeof createDemoQuoteRequest>;
