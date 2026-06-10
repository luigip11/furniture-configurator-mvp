"use client";

import { useMemo } from "react";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

export function QuotePanel() {
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const clear = useConfiguratorStore((state) => state.clear);

  const t = dictionary[locale];

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [items]);

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t.quote}</h2>

        {items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
          >
            {t.clear}
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{t.noItems}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const name =
              locale === "it" ? item.nameIt : item.nameEn || item.nameIt;

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.widthMm} × {item.heightMm} × {item.depthMm} mm
                  </p>
                </div>

                <p className="text-sm font-medium">
                  {item.price ? `€ ${item.price}` : "-"}
                </p>
              </div>
            );
          })}

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{t.total}</p>
              <p className="font-semibold">
                {total > 0 ? `€ ${total.toFixed(2)}` : "-"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {t.requestQuote}
          </button>
        </div>
      )}
    </section>
  );
}
