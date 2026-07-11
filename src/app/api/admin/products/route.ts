import type { ProductPayload } from "@/lib/admin/product-form";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Crea un prodotto admin dal server, usando la stessa validazione minima del confine API.
export async function POST(request: Request) {
  const payload = await readProductPayload(request);

  if ("message" in payload) {
    return Response.json({ message: payload.message }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ product: data });
}

export async function readProductPayload(request: Request) {
  const payload = (await request.json().catch(() => null)) as Partial<ProductPayload> | null;

  if (!payload || typeof payload !== "object") {
    return { message: "Payload prodotto non valido." };
  }

  if (typeof payload.name_it !== "string" || payload.name_it.trim().length === 0) {
    return { message: "Nome IT obbligatorio." };
  }

  for (const [key, label] of [
    ["width_mm", "Larghezza"],
    ["height_mm", "Altezza"],
    ["depth_mm", "Profondita"],
  ] as const) {
    if (!Number.isFinite(payload[key])) {
      return { message: `${label} deve essere un numero valido.` };
    }
  }

  return payload as ProductPayload;
}
