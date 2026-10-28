import { validateProductAssetContent } from "./product-assets.ts";
import type { ProductAssetField } from "./product-assets.ts";
import type { UploadedProductAsset } from "./product-save.ts";

// Usa una firma limitata al nuovo percorso; i byte non attraversano le funzioni Vercel.
export async function uploadProductAsset({
  field,
  file,
  productCode,
  onPrepared,
}: {
  field: ProductAssetField;
  file: File;
  productCode?: string | null;
  onPrepared: (receipt: string) => void;
}): Promise<UploadedProductAsset> {
  await validateProductAssetContent(field, file);
  const prepared = await fetch("/api/admin/product-assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      field,
      fileName: file.name,
      size: file.size,
      productCode,
    }),
  });
  const result = await prepared.json().catch(() => null);
  if (
    !prepared.ok ||
    !result?.signedUrl ||
    !result?.publicUrl ||
    !result?.receipt
  )
    throw new Error(result?.message || "Impossibile preparare l’upload.");
  onPrepared(result.receipt);
  const uploaded = await fetch(result.signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": result.contentType,
      "cache-control": "max-age=3600",
      "x-upsert": "false",
    },
    signal: AbortSignal.timeout(180000),
  });
  if (!uploaded.ok)
    throw new Error(
      "Upload non riuscito. Verifica rete, limite Storage e formato del file.",
    );
  return { publicUrl: result.publicUrl, receipt: result.receipt };
}

// Richiede la pulizia delle sole ricevute raccolte da questa operazione.
export async function cleanupProductAssets(receipts: string[]) {
  const response = await fetch("/api/admin/product-assets", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receipts }),
  });
  if (!response.ok) throw new Error("Pulizia dei nuovi asset non riuscita.");
}
