// Coordina il salvataggio: valida prima di caricare e compensa soltanto nuovi asset in caso di errore.
import { buildProductPayload } from "./product-form.ts";
import type { ProductFormValues, ProductPayload } from "./product-form.ts";
import { validateProductAssetFile } from "./product-assets.ts";
import type { ProductAssetField } from "./product-assets.ts";
import type { Product } from "../../types/configurator.ts";

export type PendingProductFiles = Partial<Record<ProductAssetField, File>>;
export type UploadedProductAsset = { publicUrl: string; receipt: string };
export type ProductSavePorts = {
  upload: (
    field: ProductAssetField,
    file: File,
    onPrepared: (receipt: string) => void,
  ) => Promise<UploadedProductAsset>;
  save: (payload: ProductPayload, receipts: string[]) => Promise<Product>;
  cleanup: (receipts: string[]) => Promise<void>;
};

// Un timeout dopo la richiesta di salvataggio non prova che il database abbia rifiutato la scrittura.
export class ProductSaveUncertainError extends Error {}

// I file restano locali fino al submit; annullamento o cambio scheda non producono oggetti remoti.
export async function saveProductWithAssets(
  form: ProductFormValues,
  files: PendingProductFiles,
  ports: ProductSavePorts,
) {
  const payload = buildProductPayload(form);
  const entries = Object.entries(files) as [ProductAssetField, File][];
  for (const [field, file] of entries) validateProductAssetFile(field, file);
  const receipts: string[] = [];
  // Registra anche l'upload in corso, così un timeout di rete non lo esclude dalla pulizia.
  function remember(receipt: string) {
    if (!receipts.includes(receipt)) receipts.push(receipt);
  }
  try {
    for (const [field, file] of entries) {
      const uploaded = await ports.upload(field, file, remember);
      remember(uploaded.receipt);
      payload[field] = uploaded.publicUrl;
    }
    return await ports.save(payload, receipts);
  } catch (error) {
    if (error instanceof ProductSaveUncertainError) throw error;
    if (receipts.length) {
      try {
        await ports.cleanup(receipts);
      } catch {
        throw new Error(
          `${error instanceof Error ? error.message : "Salvataggio non riuscito."} Pulizia dei nuovi asset non completata: verifica Storage prima di riprovare.`,
        );
      }
    }
    throw error;
  }
}
