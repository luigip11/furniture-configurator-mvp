import assert from "node:assert/strict";
import test from "node:test";

import { getProportionalModelScale } from "../src/lib/configurator/gltf-transform.ts";

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
