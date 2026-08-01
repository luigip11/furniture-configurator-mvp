import { ProductAdmin } from "@/components/admin/ProductAdmin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <AdminHeader page="products" />
      <ProductAdmin initialProducts={products} categories={categories} />
    </main>
  );
}
