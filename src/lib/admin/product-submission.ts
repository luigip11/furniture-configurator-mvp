import {
  validateProductPayload,
  PRODUCT_PAYLOAD_FIELDS,
} from "./product-validation.ts";
import { validatedRecord } from "./input-validation.ts";
import { readAdminJson } from "./request-body.ts";
import {
  readUploadReceipts,
  verifyUploadedAssets,
} from "./product-asset-server.ts";

// Separa le ricevute dal payload DB e verifica anche i file prima di qualsiasi mutazione.
export async function readProductSubmission(request: Request) {
  const data = validatedRecord(await readAdminJson(request), [
    ...PRODUCT_PAYLOAD_FIELDS,
    "uploadReceipts",
  ]);
  const { uploadReceipts = [], ...raw } = data;
  const payload = validateProductPayload(raw);
  const receipts = readUploadReceipts(uploadReceipts).map(({ token }) => token);
  await verifyUploadedAssets(receipts, payload);
  return payload;
}

// Distingue un rifiuto DB noto da un esito incerto, per evitare pulizie su scritture forse riuscite.
export function productWriteError(error: { code?: string }) {
  const rejected =
    !!error.code &&
    (/^(?:22|23|28|42|3F|0A)[A-Z0-9]{3}$/.test(error.code) ||
      /^PGRST20[0-5]$/.test(error.code));
  return Response.json(
    {
      message: "Impossibile salvare il prodotto. Verifica i dati e riprova.",
      outcome: rejected ? "rejected" : "unknown",
    },
    { status: 500 },
  );
}
