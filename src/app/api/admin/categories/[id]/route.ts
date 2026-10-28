import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validateCategoryPayload } from "@/lib/admin/category-validation";
import { validatedUuid } from "@/lib/admin/input-validation";
import { readAdminJson, adminInputError } from "@/lib/admin/request-body";

// Verifica identificatore e dati prima di aggiornare una categoria.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let id, payload;
  try {
    id = validatedUuid((await context.params).id);
    if (!id) throw new Error("Categoria non valida.");
    payload = validateCategoryPayload(await readAdminJson(request));
  } catch (error) {
    return adminInputError(error);
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error)
      return Response.json(
        { message: "Impossibile salvare la categoria." },
        { status: 500 },
      );
    if (!data)
      return Response.json(
        { message: "Categoria non trovata." },
        { status: 404 },
      );
    return Response.json({ category: data });
  } catch {
    return Response.json(
      { message: "Servizio non disponibile." },
      { status: 503 },
    );
  }
}
