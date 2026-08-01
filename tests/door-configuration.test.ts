import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_DOOR_CONFIGURATION,
  DOOR_COATING_OPTIONS,
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

test("la configurazione anta viene riassunta in francese", () => {
  assert.deepEqual(getDoorConfigurationSummary(DEFAULT_DOOR_CONFIGURATION, "fr"), [
    "1 porte",
    "Porte affleurante au sol (SP)",
    "SPV - avec vasque",
    "Lisse",
  ]);
});

test("la configurazione anta mancante non aggiunge righe in distinta", () => {
  assert.deepEqual(getDoorConfigurationSummary(undefined, "it"), []);
});

test("le opzioni rivestimento includono SA e MGR", () => {
  const coatingLabels = DOOR_COATING_OPTIONS.map((option) => option.labelIt);

  assert.ok(
    coatingLabels.includes("SA - predisposizione per essere tinteggiata")
  );
  assert.ok(
    coatingLabels.includes(
      "MGR - predisposizione per rivestimento con vasca e maniglia gola"
    )
  );
});
