import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkAdminAccess } from "@/lib/admin/admin-access";
import type { Category, Product } from "@/types/configurator";

// Ripete il controllo del proxy accanto ai dati: un matcher modificato non deve esporre le bozze.
async function assertAdminAccess() {
  if (checkAdminAccess("GET", await headers()))
    throw new Error("Accesso admin non autorizzato.");
}

export async function getAdminCategories(): Promise<Category[]> {
  await assertAdminAccess();
  // Le pagine admin devono leggere anche elementi nascosti dalle policy pubbliche.
  const { data, error } = await getSupabaseAdmin()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading categories", error);
    return [];
  }

  return data || [];
}

export async function getAdminProducts(): Promise<Product[]> {
  await assertAdminAccess();
  // Usa la service role solo server-side per includere bozze e prodotti nascosti.
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products", error);
    return [];
  }

  return data || [];
}
