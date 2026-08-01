import assert from "node:assert/strict";
import test from "node:test";

import {
  clampItemPositionToGridBounds,
  CONFIGURATOR_GRID_HALF_SIZE,
  getDockedCompositionItems,
  getDockedItemsAfterMove,
  getAlignedPositionForSceneMode,
  getItemSceneWidth,
  getNextPosition,
  getNonOverlappingAlignedPosition,
  getWallUnitSceneBottom,
  isWallUnitProduct,
  normalizeRotation,
  shouldDockComposition,
  snapPosition,
  snapToGrid,
} from "../src/store/configurator-calculations.ts";
import type { ConfiguratorItem } from "../src/types/configurator.ts";

const baseItem: ConfiguratorItem = {
  id: "item-1",
  productId: "product-1",
  nameIt: "Modulo",
  nameEn: null,
  code: null,
  widthMm: 700,
  heightMm: 2100,
  depthMm: 450,
  price: null,
  position: [0, 0, 0],
  rotationY: 0,
  variantKey: "two_visible_sides",
  color: "#d8d3c7",
};

test("snapToGrid arrotonda al quarto di unita", () => {
  assert.equal(snapToGrid(0.37), 0.25);
  assert.equal(snapToGrid(0.38), 0.5);
});

test("normalizeRotation mantiene la rotazione nel range positivo", () => {
  assert.equal(normalizeRotation(450), 90);
  assert.equal(normalizeRotation(-90), 270);
});

test("snapPosition mantiene l'asse verticale invariato", () => {
  assert.deepEqual(snapPosition([0.37, 1.2, -0.38]), [0.25, 1.2, -0.5]);
});

test("getItemSceneWidth converte millimetri in scala scena", () => {
  assert.equal(getItemSceneWidth(baseItem), 1);
});

test("getNextPosition parte dall'origine quando non ci sono moduli", () => {
  assert.deepEqual(getNextPosition([], 700), [0, 0, 0]);
});

test("getNextPosition affianca il nuovo modulo al bordo destro", () => {
  assert.deepEqual(getNextPosition([baseItem], 700), [1, 0, 0]);
});

test("getDockedCompositionItems aggancia i moduli in una fila centrata", () => {
  const secondItem: ConfiguratorItem = {
    ...baseItem,
    id: "item-2",
    position: [3, 0, 2],
  };

  assert.deepEqual(
    getDockedCompositionItems([baseItem, secondItem], "open").map(
      (item) => item.position
    ),
    [
      [-0.5, 0, 0],
      [0.5, 0, 0],
    ]
  );
});

test("getDockedItemsAfterMove usa la traslazione per riordinare i moduli", () => {
  const secondItem: ConfiguratorItem = {
    ...baseItem,
    id: "item-2",
    position: [0.5, 0, 0],
  };

  assert.deepEqual(
    getDockedItemsAfterMove([baseItem, secondItem], "item-2", [-2, 0, 0], "open")
      .map((item) => item.id),
    ["item-2", "item-1"]
  );
});

test("isWallUnitProduct riconosce i pensili e la quota standard", () => {
  assert.equal(
    isWallUnitProduct({ code: "PENSILE-VERTICALE", name_it: "Pensile" }),
    true
  );
  assert.equal(getWallUnitSceneBottom(), 2);
});

test("shouldDockComposition permette movimento libero solo in modalita aperta", () => {
  assert.equal(
    shouldDockComposition("open", { allowFreeMovementInOpenScene: true }),
    false
  );
  assert.equal(
    shouldDockComposition("wall", { allowFreeMovementInOpenScene: true }),
    true
  );
  assert.equal(
    shouldDockComposition("open", { allowFreeMovementInOpenScene: false }),
    true
  );
});

test("getNonOverlappingAlignedPosition evita sovrapposizioni in filo parete", () => {
  const nextItem: ConfiguratorItem = {
    ...baseItem,
    id: "item-2",
    position: [0, 0, 0],
  };

  assert.deepEqual(getNonOverlappingAlignedPosition(nextItem, [baseItem], "wall"), [
    -1,
    0,
    0.32142857142857145,
  ]);
});

test("getAlignedPositionForSceneMode mantiene il bordo a filo dopo una variazione di profondita", () => {
  const updatedDepthItem: ConfiguratorItem = {
    ...baseItem,
    depthMm: 450,
    position: [1.1, 0, 3],
  };

  assert.deepEqual(getAlignedPositionForSceneMode(updatedDepthItem, "wall"), [
    1,
    0,
    0.32142857142857145,
  ]);
  assert.deepEqual(getAlignedPositionForSceneMode(updatedDepthItem, "front"), [
    1,
    0,
    -0.32142857142857145,
  ]);
});

test("getNonOverlappingAlignedPosition mantiene i moduli accostati in sequenza", () => {
  const secondItem: ConfiguratorItem = {
    ...baseItem,
    id: "item-2",
    position: [1, 0, 0.25],
  };
  const thirdItem: ConfiguratorItem = {
    ...baseItem,
    id: "item-3",
    position: [1, 0, 0],
  };

  assert.deepEqual(
    getNonOverlappingAlignedPosition(thirdItem, [baseItem, secondItem], "front"),
    [2, 0, -0.32142857142857145]
  );
});

test("clampItemPositionToGridBounds mantiene il modulo nel piano quadrettato", () => {
  assert.deepEqual(clampItemPositionToGridBounds(baseItem, [20, 0, -20]), [
    CONFIGURATOR_GRID_HALF_SIZE - 0.5,
    0,
    -6.75,
  ]);
});

test("clampItemPositionToGridBounds considera l'ingombro ruotato", () => {
  assert.deepEqual(
    clampItemPositionToGridBounds({ ...baseItem, rotationY: 90 }, [20, 0, 20]),
    [6.75, 0, CONFIGURATOR_GRID_HALF_SIZE - 0.5]
  );
});
