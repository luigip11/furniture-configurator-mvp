import {
  buildProductAssetPath,
  getProductAssetContentType,
  isProductAssetField,
  PRODUCT_ASSET_BUCKET,
  PRODUCT_ASSET_CONFIG,
  validateProductAssetFile,
} from "@/lib/admin/product-assets";
import {
  getUploadReceiptSecret,
  removeUnusedUploads,
} from "@/lib/admin/product-asset-server";
import { signUploadReceipt } from "@/lib/admin/upload-receipt";
import { validatedRecord, validatedText } from "@/lib/admin/input-validation";
import { readAdminJson, adminInputError } from "@/lib/admin/request-body";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rejectUnauthorizedAdmin } from "@/lib/admin/admin-access";

// Prepara un upload diretto: i byte pesanti non transitano dalle funzioni Vercel.
export async function POST(request: Request) {
  const denied = rejectUnauthorizedAdmin(request);
  if (denied) return denied;
  let input;
  try {
    input = validatedRecord(await readAdminJson(request, 8192), [
      "field",
      "fileName",
      "size",
      "productCode",
    ]);
    if (!isProductAssetField(input.field))
      throw new Error("Campo asset non valido.");
    validatedText(input.fileName, "Nome file", 255, true);
    validatedText(input.productCode, "Codice", 120);
    validateProductAssetFile(input.field, {
      name: input.fileName as string,
      size: input.size as number,
    });
  } catch (error) {
    return adminInputError(error);
  }
  const field = input.field;
  if (!isProductAssetField(field))
    return Response.json(
      { message: "Campo asset non valido." },
      { status: 400 },
    );
  try {
    const client = getSupabaseAdmin();
    const { data: bucketInfo, error: bucketError } =
      await client.storage.getBucket(PRODUCT_ASSET_BUCKET);
    if (bucketError || !bucketInfo)
      return Response.json(
        { message: "Storage non disponibile. Riprova più tardi." },
        { status: 503 },
      );
    if (
      bucketInfo.file_size_limit &&
      Number(input.size) > Number(bucketInfo.file_size_limit)
    )
      return Response.json(
        {
          message: `Il bucket Storage consente al massimo ${Number(bucketInfo.file_size_limit) / 1024 / 1024} MB per file.`,
        },
        { status: 400 },
      );
    const path = buildProductAssetPath({
      field,
      fileName: input.fileName as string,
      productCode: input.productCode as string | null,
      randomSuffix: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    const bucket = client.storage.from(PRODUCT_ASSET_BUCKET);
    const { data, error } = await bucket.createSignedUploadUrl(path, {
      upsert: false,
    });
    if (error || !data)
      return Response.json(
        { message: "Impossibile preparare l’upload." },
        { status: 503 },
      );
    const receipt = signUploadReceipt(
      {
        path,
        field,
        name: input.fileName as string,
        size: input.size as number,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      },
      getUploadReceiptSecret(),
    );
    return Response.json(
      {
        signedUrl: data.signedUrl,
        publicUrl: bucket.getPublicUrl(path).data.publicUrl,
        receipt,
        contentType: getProductAssetContentType(input.fileName as string),
        maxSizeMb: PRODUCT_ASSET_CONFIG[field].maxSizeMb,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { message: "Upload non disponibile. Riprova più tardi." },
      { status: 503 },
    );
  }
}

// Compensa soltanto upload con ricevuta valida e ancora estranei ai prodotti salvati.
export async function DELETE(request: Request) {
  const denied = rejectUnauthorizedAdmin(request);
  if (denied) return denied;
  try {
    const input = validatedRecord(await readAdminJson(request), ["receipts"]);
    await removeUnusedUploads(input.receipts as string[]);
    return Response.json({ ok: true });
  } catch (error) {
    return adminInputError(error);
  }
}
