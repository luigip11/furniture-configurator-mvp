import { supabase } from "@/lib/supabase/client";
import type { Category, Product } from "@/types/configurator";

export async function getAdminCategories(): Promise<Category[]> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products", error);
    return [];
  }

  return data || [];
}
