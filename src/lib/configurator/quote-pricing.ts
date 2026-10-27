// Il catalogo contiene prezzi di riferimento: mancano regole approvate per le personalizzazioni.
import { DEFAULT_DOOR_CONFIGURATION } from "../../types/configurator.ts";
import type { ConfiguratorItem } from "../../types/configurator.ts";
import { getEffectiveDoorConfiguration } from "./module-capabilities.ts";

export type ItemPrice = {
  status: "catalog" | "missing" | "custom";
  catalogPrice: number | null;
  amountCents: number | null;
};

// Zero è un prezzo valido; stringhe, negativi e importi non rappresentabili non diventano zeri.
export function getCatalogPrice(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    return null;
  const cents = Math.round((value + Number.EPSILON) * 100);
  return Number.isSafeInteger(cents) ? cents / 100 : null;
}

// Non applica incrementi inventati a misure, top o ante non coperti da un listino.
export function getItemPrice(item: ConfiguratorItem): ItemPrice {
  const catalogPrice = getCatalogPrice(item.price);
  if (catalogPrice === null)
    return { status: "missing", catalogPrice, amountCents: null };
  const nominal = item.catalogDimensions;
  const changedDimensions =
    !nominal ||
    (["widthMm", "heightMm", "depthMm"] as const).some(
      (axis) =>
        !Number.isFinite(item[axis]) ||
        !Number.isFinite(nominal[axis]) ||
        Math.abs(item[axis] - nominal[axis]) > 1e-7,
    );
  const finish = item.baseFinishConfiguration;
  const doors = getEffectiveDoorConfiguration(item);
  const changedDoors =
    doors &&
    (
      Object.keys(
        DEFAULT_DOOR_CONFIGURATION,
      ) as (keyof typeof DEFAULT_DOOR_CONFIGURATION)[]
    ).some((key) => doors[key] !== DEFAULT_DOOR_CONFIGURATION[key]);
  const custom =
    changedDimensions ||
    finish?.hasTop ||
    (finish?.doorCount && finish.doorCount !== "none") ||
    changedDoors;
  return {
    status: custom ? "custom" : "catalog",
    catalogPrice,
    amountCents: custom ? null : Math.round(catalogPrice * 100),
  };
}

// Somma in centesimi solo i moduli quotabili e rende esplicito ogni prezzo ancora da definire.
export function getQuotePricing(items: ConfiguratorItem[]) {
  const prices = items.map(getItemPrice);
  const totalCents = prices.reduce(
    (sum, price) => sum + (price.amountCents ?? 0),
    0,
  );
  const pendingCount = prices.filter(
    (price) => price.amountCents === null,
  ).length;
  return {
    totalCents,
    pendingCount,
    pricedCount: prices.length - pendingCount,
    partial: pendingCount > 0,
  };
}

// Usa la stessa formattazione valutaria per zeri, righe e totali nelle tre lingue.
export function formatQuoteMoney(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
