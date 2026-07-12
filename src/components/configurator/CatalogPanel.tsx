"use client";

import { useMemo, useState } from "react";
import { ChevronDown, GripVertical, Minus, Search, X } from "lucide-react";
import { Product } from "@/types/configurator";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

export type CatalogCollapsedGroups = Record<string, boolean>;

type CatalogPanelProps = {
  collapsedGroups: CatalogCollapsedGroups;
  products: Product[];
  onCollapse?: () => void;
  onToggleGroup: (groupId: string, collapsed: boolean) => void;
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
  { id: "wallUnits", titleKey: "groupWallUnits" },
  { id: "systems", titleKey: "groupSystems" },
  { id: "portal", titleKey: "groupPortal" },
] satisfies { id: string; titleKey: keyof typeof dictionary.it }[];

// Crea lo stato iniziale del catalogo con tutte le sezioni chiuse.
export function createDefaultCatalogCollapsedGroups(): CatalogCollapsedGroups {
  return Object.fromEntries(CATALOG_GROUPS.map((group) => [group.id, true]));
}

export function CatalogPanel({
  collapsedGroups,
  products,
  onCollapse,
  onToggleGroup,
}: CatalogPanelProps) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const locale = useConfiguratorStore((state) => state.locale);
  const addProduct = useConfiguratorStore((state) => state.addProduct);

  const t = dictionary[locale];
  const normalizedSearchText = searchText.trim().toLowerCase();
  const filteredProducts = useMemo(
    () => filterCatalogProducts(products, normalizedSearchText),
    [normalizedSearchText, products]
  );
  const catalogGroups = useMemo(
    () => groupCatalogProducts(filteredProducts),
    [filteredProducts]
  );
  const hasActiveSearch = normalizedSearchText.length > 0;

  // Alterna la ricerca mantenendo il catalogo compatto quando non serve.
  function toggleSearch() {
    setSearchExpanded((expanded) => {
      if (expanded) {
        setSearchText("");
        return false;
      }

      return true;
    });
  }

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {searchExpanded ? (
            <div className="relative">
              <input
                autoFocus
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="catalog-search-input h-9 w-full rounded-lg border border-gray-300 bg-white px-3 pr-9 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder={locale === "it" ? "Cerca prodotti" : "Search products"}
              />
              {searchText ? (
                <button
                  type="button"
                  aria-label={locale === "it" ? "Cancella ricerca" : "Clear search"}
                  title={locale === "it" ? "Cancella ricerca" : "Clear search"}
                  onClick={() => setSearchText("")}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : (
            <h2 className="truncate text-lg font-semibold">{t.catalog}</h2>
          )}
        </div>

        <button
          type="button"
          aria-label={searchExpanded ? t.catalog : locale === "it" ? "Cerca" : "Search"}
          title={searchExpanded ? t.catalog : locale === "it" ? "Cerca" : "Search"}
          onClick={toggleSearch}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <Search size={16} aria-hidden="true" />
        </button>

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

      {filteredProducts.length === 0 ? (
        <p className="text-sm text-gray-500">{t.noProducts}</p>
      ) : (
        <div className="min-h-0 space-y-2 lg:overflow-y-auto lg:pr-1">
          {catalogGroups.map((group) => {
            const collapsed = hasActiveSearch
              ? false
              : collapsedGroups[group.id] ?? true;

            return (
              <div key={group.id} className="rounded-xl border bg-gray-50">
                <button
                  type="button"
                  aria-expanded={!collapsed}
                  onClick={() => onToggleGroup(group.id, !collapsed)}
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
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData(
          "application/x-configurator-product-id",
          product.id
        );
        event.dataTransfer.setData("text/plain", product.id);
      }}
      className="cursor-grab rounded-lg border bg-white p-3 active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start gap-2">
        <GripVertical
          className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium">{name}</p>
          {product.code ? (
            <p className="truncate text-xs text-gray-500" title={product.code}>
              {t.code}: {product.code}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-gray-500">
            L {product.width_mm} × A {product.height_mm} × P{" "}
            {product.depth_mm} mm
          </p>
        </div>
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

// Filtra i prodotti su nome, traduzione e codice senza alterare il dato sorgente.
function filterCatalogProducts(products: Product[], searchText: string) {
  if (!searchText) return products;

  return products.filter((product) => {
    const searchableText = `${product.name_it} ${product.name_en || ""} ${
      product.code || ""
    }`.toLowerCase();

    return searchableText.includes(searchText);
  });
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
  if (text.includes("pensile")) return "wallUnits";
  if (text.includes("impiant") || text.includes("cont")) return "systems";
  if (text.includes("lavatrice") || text.includes("asciug")) return "laundry";
  if (text.includes("sottolavatoio")) return "washbasin";
  if (text.includes("sottolav")) return "sink";

  return "standard";
}
