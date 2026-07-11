import { readProductPayload } from "@/app/api/admin/products/route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Aggiorna un prodotto admin dal server, restituendo la riga persistita.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = await readProductPayload(request);

  if (!id) {
    return Response.json({ message: "Prodotto non valido." }, { status: 400 });
  }

  if ("message" in payload) {
    return Response.json({ message: payload.message }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .update(payload)
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
