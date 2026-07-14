"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, FolderTree, LayoutDashboard, MonitorCog } from "lucide-react";

type AdminHeaderProps = {
  title: string;
  description: string;
};

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Panoramica" },
  { href: "/admin/prodotti", icon: Boxes, label: "Prodotti" },
  { href: "/admin/categorie", icon: FolderTree, label: "Categorie" },
  { href: "/admin/configuratore", icon: MonitorCog, label: "Configuratore" },
];

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white/95 shadow-sm shadow-gray-200/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Furniture Configurator MVP
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              {description}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
            Admin console
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white text-gray-950 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:bg-white/80 hover:text-gray-950"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
