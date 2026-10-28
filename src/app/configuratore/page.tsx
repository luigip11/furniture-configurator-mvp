import { ConfiguratorHeader } from "@/components/configurator/ConfiguratorHeader";
import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getSupabaseClient } from "@/lib/supabase/client";
import { loadPublishedCatalog } from "@/lib/catalog/load-catalog";

export const dynamic = "force-dynamic";

// Carica solo il catalogo pubblico e conserva lo stato di errore per l'interfaccia.
// Il client nasce dentro la query: anche una configurazione mancante diventa "catalogo non disponibile".
async function getProducts() {
  return loadPublishedCatalog(() =>
    getSupabaseClient()
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true }),
  );
}

// Mantiene utilizzabile la scena anche quando il catalogo remoto non risponde.
export default async function ConfiguratorPage() {
  const { products, failed } = await getProducts();

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-950 md:p-6 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex min-h-0 w-full flex-col lg:h-full">
        <div className="shrink-0">
          <ConfiguratorHeader />
        </div>

        <ConfiguratorWorkspace products={products} catalogFailed={failed} />
      </div>
    </main>
  );
}
