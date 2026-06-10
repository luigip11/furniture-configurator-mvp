"use client";

import { Product } from "@/types/configurator";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

type CatalogPanelProps = {
  products: Product[];
};

export function CatalogPanel({ products }: CatalogPanelProps) {
  const locale = useConfiguratorStore((state) => state.locale);
  const addProduct = useConfiguratorStore((state) => state.addProduct);

  const t = dictionary[locale];

  return (
    <aside className="h-full rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{t.catalog}</h2>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500">{t.noProducts}</p>
      ) : (
        <div className="space-y-3">
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
