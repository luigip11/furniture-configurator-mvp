import type { ModuleBomComponent } from "./module-technical-catalog.ts";
import type { ConfiguratorItem } from "../../types/configurator.ts";

const PANEL_THICKNESS_MM = 19.5;
const REGLET_THICKNESS_MM = 13;
const REGLET_HEIGHT_MM = 54;

// Indica se il modulo usa le regole della base interna con top e ante opzionali.
export function canConfigureBaseFinish(code?: string | null) {
  return code?.trim().toUpperCase() === "BASE_CON_2_FIANCHI_INTERNI";
}

// Calcola la distinta da formule documentate dal committente, se la famiglia e supportata.
export function getParametricBillOfMaterials(
  item: ConfiguratorItem
): ModuleBomComponent[] | null {
  const code = item.code?.trim().toUpperCase();

  if (code === "BASE_CON_2_FIANCHI_INTERNI") return getBaseBom(item);
  if (code === "BASE_SOTTOLAVELLO_CON_2_FIANCHI_INTERNI") {
    return getSinkBaseBom(item);
  }
  if (
    code === "PENSILE_ORIZZONTALE_A_VISTA_DX" ||
    code === "PENSILE_ORIZZONTALE_A_VISTA_SX"
  ) {
    return getHorizontalWallUnitBom(item);
  }
  if (code === "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX_E_DX") {
    return getLowerUtilityColumnBom(item);
  }
  if (code === "BASE_SOTTOLAVATOIO_CON_1_FIANCHIA_VISTA_1_INTERNO") {
    return getMixedWashbasinBaseBom(item);
  }

  return null;
}

// Applica le quote della base con due fianchi interni e gli optional top/ante nominali.
function getBaseBom(item: ConfiguratorItem): ModuleBomComponent[] {
  const { width, height, depth } = getSafeDimensions(item);
  const internalWidth = width - PANEL_THICKNESS_MM * 2;
  const finish = item.baseFinishConfiguration;
  const components: ModuleBomComponent[] = [
    component("FIB", "FIANCO INTERNO PER BASE", 2, null, height - 80, depth),
    component("RFV", "REGOLO FISSO VERTICALI CON ATTACCO", 1, internalWidth, REGLET_HEIGHT_MM, null, REGLET_THICKNESS_MM),
    component("SCHB", "SCHIENALE BASE", 1, internalWidth, height - 99.5, null),
    component("SOTTOBC", "SOTTO PER BASE E COLONNA", 1, internalWidth, null, depth - 25),
    component("RIPINT", "RIPIANI INTERNI", null, internalWidth - 0.5, null, depth - 54.5),
  ];

  if (finish?.hasTop) {
    components.push(component("TOPB", "TOP PER BASE", 1, width, null, depth + 15));
  }
  if (finish?.doorCount && finish.doorCount !== "none") {
    const quantity = finish.doorCount === "two" ? 2 : 1;
    components.push(
      component("ANTAB", "ANTA PER BASE", quantity, width / quantity, height - 80, null)
    );
  }

  return components;
}

// Applica le quote della base sottolavello con due fianchi interni.
function getSinkBaseBom(item: ConfiguratorItem): ModuleBomComponent[] {
  const { width, height, depth } = getSafeDimensions(item);
  const internalWidth = width - PANEL_THICKNESS_MM * 2;

  return [
    component("FISOTTOLAV", "FIANCO INTERNO SOTTOLAVELLO", 2, null, height - 80, depth),
    component("RFV", "REGOLO FISSO VERTICALI CON ATTACCO", 2, internalWidth, REGLET_HEIGHT_MM, null, REGLET_THICKNESS_MM),
    component("SCHSOTTOLAV", "SCHIENALE SOTTOLAVELLO - SOTTOLAVATOIO ALT. 150 MM", 1, internalWidth, 150, null),
    component("SOTSOTTOLAV", "SOTTO-SOTTOLAVELLO", 1, internalWidth, null, depth - 40),
  ];
}

// Applica le quote del pensile orizzontale con un fianco a vista e uno interno.
function getHorizontalWallUnitBom(item: ConfiguratorItem): ModuleBomComponent[] {
  const { width, height, depth } = getSafeDimensions(item);

  return [
    component("FIP0", "FIANCO INTERNO PER PENSILE ORIZZONTALE", 1, null, height, depth),
    component("FAVPO", "FIANCO A VISTA PER PENSILE ORIZZONTALE", 1, null, height, depth),
    component("SCHPVO", "SCHIENALE PENSILE VERTICALE-ORIZZONTALE", 1, width - 39, height - 39, null),
    component("SOTTOPVO", "SOTTO PER PENSILE VERTICALE E ORIZZONTALE", 1, width - 39, null, depth),
    component("CAPPPO", "CAPPELLO PER PENSILE ORIZZONTALE", 1, width - 39, null, depth),
    component("RIPINT", "RIPIANI INTERNI", null, width - 39.5, null, depth - 29.5),
  ];
}

// Applica le quote della colonna porta-impianti libera in basso con due fianchi a vista.
function getLowerUtilityColumnBom(item: ConfiguratorItem): ModuleBomComponent[] {
  const { width, height, depth } = getSafeDimensions(item);
  const internalWidth = width - 39;

  return [
    component("FAVC", "FIANCO A VISTA PER COLONNA", 2, null, height, depth),
    component("SCHC", "SCHIENALE COLONNA", 1, internalWidth, height - 119, null),
    component("RRAVR", "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE", 1, internalWidth, REGLET_HEIGHT_MM, null, REGLET_THICKNESS_MM),
    component("RRVP", "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO", 1, internalWidth, REGLET_HEIGHT_MM, null, REGLET_THICKNESS_MM),
    component("CAPPC", "CAPPELLO COLONNA", 1, internalWidth, null, depth - 25),
    component("RIPINT", "RIPIANI INTERNI", null, width - 39.5, null, depth - 54.5),
  ];
}

// Applica le quote della base sottolavatoio con un fianco a vista e uno interno.
function getMixedWashbasinBaseBom(item: ConfiguratorItem): ModuleBomComponent[] {
  const { width, height, depth } = getSafeDimensions(item);
  const internalWidth = width - 39;

  return [
    component("FAVSOTTOLAV", "FIANCO A VISTA SOTTOLAVELLO", 1, null, height, depth),
    component("FISOTTOLAV", "FIANCO INTERNO SOTTOLAVELLO", 1, null, height - 80, depth),
    component("RFV", "REGOLO FISSO VERTICALI CON ATTACCO", 2, internalWidth, REGLET_HEIGHT_MM, null, REGLET_THICKNESS_MM),
    component("SCHSOTTOLAV", "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM", 1, internalWidth, 150, null),
    component("SOTSOTTOLAV", "SOTTO-SOTTOLAVELLO", 1, internalWidth, null, depth - 40),
  ];
}

// Normalizza le quote per evitare risultati negativi o non numerici nelle formule tecniche.
function getSafeDimensions(item: ConfiguratorItem) {
  return {
    width: getSafeDimension(item.widthMm),
    height: getSafeDimension(item.heightMm),
    depth: getSafeDimension(item.depthMm),
  };
}

// Mantiene gli input dimensionali entro un minimo tecnico sicuro.
function getSafeDimension(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

// Crea una riga distinta coerente tra tutte le famiglie parametriche.
function component(
  code: string,
  name: string,
  quantity: number | null,
  widthMm: number | null,
  heightMm: number | null,
  depthMm: number | null,
  thicknessMm = PANEL_THICKNESS_MM
): ModuleBomComponent {
  return { code, name, quantity, widthMm, heightMm, depthMm, thicknessMm, optional: false };
}
