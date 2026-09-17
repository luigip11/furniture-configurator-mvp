import type { ConfiguratorItem } from "../../types/configurator.ts";
import {
  getItemBillOfMaterials,
  type ModuleBomComponent,
} from "./module-technical-catalog.ts";

export type AggregatedBomComponent = ModuleBomComponent;

// Raggruppa le righe con stesso codice e stesse quote, senza inventare quantità per RIPINT.
export function getAggregatedBillOfMaterials(
  items: ConfiguratorItem[]
): AggregatedBomComponent[] {
  const aggregated = new Map<string, AggregatedBomComponent>();

  items.flatMap((item) => getItemBillOfMaterials(item)).forEach((component) => {
    const key = getBomComponentKey(component);
    const current = aggregated.get(key);

    if (!current) {
      aggregated.set(key, { ...component });
      return;
    }

    current.quantity =
      current.quantity === null ||
      current.quantity === undefined ||
      component.quantity === null ||
      component.quantity === undefined
        ? null
        : Number(current.quantity) + Number(component.quantity);
  });

  return [...aggregated.values()].sort((left, right) =>
    `${left.code}:${left.name}`.localeCompare(`${right.code}:${right.name}`)
  );
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
