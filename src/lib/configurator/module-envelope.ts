// Ingombri installati in millimetri, condivisi da collisioni, camera, scena e PDF.
import type { ConfiguratorItem } from "../../types/configurator.ts";
import {
  canConfigureBaseFinish,
  PANEL_THICKNESS_MM,
} from "./parametric-bom.ts";
import { CONFIGURATOR_SCENE_SCALE } from "./scene-scale.ts";

export type FootprintItem = Pick<
  ConfiguratorItem,
  "widthMm" | "depthMm" | "rotationY"
> &
  Partial<Pick<ConfiguratorItem, "code" | "baseFinishConfiguration">>;

// Top e ante sporgono sul fronte; il top aggiunge il proprio spessore all'altezza nominale.
export function getModuleExtras(
  item: Partial<Pick<ConfiguratorItem, "code" | "baseFinishConfiguration">>,
) {
  const finish = canConfigureBaseFinish(item.code)
    ? item.baseFinishConfiguration
    : undefined;
  return {
    topMm: finish?.hasTop ? PANEL_THICKNESS_MM : 0,
    frontMm: Math.max(
      finish?.hasTop ? 15 : 0,
      finish?.doorCount && finish.doorCount !== "none" ? PANEL_THICKNESS_MM : 0,
    ),
  };
}

// Ruota anche lo scostamento del fronte, senza assumere un ingombro simmetrico.
export function getRotatedModuleFootprint(item: FootprintItem) {
  const { frontMm } = getModuleExtras(item);
  const angle = (item.rotationY * Math.PI) / 180;
  const c = Math.abs(Math.cos(angle)) < 1e-10 ? 0 : Math.cos(angle);
  const s = Math.abs(Math.sin(angle)) < 1e-10 ? 0 : Math.sin(angle);
  const widthMm =
    Math.abs(c) * item.widthMm + Math.abs(s) * (item.depthMm + frontMm);
  const depthMm =
    Math.abs(s) * item.widthMm + Math.abs(c) * (item.depthMm + frontMm);
  return {
    widthMm,
    depthMm,
    offsetXMm: (s * frontMm) / 2,
    offsetZMm: (c * frontMm) / 2,
  };
}

// Include la quota da terra e le sporgenze opzionali nel volume effettivamente installato.
export function getItemInstalledBounds(item: ConfiguratorItem) {
  const footprint = getRotatedModuleFootprint(item);
  const x = item.position[0] * CONFIGURATOR_SCENE_SCALE + footprint.offsetXMm;
  const y = item.position[1] * CONFIGURATOR_SCENE_SCALE;
  const z = item.position[2] * CONFIGURATOR_SCENE_SCALE + footprint.offsetZMm;
  return {
    minX: x - footprint.widthMm / 2,
    maxX: x + footprint.widthMm / 2,
    minY: y,
    maxY: y + item.heightMm + getModuleExtras(item).topMm,
    minZ: z - footprint.depthMm / 2,
    maxZ: z + footprint.depthMm / 2,
  };
}

// L'altezza complessiva usa il riferimento pavimento anche per un pensile isolato.
export function getCompositionFootprint(items: ConfiguratorItem[]) {
  if (!items.length) return { count: 0, widthMm: 0, heightMm: 0, depthMm: 0 };
  const boxes = items.map(getItemInstalledBounds);
  return {
    count: items.length,
    widthMm: preciseMm(
      Math.max(...boxes.map((b) => b.maxX)) -
        Math.min(...boxes.map((b) => b.minX)),
    ),
    heightMm: preciseMm(Math.max(...boxes.map((b) => b.maxY))),
    depthMm: preciseMm(
      Math.max(...boxes.map((b) => b.maxZ)) -
        Math.min(...boxes.map((b) => b.minZ)),
    ),
  };
}

// Conserva le quote decimali del catalogo eliminando soltanto il rumore della virgola mobile.
function preciseMm(value: number) {
  return Number(value.toFixed(3));
}
