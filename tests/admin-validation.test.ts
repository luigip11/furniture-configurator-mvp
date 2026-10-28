import assert from "node:assert/strict";
import test from "node:test";
import {
  buildProductPayload,
  emptyProductForm,
} from "../src/lib/admin/product-form.ts";
import { buildCategoryPayload } from "../src/lib/admin/category-form.ts";
import { validateProductPayload } from "../src/lib/admin/product-validation.ts";
import { validateCategoryPayload } from "../src/lib/admin/category-validation.ts";
import { readAdminJson } from "../src/lib/admin/request-body.ts";
import { validatedUuid } from "../src/lib/admin/input-validation.ts";

const form = {
  ...emptyProductForm,
  name_it: "Base",
  width_mm: "700",
  height_mm: "880",
  depth_mm: "665",
};
const category = {
  name: "Basi",
  slug: "basi",
  description: null,
  sort_order: null,
};

for (const value of [
  "",
  " ",
  "0",
  "-1",
  "NaN",
  "Infinity",
  "0x20",
  "1e3",
  "9801",
]) {
  test(`il form prodotto rifiuta la quota ${JSON.stringify(value)}`, () => {
    assert.throws(() => buildProductPayload({ ...form, width_mm: value }));
  });
}

test("API prodotti e form condividono limiti e normalizzazione", () => {
  const good = buildProductPayload({
    ...form,
    width_mm: "700,5",
    price: "0",
    thickness_mm: "19,5",
  });
  assert.deepEqual(validateProductPayload(good), good);
  assert.equal(good.price, 0);
  assert.equal(good.thickness_mm, 19.5);
  for (const patch of [
    { width_mm: 0 },
    { height_mm: -10 },
    { depth_mm: 10000 },
    { width_mm: "700" },
    { thickness_mm: 0 },
    { thickness_mm: 1000 },
    { price: -1 },
    { price: "0" },
    { is_published: "false" },
    { name_it: " " },
    { name_it: "x".repeat(201) },
    { category_id: "not-an-id" },
    { created_at: "today" },
    { id: "other" },
    { preview_image_url: "javascript:alert(1)" },
    { model_url: "https://user:password@example.test/model.glb" },
  ])
    assert.throws(() => validateProductPayload({ ...good, ...patch }));
  assert.equal(
    validateProductPayload({
      ...good,
      model_url: "https://example.test/model.glb",
    }).model_url,
    "https://example.test/model.glb",
  );
  for (const input of [null, [], "data", 1, { message: "override" }])
    assert.throws(() => validateProductPayload(input));
});

test("categorie: interi PostgreSQL, slug e campi ammessi verificati anche server-side", () => {
  assert.deepEqual(validateCategoryPayload(category), category);
  assert.equal(
    validateCategoryPayload({ ...category, sort_order: -1 }).sort_order,
    -1,
  );
  for (const patch of [
    { slug: "../basi" },
    { slug: "Basi" },
    { sort_order: 1.5 },
    { sort_order: "2" },
    { sort_order: 2147483648 },
    { id: "override" },
  ])
    assert.throws(() => validateCategoryPayload({ ...category, ...patch }));
  for (const sort_order of ["0x20", "1e3", "1.5"])
    assert.throws(() =>
      buildCategoryPayload({
        name: "Basi",
        slug: "",
        description: "",
        sort_order,
      }),
    );
});

test("identificatori delle route non accettano filtri o stringhe arbitrarie", () => {
  assert.equal(
    validatedUuid("11111111-1111-4111-8111-111111111111"),
    "11111111-1111-4111-8111-111111111111",
  );
  for (const id of ["eq.any", "../path", "123", 1])
    assert.throws(() => validatedUuid(id));
});

test("lettura JSON limita il corpo anche senza Content-Length", async () => {
  assert.deepEqual(
    await readAdminJson(
      new Request("https://test.invalid", {
        method: "POST",
        body: '{"name":"ok"}',
      }),
    ),
    { name: "ok" },
  );
  await assert.rejects(
    () =>
      readAdminJson(
        new Request("https://test.invalid", { method: "POST", body: "{" }),
      ),
    /JSON non valido/,
  );
  await assert.rejects(
    () =>
      readAdminJson(
        new Request("https://test.invalid", {
          method: "POST",
          body: "x".repeat(101),
        }),
        100,
      ),
    /troppo grande/,
  );
  await assert.rejects(
    () =>
      readAdminJson(
        new Request("https://test.invalid", {
          method: "POST",
          body: "{}",
          headers: { "content-length": "70000" },
        }),
      ),
    /troppo grande/,
  );
});
