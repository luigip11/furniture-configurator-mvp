import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  readProductSubmission,
  productWriteError,
} from "@/lib/admin/product-submission";
import { adminInputError } from "@/lib/admin/request-body";

// Crea solo payload validati e asset verificati; i campi extra non raggiungono il database.
export async function POST(request: Request) {
  let payload;
  try {
    payload = await readProductSubmission(request);
  } catch (error) {
    return adminInputError(error);
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("products")
      .insert(payload)
      .select("*")
      .single();
    if (error) return productWriteError(error);
    return Response.json({ product: data });
  } catch {
    return productWriteError({});
  }
}
