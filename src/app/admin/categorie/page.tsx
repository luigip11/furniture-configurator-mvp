import { CategoryAdmin } from "@/components/admin/CategoryAdmin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminCategories } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <AdminHeader
        title="Categorie"
        description="Organizza le famiglie prodotto usate dal catalogo."
      />
      <CategoryAdmin initialCategories={categories} />
    </main>
  );
}
