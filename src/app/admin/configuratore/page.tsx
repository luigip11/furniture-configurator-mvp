import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfiguratorAdmin } from "@/components/admin/ConfiguratorAdmin";

export const dynamic = "force-dynamic";

// Mostra la console dedicata ai comportamenti runtime del configuratore.
export default function AdminConfiguratorPage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <AdminHeader
        title="Configuratore"
        description="Gestisci i comportamenti della scena e apri rapidamente il configuratore cliente."
      />
      <ConfiguratorAdmin />
    </main>
  );
}
