import {
  DEFAULT_MODULE_VARIANT,
  MODULE_VARIANT_OPTIONS,
} from "../../types/configurator.ts";
import type { ModuleVariantKey } from "../../types/configurator.ts";

// Catalogo tecnico derivato dalla legenda allegata: collega prodotti, varianti e distinta base.
export type ModuleBomComponent = {
  code: string;
  depthMm?: number | string | null;
  heightMm?: number | string | null;
  name: string;
  optional?: boolean;
  quantity: number | null;
  thicknessMm?: number | string | null;
  widthMm?: number | string | null;
};

type ModuleTechnicalDefinition = {
  bomByVariant: Partial<Record<ModuleVariantKey, ModuleBomComponent[]>>;
  configurableVariants: ModuleVariantKey[];
};

const ALL_SIDE_VARIANTS: ModuleVariantKey[] = MODULE_VARIANT_OPTIONS.map(
  (variant) => variant.key
);

const BASE_COMPONENTS = {
  rfVertical: {
    code: "RFV",
    heightMm: 54,
    name: "Regolo fisso verticale con attacco",
    quantity: 1,
    thicknessMm: 13,
    widthMm: 660,
  },
  removableVerticalPair: {
    code: "RRV",
    heightMm: 54,
    name: "Regoli removibili verticali con attacco",
    quantity: 2,
    thicknessMm: 13,
    widthMm: 660,
  },
  rfoPair: {
    code: "RFO",
    heightMm: 54,
    name: "Regoli fissi orizzontali con attacco",
    quantity: 2,
    thicknessMm: 13,
    widthMm: 660,
  },
  sinkBack: {
    code: "SCHSOTTOLAV",
    heightMm: 150,
    name: "Schienale sottolavello-sottolavatoio alt. 150 mm",
    quantity: 1,
    thicknessMm: 20,
    widthMm: 660,
  },
  sinkBottom: {
    code: "SOTSOTTOLAV",
    depthMm: 625,
    name: "Sotto per basi sottolavello-sottolavatoio",
    quantity: 1,
    thicknessMm: 20,
    widthMm: 660,
  },
  baseBack: {
    code: "SCHB",
    heightMm: 776,
    name: "Schienale base",
    quantity: 1,
    thicknessMm: 20,
    widthMm: 660,
  },
  baseBottom: {
    code: "SOTTOBC",
    depthMm: 640,
    name: "Sotto per base e colonna",
    quantity: 1,
    thicknessMm: 20,
    widthMm: 660,
  },
  baseShelf: {
    code: "RIP INTERNI",
    depthMm: 610,
    name: "Ripiani interni",
    quantity: null,
    thicknessMm: 20,
    widthMm: 658,
  },
  columnBottom: {
    code: "SOTTOBC",
    depthMm: 640,
    name: "Sotto per base e colonna",
    quantity: 1,
    thicknessMm: 20,
    widthMm: 660,
  },
  columnCap: {
    code: "CAPPC",
    depthMm: 640,
    name: "Cappello colonna",
    quantity: 1,
    thicknessMm: 20,
    widthMm: 660,
  },
  columnShelf: {
    code: "RIP INTERNI",
    depthMm: 610,
    name: "Ripiani interni",
    quantity: null,
    thicknessMm: 20,
    widthMm: 658,
  },
  wallUnitBottom: {
    code: "SOTTOPVO",
    depthMm: 350,
    name: "Sotto per pensile verticale e orizzontale",
    quantity: 1,
    thicknessMm: 20,
    widthMm: 660,
  },
  wallUnitShelf: {
    code: "RIP INTERNI",
    depthMm: 320,
    name: "Ripiani interni",
    quantity: null,
    thicknessMm: 20,
    widthMm: 658,
  },
} satisfies Record<string, ModuleBomComponent>;

const TECHNICAL_CATALOG: Record<string, ModuleTechnicalDefinition> = {
  "CONT-IMP": {
    configurableVariants: ["two_visible_sides", "one_visible_one_internal"],
    bomByVariant: {
      two_visible_sides: [
        side("FAVCI", "Fianco a vista per contenitori impianti", 2, 876, 665),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.removableVerticalPair,
        topAgg(),
      ],
      one_visible_one_internal: [
        side("FAVCI", "Fianco a vista per contenitori impianti", 1, 876, 665),
        side("FICI", "Fianco interno per contenitori impianti", 1, 796, 665),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.removableVerticalPair,
        topAgg(),
      ],
    },
  },
  "BASE-LAV-ASCIUG": {
    configurableVariants: ALL_SIDE_VARIANTS,
    bomByVariant: {
      two_visible_sides: [
        side(
          "FAVBLAV/ASCIUG",
          "Fianco a vista per base lavatrice-asciugatrice",
          2,
          876,
          665
        ),
        BASE_COMPONENTS.rfoPair,
        BASE_COMPONENTS.removableVerticalPair,
      ],
      one_visible_one_internal: [
        side(
          "FAVBLAV/ASCIUG",
          "Fianco a vista per base lavatrice-asciugatrice",
          1,
          876,
          665
        ),
        side(
          "FIBLAV/ASCIUG",
          "Fianco interno per base lavatrice-asciugatrice",
          1,
          796,
          665
        ),
        BASE_COMPONENTS.rfoPair,
        BASE_COMPONENTS.removableVerticalPair,
      ],
      two_internal_sides: [
        side(
          "FIBLAV/ASCIUG",
          "Fianco interno per base lavatrice-asciugatrice",
          2,
          796,
          665
        ),
        BASE_COMPONENTS.rfoPair,
        BASE_COMPONENTS.removableVerticalPair,
      ],
    },
  },
  "PORT-FIL": {
    configurableVariants: [],
    bomByVariant: {
      [DEFAULT_MODULE_VARIANT]: [
        side(
          "PORTLAV/ASCIUG",
          "Montante SX FIL con piedini registrabili e stabilizzatore",
          1,
          876,
          64,
          18
        ),
        side(
          "PORTLAV/ASCIUG",
          "Montante DX FIL con piedini registrabili e stabilizzatore",
          1,
          876,
          64,
          18
        ),
        {
          code: "PORTLAV/ASCIUG",
          depthMm: 64,
          name: "Traverso FIL con piedini registrabili e stabilizzatore",
          quantity: 1,
          thicknessMm: 18,
          widthMm: 700,
        },
        {
          code: "RRVPORT",
          heightMm: 54,
          name: "Regolo removibile verticale con attacco per portale",
          quantity: 1,
          thicknessMm: 13,
          widthMm: 664,
        },
        {
          code: "RRVPORT",
          heightMm: 54,
          name: "Regolo removibile verticale per portale largo tra due basi",
          quantity: 1,
          thicknessMm: 13,
          widthMm: 700,
        },
      ],
    },
  },
  "BASE-SOTTOLAV": {
    configurableVariants: ALL_SIDE_VARIANTS,
    bomByVariant: {
      two_visible_sides: [
        side("FAVBSOTTOLAV", "Fianco a vista per base sottolavello", 2, 876, 665),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.sinkBack,
        BASE_COMPONENTS.sinkBottom,
      ],
      one_visible_one_internal: [
        side("FAVBSOTTOLAV", "Fianco a vista per base sottolavello", 1, 876, 665),
        side("FIBSOTTOLAV", "Fianco interno per base sottolavello", 1, 796, 665),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.sinkBack,
        BASE_COMPONENTS.sinkBottom,
      ],
      two_internal_sides: [
        side("FIBSOTTOLAV", "Fianco interno per base sottolavello", 2, 796, 665),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.sinkBack,
        BASE_COMPONENTS.sinkBottom,
      ],
    },
  },
  "BASE-SOTTOLAVATOIO": {
    configurableVariants: ALL_SIDE_VARIANTS,
    bomByVariant: {
      two_visible_sides: [
        side(
          "FAVBSOTTOLAVATOIO",
          "Fianco a vista per base sottolavatoio",
          2,
          876,
          665
        ),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.sinkBack,
        BASE_COMPONENTS.sinkBottom,
        lavatoioReinforcement(),
      ],
      one_visible_one_internal: [
        side(
          "FAVBSOTTOLAVATOIO",
          "Fianco a vista per base sottolavatoio",
          1,
          876,
          665
        ),
        side(
          "FIBSOTTOLAVATOIO",
          "Fianco interno per base sottolavatoio",
          1,
          796,
          665
        ),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.sinkBack,
        BASE_COMPONENTS.sinkBottom,
        lavatoioReinforcement(),
      ],
      two_internal_sides: [
        side(
          "FIBSOTTOLAVATOIO",
          "Fianco interno per base sottolavatoio",
          2,
          796,
          665
        ),
        { ...BASE_COMPONENTS.rfVertical, quantity: 2 },
        BASE_COMPONENTS.sinkBack,
        BASE_COMPONENTS.sinkBottom,
        lavatoioReinforcement(),
      ],
    },
  },
  BASE: {
    configurableVariants: ALL_SIDE_VARIANTS,
    bomByVariant: {
      two_visible_sides: [
        side("FAVB", "Fianco a vista per base", 2, 876, 665),
        BASE_COMPONENTS.rfVertical,
        BASE_COMPONENTS.baseBack,
        BASE_COMPONENTS.baseBottom,
        BASE_COMPONENTS.baseShelf,
      ],
      one_visible_one_internal: [
        side("FAVB", "Fianco a vista per base", 1, 876, 665),
        side("FIB", "Fianco interno per base", 1, 796, 665),
        BASE_COMPONENTS.rfVertical,
        BASE_COMPONENTS.baseBack,
        BASE_COMPONENTS.baseBottom,
        BASE_COMPONENTS.baseShelf,
      ],
      two_internal_sides: [
        side("FIB", "Fianco interno per base", 2, 796, 665),
        BASE_COMPONENTS.rfVertical,
        BASE_COMPONENTS.baseBack,
        BASE_COMPONENTS.baseBottom,
        BASE_COMPONENTS.baseShelf,
      ],
    },
  },
  COLONNA: {
    configurableVariants: ALL_SIDE_VARIANTS,
    bomByVariant: {
      two_visible_sides: [
        side("FAVC", "Fianco a vista per colonna", 2, 2278, 665),
        side("SCHC", "Schienale colonna", 1, 2238, 665),
        BASE_COMPONENTS.columnBottom,
        BASE_COMPONENTS.columnCap,
        BASE_COMPONENTS.columnShelf,
      ],
      one_visible_one_internal: [
        side("FAVC", "Fianco a vista per colonna", 1, 2278, 665),
        side("FIC", "Fianco interno per colonna", 1, 2238, 665),
        side("SCHC", "Schienale colonna", 1, 2238, 665),
        BASE_COMPONENTS.columnBottom,
        BASE_COMPONENTS.columnCap,
        BASE_COMPONENTS.columnShelf,
      ],
      two_internal_sides: [
        side("FIC", "Fianco interno per colonna", 2, 2238, 665),
        side("SCHC", "Schienale colonna", 1, 2238, 665),
        BASE_COMPONENTS.columnBottom,
        BASE_COMPONENTS.columnCap,
        BASE_COMPONENTS.columnShelf,
      ],
    },
  },
  "PENSILE-VERTICALE": {
    configurableVariants: ALL_SIDE_VARIANTS,
    bomByVariant: {
      two_visible_sides: [
        side("FAVPV", "Fianco a vista per pensile verticale", 2, 878, 350),
        panel("SCHPV", "Schienale pensile verticale", 1, 660, 838),
        BASE_COMPONENTS.wallUnitBottom,
        panel("CAPPPV", "Cappello per pensile verticale", 1, 660, null, 350),
        BASE_COMPONENTS.wallUnitShelf,
      ],
      one_visible_one_internal: [
        side("FAVPV", "Fianco a vista per pensile verticale", 1, 878, 350),
        side("FIPV", "Fianco interno per pensile verticale", 1, 878, 350),
        panel("SCHPV", "Schienale pensile verticale", 1, 660, 838),
        BASE_COMPONENTS.wallUnitBottom,
        panel("CAPPPV", "Cappello per pensile verticale", 1, 660, null, 350),
        BASE_COMPONENTS.wallUnitShelf,
      ],
      two_internal_sides: [
        side("FIPV", "Fianco interno per pensile verticale", 2, 878, 350),
        panel("SCHPV", "Schienale pensile verticale", 1, 660, 838),
        BASE_COMPONENTS.wallUnitBottom,
        panel("CAPPPV", "Cappello per pensile verticale", 1, 660, null, 350),
        BASE_COMPONENTS.wallUnitShelf,
      ],
    },
  },
  "PENSILE-ORIZZONTALE": {
    configurableVariants: ALL_SIDE_VARIANTS,
    bomByVariant: {
      two_visible_sides: [
        side("FAVPO", "Fianco a vista per pensile orizzontale", 2, 439, 350),
        panel("SCHPVO", "Schienale pensile verticale-orizzontale", 1, 660, 399),
        BASE_COMPONENTS.wallUnitBottom,
        panel("CAPPPO", "Cappello per pensile orizzontale", 1, 660, null, 350),
        BASE_COMPONENTS.wallUnitShelf,
      ],
      one_visible_one_internal: [
        side("FAVPO", "Fianco a vista per pensile orizzontale", 1, 439, 350),
        side("FIP0", "Fianco interno per pensile orizzontale", 1, 439, 350),
        panel("SCHPVO", "Schienale pensile verticale-orizzontale", 1, 660, 399),
        BASE_COMPONENTS.wallUnitBottom,
        panel("CAPPPO", "Cappello per pensile orizzontale", 1, 660, null, 350),
        BASE_COMPONENTS.wallUnitShelf,
      ],
      two_internal_sides: [
        side("FIP0", "Fianco interno per pensile orizzontale", 2, 439, 350),
        panel("SCHPVO", "Schienale pensile verticale-orizzontale", 1, 660, 399),
        BASE_COMPONENTS.wallUnitBottom,
        panel("CAPPPO", "Cappello per pensile orizzontale", 1, 660, null, 350),
        BASE_COMPONENTS.wallUnitShelf,
      ],
    },
  },
};

// Normalizza il codice prodotto per rendere robuste le ricerche nel catalogo tecnico.
export function normalizeProductCode(code?: string | null) {
  return (code || "").trim().toUpperCase();
}

// Restituisce le varianti fianchi disponibili per un prodotto configurabile.
export function getAvailableModuleVariants(code?: string | null) {
  const definition = TECHNICAL_CATALOG[normalizeProductCode(code)];

  return definition?.configurableVariants || ALL_SIDE_VARIANTS;
}

// Distingue elementi speciali, come il portale FIL, dai moduli con varianti fianchi.
export function hasConfigurableModuleVariants(code?: string | null) {
  return getAvailableModuleVariants(code).length > 0;
}

// Evita che nello store rimangano varianti non previste dal prodotto selezionato.
export function getSafeModuleVariant(
  code: string | null | undefined,
  variantKey: ModuleVariantKey
) {
  const variants = getAvailableModuleVariants(code);

  if (variants.length === 0) return DEFAULT_MODULE_VARIANT;

  return variants.includes(variantKey) ? variantKey : variants[0];
}

// Recupera la distinta base esplosa per codice prodotto e variante selezionata.
export function getModuleBillOfMaterials(
  code: string | null | undefined,
  variantKey: ModuleVariantKey
) {
  const definition = TECHNICAL_CATALOG[normalizeProductCode(code)];

  if (!definition) return [];

  const safeVariant = getSafeModuleVariant(code, variantKey);

  return definition.bomByVariant[safeVariant] || [];
}

function side(
  code: string,
  name: string,
  quantity: number,
  heightMm: number | string,
  depthMm: number | string,
  thicknessMm: number | string = 20
): ModuleBomComponent {
  return {
    code,
    depthMm,
    heightMm,
    name,
    quantity,
    thicknessMm,
  };
}

function panel(
  code: string,
  name: string,
  quantity: number | null,
  widthMm: number | string | null,
  heightMm: number | string | null,
  depthMm: number | string | null = null,
  thicknessMm: number | string = 20
): ModuleBomComponent {
  return {
    code,
    depthMm,
    heightMm,
    name,
    quantity,
    thicknessMm,
    widthMm,
  };
}

function topAgg(): ModuleBomComponent {
  return {
    code: "TOPAGG",
    depthMm: "665+20+15",
    name: "Top copertura in alto con aggetto laterale 15 mm",
    optional: true,
    quantity: 1,
    thicknessMm: 20,
    widthMm: "700+15+15",
  };
}

function lavatoioReinforcement(): ModuleBomComponent {
  return {
    code: "RFRINFLAVATOIO",
    heightMm: 64,
    name: "Regoli fissi rinforzo modulo con registri a ragno",
    quantity: 2,
    thicknessMm: 28,
    widthMm: 660,
  };
}
