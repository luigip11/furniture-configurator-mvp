import assert from "node:assert/strict";
import test from "node:test";
import { emptyProductForm } from "../src/lib/admin/product-form.ts";
import {
  validateProductAssetContent,
  validateProductAssetFile,
  validateProductAssetHeader,
} from "../src/lib/admin/product-assets.ts";
import {
  signUploadReceipt,
  verifyUploadReceipt,
} from "../src/lib/admin/upload-receipt.ts";
import {
  saveProductWithAssets,
  ProductSaveUncertainError,
} from "../src/lib/admin/product-save.ts";
import type { ProductSavePorts } from "../src/lib/admin/product-save.ts";
import type { Product } from "../src/types/configurator.ts";
import { isProductAssetReferenced } from "../src/lib/admin/asset-references.ts";

const form = {
  ...emptyProductForm,
  name_it: "Base",
  width_mm: "700",
  height_mm: "880",
  depth_mm: "665",
};
const secret = "synthetic-test-key-only";
const receipt = {
  path: "models/base/1-test-model.glb",
  field: "model_url" as const,
  name: "model.glb",
  size: 20,
  expiresAt: 2000,
};
const file = new File(["%PDF-1.7\nTest"], "schema.pdf", {
  type: "application/pdf",
});

test("riferimenti condivisi proteggono anche URL firmati e con query o caratteri codificati", () => {
  const target =
    "https://storage.test/storage/v1/object/public/product-assets/models/test.glb";
  for (const url of [
    target + "?v=2",
    target + "#part",
    target.replace("/public/", "/sign/") + "?token=test",
    target.replace("test.glb", "%74est.glb"),
  ]) {
    assert.equal(
      isProductAssetReferenced(target, [
        { preview_image_url: url, model_url: null, technical_file_url: null },
      ]),
      true,
    );
  }
  assert.equal(
    isProductAssetReferenced(target, [
      {
        preview_image_url: null,
        model_url: target + ".other",
        technical_file_url: null,
      },
    ]),
    false,
  );
});

test("estensioni, file vuoti e limiti sono verificati senza fidarsi del MIME", () => {
  for (const size of [0, -1, NaN, Infinity, 0.5])
    assert.throws(() =>
      validateProductAssetFile("model_url", { name: "model.glb", size }),
    );
  assert.throws(() =>
    validateProductAssetFile("preview_image_url", {
      name: "image.png",
      size: 8 * 1024 * 1024 + 1,
    }),
  );
  assert.throws(() =>
    validateProductAssetFile("model_url", {
      name: "model.glb",
      size: 80 * 1024 * 1024 + 1,
    }),
  );
  assert.throws(() =>
    validateProductAssetHeader(
      "preview_image_url",
      { name: "fake.png", size: 20 },
      new TextEncoder().encode("<html>not PNG</html>"),
    ),
  );
});

test("firme minime dei contenuti ammessi e GLB v2 con lunghezza coerente", async () => {
  await validateProductAssetContent("technical_file_url", file);
  const glb = new Uint8Array(20);
  glb.set(new TextEncoder().encode("glTF"));
  const view = new DataView(glb.buffer);
  view.setUint32(4, 2, true);
  view.setUint32(8, 20, true);
  await validateProductAssetContent("model_url", new File([glb], "model.glb"));
  view.setUint32(8, 100, true);
  await assert.rejects(
    () =>
      validateProductAssetContent("model_url", new File([glb], "model.glb")),
    /contenuto/,
  );
  await assert.rejects(
    () =>
      validateProductAssetContent(
        "technical_file_url",
        new File(["not-pdf"], "fake.pdf"),
      ),
    /contenuto/,
  );
});

test("GLTF standalone richiede JSON valido, versione supportata e risorse incorporate", async () => {
  await validateProductAssetContent(
    "model_url",
    new File(
      [
        JSON.stringify({
          asset: { version: "2.0" },
          buffers: [{ uri: "data:application/octet-stream;base64,AA==" }],
        }),
      ],
      "model.gltf",
    ),
  );
  for (const content of [
    "{broken",
    JSON.stringify({ asset: { version: "1.0" } }),
    JSON.stringify({
      asset: { version: "2.0" },
      buffers: [{ uri: "missing.bin" }],
    }),
    JSON.stringify({ asset: { version: "2.0" }, images: {} }),
  ]) {
    await assert.rejects(() =>
      validateProductAssetContent(
        "model_url",
        new File([content], "model.gltf"),
      ),
    );
  }
});

test("ricevute firmate rifiutano alterazioni, scadenza e percorsi esterni", () => {
  const token = signUploadReceipt(receipt, secret);
  assert.deepEqual(verifyUploadReceipt(token, secret, 1000), receipt);
  assert.throws(() => verifyUploadReceipt(token, "wrong-secret", 1000));
  assert.throws(() => verifyUploadReceipt(token, secret, 2000));
  const [body, signature] = token.split(".");
  assert.throws(() =>
    verifyUploadReceipt(
      `${Buffer.from(JSON.stringify({ ...receipt, path: "models/other/existing.glb" })).toString("base64url")}.${signature}`,
      secret,
      1000,
    ),
  );
  for (const path of [
    "../existing.glb",
    "models/../existing.glb",
    "technical/base/a.glb",
  ])
    assert.throws(() =>
      verifyUploadReceipt(
        signUploadReceipt({ ...receipt, path }, secret),
        secret,
        1000,
      ),
    );
  assert.throws(() => verifyUploadReceipt(body, secret, 1000));
});

// Porte isolate: verificano ordine e compensazione senza creare o cancellare file remoti.
function ports(
  log: string[],
  changes: Partial<ProductSavePorts> = {},
): ProductSavePorts {
  return {
    upload: async (field, _file, prepared) => {
      log.push("upload:" + field);
      prepared("new-receipt");
      return {
        publicUrl: "https://example.test/new.pdf",
        receipt: "new-receipt",
      };
    },
    save: async (payload, receipts) => {
      log.push("save");
      assert.equal(receipts.length, 1);
      assert.equal(payload.technical_file_url, "https://example.test/new.pdf");
      return { id: "saved", ...payload } as Product;
    },
    cleanup: async (receipts) => {
      log.push("cleanup:" + receipts.join(","));
    },
    ...changes,
  };
}

test("form non valido non avvia upload; successo associa i file senza pulirli", async () => {
  const log: string[] = [];
  await assert.rejects(() =>
    saveProductWithAssets(
      { ...form, width_mm: "" },
      { technical_file_url: file },
      ports(log),
    ),
  );
  assert.deepEqual(log, []);
  const saved = await saveProductWithAssets(
    form,
    { technical_file_url: file },
    ports(log),
  );
  assert.equal(saved.id, "saved");
  assert.deepEqual(log, ["upload:technical_file_url", "save"]);
});

test("fallimento dopo il primo upload pulisce solo le ricevute nuove", async () => {
  const log: string[] = [];
  await assert.rejects(
    () =>
      saveProductWithAssets(
        form,
        { technical_file_url: file },
        ports(log, {
          save: async () => {
            throw new Error("DB rejected");
          },
        }),
      ),
    /DB rejected/,
  );
  assert.deepEqual(log, ["upload:technical_file_url", "cleanup:new-receipt"]);
});

test("timeout durante upload registra anche il file in corso prima della pulizia", async () => {
  const log: string[] = [];
  await assert.rejects(
    () =>
      saveProductWithAssets(
        form,
        { technical_file_url: file },
        ports(log, {
          upload: async (_field, _file, prepared) => {
            prepared("in-flight");
            throw new Error("upload timeout");
          },
        }),
      ),
    /upload timeout/,
  );
  assert.deepEqual(log, ["cleanup:in-flight"]);
});

test("salvataggio con esito incerto conserva i file potenzialmente associati", async () => {
  const log: string[] = [];
  await assert.rejects(
    () =>
      saveProductWithAssets(
        form,
        { technical_file_url: file },
        ports(log, {
          save: async () => {
            throw new ProductSaveUncertainError("Esito incerto");
          },
        }),
      ),
    ProductSaveUncertainError,
  );
  assert.deepEqual(log, ["upload:technical_file_url"]);
});

test("pulizia fallita viene dichiarata e il file locale resta disponibile", async () => {
  const files = { technical_file_url: file };
  await assert.rejects(
    () =>
      saveProductWithAssets(
        form,
        files,
        ports([], {
          save: async () => {
            throw new Error("rejected");
          },
          cleanup: async () => {
            throw new Error("storage offline");
          },
        }),
      ),
    /Pulizia dei nuovi asset non completata/,
  );
  assert.equal(files.technical_file_url, file);
});
