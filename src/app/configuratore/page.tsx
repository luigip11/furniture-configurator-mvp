import { CatalogPanel } from "@/components/configurator/CatalogPanel";
import { ConfiguratorHeader } from "@/components/configurator/ConfiguratorHeader";
import { ConfiguratorScene } from "@/components/configurator/ConfiguratorScene";
import { ProductPropertiesPanel } from "@/components/configurator/ProductPropertiesPanel";
import { QuotePanel } from "@/components/configurator/QuotePanel";
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
    <main className="min-h-screen bg-gray-100 p-4 text-gray-950 md:p-6">
      <div className="mx-auto max-w-7xl">
        <ConfiguratorHeader />

        <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <div className="min-h-[520px] min-w-0">
            <CatalogPanel products={products} />
          </div>

          <div className="min-h-[520px] min-w-0">
            <ConfiguratorScene />
          </div>

          <div className="min-w-0 space-y-4">
            <ProductPropertiesPanel />
            <QuotePanel />
          </div>
        </div>
      </div>
    </main>
  );
}
