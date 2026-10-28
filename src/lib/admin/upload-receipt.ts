// Ricevute server firmate: autorizzano soltanto la gestione di un nuovo file appena preparato.
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  isProductAssetField,
  PRODUCT_ASSET_CONFIG,
  validateProductAssetFile,
} from "./product-assets.ts";
import type { ProductAssetField } from "./product-assets.ts";

export type UploadReceipt = {
  path: string;
  field: ProductAssetField;
  name: string;
  size: number;
  expiresAt: number;
};

// Firma una descrizione immutabile del file, senza inserire credenziali nello storage o nel browser.
export function signUploadReceipt(data: UploadReceipt, secret: string) {
  if (!secret) throw new Error("Upload non configurato.");
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

// Rifiuta ricevute alterate, scadute o percorsi non generati dall'applicazione.
export function verifyUploadReceipt(
  token: unknown,
  secret: string,
  now = Date.now(),
): UploadReceipt {
  if (typeof token !== "string" || token.length > 5000 || !secret)
    throw new Error("Ricevuta upload non valida.");
  const [payload, signature, extra] = token.split(".");
  const expected = createHmac("sha256", secret)
    .update(payload || "")
    .digest();
  const supplied = Buffer.from(signature || "", "base64url");
  if (
    extra ||
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    throw new Error("Ricevuta upload non valida.");
  let data: UploadReceipt;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new Error("Ricevuta upload non valida.");
  }
  if (
    !data ||
    !isProductAssetField(data.field) ||
    typeof data.path !== "string" ||
    !data.path.startsWith(PRODUCT_ASSET_CONFIG[data.field].folder + "/") ||
    !/^[a-z0-9/._-]+$/.test(data.path) ||
    data.path
      .split("/")
      .some((part) => !part || part === "." || part === "..") ||
    !Number.isFinite(data.expiresAt) ||
    data.expiresAt <= now
  )
    throw new Error("Ricevuta upload scaduta o non valida.");
  validateProductAssetFile(data.field, { name: data.name, size: data.size });
  return data;
}
