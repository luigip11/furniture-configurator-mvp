import type { ConfiguratorItem } from "../../types/configurator.ts";
import {
  getItemBillOfMaterials,
  type ModuleBomComponent,
} from "./module-technical-catalog.ts";

export type AggregatedBomComponent = ModuleBomComponent;

// Raggruppa le righe con stesso codice e stesse quote, senza inventare quantità per RIPINT.
export function getAggregatedBillOfMaterials(
  items: ConfiguratorItem[],
): AggregatedBomComponent[] {
  const aggregated = new Map<string, AggregatedBomComponent>();

  items
    .flatMap((item) => getItemBillOfMaterials(item))
    .forEach((component) => {
      const key = getBomComponentKey(component);
      const current = aggregated.get(key);

      if (!current) {
        aggregated.set(key, {
          ...component,
          quantity: getComponentQuantity(component),
        });
        return;
      }

      const first = getComponentQuantity(current);
      const second = getComponentQuantity(component);
      const sum = first !== null && second !== null ? first + second : NaN;
      current.quantity = Number.isFinite(sum) ? sum : null;
    });

  return [...aggregated.values()].sort((left, right) =>
    `${left.code}:${left.name}`.localeCompare(`${right.code}:${right.name}`),
  );
}

// Quantità assenti o non numeriche restano da definire, anche durante l'aggregazione.
export function getComponentQuantity(
  component: ModuleBomComponent,
): number | null {
  const raw = component.quantity;
  const quantity =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && raw.trim()
        ? Number(raw)
        : NaN;
  return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
}

// Genera una chiave stabile che evita di sommare pezzi con quote tecniche differenti.
function getBomComponentKey(component: ModuleBomComponent) {
  return [
    component.code,
    component.name,
    component.widthMm,
    component.heightMm,
    component.depthMm,
    component.thicknessMm,
    component.optional ? "optional" : "required",
  ].join("|");
}
