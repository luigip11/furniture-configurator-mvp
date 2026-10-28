import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkAdminAccess } from "@/lib/admin/admin-access";
import { loadAdminRows } from "@/lib/admin/admin-query";
import type { Category, Product } from "@/types/configurator";

// Ripete il controllo del proxy accanto ai dati: un matcher modificato non deve esporre le bozze.
async function assertAdminAccess() {
  if (checkAdminAccess("GET", await headers()))
    throw new Error("Accesso admin non autorizzato.");
}

// Restituisce anche l'esito: le pagine devono distinguere "nessuna categoria" da "database non raggiungibile".
export async function getAdminCategories() {
  await assertAdminAccess();
  // Le pagine admin devono leggere anche elementi nascosti dalle policy pubbliche.
  return loadAdminRows<Category>("categories", () =>
    getSupabaseAdmin()
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true }),
  );
}

// Usa la service role solo server-side per includere bozze e prodotti nascosti.
export async function getAdminProducts() {
  await assertAdminAccess();
  return loadAdminRows<Product>("products", () =>
    getSupabaseAdmin()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false }),
  );
}
