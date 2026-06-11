"use client";

import { Minus } from "lucide-react";
import { Product } from "@/types/configurator";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

type CatalogPanelProps = {
  products: Product[];
  onCollapse?: () => void;
};

export function CatalogPanel({ products, onCollapse }: CatalogPanelProps) {
  const locale = useConfiguratorStore((state) => state.locale);
  const addProduct = useConfiguratorStore((state) => state.addProduct);

  const t = dictionary[locale];

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t.catalog}</h2>

        {onCollapse ? (
          <button
            type="button"
            aria-label="Comprimi catalogo"
            title="Comprimi catalogo"
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
        <div className="min-h-0 space-y-3 lg:overflow-y-auto lg:pr-1">
          {products.map((product) => {
            const name =
              locale === "it"
                ? product.name_it
                : product.name_en || product.name_it;

            return (
              <div key={product.id} className="rounded-xl border bg-gray-50 p-3">
                <div className="mb-2">
                  <p className="font-medium">{name}</p>
                  {product.code ? (
                    <p className="text-xs text-gray-500">
                      {t.code}: {product.code}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-gray-500">
                    {product.width_mm} × {product.height_mm} ×{" "}
                    {product.depth_mm} mm
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addProduct(product)}
                  className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  {t.add}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
