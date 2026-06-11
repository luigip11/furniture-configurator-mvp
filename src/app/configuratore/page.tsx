import { ConfiguratorHeader } from "@/components/configurator/ConfiguratorHeader";
import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/types/configurator";

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading products", error);
    return [];
  }

  return data || [];
}

export default async function ConfiguratorPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-950 md:p-6 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex min-h-0 max-w-7xl flex-col lg:h-full">
        <div className="shrink-0">
          <ConfiguratorHeader />
        </div>

        <ConfiguratorWorkspace products={products} />
      </div>
    </main>
  );
}
