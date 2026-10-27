// Vista schematica ricavata dalle stesse righe della distinta, senza inventare ripiani o quantità.
import type { ConfiguratorItem } from "../../types/configurator.ts";
import { getParametricBillOfMaterials } from "./parametric-bom.ts";

export type PreviewPanel = {
  code: string;
  sizeMm: [number, number, number];
  positionMm: [number, number, number];
  surface: "internal" | "external" | "back" | "front";
};

// Disegna pannelli e optional solo per le famiglie già coperte dalle formule documentate.
export function getParametricPreviewPanels(
  item: ConfiguratorItem,
): PreviewPanel[] | null {
  const bom = getParametricBillOfMaterials(item);
  if (!bom) return null;
  const panels: PreviewPanel[] = [];
  const { widthMm: w, heightMm: h, depthMm: d } = item;
  const sides = bom
    .filter((row) =>
      /^(FIB|FISOTTOLAV|FIP0|FAVPO|FAVC|FAVSOTTOLAV)$/.test(row.code),
    )
    .flatMap((row) =>
      Array.from({ length: Number(row.quantity) || 0 }, () => row),
    );
  if (sides.length === 2 && sides[0].code !== sides[1].code) {
    const visibleFirst = item.productVariantKey !== "visible_right";
    sides.sort(
      (a, b) =>
        (Number(a.code.startsWith("FAV")) - Number(b.code.startsWith("FAV"))) *
        (visibleFirst ? -1 : 1),
    );
  }
  sides.forEach((row, index) => {
    const t = Number(row.thicknessMm),
      height = Number(row.heightMm),
      depth = Number(row.depthMm);
    panels.push({
      code: row.code,
      sizeMm: [t, height, depth],
      positionMm: [(index === 0 ? -1 : 1) * (w / 2 - t / 2), h - height / 2, 0],
      surface: row.code.startsWith("FAV") ? "external" : "internal",
    });
  });
  const bottom = sides.length
    ? Math.max(...sides.map((row) => h - Number(row.heightMm)))
    : 0;
  bom
    .filter((row) => !sides.includes(row))
    .forEach((row) => {
      // RIPINT con quantità non definita resta documentale; non aggiunge ripiani fittizi alla scena.
      const quantity = typeof row.quantity === "number" ? row.quantity : 0;
      for (let i = 0; i < quantity; i++) {
        const t = Number(row.thicknessMm),
          width = Number(row.widthMm);
        let size: [number, number, number] | null = null;
        let position: [number, number, number] = [0, 0, 0];
        let surface: PreviewPanel["surface"] = "internal";
        if (row.code.startsWith("SCH")) {
          size = [width, Number(row.heightMm), t];
          position = [0, h - size[1] / 2, -d / 2 + t / 2];
          surface = "back";
        } else if (row.code.startsWith("SOT")) {
          size = [width, t, Number(row.depthMm)];
          position = [0, bottom + t / 2, 0];
        } else if (row.code.startsWith("CAPP")) {
          size = [width, t, Number(row.depthMm)];
          position = [0, h - t / 2, 0];
        } else if (row.code === "TOPB") {
          size = [width, t, Number(row.depthMm)];
          position = [0, h + t / 2, (size[2] - d) / 2];
          surface = "external";
        } else if (row.code === "ANTAB") {
          size = [width, Number(row.heightMm), t];
          position = [
            -w / 2 + width / 2 + i * width,
            h - size[1] / 2,
            d / 2 + t / 2,
          ];
          surface = "front";
        } else if (/^(RFV|RFVP|RRAVR|RRVP)$/.test(row.code)) {
          size = [width, Number(row.heightMm), t];
          position = [
            0,
            h - size[1] / 2,
            (row.code.endsWith("P") || i % 2 ? -1 : 1) * (d / 2 - t / 2),
          ];
        } else if (row.code === "RIPINT") {
          size = [width, t, Number(row.depthMm)];
          position = [0, bottom + ((h - bottom) * (i + 1)) / (quantity + 1), 0];
        }
        if (size && size.every((value) => Number.isFinite(value) && value > 0))
          panels.push({
            code: row.code,
            sizeMm: size,
            positionMm: position,
            surface,
          });
      }
    });
  return panels;
}
