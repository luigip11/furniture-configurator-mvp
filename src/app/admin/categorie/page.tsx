import { CategoryAdmin } from "@/components/admin/CategoryAdmin";
import { AdminDataError } from "@/components/admin/AdminDataError";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminCategories } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

// Mostra l'errore invece di un elenco vuoto, che farebbe pensare a categorie cancellate.
export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <AdminHeader page="categories" />
      {categories.failed ? (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <AdminDataError />
        </section>
      ) : (
        <CategoryAdmin initialCategories={categories.rows} />
      )}
    </main>
  );
}
