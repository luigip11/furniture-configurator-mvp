import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rejectUnauthorizedAdmin } from "@/lib/admin/admin-access";
import { validateCategoryPayload } from "@/lib/admin/category-validation";
import { validatedUuid } from "@/lib/admin/input-validation";
import { readAdminJson, adminInputError } from "@/lib/admin/request-body";

// Codice PostgreSQL per un vincolo di chiave esterna violato.
const FOREIGN_KEY_VIOLATION = "23503";

// Verifica identificatore e dati prima di aggiornare una categoria.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = rejectUnauthorizedAdmin(request);
  if (denied) return denied;
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

// Elimina dal server e spiega il rifiuto quando il database protegge prodotti ancora collegati.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = rejectUnauthorizedAdmin(request);
  if (denied) return denied;
  let id;
  try {
    id = validatedUuid((await context.params).id);
    if (!id) throw new Error("Categoria non valida.");
  } catch (error) {
    return adminInputError(error);
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error?.code === FOREIGN_KEY_VIOLATION)
      return Response.json(
        {
          message:
            "Categoria usata da uno o più prodotti: spostali prima di eliminarla.",
        },
        { status: 409 },
      );
    if (error)
      return Response.json(
        { message: "Impossibile eliminare la categoria." },
        { status: 500 },
      );
    if (!data)
      return Response.json(
        { message: "Categoria non trovata." },
        { status: 404 },
      );
    return Response.json({ id: data.id });
  } catch {
    return Response.json(
      { message: "Servizio non disponibile." },
      { status: 503 },
    );
  }
}
