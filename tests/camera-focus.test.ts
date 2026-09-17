import assert from "node:assert/strict";
import test from "node:test";

import { hasSceneCompositionChanged } from "../src/lib/configurator/camera-focus.ts";

test("non richiede un refocus quando una variante aggiorna un modulo esistente", () => {
  assert.equal(hasSceneCompositionChanged(["module-1"], ["module-1"]), false);
});

test("richiede un refocus quando la composizione aggiunge o rimuove moduli", () => {
  assert.equal(
    hasSceneCompositionChanged(["module-1"], ["module-1", "module-2"]),
    true
  );
  assert.equal(hasSceneCompositionChanged(["module-1"], []), true);
});
