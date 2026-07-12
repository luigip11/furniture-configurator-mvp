import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_DOOR_CONFIGURATION,
  getDoorConfigurationSummary,
} from "../src/types/configurator.ts";

test("la configurazione anta viene riassunta in italiano", () => {
  assert.deepEqual(getDoorConfigurationSummary(DEFAULT_DOOR_CONFIGURATION, "it"), [
    "1 anta",
    "Anta a sfioro pavimento (SP)",
    "SPV - con vasca",
    "Liscia",
  ]);
});

test("la configurazione anta mancante non aggiunge righe in distinta", () => {
  assert.deepEqual(getDoorConfigurationSummary(undefined, "it"), []);
});
