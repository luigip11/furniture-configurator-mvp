// Confronta riferimenti allo stesso oggetto anche con URL firmati, query o caratteri codificati.
import type { Product } from "../../types/configurator.ts";

export type ProductAssetReferences = Pick<
  Product,
  "preview_image_url" | "model_url" | "technical_file_url"
>;

// Ignora parametri temporanei e modalità public/sign/authenticated dello stesso endpoint Storage.
function assetIdentity(value: string) {
  try {
    const url = new URL(value);
    return (
      url.origin +
      decodeURIComponent(url.pathname).replace(
        /\/storage\/v1\/object\/(?:public|sign|authenticated)\//,
        "/storage/v1/object/",
      )
    );
  } catch {
    return value;
  }
}

// Controlla tutti i campi asset, non soltanto quello da cui è nato l'upload.
export function isProductAssetReferenced(
  url: string,
  products: ProductAssetReferences[],
) {
  const identity = assetIdentity(url);
  return products.some((product) =>
    Object.values(product).some(
      (value) => typeof value === "string" && assetIdentity(value) === identity,
    ),
  );
}
