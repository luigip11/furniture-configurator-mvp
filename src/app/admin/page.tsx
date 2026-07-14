import Link from "next/link";
import {
  Boxes,
  Eye,
  FilePenLine,
  FolderTree,
  MonitorCog,
  PackageCheck,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  const publishedProducts = products.filter((product) => product.is_published);
  const draftProducts = products.length - publishedProducts.length;

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <AdminHeader
        title="Area admin"
        description="Gestione rapida del catalogo prodotti e delle categorie visibili nel configuratore."
      />

      <section className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetric
            icon={Boxes}
            label="Prodotti totali"
            value={products.length}
          />
          <AdminMetric
            icon={PackageCheck}
            label="Pubblicati"
            value={publishedProducts.length}
          />
          <AdminMetric icon={FilePenLine} label="Bozze" value={draftProducts} />
          <AdminMetric
            icon={FolderTree}
            label="Categorie"
            value={categories.length}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Link
            href="/admin/prodotti"
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Catalogo</p>
                <h2 className="mt-1 text-xl font-semibold">Prodotti</h2>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-700 text-white shadow-sm transition group-hover:bg-gray-800">
                <Boxes className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-gray-600">
                Gestisci moduli, misure, prezzi e visibilità nel configuratore.
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <AdminMiniStat label="Totali" value={products.length} />
                <AdminMiniStat label="Online" value={publishedProducts.length} />
                <AdminMiniStat label="Bozze" value={draftProducts} />
              </dl>
            </div>
          </Link>

          <Link
            href="/admin/categorie"
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Archivio</p>
                <h2 className="mt-1 text-xl font-semibold">Categorie</h2>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 text-gray-800 transition group-hover:bg-gray-300">
                <FolderTree className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-gray-600">
                Ordina le famiglie prodotto e mantieni il catalogo leggibile.
              </p>
              <div className="mt-5">
                <AdminMiniStat
                  label="Categorie disponibili"
                  value={categories.length}
                />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/configuratore"
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Esperienza</p>
                <h2 className="mt-1 text-xl font-semibold">Configuratore</h2>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-100">
                <MonitorCog className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-gray-600">
                Regola movimento dei moduli e visibilità iniziale dei dati in
                scena.
              </p>
              <div className="mt-5">
                <AdminMiniStat label="Settings" value={2} />
              </div>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Eye className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold">Stato catalogo</h2>
              <p className="text-sm text-gray-600">
                {publishedProducts.length > 0
                  ? `${publishedProducts.length} moduli sono visibili nel configuratore.`
                  : "Nessun modulo pubblicato nel configuratore."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

type AdminMetricProps = {
  icon: typeof Boxes;
  label: string;
  value: number;
};

function AdminMetric({ icon: Icon, label, value }: AdminMetricProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function AdminMiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l-2 border-gray-300 pl-3">
      <dt className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  );
}
