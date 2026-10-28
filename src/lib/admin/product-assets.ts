import type { ProductFormValues } from "@/lib/admin/product-form";

export const PRODUCT_ASSET_BUCKET = "product-assets";

export type ProductAssetField = Extract<
  keyof ProductFormValues,
  "preview_image_url" | "model_url" | "technical_file_url"
>;

type ProductAssetConfig = {
  acceptedExtensions: string[];
  folder: string;
  maxSizeMb: number;
};

type ProductAssetFileLike = {
  name: string;
  size: number;
  type?: string;
};

export const PRODUCT_ASSET_CONFIG: Record<
  ProductAssetField,
  ProductAssetConfig
> = {
  preview_image_url: {
    acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    folder: "previews",
    maxSizeMb: 8,
  },
  model_url: {
    acceptedExtensions: [".glb", ".gltf"],
    folder: "models",
    maxSizeMb: 80,
  },
  technical_file_url: {
    acceptedExtensions: [".rfa", ".pdf", ".dwg", ".zip"],
    folder: "technical",
    maxSizeMb: 180,
  },
};

// Restituisce la lista di estensioni accettate dal campo asset del form.
export function getProductAssetAccept(field: ProductAssetField) {
  return PRODUCT_ASSET_CONFIG[field].acceptedExtensions.join(",");
}

// Valida estensione e dimensione prima di inviare file pesanti a Supabase Storage.
export function validateProductAssetFile(
  field: ProductAssetField,
  file: ProductAssetFileLike,
) {
  if (
    !isProductAssetField(field) ||
    typeof file.name !== "string" ||
    !Number.isSafeInteger(file.size) ||
    file.size <= 0
  )
    throw new Error("File asset vuoto o non valido.");
  const config = PRODUCT_ASSET_CONFIG[field];
  const fileName = file.name.trim().toLowerCase();
  const hasAcceptedExtension = config.acceptedExtensions.some((extension) =>
    fileName.endsWith(extension),
  );

  if (!hasAcceptedExtension) {
    throw new Error(
      `Formato non supportato. Usa: ${config.acceptedExtensions.join(", ")}.`,
    );
  }

  if (file.size > config.maxSizeMb * 1024 * 1024) {
    throw new Error(`File troppo grande. Limite: ${config.maxSizeMb} MB.`);
  }
}

// Riconosce solo i tre campi previsti, anche quando l'input arriva da JSON o FormData.
export function isProductAssetField(
  value: unknown,
): value is ProductAssetField {
  return (
    typeof value === "string" && Object.hasOwn(PRODUCT_ASSET_CONFIG, value)
  );
}

// Il tipo inviato allo storage deriva dall'estensione ammessa, non da un MIME arbitrario del client.
export function getProductAssetContentType(fileName: string) {
  const extension = fileName.trim().toLowerCase().split(".").pop();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    glb: "model/gltf-binary",
    gltf: "model/gltf+json",
    pdf: "application/pdf",
    zip: "application/zip",
    dwg: "application/acad",
    rfa: "application/octet-stream",
  };
  return types[extension || ""] || "application/octet-stream";
}

// Rifiuta contenuti palesemente incompatibili: non sostituisce la validazione CAD o antivirus.
export function validateProductAssetHeader(
  field: ProductAssetField,
  file: ProductAssetFileLike,
  bytes: Uint8Array,
) {
  validateProductAssetFile(field, file);
  const extension = file.name.trim().toLowerCase().split(".").pop();
  const text = new TextDecoder().decode(bytes);
  const starts = (...prefix: number[]) =>
    prefix.every((value, index) => bytes[index] === value);
  const valid =
    extension === "png"
      ? starts(137, 80, 78, 71, 13, 10, 26, 10)
      : extension === "jpg" || extension === "jpeg"
        ? starts(255, 216, 255)
        : extension === "webp"
          ? text.startsWith("RIFF") && text.slice(8, 12) === "WEBP"
          : extension === "pdf"
            ? text.startsWith("%PDF-")
            : extension === "zip"
              ? starts(80, 75, 3, 4) ||
                starts(80, 75, 5, 6) ||
                starts(80, 75, 7, 8)
              : extension === "rfa"
                ? starts(208, 207, 17, 224, 161, 177, 26, 225)
                : extension === "dwg"
                  ? /^AC10\d{2}/.test(text)
                  : extension === "gltf"
                    ? text.trimStart().startsWith("{")
                    : extension === "glb"
                      ? bytes.length >= 12 &&
                        text.startsWith("glTF") &&
                        new DataView(
                          bytes.buffer,
                          bytes.byteOffset,
                          bytes.byteLength,
                        ).getUint32(4, true) === 2 &&
                        new DataView(
                          bytes.buffer,
                          bytes.byteOffset,
                          bytes.byteLength,
                        ).getUint32(8, true) === file.size
                      : false;
  if (!valid)
    throw new Error(
      "Il contenuto del file non corrisponde al formato dichiarato.",
    );
}

// Controlla il file locale prima di richiedere uno spazio storage; un GLTF singolo deve essere autosufficiente.
export async function validateProductAssetContent(
  field: ProductAssetField,
  file: File,
) {
  validateProductAssetHeader(
    field,
    file,
    new Uint8Array(await file.slice(0, 512).arrayBuffer()),
  );
  if (file.name.trim().toLowerCase().endsWith(".gltf")) {
    let model;
    try {
      model = JSON.parse(await file.text());
    } catch {
      throw new Error("File GLTF non valido.");
    }
    if (
      !model ||
      model.asset?.version !== "2.0" ||
      (model.buffers !== undefined && !Array.isArray(model.buffers)) ||
      (model.images !== undefined && !Array.isArray(model.images)) ||
      [...(model.buffers || []), ...(model.images || [])].some(
        (resource) =>
          !resource ||
          typeof resource !== "object" ||
          (resource.uri !== undefined &&
            (typeof resource.uri !== "string" ||
              !resource.uri.startsWith("data:"))),
      )
    )
      throw new Error(
        "Il GLTF deve includere le risorse. Esporta un GLB o un GLTF con risorse incorporate.",
      );
  }
}

// Genera un percorso stabile e leggibile per raggruppare gli asset per codice prodotto.
export function buildProductAssetPath({
  field,
  fileName,
  productCode,
  randomSuffix,
  timestamp,
}: {
  field: ProductAssetField;
  fileName: string;
  productCode?: string | null;
  randomSuffix: string;
  timestamp: number;
}) {
  const config = PRODUCT_ASSET_CONFIG[field];
  const productFolder = slugifyStorageSegment(productCode || "senza-codice");
  const safeFileName = sanitizeStorageFileName(fileName);

  return `${config.folder}/${productFolder}/${timestamp}-${randomSuffix}-${safeFileName}`;
}

// Normalizza il nome file evitando caratteri problematici nei path storage.
function sanitizeStorageFileName(fileName: string) {
  const fallbackName = "asset";
  const normalizedName = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return normalizedName || fallbackName;
}

// Normalizza il codice prodotto in una cartella leggibile.
function slugifyStorageSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "senza-codice"
  );
}
