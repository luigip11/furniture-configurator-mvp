import assert from "node:assert/strict";
import test from "node:test";
import { getProductCodeStatus } from "../src/lib/admin/product-code-check.ts";
import { GENERATED_TECHNICAL_CATALOG } from "../src/lib/configurator/generated-technical-catalog.ts";

test("i codici del catalogo Excel e delle formule parametriche sono riconosciuti", () => {
  for (const code of [
    Object.keys(GENERATED_TECHNICAL_CATALOG)[0],
    "BASE_CON_2_FIANCHI_INTERNI",
    "PENSILE_ORIZZONTALE_A_VISTA_SX",
  ])
    assert.equal(getProductCodeStatus(code), "recognized", code);
});

test("maiuscole e spazi esterni non cambiano il riconoscimento", () => {
  assert.equal(
    getProductCodeStatus("  base_con_2_fianchi_interni "),
    "recognized",
  );
});

test("un codice sconosciuto o con un refuso viene segnalato", () => {
  for (const code of ["PIPPO", "BASE_CON_2_FIANCHI_INTERN", "BASE CON 2 FIANCHI INTERNI"])
    assert.equal(getProductCodeStatus(code), "unknown", code);
});

test("un codice assente viene distinto da uno sconosciuto", () => {
  for (const code of [null, undefined, "", "   "])
    assert.equal(getProductCodeStatus(code), "missing", String(code));
});
