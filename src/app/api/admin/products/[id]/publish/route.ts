import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validatedRecord, validatedUuid } from "@/lib/admin/input-validation";
import { readAdminJson, adminInputError } from "@/lib/admin/request-body";
import { rejectUnauthorizedAdmin } from "@/lib/admin/admin-access";

// Aggiorna lo stato di pubblicazione dal server, così il configuratore legge un valore persistito.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = rejectUnauthorizedAdmin(request);
  if (denied) return denied;
  let id, payload;
  try {
    id = validatedUuid((await context.params).id);
    if (!id) throw new Error("Prodotto non valido.");
    payload = validatedRecord(await readAdminJson(request), ["is_published"]);
    if (typeof payload.is_published !== "boolean")
      throw new Error("Stato pubblicazione non valido.");
  } catch (error) {
    return adminInputError(error);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .update({ is_published: payload.is_published })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  if (!data) {
    return Response.json({ message: "Prodotto non trovato." }, { status: 404 });
  }

  return Response.json({ product: data });
}
