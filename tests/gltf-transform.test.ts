import assert from "node:assert/strict";
import test from "node:test";

import {
  getGltfTransformPreset,
  getIndependentModelScale,
  getProportionalModelScale,
} from "../src/lib/configurator/gltf-transform.ts";

test("getProportionalModelScale preserva le proporzioni dei pensili", () => {
  assert.equal(
    getProportionalModelScale(
      { width: 7, height: 8.78, depth: 3.5 },
      { width: 1, height: 1.2542857143, depth: 0.5 }
    ),
    1 / 7
  );
});

test("getProportionalModelScale usa misure sicure per GLB non validi", () => {
  assert.equal(
    getProportionalModelScale(
      { width: 0, height: 0, depth: 0 },
      { width: 1, height: 2, depth: 3 }
    ),
    1
  );
});

test("getProportionalModelScale non genera scale non finite con dati corrotti", () => {
  assert.equal(
    getProportionalModelScale(
      { width: Number.NaN, height: Number.POSITIVE_INFINITY, depth: -3 },
      { width: Number.NaN, height: 0, depth: Number.NEGATIVE_INFINITY }
    ),
    1
  );
});

test("i GLB di pensili e colonne miste ruotano l'asse Z in verticale", () => {
  assert.equal(
    getGltfTransformPreset("PENSILE_VERTICALE_A_VISTA_DX").rotationX,
    -Math.PI / 2
  );
  assert.equal(
    getGltfTransformPreset("COLONNA_MISTA_IMPIANTO_ALTO_A_VISTA_DX")
      .rotationX,
    -Math.PI / 2
  );
  assert.equal(getGltfTransformPreset("BASE_CON_2_FIANCHI_INTERNI").rotationX, 0);
});

test("il portale adatta ogni asse alle dimensioni dichiarate", () => {
  assert.equal(
    getGltfTransformPreset("PORTALE_BASI_LAVATRICE_ASCIUGATRICE").scaleMode,
    "independent"
  );
  assert.deepEqual(
    getIndependentModelScale(
      { width: 2.3, height: 2.87, depth: 2.18 },
      { width: 1, height: 1.26, depth: 0.09 }
    ),
    { width: 1 / 2.3, height: 1.26 / 2.87, depth: 0.09 / 2.18 }
  );
});
