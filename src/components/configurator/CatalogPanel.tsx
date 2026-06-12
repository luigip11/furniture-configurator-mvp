"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Minus } from "lucide-react";
import { Product } from "@/types/configurator";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

type CatalogPanelProps = {
  products: Product[];
  onCollapse?: () => void;
};

type CatalogGroup = {
  id: string;
  title: keyof typeof dictionary.it;
  products: Product[];
};

const CATALOG_GROUPS = [
  { id: "standard", titleKey: "groupStandard" },
  { id: "columns", titleKey: "groupColumns" },
  { id: "sink", titleKey: "groupSink" },
  { id: "washbasin", titleKey: "groupWashbasin" },
  { id: "laundry", titleKey: "groupLaundry" },
  { id: "systems", titleKey: "groupSystems" },
  { id: "portal", titleKey: "groupPortal" },
] satisfies { id: string; titleKey: keyof typeof dictionary.it }[];

export function CatalogPanel({ products, onCollapse }: CatalogPanelProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const locale = useConfiguratorStore((state) => state.locale);
  const addProduct = useConfiguratorStore((state) => state.addProduct);

  const t = dictionary[locale];
  const catalogGroups = useMemo(() => groupCatalogProducts(products), [products]);

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t.catalog}</h2>

        {onCollapse ? (
          <button
            type="button"
            aria-label={t.collapseCatalog}
            title={t.collapseCatalog}
            onClick={onCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <Minus size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500">{t.noProducts}</p>
      ) : (
        <div className="min-h-0 space-y-2 lg:overflow-y-auto lg:pr-1">
          {catalogGroups.map((group) => {
            const collapsed = collapsedGroups[group.id] || false;

            return (
              <div key={group.id} className="rounded-xl border bg-gray-50">
                <button
                  type="button"
                  aria-expanded={!collapsed}
                  onClick={() =>
                    setCollapsedGroups((currentGroups) => ({
                      ...currentGroups,
                      [group.id]: !collapsed,
                    }))
                  }
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                >
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">
                      {t[group.title]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {group.products.length} {t.modules}
                    </span>
                  </span>
                  <ChevronDown
                    size={17}
                    aria-hidden="true"
                    className={`shrink-0 text-gray-600 transition ${
                      collapsed ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>

                {collapsed ? null : (
                  <div className="space-y-2 border-t p-2">
                    {group.products.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        locale={locale}
                        product={product}
                        onAdd={() => addProduct(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

type CatalogProductCardProps = {
  locale: "it" | "en";
  onAdd: () => void;
  product: Product;
};

function CatalogProductCard({
  locale,
  onAdd,
  product,
}: CatalogProductCardProps) {
  const t = dictionary[locale];
  const name =
    locale === "it" ? product.name_it : product.name_en || product.name_it;

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="mb-2">
        <p className="text-sm font-medium">{name}</p>
        {product.code ? (
          <p className="text-xs text-gray-500">
            {t.code}: {product.code}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-gray-500">
          L {product.width_mm} × A {product.height_mm} × P{" "}
          {product.depth_mm} mm
        </p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        {t.add}
      </button>
    </div>
  );
}

function groupCatalogProducts(products: Product[]): CatalogGroup[] {
  const productsByGroup = new Map<string, Product[]>(
    CATALOG_GROUPS.map((group) => [group.id, []])
  );

  products.forEach((product) => {
    const groupId = getCatalogGroupId(product);
    productsByGroup.get(groupId)?.push(product);
  });

  return CATALOG_GROUPS.map((group) => ({
    id: group.id,
    title: group.titleKey,
    products: productsByGroup.get(group.id) || [],
  })).filter((group) => group.products.length > 0);
}

function getCatalogGroupId(product: Product) {
  const text = `${product.code || ""} ${product.name_it} ${
    product.name_en || ""
  }`.toLowerCase();

  if (text.includes("colonna")) return "columns";
  if (text.includes("port")) return "portal";
  if (text.includes("impiant") || text.includes("cont")) return "systems";
  if (text.includes("lavatrice") || text.includes("asciug")) return "laundry";
  if (text.includes("sottolavatoio")) return "washbasin";
  if (text.includes("sottolav")) return "sink";

  return "standard";
}
