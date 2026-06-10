import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6 text-gray-950">
      <section className="max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-500">
          Furniture Configurator MVP
        </p>

        <h1 className="mb-4 text-3xl font-bold">
          Configuratore arredamento modulare
        </h1>

        <p className="mb-6 text-gray-600">
          Prima versione MVP con catalogo, scena 3D semplificata e riepilogo
          configurazione.
        </p>

        <Link
          href="/configuratore"
          className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Apri configuratore
        </Link>
      </section>
    </main>
  );
}
