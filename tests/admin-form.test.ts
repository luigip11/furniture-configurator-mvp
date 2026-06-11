import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCategoryPayload,
  categoryToForm,
  slugify,
} from "../src/lib/admin/category-form.ts";
import { buildProductPayload, productToForm } from "../src/lib/admin/product-form.ts";

test("slugify normalizza accenti, spazi e simboli", () => {
  assert.equal(slugify(" Libreria Àngolo / Premium "), "libreria-angolo-premium");
});

test("buildCategoryPayload genera slug e converte campi opzionali", () => {
  assert.deepEqual(
    buildCategoryPayload({
      name: "  Librerie ",
      slug: "",
      description: " ",
      sort_order: "2",
    }),
    {
      name: "Librerie",
      slug: "librerie",
      description: null,
      sort_order: 2,
    }
  );
});

test("buildCategoryPayload blocca un ordine non numerico", () => {
  assert.throws(
    () =>
      buildCategoryPayload({
        name: "Librerie",
        slug: "",
        description: "",
        sort_order: "abc",
      }),
    /Ordine deve essere un numero valido/
  );
});

test("categoryToForm preserva i valori modificabili", () => {
  assert.deepEqual(
    categoryToForm({
      id: "cat-1",
      name: "Armadi",
      slug: "armadi",
      description: null,
      sort_order: 3,
    }),
    {
      name: "Armadi",
      slug: "armadi",
      description: "",
      sort_order: "3",
    }
  );
});

test("buildProductPayload trimma testo e converte numeri", () => {
  assert.deepEqual(
    buildProductPayload({
      category_id: " ",
      name_it: "  Modulo base ",
      name_en: "",
      code: " MB-01 ",
      width_mm: "700",
      height_mm: "2100",
      depth_mm: "450",
      thickness_mm: "",
      price: "199.90",
      preview_image_url: "",
      model_url: "",
      technical_file_url: "",
      is_published: true,
    }),
    {
      category_id: null,
      name_it: "Modulo base",
      name_en: null,
      code: "MB-01",
      width_mm: 700,
      height_mm: 2100,
      depth_mm: 450,
      thickness_mm: null,
      price: 199.9,
      preview_image_url: null,
      model_url: null,
      technical_file_url: null,
      is_published: true,
    }
  );
});

test("buildProductPayload blocca dimensioni obbligatorie non numeriche", () => {
  assert.throws(
    () =>
      buildProductPayload({
        category_id: "",
        name_it: "Modulo base",
        name_en: "",
        code: "",
        width_mm: "abc",
        height_mm: "2100",
        depth_mm: "450",
        thickness_mm: "",
        price: "",
        preview_image_url: "",
        model_url: "",
        technical_file_url: "",
        is_published: false,
      }),
    /Larghezza deve essere un numero valido/
  );
});

test("productToForm preserva valori e svuota nullable", () => {
  assert.deepEqual(
    productToForm({
      id: "prod-1",
      category_id: null,
      name_it: "Modulo",
      name_en: null,
      code: null,
      width_mm: 700,
      height_mm: 2100,
      depth_mm: 450,
      thickness_mm: null,
      price: null,
      preview_image_url: null,
      model_url: null,
      technical_file_url: null,
      is_published: false,
    }),
    {
      category_id: "",
      name_it: "Modulo",
      name_en: "",
      code: "",
      width_mm: "700",
      height_mm: "2100",
      depth_mm: "450",
      thickness_mm: "",
      price: "",
      preview_image_url: "",
      model_url: "",
      technical_file_url: "",
      is_published: false,
    }
  );
});
