import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  readProductSubmission,
  productWriteError,
} from "@/lib/admin/product-submission";
import { validatedUuid } from "@/lib/admin/input-validation";
import { adminInputError } from "@/lib/admin/request-body";

// Aggiorna una riga valida senza accettare identificatori o proprietà arbitrarie.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let id, payload;
  try {
    id = validatedUuid((await context.params).id);
    if (!id) throw new Error("Prodotto non valido.");
    payload = await readProductSubmission(request);
  } catch (error) {
    return adminInputError(error);
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) return productWriteError(error);
    if (!data)
      return Response.json(
        { message: "Prodotto non trovato." },
        { status: 404 },
      );
    return Response.json({ product: data });
  } catch {
    return productWriteError({});
  }
}
