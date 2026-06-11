import Link from "next/link";
import { Boxes, FolderTree } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  const publishedProducts = products.filter((product) => product.is_published);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <AdminHeader
        title="Area admin"
        description="Gestione rapida del catalogo prodotti e delle categorie visibili nel configuratore."
      />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Link
          href="/admin/prodotti"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Catalogo</p>
              <h2 className="mt-1 text-xl font-semibold">Prodotti</h2>
            </div>
            <Boxes className="h-6 w-6 text-gray-500" aria-hidden="true" />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">Totali</dt>
              <dd className="mt-1 text-2xl font-semibold">{products.length}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">Pubblicati</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {publishedProducts.length}
              </dd>
            </div>
          </dl>
        </Link>

        <Link
          href="/admin/categorie"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Archivio</p>
              <h2 className="mt-1 text-xl font-semibold">Categorie</h2>
            </div>
            <FolderTree className="h-6 w-6 text-gray-500" aria-hidden="true" />
          </div>
          <div className="mt-5 rounded-lg bg-gray-50 p-3 text-sm">
            <p className="text-gray-500">Categorie disponibili</p>
            <p className="mt-1 text-2xl font-semibold">{categories.length}</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
