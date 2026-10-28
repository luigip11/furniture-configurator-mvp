import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validateCategoryPayload } from "@/lib/admin/category-validation";
import { readAdminJson, adminInputError } from "@/lib/admin/request-body";
import { rejectUnauthorizedAdmin } from "@/lib/admin/admin-access";

// Applica alle categorie la stessa validazione del form anche nelle richieste dirette.
export async function POST(request: Request) {
  const denied = rejectUnauthorizedAdmin(request);
  if (denied) return denied;
  let payload;
  try {
    payload = validateCategoryPayload(await readAdminJson(request));
  } catch (error) {
    return adminInputError(error);
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("categories")
      .insert(payload)
      .select("*")
      .single();
    if (error)
      return Response.json(
        { message: "Impossibile salvare la categoria." },
        { status: 500 },
      );
    return Response.json({ category: data });
  } catch {
    return Response.json(
      { message: "Servizio non disponibile." },
      { status: 503 },
    );
  }
}
