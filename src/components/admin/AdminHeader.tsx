import Link from "next/link";

type AdminHeaderProps = {
  title: string;
  description: string;
};

const navItems = [
  { href: "/admin", label: "Panoramica" },
  { href: "/admin/prodotti", label: "Prodotti" },
  { href: "/admin/categorie", label: "Categorie" },
  { href: "/configuratore", label: "Configuratore" },
];

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Furniture Configurator MVP
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            {description}
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
