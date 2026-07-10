import type { ModuleTechnicalDefinition } from "./module-technical-catalog.ts";

// Catalogo tecnico generato dalla legenda Excel del committente.
export const GENERATED_TECHNICAL_CATALOG: Record<string, ModuleTechnicalDefinition> = {
  "BASE_LAVATRICE_ASCIUGATRICE_CON_1_FIANCHI_A_VISTA_1_FIANCO_INTERNO": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "FAVBLAV_ASCIUG",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 57
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "FIBLAV_ASCIUG",
          "heightMm": 800,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 58
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO ORIZZONTALE CON ATTACCO POSTERIORE E ANTERIORE",
          "code": "RFO",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 59
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO",
          "code": "RRVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 60
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 61
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I56",
    "excelSystemName": "BASE LAVATRICE-ASCIUGATRICE CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "BASE_LAVATRICE_ASCIUGATRICE_CON_2_FIANCHI_INTERNI": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "FIBLAV_ASCIUG",
          "heightMm": 800,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 64
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO ORIZZONTALE CON ATTACCO POSTERIORE E ANTERIORE",
          "code": "RFO",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 65
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO",
          "code": "RRVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 66
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 67
        },
        {
          "quantity": 1,
          "name": "MONTANTE SX FIL CON PIEDINI REGISTRABILI E STABILIZZATORE PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "PORT_MSX_LAV_ASCIUG",
          "heightMm": 880,
          "depthMm": 64,
          "thicknessMm": 18,
          "optional": false,
          "excelRow": 70
        },
        {
          "quantity": 1,
          "name": "MONTANTE DX FIL CON PIEDINI REGISTRABILI E STABILIZZATORE PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "PORT_MDX_LAV_ASCIUG",
          "heightMm": 880,
          "depthMm": 64,
          "thicknessMm": 18,
          "optional": false,
          "excelRow": 71
        },
        {
          "quantity": 1,
          "name": "TRAVERSO PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "PORT_TRAV_LAV_ASCIUG",
          "widthMm": 700,
          "depthMm": 64,
          "thicknessMm": 18,
          "optional": false,
          "excelRow": 72
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 664,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 73
        },
        {
          "quantity": 2,
          "name": "REGOLI REMOVIBILI VERTICALI CON ATTACCO PER FISSAGGIO FIANCO IN ACCOSTO, PIU' LARGO, DA POSIZIONARE TRA LE DUE BASI",
          "code": "RRVPORT",
          "widthMm": 700,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 74
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I63",
    "excelSystemName": "BASE LAVATRICE-ASCIUGATRICE CON 2 FIANCHI INTERNI"
  },
  "BASE_CON_1_FIANCO_INTERNO_1_FIANCO_VISTA": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "FAVBLAV/ASCIUG",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 160
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER BASE",
          "code": "FIB",
          "heightMm": 800,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 161
        },
        {
          "quantity": 1,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 162
        },
        {
          "quantity": 1,
          "name": "SCHIENALE BASE",
          "code": "SCHB",
          "widthMm": 661,
          "heightMm": 780.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 163
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 164
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 165
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I159",
    "excelSystemName": "BASE CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "BASE_CON_1_FIANCHIA_VISTA_1_FIANCO_INTERNO": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER BASE",
          "code": "FAVB",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 153
        },
        {
          "quantity": 1,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 154
        },
        {
          "quantity": 1,
          "name": "SCHIENALE BASE",
          "code": "SCHB",
          "widthMm": 661,
          "heightMm": 780.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 155
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 156
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 157
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I152",
    "excelSystemName": "BASE CON 2 FIANCHI A VISTA"
  },
  "BASE_CON_2_FIANCHI_INTERNI": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER BASE",
          "code": "FIB",
          "heightMm": 800,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 169
        },
        {
          "quantity": 1,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 170
        },
        {
          "quantity": 1,
          "name": "SCHIENALE BASE",
          "code": "SCHB",
          "widthMm": 661,
          "heightMm": 780.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 171
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 172
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 173
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I168",
    "excelSystemName": "BASE CON 2 FIANCHI INTERNI"
  },
  "BASE_CON_2_FIANCHIA_VISTA": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER BASE",
          "code": "FAVB",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 153
        },
        {
          "quantity": 1,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 154
        },
        {
          "quantity": 1,
          "name": "SCHIENALE BASE",
          "code": "SCHB",
          "widthMm": 661,
          "heightMm": 780.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 155
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 156
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 157
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I152",
    "excelSystemName": "BASE CON 2 FIANCHI A VISTA"
  },
  "BASE_LAVATRICE_ASCIUGATRICE_FIANCHI_PORTANTI_2": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "FAVBLAV_ASCIUG",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 50
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO ORIZZONTALE CON ATTACCO POSTERIORE E ANTERIORE",
          "code": "RFO",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 51
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO",
          "code": "RRVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 52
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 53
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I49",
    "excelSystemName": "BASE LAVATRICE-ASCIUGATRICE CON 2 FIANCHI A VISTA"
  },
  "BASE_LAVATRICE_ASCIUGATRICE_1_FIANCO_INTERNO_FIANCO_A_VISTA_2": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "FAVBLAV_ASCIUG",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 50
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO ORIZZONTALE CON ATTACCO POSTERIORE E ANTERIORE",
          "code": "RFO",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 51
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO",
          "code": "RRVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 52
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 53
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I49",
    "excelSystemName": "BASE LAVATRICE-ASCIUGATRICE CON 2 FIANCHI A VISTA"
  },
  "BASE_SOTTOLAVATOIO_CON_1_FIANCHIA_VISTA_1_INTERNO": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER SOTTOLAVATOIO",
          "code": "FAVSOTTOLAVATOIO",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 120
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO ANTERIORE E POSTERIORE",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 121
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 122
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVATOIO",
          "code": "SOTSOTTOTOIO",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 123
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSI RINFORZO MODULO VERTICALI CON REGISTRI A RAGNO PER LIVELLARE LAVATOIO",
          "code": "RFRINFLAVATOIO",
          "widthMm": 661,
          "heightMm": 64,
          "thicknessMm": 28,
          "optional": false,
          "excelRow": 124
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I119",
    "excelSystemName": "BASE SOTTOLAVATOIO CON 2 FIANCHI A VISTA"
  },
  "BASE_SOTTOLAVATOIO_CON_1_FIANCO_INTERNO_A_VISTA": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER SOTTOLAVATOIO",
          "code": "FAVSOTTOLAVATOIO",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 120
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO ANTERIORE E POSTERIORE",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 121
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 122
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVATOIO",
          "code": "SOTSOTTOTOIO",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 123
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSI RINFORZO MODULO VERTICALI CON REGISTRI A RAGNO PER LIVELLARE LAVATOIO",
          "code": "RFRINFLAVATOIO",
          "widthMm": 661,
          "heightMm": 64,
          "thicknessMm": 28,
          "optional": false,
          "excelRow": 124
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I119",
    "excelSystemName": "BASE SOTTOLAVATOIO CON 2 FIANCHI A VISTA"
  },
  "BASE_SOTTOLAVATOIO_CON_2_FIANCHI_A_VISTA": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER SOTTOLAVATOIO",
          "code": "FAVSOTTOLAVATOIO",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 120
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO ANTERIORE E POSTERIORE",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 121
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 122
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVATOIO",
          "code": "SOTSOTTOTOIO",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 123
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSI RINFORZO MODULO VERTICALI CON REGISTRI A RAGNO PER LIVELLARE LAVATOIO",
          "code": "RFRINFLAVATOIO",
          "widthMm": 661,
          "heightMm": 64,
          "thicknessMm": 28,
          "optional": false,
          "excelRow": 124
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I119",
    "excelSystemName": "BASE SOTTOLAVATOIO CON 2 FIANCHI A VISTA"
  },
  "BASE_SOTTOLAVATOIO_CON_2_FIANCHI_INTERNI": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER SOTTOLAVATOIO",
          "code": "FISOTTOLAVATOIO",
          "heightMm": 800,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 138
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO ANTERIORE E POSTERIORE",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 139
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 140
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVATOIO",
          "code": "SOTSOTTOTOIO",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 141
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSI RINFORZO MODULO VERTICALI CON REGISTRI A RAGNO PER LIVELLARE LAVATOIO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 64,
          "thicknessMm": 28,
          "optional": false,
          "excelRow": 142
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I137",
    "excelSystemName": "BASE SOTTOLAVATOIO CON 2 FIANCHI I NTERNI"
  },
  "BASE_SOTTOLAVELLO_CON_1_FIANCO_INTERNO_1_FIANCO_VISTA": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA SOTTOLAVELLO",
          "code": "FAVSOTTOLAV",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 96
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO SOTTOLAVELLO",
          "code": "FISOTTOLAV",
          "heightMm": 800,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 97
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 98
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 99
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVELLO",
          "code": "SOTSOTTOLAV",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 100
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I95",
    "excelSystemName": "BASE SOTTOLAVELLO CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "BASE_SOTTOLAVELLO_CON_1_FIANCOA_VISTA_1_FIANCO_INTERNO": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA SOTTOLAVELLO",
          "code": "FAVSOTTOLAV",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 89
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO ANTERIORE E POSTERIORE",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 90
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 91
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVELLO",
          "code": "SOTSOTTOLAV",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 92
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I88",
    "excelSystemName": "BASE SOTTOLAVELLO CON 2 FIANCHI A VISTA"
  },
  "BASE_SOTTOLAVELLO_CON_2_FIANCHI_INTERNI": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO SOTTOLAVELLO",
          "code": "FISOTTOLAV",
          "heightMm": 800,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 105
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 106
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 107
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVELLO",
          "code": "SOTSOTTOLAV",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 108
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I103",
    "excelSystemName": "BASE SOTTOLAVELLO CON 2 FIANCHI INTERNI"
  },
  "BASE_SOTTOLAVELLO_CON_2_FIANCHIA_VISTA": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA SOTTOLAVELLO",
          "code": "FAVSOTTOLAV",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 89
        },
        {
          "quantity": 2,
          "name": "REGOLO FISSO VERTICALI CON ATTACCO ANTERIORE E POSTERIORE",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 90
        },
        {
          "quantity": 1,
          "name": "SCHIENALE SOTTOLAVELLO- SOTTOLAVATOIO ALT. 150 MM",
          "code": "SCHSOTTOLAV",
          "widthMm": 661,
          "heightMm": 150,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 91
        },
        {
          "quantity": 1,
          "name": "SOTTO-SOTTOLAVELLO",
          "code": "SOTSOTTOLAV",
          "widthMm": 661,
          "depthMm": 625,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 92
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I88",
    "excelSystemName": "BASE SOTTOLAVELLO CON 2 FIANCHI A VISTA"
  },
  "CONTENITORE_IMPIANTI_CON_1_FIANCHI_A_VISTA_1_FIANCO_INTERNO": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER CONTENITORI IMPIANTI",
          "code": "FAVCI",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 26
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER CONTENITORI IMPIANTI",
          "code": "FICI",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 27
        },
        {
          "quantity": 2,
          "name": "REGOLI FISSI VERTICALI CON ATTACCO POSTERIORE E ANTERIORE ALTO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 28
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 29
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO",
          "code": "RRVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 30
        },
        {
          "quantity": 1,
          "name": "REGOLO FISSO ORIZZONTALE POSTERIORE CON ATTACCO",
          "code": "RFVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 31
        },
        {
          "quantity": 1,
          "name": "TOP COPERTURA IN ALTO CON AGGETTO LATER. 15 MM",
          "code": "",
          "widthMm": "700+15+15",
          "depthMm": "665+19,5+15",
          "thicknessMm": 19.5,
          "optional": true,
          "excelRow": 33
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I25",
    "excelSystemName": "CONTENITORE IMPIANTI CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "CONTENITORE_IMPIANTI_CON_1_FIANCO_INTERNO_1_FIANCHI_A_VISTA": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER CONTENITORI IMPIANTI",
          "code": "FAVCI",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 26
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER CONTENITORI IMPIANTI",
          "code": "FICI",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 27
        },
        {
          "quantity": 2,
          "name": "REGOLI FISSI VERTICALI CON ATTACCO POSTERIORE E ANTERIORE ALTO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 28
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 29
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO",
          "code": "RRVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 30
        },
        {
          "quantity": 1,
          "name": "REGOLO FISSO ORIZZONTALE POSTERIORE CON ATTACCO",
          "code": "RFVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 31
        },
        {
          "quantity": 1,
          "name": "TOP COPERTURA IN ALTO CON AGGETTO LATER. 15 MM",
          "code": "",
          "widthMm": "700+15+15",
          "depthMm": "665+19,5+15",
          "thicknessMm": 19.5,
          "optional": true,
          "excelRow": 33
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I25",
    "excelSystemName": "CONTENITORE IMPIANTI CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "CONTENITORE_IMPIANTI_CON_2_FIANCHI_A_VISTA": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCHI A VISTA PER CONTENITORI IMPIANTI",
          "code": "FAVCI",
          "heightMm": 880,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 18
        },
        {
          "quantity": 2,
          "name": "REGOLI FISSI VERTICALI CON ATTACCO POSTERIORE E ANTERIORE ALTO",
          "code": "RFV",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 19
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 20
        },
        {
          "quantity": 1,
          "name": "REGOLO REMOVIBILE VERTICALE POSTERIORE CON ATTACCO",
          "code": "RRVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 21
        },
        {
          "quantity": 1,
          "name": "REGOLO FISSO ORIZZONTALE POSTERIORE CON ATTACCO",
          "code": "RFVP",
          "widthMm": 661,
          "heightMm": 54,
          "thicknessMm": 13,
          "optional": false,
          "excelRow": 22
        },
        {
          "quantity": 1,
          "name": "TOP COPERTURA IN ALTO CON AGGETTO LATER. 15 MM",
          "code": "",
          "widthMm": "700+15+15",
          "depthMm": "665+19,5+15",
          "thicknessMm": 19.5,
          "optional": true,
          "excelRow": 24
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I17",
    "excelSystemName": "CONTENITORE IMPIANTI CON 2 FIANCHI A VISTA"
  },
  "COLONNA_MISTA_IMPIANTO_ALTO_NON_A_VISTA": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER COLONNA",
          "code": "FIC",
          "heightMm": 2202,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 204
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 205
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 206
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 207
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 208
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I203",
    "excelSystemName": "COLONNA CON 2 FIANCHI INTERNI"
  },
  "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_DX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 195
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER COLONNA",
          "code": "FIC",
          "heightMm": 2202,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 196
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 197
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 198
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 199
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 200
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I194",
    "excelSystemName": "COLONNA CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_SX_E_DX": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 187
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 188
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 189
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 190
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 191
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I186",
    "excelSystemName": "COLONNA CON 2 FIANCHI A VISTA"
  },
  "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_SX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 195
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER COLONNA",
          "code": "FIC",
          "heightMm": 2202,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 196
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 197
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 198
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 199
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 200
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I194",
    "excelSystemName": "COLONNA CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "COLONNA_MISTA_IMPIANTO_BASSO_NON_A_VISTA": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER COLONNA",
          "code": "FIC",
          "heightMm": 2202,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 204
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 205
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 206
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 207
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 208
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I203",
    "excelSystemName": "COLONNA CON 2 FIANCHI INTERNI"
  },
  "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_DX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 195
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER COLONNA",
          "code": "FIC",
          "heightMm": 2202,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 196
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 197
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 198
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 199
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 200
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I194",
    "excelSystemName": "COLONNA CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX_E_DX": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 187
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 188
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 189
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 190
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 191
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I186",
    "excelSystemName": "COLONNA CON 2 FIANCHI A VISTA"
  },
  "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 195
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER COLONNA",
          "code": "FIC",
          "heightMm": 2202,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 196
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 197
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 198
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 199
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 200
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I194",
    "excelSystemName": "COLONNA CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "COLONNA_CON_1_FIANCO_INTERNO_1_FIANCOA_VISTA": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 187
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 188
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 189
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 190
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 191
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I186",
    "excelSystemName": "COLONNA CON 2 FIANCHI A VISTA"
  },
  "COLONNA_CON_1_FIANCOA_VISTA_1_FIANCO_INTERNO": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 187
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 188
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 189
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 190
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 191
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I186",
    "excelSystemName": "COLONNA CON 2 FIANCHI A VISTA"
  },
  "COLONNA_CON_2_FIANCHI_INTERNI": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER COLONNA",
          "code": "FIC",
          "heightMm": 2202,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 204
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 205
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 206
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 207
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 208
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I203",
    "excelSystemName": "COLONNA CON 2 FIANCHI INTERNI"
  },
  "COLONNA_CON_2_FIANCHIA_VISTA": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER COLONNA",
          "code": "FAVC",
          "heightMm": 2282,
          "depthMm": 665,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 187
        },
        {
          "quantity": 1,
          "name": "SCHIENALE COLONNA",
          "code": "SCHC",
          "widthMm": 661,
          "heightMm": 2163,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 188
        },
        {
          "quantity": 1,
          "name": "SOTTO PER BASE E COLONNA",
          "code": "SOTTOBC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 189
        },
        {
          "quantity": 1,
          "name": "CAPPELLOCOLONNA",
          "code": "CAPPC",
          "widthMm": 661,
          "depthMm": 640,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 190
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 610.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 191
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I186",
    "excelSystemName": "COLONNA CON 2 FIANCHI A VISTA"
  },
  "PENSILE_ORIZZONTALE_NON_A_VISTA": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER PENSILE ORIZZONTALE",
          "code": "FIP0",
          "heightMm": 439,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 344
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE-ORIZZONTALE",
          "code": "SCHPVO",
          "widthMm": 661,
          "heightMm": 400,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 345
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 346
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE ORIZZONTALE",
          "code": "CAPPPO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 347
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 348
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I343",
    "excelSystemName": "PENSILE ORIZZONTALE CON 2 FIANCHI INTERNI"
  },
  "PENSILE_ORIZZONTALE_A_VISTA_DX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER PENSILE ORIZZONTALE",
          "code": "FIP0",
          "heightMm": 439,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 336
        },
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER PENSILE ORIZZONTALE",
          "code": "FAVPO",
          "heightMm": 439,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 337
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE-ORIZZONTALE",
          "code": "SCHPVO",
          "widthMm": 661,
          "heightMm": 400,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 338
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 339
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE ORIZZONTALE",
          "code": "CAPPPO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 340
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 341
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I335",
    "excelSystemName": "PENSILE ORIZZONTALE CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "PENSILE_ORIZZONTALE_A_VISTA_SX_E_DX": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER PENSILE ORIZZONTALE",
          "code": "FAVPO",
          "heightMm": 439,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 329
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE-ORIZZONTALE",
          "code": "SCHPVO",
          "widthMm": 661,
          "heightMm": 400,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 330
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 331
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE ORIZZONTALE",
          "code": "CAPPPO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 332
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 333
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I328",
    "excelSystemName": "PENSILE ORIZZONTALE CON 2 FIANCHI A VISTA"
  },
  "PENSILE_ORIZZONTALE_A_VISTA_SX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER PENSILE ORIZZONTALE",
          "code": "FIP0",
          "heightMm": 439,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 336
        },
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER PENSILE ORIZZONTALE",
          "code": "FAVPO",
          "heightMm": 439,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 337
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE-ORIZZONTALE",
          "code": "SCHPVO",
          "widthMm": 661,
          "heightMm": 400,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 338
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 339
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE ORIZZONTALE",
          "code": "CAPPPO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 340
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 341
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I335",
    "excelSystemName": "PENSILE ORIZZONTALE CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "PENSILE_VERTICALE_NON_A_VISTA": {
    "configurableVariants": [
      "two_internal_sides"
    ],
    "bomByVariant": {
      "two_internal_sides": [
        {
          "quantity": 2,
          "name": "FIANCO INTERNO PER PENSILE VERTICALE",
          "code": "FIPV",
          "heightMm": 878,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 312
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE",
          "code": "SCHPV",
          "widthMm": 661,
          "heightMm": 839,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 313
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 314
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE VERTICALE",
          "code": "CAPPPV",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 315
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 316
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I311",
    "excelSystemName": "PENSILE VERTICALE CON 2 FIANCHI INTERNI"
  },
  "PENSILE_VERTICALE_A_VISTA_DX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER PENSILE VERTICALE",
          "code": "FAVPV",
          "heightMm": 878,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 303
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER PENSILE VERTICALE",
          "code": "FIPV",
          "heightMm": 878,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 304
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE",
          "code": "SCHPV",
          "widthMm": 661,
          "heightMm": 839,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 305
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 306
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE VERTICALE",
          "code": "CAPPPV",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 307
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 308
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I302",
    "excelSystemName": "PENSILE VERTICALE CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "PENSILE_VERTICALE_A_VISTA_SX_E_DX": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 2,
          "name": "FIANCO A VISTA PER PENSILE VERTICALE",
          "code": "FAVPV",
          "heightMm": 878,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 296
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE",
          "code": "SCHPVO",
          "widthMm": 661,
          "heightMm": 839,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 297
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 298
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE VERTICALE",
          "code": "CAPPPV",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 299
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 300
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I295",
    "excelSystemName": "PENSILE VERTICALE CON 2 FIANCHI A VISTA"
  },
  "PENSILE_VERTICALE_A_VISTA_SX": {
    "configurableVariants": [
      "one_visible_one_internal"
    ],
    "bomByVariant": {
      "one_visible_one_internal": [
        {
          "quantity": 1,
          "name": "FIANCO A VISTA PER PENSILE VERTICALE",
          "code": "FAVPV",
          "heightMm": 878,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 303
        },
        {
          "quantity": 1,
          "name": "FIANCO INTERNO PER PENSILE VERTICALE",
          "code": "FIPV",
          "heightMm": 878,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 304
        },
        {
          "quantity": 1,
          "name": "SCHIENALE PENSILE VERTICALE",
          "code": "SCHPV",
          "widthMm": 661,
          "heightMm": 839,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 305
        },
        {
          "quantity": 1,
          "name": "SOTTO PER PENSILE VERTICALE E ORIZZONTALE",
          "code": "SOTTOPVO",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 306
        },
        {
          "quantity": 1,
          "name": "CAPPELLO PER PENSILE VERTICALE",
          "code": "CAPPPV",
          "widthMm": 661,
          "depthMm": 350,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 307
        },
        {
          "name": "RIPIANI INTERNI",
          "code": "RIPINT",
          "widthMm": 660.5,
          "depthMm": 320.5,
          "thicknessMm": 19.5,
          "optional": false,
          "excelRow": 308
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I302",
    "excelSystemName": "PENSILE VERTICALE CON 1 FIANCHI A VISTA/ 1 FIANCO INTERNO"
  },
  "PORTALE_BASI_LAVATRICE_ASCIUGATRICE": {
    "configurableVariants": [
      "two_visible_sides"
    ],
    "bomByVariant": {
      "two_visible_sides": [
        {
          "quantity": 1,
          "name": "MONTANTE SX FIL CON PIEDINI REGISTRABILI E STABILIZZATORE PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "PORT_MSX_LAV_ASCIUG",
          "heightMm": 880,
          "depthMm": 64,
          "thicknessMm": 18,
          "excelRow": 70
        },
        {
          "quantity": 1,
          "name": "MONTANTE DX FIL CON PIEDINI REGISTRABILI E STABILIZZATORE PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "PORT_MDX_LAV_ASCIUG",
          "heightMm": 880,
          "depthMm": 64,
          "thicknessMm": 18,
          "excelRow": 71
        },
        {
          "quantity": 1,
          "name": "TRAVERSO FIL PER BASE LAVATRICE _ASCIUGATRICE",
          "code": "PORT_TRAV_LAV_ASCIUG",
          "widthMm": 700,
          "depthMm": 64,
          "thicknessMm": 18,
          "excelRow": 72
        },
        {
          "quantity": 1,
          "name": "N. 1 REGOLO REMOVIBILE ANTERIORE VERTICALE CON ATTACCO ROTANTE",
          "code": "RRAVR",
          "widthMm": 664,
          "heightMm": 54,
          "thicknessMm": 13,
          "excelRow": 73
        },
        {
          "quantity": 2,
          "name": "N. 2 REGOLI REMOVIBILI VERTICALI CON ATTACCO PER FISSAGGIO FIANCO IN ACCOSTO, PIU' LARGO, DA POSIZIONARE TRA LE DUE BASI",
          "code": "RRVPORT",
          "widthMm": 700,
          "heightMm": 54,
          "thicknessMm": 13,
          "excelRow": 74
        }
      ]
    },
    "excelSource": "LEGENDA_GENERALE!I70",
    "excelSystemName": "PORTALE BASI LAVATRICE-ASCIUGATRICE"
  }
};
