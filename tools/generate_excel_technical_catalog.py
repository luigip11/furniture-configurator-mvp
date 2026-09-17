#!/usr/bin/env python3
"""Genera le distinte tecniche dai configuratori Excel per singola variante."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "src" / "lib" / "configurator" / "generated-technical-catalog.ts"


@dataclass(frozen=True)
class WorkbookDefinition:
    """Collega un foglio Excel alla variante e ai codici prodotto equivalenti."""

    relative_path: str
    variant: str
    codes: tuple[str, ...]
    sheet_name: str | None = None
    configurable: bool = True


# Mantiene i codici storici e quelli normalizzati, cosi i prodotti gia pubblicati
# continuano a risolvere la distinta corretta dopo l'aggiornamento del catalogo.
DEFINITIONS = (
    WorkbookDefinition("_01_Contenitori_Impianti/1_Fianco_Interno_1_Fianco_Vista/configuratore_contenitore_impianti_1_fianco_interno_1_fianco_vista_5__NO_INDICE.xlsx", "one_visible_one_internal", ("CONTENITORE_IMPIANTI_CON_1_FIANCHI_A_VISTA_1_FIANCO_INTERNO", "CONTENITORE_IMPIANTI_CON_1_FIANCO_INTERNO_1_FIANCHI_A_VISTA")),
    WorkbookDefinition("_01_Contenitori_Impianti/2_Fianchi_Interni/configuratore_contenitore_impianti_2_fianchi_interni_5__NO_INDICE.xlsx", "two_internal_sides", ("CONTENITORE_IMPIANTI_CON_2_FIANCHI_INTERNI",)),
    WorkbookDefinition("_01_Contenitori_Impianti/2_Fianchi_Vista/configuratore_contenitore_impianti_2_fianchi_vista_5__NO_INDICE.xlsx", "two_visible_sides", ("CONTENITORE_IMPIANTI_CON_2_FIANCHI_A_VISTA",)),
    WorkbookDefinition("_02_Basi_Lavatrice_Asciugatrice/_1_Fianco_Vista_1_Fianco_Interno/configuratore_base_lavatrice_asciugatrice_1_fianco_vista_1_fianco_interno_5__NO_INDICE.xlsx", "one_visible_one_internal", ("BASE_LAVATRICE_ASCIUGATRICE_CON_1_FIANCHI_A_VISTA_1_FIANCO_INTERNO", "BASE_LAVATRICE_ASCIUGATRICE_1_FIANCO_INTERNO_FIANCO_A_VISTA_2")),
    WorkbookDefinition("_02_Basi_Lavatrice_Asciugatrice/2_Fianchi_Interni/configuratore_base_lavatrice_asciugatrice_2_fianchi_interni_4__NO_INDICE.xlsx", "two_internal_sides", ("BASE_LAVATRICE_ASCIUGATRICE_CON_2_FIANCHI_INTERNI",)),
    WorkbookDefinition("_02_Basi_Lavatrice_Asciugatrice/2_Fianchi_Vista/configuratore_base_lavatrice_asciugatrice_2_fianchi_vista_5__NO_INDICE.xlsx", "two_visible_sides", ("BASE_LAVATRICE_ASCIUGATRICE_CON_2_FIANCHI_A_VISTA", "BASE_LAVATRICE_ASCIUGATRICE_FIANCHI_PORTANTI_2")),
    WorkbookDefinition("_03_Portale_FIL/Standard/Portale_fil_basi_lavatrice_asciugatrice_3__NO_INDICE.xlsx", "two_visible_sides", ("PORTALE_BASI_LAVATRICE_ASCIUGATRICE",), configurable=False),
    WorkbookDefinition("_04_Basi_Sottolavello/1_Fianco_Vista_1_Fianco_Interno/configuratore_base_sottolavello_1_fianco_vista_1_fianco_interno _1__4__NO_INDICE.xlsx", "one_visible_one_internal", ("BASE_SOTTOLAVELLO_CON_1_FIANCO_A_VISTA_1_FIANCO_INTERNO", "BASE_SOTTOLAVELLO_CON_1_FIANCO_INTERNO_1_FIANCO_VISTA", "BASE_SOTTOLAVELLO_CON_1_FIANCOA_VISTA_1_FIANCO_INTERNO")),
    WorkbookDefinition("_04_Basi_Sottolavello/2_Fianchi_Interni/configuratore_base_sottolavello_2_fianchi_interni_CORRETTO _1__2__NO_INDICE.xlsx", "two_internal_sides", ("BASE_SOTTOLAVELLO_CON_2_FIANCHI_INTERNI",)),
    WorkbookDefinition("_04_Basi_Sottolavello/2_Fianchi_Vista/configuratore_base_sottolavello_2_fianchi_vista_5__NO_INDICE.xlsx", "two_visible_sides", ("BASE_SOTTOLAVELLO_CON_2_FIANCHI_A_VISTA", "BASE_SOTTOLAVELLO_CON_2_FIANCHIA_VISTA")),
    WorkbookDefinition("_05_Basi_Sottolavatoio/1_Fianco_Vista_1_Fianco_Interno/Configuratore_Base_Sottolavatoio_1FiancoVista_1FiancoInterno_SCHEMA_CORRETTO.xlsx", "one_visible_one_internal", ("BASE_SOTTOLAVATOIO_CON_1_FIANCO_A_VISTA_1_FIANCO_INTERNO", "BASE_SOTTOLAVATOIO_CON_1_FIANCHIA_VISTA_1_INTERNO", "BASE_SOTTOLAVATOIO_CON_1_FIANCO_INTERNO_A_VISTA")),
    WorkbookDefinition("_05_Basi_Sottolavatoio/_2_Fianchi_Interni/Configuratore_Base_Sottolavatoio_2FianchiInterni_CORRETTO_3__NO_INDICE.xlsx", "two_internal_sides", ("BASE_SOTTOLAVATOIO_CON_2_FIANCHI_INTERNI",)),
    WorkbookDefinition("_05_Basi_Sottolavatoio/_2_Fianchi_Vista/Configuratore_Base_Sottolavatoio_2FianchiVista_CORRETTO_3__NO_INDICE.xlsx", "two_visible_sides", ("BASE_SOTTOLAVATOIO_CON_2_FIANCHI_A_VISTA",)),
    WorkbookDefinition("_06_Basi/1_Fianco_Interno_1_Fianco_Vista/configuratore_base_1_fianco_interno_1_fianco_a_vista.xlsx", "one_visible_one_internal", ("BASE_CON_1_FIANCO_A_VISTA_1_FIANCO_INTERNO", "BASE_CON_1_FIANCO_INTERNO_1_FIANCO_VISTA", "BASE_CON_1_FIANCHIA_VISTA_1_FIANCO_INTERNO")),
    WorkbookDefinition("_06_Basi/_2_Fianchi_Interni/configuratore_base_2_fianchi_interni_4__NO_INDICE.xlsx", "two_internal_sides", ("BASE_CON_2_FIANCHI_INTERNI",)),
    WorkbookDefinition("_06_Basi/2_Fianchi_Vista/configuratore_base_2_fianchi_a_vista.xlsx", "two_visible_sides", ("BASE_CON_2_FIANCHI_A_VISTA", "BASE_CON_2_FIANCHIA_VISTA")),
    WorkbookDefinition("_07_Colonne/Colonna_/1_Fianco_Interno_1_Fianco_Vista/Configuratore_Colonna_Completa_1Vista_1Interno_NO_INDICE.xlsx", "one_visible_one_internal", ("COLONNA_CON_1_FIANCO_A_VISTA_1_FIANCO_INTERNO", "COLONNA_CON_1_FIANCO_INTERNO_1_FIANCOA_VISTA", "COLONNA_CON_1_FIANCOA_VISTA_1_FIANCO_INTERNO")),
    WorkbookDefinition("_07_Colonne/Colonna_/2_Fianchi_Interni/Configuratore_Colonna_Completa_2FianchiInterni_NO_INDICE_CORRETTO.xlsx", "two_internal_sides", ("COLONNA_CON_2_FIANCHI_INTERNI",)),
    WorkbookDefinition("_07_Colonne/Colonna_/2_Fianchi_Vista/Configuratore_Colonna_Completa_2FianchiVista_NO_INDICE.xlsx", "two_visible_sides", ("COLONNA_CON_2_FIANCHI_A_VISTA", "COLONNA_CON_2_FIANCHIA_VISTA")),
    WorkbookDefinition("_07_Colonne/Colonna_Porta_Impianti_Libera_Alto/1_Fianco_Interno_1_Fianco_Vista/Configuratore_Colonna_Libera_Alto_1Vista_1Interno_NO_INDICE.xlsx", "one_visible_one_internal", ("COLONNA_PORTA_IMPIANTI_LIBERA_ALTO_1_FIANCO_A_VISTA_1_FIANCO_INTERNO", "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_DX", "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_SX")),
    WorkbookDefinition("_07_Colonne/Colonna_Porta_Impianti_Libera_Alto/2_Fianchi_Interni/Configuratore_Colonna_Libera_Alto_2FianchiInterni_NO_INDICE.xlsx", "two_internal_sides", ("COLONNA_PORTA_IMPIANTI_LIBERA_ALTO_2_FIANCHI_INTERNI", "COLONNA_MISTA_IMPIANTO_ALTO_NON_A_VISTA")),
    WorkbookDefinition("_07_Colonne/Colonna_Porta_Impianti_Libera_Alto/2_Fianchi_Vista/Configuratore_Colonna_Libera_Alto_2FianchiVista_NO_INDICE.xlsx", "two_visible_sides", ("COLONNA_PORTA_IMPIANTI_LIBERA_ALTO_2_FIANCHI_A_VISTA", "COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_SX_E_DX")),
    WorkbookDefinition("_07_Colonne/_Colonna_Porta_Impianti_Libera_Basso/_1_Fianco_Interno_1_Fianco_Vista/_configuratore_colPortaImpBASSO_1Int_1Vista_3__NO_INDICE.xlsx", "one_visible_one_internal", ("COLONNA_PORTA_IMPIANTI_LIBERA_BASSO_1_FIANCO_A_VISTA_1_FIANCO_INTERNO", "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_DX", "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX")),
    WorkbookDefinition("_07_Colonne/_Colonna_Porta_Impianti_Libera_Basso/_2_Fianchi_Interni/configuratore_colPortaImpBASSO_2interni_2__NO_INDICE.xlsx", "two_internal_sides", ("COLONNA_PORTA_IMPIANTI_LIBERA_BASSO_2_FIANCHI_INTERNI", "COLONNA_MISTA_IMPIANTO_BASSO_NON_A_VISTA")),
    WorkbookDefinition("_07_Colonne/_Colonna_Porta_Impianti_Libera_Basso/_2_Fianchi_Vista/configuratore_colPortaImpBASSO_2vista_2__NO_INDICE.xlsx", "two_visible_sides", ("COLONNA_PORTA_IMPIANTI_LIBERA_BASSO_2_FIANCHI_A_VISTA", "COLONNA_MISTA_IMPIANTO_BASSO_A_VISTA_SX_E_DX")),
    WorkbookDefinition("_08_Pensili/Pensili_Orizzontali/Pensili_Orizzontali - 1FV1FI.xlsx", "one_visible_one_internal", ("PENSILE_ORIZZONTALE_A_VISTA_DX", "PENSILE_ORIZZONTALE_A_VISTA_SX")),
    WorkbookDefinition("_08_Pensili/Pensili_Orizzontali/Pensili_Orizzontali - 2FI.xlsx", "two_internal_sides", ("PENSILE_ORIZZONTALE_NON_A_VISTA",)),
    WorkbookDefinition("_08_Pensili/Pensili_Orizzontali/Pensili_Orizzontali - 2FV.xlsx", "two_visible_sides", ("PENSILE_ORIZZONTALE_A_VISTA_SX_E_DX",), "ORIZZ_2FV"),
    WorkbookDefinition("_08_Pensili/Pensili_Verticali/PENSILE VERTICALE CON 1 FIANCHI A VISTA 1 FIANCO INTERNO.xlsx", "one_visible_one_internal", ("PENSILE_VERTICALE_A_VISTA_DX", "PENSILE_VERTICALE_A_VISTA_SX")),
    WorkbookDefinition("_08_Pensili/Pensili_Verticali/PENSILE VERTICALE CON 2 FIANCHI A VISTA.xlsx", "two_visible_sides", ("PENSILE_VERTICALE_A_VISTA_SX_E_DX",)),
    WorkbookDefinition("_08_Pensili/Pensili_Verticali/PENSILE VERTICALE CON 2 FIANCHI INTERNI.xlsx", "two_internal_sides", ("PENSILE_VERTICALE_NON_A_VISTA",)),
)


def get_worksheet(path: Path, sheet_name: str | None):
    """Apre il foglio richiesto mantenendo sia formule sia risultati memorizzati."""
    formulas = load_workbook(path, read_only=True, data_only=False)
    values = load_workbook(path, read_only=True, data_only=True)
    selected_name = sheet_name or formulas.sheetnames[0]
    return formulas[selected_name], values[selected_name]


def find_bom_header(sheet: Any) -> int:
    """Trova l'intestazione della distinta senza assumere una riga fissa."""
    for row in range(1, sheet.max_row + 1):
        first_value = str(sheet.cell(row, 1).value or "").upper()
        second_value = str(sheet.cell(row, 2).value or "").upper()
        code_value = str(sheet.cell(row, 3).value or "").upper()
        if "Q.TA" in first_value and (
            "DESCRIZIONE" in second_value
            or "COMPONENTE" in second_value
            or "COD" in code_value
        ):
            return row
    raise ValueError(f"Intestazione distinta non trovata nel foglio {sheet.title}.")


def clean_value(value: Any) -> Any:
    """Elimina testo vuoto senza alterare numeri e decimali delle distinte."""
    if isinstance(value, str):
        value = " ".join(value.split())
        return value or None
    return value


def read_bom(path: Path, sheet_name: str | None) -> tuple[str, list[dict[str, Any]]]:
    """Estrae le righe componente e le misure calcolate dal configuratore Excel."""
    formula_sheet, value_sheet = get_worksheet(path, sheet_name)
    header_row = find_bom_header(formula_sheet)
    components: list[dict[str, Any]] = []
    for row in range(header_row + 1, formula_sheet.max_row + 1):
        description = clean_value(formula_sheet.cell(row, 2).value)
        code = clean_value(formula_sheet.cell(row, 3).value)
        quantity = clean_value(value_sheet.cell(row, 1).value)
        if not description and not code:
            if components:
                break
            continue
        if not description or (not code and quantity is None):
            continue
        values = [clean_value(value_sheet.cell(row, column).value) for column in range(4, 8)]
        components.append({"quantity": quantity, "name": description, "code": code or "", "widthMm": values[0], "heightMm": values[1], "depthMm": values[2], "thicknessMm": values[3], "optional": "opzional" in description.lower()})
    if not components:
        raise ValueError(f"Nessun componente trovato in {path.name}.")
    return formula_sheet.title, components


def build_catalog(source_root: Path) -> dict[str, dict[str, Any]]:
    """Costruisce il catalogo con una definizione autonoma per ogni codice prodotto."""
    catalog: dict[str, dict[str, Any]] = {}
    for definition in DEFINITIONS:
        workbook_path = source_root / definition.relative_path
        if not workbook_path.is_file():
            raise FileNotFoundError(f"Workbook mancante: {workbook_path}")
        sheet_name, components = read_bom(workbook_path, definition.sheet_name)
        for code in definition.codes:
            catalog[code] = {"configurableVariants": [definition.variant] if definition.configurable else [], "bomByVariant": {definition.variant: components}, "excelSource": f"{definition.relative_path}::{sheet_name}"}
    return dict(sorted(catalog.items()))


def write_catalog(catalog: dict[str, dict[str, Any]], output_path: Path) -> None:
    """Scrive il modulo TypeScript generato senza dipendenze runtime dall'Excel."""
    output_path.write_text('import type { ModuleTechnicalDefinition } from "./module-technical-catalog.ts";\n\n// Catalogo tecnico generato dai configuratori Excel del committente.\nexport const GENERATED_TECHNICAL_CATALOG: Record<string, ModuleTechnicalDefinition> = ' + json.dumps(catalog, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")


def main() -> None:
    """Espone una CLI ripetibile per rigenerare il catalogo dai workbook aggiornati."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    arguments = parser.parse_args()
    catalog = build_catalog(arguments.source_root)
    write_catalog(catalog, arguments.output)
    print(f"Generated {len(catalog)} technical definitions in {arguments.output}")


if __name__ == "__main__":
    main()
