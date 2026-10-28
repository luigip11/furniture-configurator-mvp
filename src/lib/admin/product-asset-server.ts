// Adattatore server per URL firmati, verifica dei file e pulizia circoscritta ai nuovi upload.
import { getSupabaseAdmin } from "../supabase/admin.ts";
import {
  PRODUCT_ASSET_BUCKET,
  PRODUCT_ASSET_CONFIG,
  validateProductAssetHeader,
} from "./product-assets.ts";
import { verifyUploadReceipt } from "./upload-receipt.ts";
import type { ProductPayload } from "./product-form.ts";
import {
  isProductAssetReferenced,
  type ProductAssetReferences,
} from "./asset-references.ts";

// Non usa firme locali se la configurazione server non è disponibile.
export function getUploadReceiptSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Upload non configurato.");
  return secret;
}

// Ogni richiesta può riguardare al massimo i tre file del prodotto.
export function readUploadReceipts(value: unknown) {
  if (
    !Array.isArray(value) ||
    value.length > 3 ||
    value.some((token) => typeof token !== "string")
  )
    throw new Error("Ricevute upload non valide.");
  return [...new Set(value as string[])].map((token) => ({
    token,
    data: verifyUploadReceipt(token, getUploadReceiptSecret()),
  }));
}

// Legge solo la firma iniziale e interrompe lo stream anche se lo storage ignora Range.
async function readStoredHeader(url: string) {
  const response = await fetch(url, {
    headers: { Range: "bytes=0-511" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok || !response.body)
    throw new Error("Impossibile verificare il file caricato.");
  const reader = response.body.getReader();
  const bytes = new Uint8Array(512);
  let length = 0;
  try {
    while (length < bytes.length) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = value.subarray(0, bytes.length - length);
      bytes.set(chunk, length);
      length += chunk.length;
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  return bytes.subarray(0, length);
}

// Verifica dimensione effettiva e contenuto prima di associare il file al prodotto.
export async function verifyUploadedAssets(
  tokens: string[],
  payload: ProductPayload,
) {
  const receipts = readUploadReceipts(tokens);
  const seen = new Set<string>();
  const bucket = getSupabaseAdmin().storage.from(PRODUCT_ASSET_BUCKET);
  for (const { data } of receipts) {
    if (seen.has(data.field)) throw new Error("Ricevute upload duplicate.");
    seen.add(data.field);
    const {
      data: { publicUrl },
    } = bucket.getPublicUrl(data.path);
    if (payload[data.field] !== publicUrl)
      throw new Error("Asset caricato non associato al campo previsto.");
    const info = await bucket.info(data.path);
    if (
      info.error ||
      !info.data ||
      (info.data.size ?? info.data.metadata?.size) !== data.size
    )
      throw new Error("Dimensione del file caricato non valida.");
    validateProductAssetHeader(
      data.field,
      data,
      await readStoredHeader(publicUrl),
    );
  }
}

// I file già referenziati restano intatti; errori di lettura bloccano la pulizia.
export async function removeUnusedUploads(tokens: string[]) {
  const receipts = readUploadReceipts(tokens);
  if (!receipts.length) return;
  const client = getSupabaseAdmin();
  const bucket = client.storage.from(PRODUCT_ASSET_BUCKET);
  const unused: string[] = [];
  const products: ProductAssetReferences[] = [];
  // Pagina esplicitamente per non ignorare riferimenti oltre il limite predefinito di Supabase.
  for (let offset = 0; ; offset += 500) {
    const result = await client
      .from("products")
      .select(Object.keys(PRODUCT_ASSET_CONFIG).join(","))
      .range(offset, offset + 499);
    if (result.error || !result.data)
      throw new Error(
        "Impossibile verificare gli asset associati ai prodotti.",
      );
    products.push(...(result.data as unknown as ProductAssetReferences[]));
    if (result.data.length < 500) break;
  }
  for (const { data } of receipts) {
    const {
      data: { publicUrl },
    } = bucket.getPublicUrl(data.path);
    if (!isProductAssetReferenced(publicUrl, products)) unused.push(data.path);
  }
  if (unused.length) {
    const { error } = await bucket.remove(unused);
    if (error) throw new Error("Pulizia dei nuovi asset non riuscita.");
  }
}
