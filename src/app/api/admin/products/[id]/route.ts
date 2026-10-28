import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  readProductSubmission,
  productWriteError,
} from "@/lib/admin/product-submission";
import { rejectUnauthorizedAdmin } from "@/lib/admin/admin-access";
import { validatedUuid } from "@/lib/admin/input-validation";
import { adminInputError } from "@/lib/admin/request-body";

// Aggiorna una riga valida senza accettare identificatori o proprietà arbitrarie.
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

// Elimina dal server, così la cancellazione non dipende dalle policy anon del browser.
// I file in Storage restano: possono essere condivisi e la loro pulizia resta manuale.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = rejectUnauthorizedAdmin(request);
  if (denied) return denied;
  let id;
  try {
    id = validatedUuid((await context.params).id);
    if (!id) throw new Error("Prodotto non valido.");
  } catch (error) {
    return adminInputError(error);
  }
  try {
    // La select conferma la riga davvero eliminata: zero righe significa prodotto inesistente.
    const { data, error } = await getSupabaseAdmin()
      .from("products")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error)
      return Response.json(
        { message: "Impossibile eliminare il prodotto." },
        { status: 500 },
      );
    if (!data)
      return Response.json(
        { message: "Prodotto non trovato." },
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
