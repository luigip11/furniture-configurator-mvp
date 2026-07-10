import { getSupabaseAdmin } from "@/lib/supabase/admin";

type PublishPayload = {
  is_published?: unknown;
};

// Aggiorna lo stato di pubblicazione dal server, così il configuratore legge un valore persistito.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as PublishPayload | null;

  if (!id) {
    return Response.json({ message: "Prodotto non valido." }, { status: 400 });
  }

  if (typeof payload?.is_published !== "boolean") {
    return Response.json(
      { message: "Stato pubblicazione non valido." },
      { status: 400 }
    );
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
