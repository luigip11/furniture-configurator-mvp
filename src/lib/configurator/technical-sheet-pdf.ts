import {
  ConfiguratorItem,
  DEFAULT_MODULE_VARIANT,
  Locale,
  getModuleVariantLabel,
} from "@/types/configurator";
import {
  getModuleBillOfMaterials,
  hasConfigurableModuleVariants,
  ModuleBomComponent,
} from "@/lib/configurator/module-technical-catalog";
import {
  CONFIGURATOR_SCENE_SCALE,
  getItemFootprintMm,
} from "@/store/configurator-calculations";
import { dictionary } from "@/lib/i18n/dictionary";

type FootprintSummary = {
  depthMm: number;
  heightMm: number;
  widthMm: number;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN_X = 42.52;
const PAGE_BOTTOM = 72;
const CONTENT_RIGHT = 552.76;

export function downloadTechnicalSheetPdf(
  items: ConfiguratorItem[],
  locale: Locale
) {
  if (items.length === 0) return;

  const pdf = createTechnicalSheetPdf(items, locale, new Date());
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `FurnitureConfigurator_${
    locale === "it" ? "Distinta" : "TechnicalSheet"
  }_${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createTechnicalSheetPdf(
  items: ConfiguratorItem[],
  locale: Locale,
  date: Date
) {
  const pages = createPageStreams(items, locale, date);

  return createPdfDocument(pages);
}

function createPageStreams(
  items: ConfiguratorItem[],
  locale: Locale,
  date: Date
) {
  const footprint = getFootprintSummary(items);
  const t = dictionary[locale];
  const pageStreams: string[] = [];
  let currentPage: string[] = [];
  let y = PAGE_HEIGHT - 56.69;

  const flushPage = () => {
    pageStreams.push(`${currentPage.join("\n")}\n`);
    currentPage = [];
  };

  const addText = (text: string, x: number, textY: number, size = 11) => {
    currentPage.push(pdfText(text, x, textY, "F1", size));
  };

  const addBoldText = (text: string, x: number, textY: number, size = 11) => {
    currentPage.push(pdfText(text, x, textY, "F2", size));
  };

  const addRule = (textY: number) => {
    currentPage.push(
      `${formatNumber(PAGE_MARGIN_X)} ${formatNumber(textY)} m ` +
        `${formatNumber(CONTENT_RIGHT)} ${formatNumber(textY)} l S`
    );
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight > PAGE_BOTTOM) return;

    flushPage();
    y = PAGE_HEIGHT - 56.69;
    addBoldText(t.pdfTitle, PAGE_MARGIN_X, y, 18);
    y -= 28;
    addText(t.pdfContinuation, PAGE_MARGIN_X, y, 10);
    y -= 26;
    addRule(y);
    y -= 34;
  };

  currentPage.push("0.567 w");
  addBoldText(t.pdfTitle, PAGE_MARGIN_X, y, 22);
  y -= 22.68;
  addText(`${locale === "it" ? "Data" : "Date"}: ${formatDate(date, locale)}`, PAGE_MARGIN_X, y, 10);
  y -= 11.34;
  addRule(y);
  y -= 36.85;

  addBoldText(t.pdfOverallFootprint, PAGE_MARGIN_X, y, 13);
  y -= 22.68;
  addText(`${t.pdfTotalWidth}: ${footprint.widthMm} mm`, PAGE_MARGIN_X, y, 11);
  y -= 22.68;
  addText(`${t.pdfMaxHeight}: ${footprint.heightMm} mm`, PAGE_MARGIN_X, y, 11);
  y -= 22.68;
  addText(`${t.pdfMaxDepth}: ${footprint.depthMm} mm`, PAGE_MARGIN_X, y, 11);
  y -= 17.01;
  addRule(y);
  y -= 34.02;

  addBoldText(t.pdfConfiguredModules, PAGE_MARGIN_X, y, 11);
  y -= 28.35;

  items.forEach((item, index) => {
    const bomComponents = getModuleBillOfMaterials(
      item.code,
      item.variantKey || DEFAULT_MODULE_VARIANT
    );

    ensureSpace(92 + bomComponents.length * 16);

    const name = locale === "it" ? item.nameIt : item.nameEn || item.nameIt;
    const variant = getModuleVariantLabel(
      item.variantKey || DEFAULT_MODULE_VARIANT,
      locale
    );

    addBoldText(
      getModuleTitle(
        index + 1,
        name,
        variant,
        hasConfigurableModuleVariants(item.code),
        t.pdfWith
      ),
      PAGE_MARGIN_X,
      y,
      11
    );
    y -= 17.01;
    addText(`${t.code}: ${item.code || "-"}`, PAGE_MARGIN_X + 14.17, y, 11);
    y -= 17.01;
    addText(
      `${t.pdfDimensions}: L ${item.widthMm} x A ${item.heightMm} x P ${item.depthMm} mm`,
      PAGE_MARGIN_X + 14.17,
      y,
      11
    );
    y -= 24;

    if (bomComponents.length > 0) {
      addBoldText(t.pdfTechnicalComponents, PAGE_MARGIN_X + 14.17, y, 10);
      y -= 15.59;

      bomComponents.forEach((component) => {
        ensureSpace(20);
        addText(
          formatBomComponentLine(component, t),
          PAGE_MARGIN_X + 28.35,
          y,
          8.5
        );
        y -= 14.17;
      });

      y -= 6;
    }
  });

  flushPage();

  return pageStreams;
}

// Compone il titolo modulo evitando varianti fianchi su elementi speciali.
function getModuleTitle(
  index: number,
  name: string,
  variant: string,
  variantVisible: boolean,
  withLabel: string
) {
  return variantVisible
    ? `${index}. ${name} ${withLabel} ${variant}`
    : `${index}. ${name}`;
}

// Formatta una riga distinta in una forma compatta adatta al PDF tecnico.
function formatBomComponentLine(
  component: ModuleBomComponent,
  t: Record<string, string>
) {
  const quantity = component.quantity ?? "-";
  const optional = component.optional ? ` (${t.pdfOptional})` : "";
  const dimensions = [
    ["L", component.widthMm],
    ["A", component.heightMm],
    ["P", component.depthMm],
    [t.pdfThickness, component.thicknessMm],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => `${label} ${formatBomValue(value)}`)
    .join(" / ");

  return `${t.pdfQuantity} ${quantity} | ${component.code} | ${
    component.name
  }${optional}${dimensions ? ` | ${dimensions}` : ""}`;
}

// Normalizza numeri e formule testuali della legenda prima di scriverli nel PDF.
function formatBomValue(value: ModuleBomComponent[keyof ModuleBomComponent]) {
  return typeof value === "number" ? `${value}` : String(value);
}

function getFootprintSummary(items: ConfiguratorItem[]): FootprintSummary {
  const boxes = items.map((item) => {
    const footprint = getItemFootprintMm(item);
    const centerX = item.position[0] * CONFIGURATOR_SCENE_SCALE;
    const centerZ = item.position[2] * CONFIGURATOR_SCENE_SCALE;

    return {
      heightMm: item.heightMm,
      maxX: centerX + footprint.widthMm / 2,
      maxZ: centerZ + footprint.depthMm / 2,
      minX: centerX - footprint.widthMm / 2,
      minZ: centerZ - footprint.depthMm / 2,
    };
  });

  return {
    depthMm: Math.round(
      Math.max(...boxes.map((box) => box.maxZ)) -
        Math.min(...boxes.map((box) => box.minZ))
    ),
    heightMm: Math.round(Math.max(...boxes.map((box) => box.heightMm))),
    widthMm: Math.round(
      Math.max(...boxes.map((box) => box.maxX)) -
        Math.min(...boxes.map((box) => box.minX))
    ),
  };
}

function createPdfDocument(pageStreams: string[]) {
  const objectCount = 4 + pageStreams.length * 2;
  const objects = new Array<string>(objectCount + 1);
  const pageIds = pageStreams.map((_, index) => 5 + index * 2);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R /PageLayout /OneColumn >>";
  objects[2] =
    `<< /Type /Pages /Kids [${pageIds
      .map((pageId) => `${pageId} 0 R`)
      .join(" ")}] /Count ${pageStreams.length} >>`;
  objects[3] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pageStreams.forEach((stream, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;

    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] =
      `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  let pdf = "%PDF-1.3\n";
  const offsets = [0];

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    offsets[objectId] = pdf.length;
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function pdfText(
  text: string,
  x: number,
  y: number,
  font: "F1" | "F2",
  size: number
) {
  return (
    `BT /${font} ${size} Tf ${formatNumber(x)} ${formatNumber(y)} Td ` +
    `(${escapePdfText(text)}) Tj ET`
  );
}

function escapePdfText(text: string) {
  return toPdfSafeText(text).replace(/[\\()]/g, (match) => `\\${match}`);
}

function toPdfSafeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[×]/g, "x")
    .replace(/[€]/g, "EUR")
    .replace(/[^\x20-\x7e]/g, "");
}

function formatDate(date: Date, locale: Locale) {
  return date.toLocaleDateString(locale === "it" ? "it-IT" : "en-GB");
}

function formatNumber(value: number) {
  return Number(value.toFixed(2)).toString();
}
