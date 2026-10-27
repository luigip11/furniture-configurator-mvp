import {
  DEFAULT_MODULE_VARIANT,
  getDoorConfigurationSummary,
  getModuleVariantLabel,
} from "../../types/configurator.ts";
import type { ConfiguratorItem, Locale } from "../../types/configurator.ts";
import {
  getItemBillOfMaterials,
  hasConfigurableModuleVariants,
} from "./module-technical-catalog.ts";
import type { ModuleBomComponent } from "./module-technical-catalog.ts";
import {
  getAggregatedBillOfMaterials,
  getComponentQuantity,
} from "./aggregated-bom.ts";
import { getCompositionFootprint } from "./module-envelope.ts";
import { getEffectiveDoorConfiguration } from "./module-capabilities.ts";
import { canConfigureBaseFinish } from "./parametric-bom.ts";
import { assertTechnicalExport } from "./technical-validation.ts";
import { dictionary } from "../i18n/dictionary.ts";
import { technicalDictionary } from "../i18n/technical-dictionary.ts";

export type { AggregatedBomComponent } from "./aggregated-bom.ts";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN_X = 42.52;
const PAGE_BOTTOM = 72;
const CONTENT_RIGHT = 552.76;

export function downloadTechnicalSheetPdf(
  items: ConfiguratorItem[],
  locale: Locale,
) {
  if (items.length === 0) return;

  const pdf = createTechnicalSheetPdf(items, locale, new Date());
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `FurnitureConfigurator_${
    locale === "it"
      ? "Distinta"
      : locale === "fr"
        ? "FicheTechnique"
        : "TechnicalSheet"
  }_${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Scarica una distinta unica che somma i componenti uguali di tutti i moduli in scena.
export function downloadAggregatedTechnicalSheetPdf(
  items: ConfiguratorItem[],
  locale: Locale,
) {
  if (items.length === 0) return;

  const pdf = createAggregatedTechnicalSheetPdf(items, locale, new Date());
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `FurnitureConfigurator_${
    locale === "it"
      ? "Distinta_Aggregata"
      : locale === "fr"
        ? "Nomenclature_Groupee"
        : "Aggregated_Bill"
  }_${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Genera un documento testabile anche senza browser, rifiutando distinte incoerenti.
export function createTechnicalSheetPdf(
  items: ConfiguratorItem[],
  locale: Locale,
  date: Date,
) {
  assertTechnicalExport(items);
  const pages = createPageStreams(items, locale, date);

  return createPdfDocument(pages);
}

// Genera il PDF compatto della distinta aggregata, separato dal dettaglio per modulo.
export function createAggregatedTechnicalSheetPdf(
  items: ConfiguratorItem[],
  locale: Locale,
  date: Date,
) {
  assertTechnicalExport(items);
  const components = getAggregatedBillOfMaterials(items);
  const t = { ...dictionary[locale], ...technicalDictionary[locale] };
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
  const addPageHeader = (continuation = false) => {
    addBoldText(
      continuation ? t.pdfContinuation : t.pdfAggregateTitle,
      PAGE_MARGIN_X,
      y,
      continuation ? 18 : 22,
    );
    y -= 28;
    if (!continuation) {
      addText(
        `${locale === "it" ? "Data" : "Date"}: ${formatDate(date, locale)}`,
        PAGE_MARGIN_X,
        y,
        10,
      );
      y -= 16;
    }
    if (!continuation) {
      wrapPdfLines(t.preliminary, CONTENT_RIGHT - PAGE_MARGIN_X, 8).forEach(
        (line) => {
          addText(line, PAGE_MARGIN_X, y, 8);
          y -= 12;
        },
      );
    }
    addText(
      `${items.length} ${t.modules} / ${components.length} ${t.pdfTechnicalComponents.toLowerCase()}`,
      PAGE_MARGIN_X,
      y,
      10,
    );
    y -= 17;
    currentPage.push(
      `${formatNumber(PAGE_MARGIN_X)} ${formatNumber(y)} m ${formatNumber(CONTENT_RIGHT)} ${formatNumber(y)} l S`,
    );
    y -= 24;
  };

  currentPage.push("0.567 w");
  addPageHeader();

  components.forEach((component) => {
    wrapPdfLines(
      formatBomComponentLine(component, t),
      CONTENT_RIGHT - PAGE_MARGIN_X,
      8.5,
    ).forEach((line) => {
      if (y - 20 <= PAGE_BOTTOM) {
        flushPage();
        y = PAGE_HEIGHT - 56.69;
        currentPage.push("0.567 w");
        addPageHeader(true);
      }
      addText(line, PAGE_MARGIN_X, y, 8.5);
      y -= 15;
    });
  });

  flushPage();
  return createPdfDocument(pageStreams);
}

function createPageStreams(
  items: ConfiguratorItem[],
  locale: Locale,
  date: Date,
) {
  const footprint = getCompositionFootprint(items);
  const t = { ...dictionary[locale], ...technicalDictionary[locale] };
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
        `${formatNumber(CONTENT_RIGHT)} ${formatNumber(textY)} l S`,
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

  // Spezza anche codici lunghi: nessuna specifica deve uscire dal foglio o essere troncata.
  const addWrappedText = (text: string, x: number, size = 11, bold = false) => {
    wrapPdfLines(text, CONTENT_RIGHT - x, size).forEach((line) => {
      ensureSpace(size + 6);
      (bold ? addBoldText : addText)(line, x, y, size);
      y -= size + 6;
    });
  };

  currentPage.push("0.567 w");
  addBoldText(t.pdfTitle, PAGE_MARGIN_X, y, 22);
  y -= 22.68;
  addText(
    `${locale === "it" ? "Data" : "Date"}: ${formatDate(date, locale)}`,
    PAGE_MARGIN_X,
    y,
    10,
  );
  y -= 11.34;
  addRule(y);
  y -= 36.85;

  addWrappedText(t.preliminary, PAGE_MARGIN_X, 8);
  y -= 8;
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
    const bomComponents = getItemBillOfMaterials(item);
    const name = locale === "it" ? item.nameIt : item.nameEn || item.nameIt;
    const variant = getModuleVariantLabel(
      item.productVariantKey || item.variantKey || DEFAULT_MODULE_VARIANT,
      locale,
    );
    const door = getDoorConfigurationSummary(
      getEffectiveDoorConfiguration(item),
      locale,
    );
    ensureSpace(90);
    addWrappedText(
      getModuleTitle(
        index + 1,
        name,
        variant,
        hasConfigurableModuleVariants(item.code),
        t.pdfWith,
      ),
      PAGE_MARGIN_X,
      11,
      true,
    );
    addWrappedText(`${t.code}: ${item.code || "-"}`, PAGE_MARGIN_X + 14.17);
    addWrappedText(
      `${t.nominalDimensions}: L ${item.widthMm} x A ${item.heightMm} x P ${item.depthMm} mm`,
      PAGE_MARGIN_X + 14.17,
    );
    if (canConfigureBaseFinish(item.code))
      addWrappedText(
        `${item.baseFinishConfiguration?.hasTop ? t.topIncluded : t.topExcluded} - ${door[0] || t.noDoors}`,
        PAGE_MARGIN_X + 14.17,
        9,
      );
    if (door.length) {
      addWrappedText(
        `${t.pdfDoorConfiguration}: ${door.join(" - ")}`,
        PAGE_MARGIN_X + 14.17,
        9.5,
      );
      addWrappedText(
        canConfigureBaseFinish(item.code) ? t.doorNotes : t.documentaryDoors,
        PAGE_MARGIN_X + 14.17,
        8,
      );
    }
    addWrappedText(t.pdfTechnicalComponents, PAGE_MARGIN_X + 14.17, 10, true);
    bomComponents.forEach((component) =>
      addWrappedText(
        formatBomComponentLine(component, t),
        PAGE_MARGIN_X + 28.35,
        8.5,
      ),
    );
    y -= 10;
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
  withLabel: string,
) {
  return variantVisible
    ? `${index}. ${name} ${withLabel} ${variant}`
    : `${index}. ${name}`;
}

// Formatta una riga distinta in una forma compatta adatta al PDF tecnico.
function formatBomComponentLine(
  component: ModuleBomComponent,
  t: Record<string, string>,
) {
  const quantity = getComponentQuantity(component) ?? t.quantityPending;
  const optional = component.optional ? ` (${t.pdfOptional})` : "";
  const dimensions = [
    ["L", component.widthMm],
    ["A", component.heightMm],
    ["P", component.depthMm],
    [t.pdfThickness, component.thicknessMm],
  ]
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
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

// Usa una larghezza conservativa per Helvetica ed evita tagli anche su parole o codici senza spazi.
function wrapPdfLines(text: string, width: number, size: number) {
  const limit = Math.max(1, Math.floor(width / size));
  const words = text
    .split(/\s+/)
    .flatMap((word) => word.match(new RegExp(`.{1,${limit}}`, "gu")) || []);
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    if (line && line.length + 1 + word.length > limit) {
      lines.push(line);
      line = "";
    }
    line = line ? `${line} ${word}` : word;
  });
  if (line) lines.push(line);
  return lines;
}

function createPdfDocument(pageStreams: string[]) {
  const objectCount = 4 + pageStreams.length * 2;
  const objects = new Array<string>(objectCount + 1);
  const pageIds = pageStreams.map((_, index) => 5 + index * 2);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R /PageLayout /OneColumn >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds
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
  size: number,
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
  const localeCode =
    locale === "it" ? "it-IT" : locale === "fr" ? "fr-FR" : "en-GB";

  return date.toLocaleDateString(localeCode);
}

function formatNumber(value: number) {
  return Number(value.toFixed(2)).toString();
}
