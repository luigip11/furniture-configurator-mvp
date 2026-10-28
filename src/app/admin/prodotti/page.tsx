import { ProductAdmin } from "@/components/admin/ProductAdmin";
import { AdminDataError } from "@/components/admin/AdminDataError";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

// Senza prodotti e categorie completi il form resta nascosto: con un elenco categorie
// vuoto, salvare un prodotto potrebbe cancellarne la categoria.
export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <AdminHeader page="products" />
      {products.failed || categories.failed ? (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <AdminDataError />
        </section>
      ) : (
        <ProductAdmin
          initialProducts={products.rows}
          categories={categories.rows}
        />
      )}
    </main>
  );
}
