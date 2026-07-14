"use client";

import { useMemo } from "react";
import { Download, Trash2 } from "lucide-react";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";
import { downloadTechnicalSheetPdf } from "@/lib/configurator/technical-sheet-pdf";
import {
  DEFAULT_MODULE_VARIANT,
  getDoorConfigurationSummary,
  getModuleVariantLabel,
} from "@/types/configurator";
import {
  getModuleBillOfMaterials,
  hasConfigurableModuleVariants,
} from "@/lib/configurator/module-technical-catalog";

export function QuotePanel() {
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const clear = useConfiguratorStore((state) => state.clear);
  const removeItem = useConfiguratorStore((state) => state.removeItem);
  const selectItem = useConfiguratorStore((state) => state.selectItem);

  const t = dictionary[locale];

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [items]);

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t.quote}</h2>

        {items.length > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clear}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              {t.clear}
            </button>

            <button
              type="button"
              aria-label={t.downloadTechnicalSheet}
              title={t.downloadTechnicalSheet}
              onClick={() => downloadTechnicalSheetPdf(items, locale)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Download size={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{t.noItems}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const name =
              locale === "it" ? item.nameIt : item.nameEn || item.nameIt;
            const variantLabel = getModuleVariantLabel(
              item.variantKey || DEFAULT_MODULE_VARIANT,
              locale
            );
            const doorConfigurationSummary = getDoorConfigurationSummary(
              item.doorConfiguration,
              locale
            );
            const bomCount = getModuleBillOfMaterials(
              item.code,
              item.variantKey || DEFAULT_MODULE_VARIANT
            ).length;

            return (
              <div
                key={item.id}
                className={`relative flex items-start justify-between gap-3 rounded-xl p-3 pb-11 transition ${
                  selectedItemId === item.id
                    ? "bg-blue-50 ring-2 ring-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectItem(item.id)}
                  className="min-w-0 flex-1 text-left focus:outline-none"
                >
                  <p
                    className="truncate text-sm font-bold text-gray-950"
                    title={name}
                  >
                    {index + 1}. {name}
                  </p>
                  {item.code ? (
                    <p className="mt-1 truncate text-xs" title={item.code}>
                      <span className="font-semibold text-black">{t.code}: </span>
                      <span className="text-gray-500">{item.code}</span>
                    </p>
                  ) : null}
                  {hasConfigurableModuleVariants(item.code) ? (
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-black">
                        {t.variant}:{" "}
                      </span>
                      <span className="text-gray-500">{variantLabel}</span>
                    </p>
                  ) : null}
                  {doorConfigurationSummary.length > 0 ? (
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-black">
                        {t.doorConfiguration}:{" "}
                      </span>
                      <span className="text-gray-500">
                        {doorConfigurationSummary.join(" · ")}
                      </span>
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs">
                    <span className="font-semibold text-black">
                      {t.measurements}:{" "}
                    </span>
                    <span className="text-gray-500">
                      L {item.widthMm} × A {item.heightMm} × P {item.depthMm} mm
                    </span>
                  </p>
                  {bomCount > 0 ? (
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-black">
                        {t.technicalComponents}:{" "}
                      </span>
                      <span className="text-gray-500">{bomCount}</span>
                    </p>
                  ) : null}
                </button>

                <p className="absolute bottom-3 left-3 text-sm font-medium text-gray-700">
                  {item.price ? `€ ${item.price}` : "-"}
                </p>

                <button
                  type="button"
                  aria-label={`${t.remove}: ${name}`}
                  title={`${t.remove}: ${name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
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
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            {t.requestQuote}
          </button>
        </div>
      )}
    </section>
  );
}
