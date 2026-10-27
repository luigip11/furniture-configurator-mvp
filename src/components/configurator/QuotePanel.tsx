"use client";

import { getEffectiveDoorConfiguration } from "@/lib/configurator/module-capabilities";
import { canConfigureBaseFinish } from "@/lib/configurator/parametric-bom";
import { getTechnicalIssue } from "@/lib/configurator/technical-validation";
import { technicalDictionary } from "@/lib/i18n/technical-dictionary";
import { useState } from "react";
import { Download, List, Trash2 } from "lucide-react";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";
import { quoteDictionary } from "@/lib/i18n/quote-dictionary";
import { QuoteItemPrice, QuotePricingSummary } from "./QuotePricing";
import { QuoteRequestDialog } from "./QuoteRequestDialog";
import type { ConfiguratorItem } from "@/types/configurator";
import {
  downloadAggregatedTechnicalSheetPdf,
  downloadTechnicalSheetPdf,
} from "@/lib/configurator/technical-sheet-pdf";
import {
  DEFAULT_MODULE_VARIANT,
  getDoorConfigurationSummary,
  getModuleVariantLabel,
} from "@/types/configurator";
import {
  getItemBillOfMaterials,
  hasConfigurableModuleVariants,
} from "@/lib/configurator/module-technical-catalog";

// Riepiloga la composizione e apre la richiesta dimostrativa su una fotografia stabile dei moduli.
export function QuotePanel() {
  const [requestItems, setRequestItems] = useState<ConfiguratorItem[] | null>(
    null,
  );
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const clear = useConfiguratorStore((state) => state.clear);
  const removeItem = useConfiguratorStore((state) => state.removeItem);
  const selectItem = useConfiguratorStore((state) => state.selectItem);

  const t = dictionary[locale];
  const technical = technicalDictionary[locale];
  const exportBlocked = items.some((item) => getTechnicalIssue(item));

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
              disabled={exportBlocked}
              onClick={() => downloadTechnicalSheetPdf(items, locale)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Download size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t.downloadAggregateTechnicalSheet}
              title={t.downloadAggregateTechnicalSheet}
              disabled={exportBlocked}
              onClick={() => downloadAggregatedTechnicalSheetPdf(items, locale)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {exportBlocked ? (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"
        >
          {technical.exportBlocked}
        </p>
      ) : null}
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{t.noItems}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const name =
              locale === "it" ? item.nameIt : item.nameEn || item.nameIt;
            const variantLabel = getModuleVariantLabel(
              item.productVariantKey ||
                item.variantKey ||
                DEFAULT_MODULE_VARIANT,
              locale,
            );
            const doorConfigurationSummary = getDoorConfigurationSummary(
              getEffectiveDoorConfiguration(item),
              locale,
            );
            const bomCount = getItemBillOfMaterials(item).length;

            return (
              <div
                key={item.id}
                className={`relative rounded-xl p-3 transition ${
                  selectedItemId === item.id
                    ? "bg-blue-50 ring-2 ring-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectItem(item.id)}
                  className="block w-full min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <p
                    className="truncate text-sm font-bold text-gray-950"
                    title={name}
                  >
                    {index + 1}. {name}
                  </p>
                  {item.code ? (
                    <p className="mt-1 truncate text-xs" title={item.code}>
                      <span className="font-semibold text-black">
                        {t.code}:{" "}
                      </span>
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
                  {canConfigureBaseFinish(item.code) ? (
                    <p className="mt-1 text-xs text-gray-600">
                      {item.baseFinishConfiguration?.hasTop
                        ? technical.topIncluded
                        : technical.topExcluded}{" "}
                      · {doorConfigurationSummary[0] || technical.noDoors}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs">
                    <span className="font-semibold text-black">
                      {technical.nominalDimensions}:{" "}
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

                <div className="mt-3 min-h-8 pr-10">
                  <QuoteItemPrice item={item} locale={locale} />
                </div>

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

          <QuotePricingSummary items={items} locale={locale} />

          <button
            type="button"
            onClick={() => setRequestItems(structuredClone(items))}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            {t.requestQuote}
          </button>
          <p className="text-xs text-amber-800">
            {quoteDictionary[locale].demo}
          </p>
        </div>
      )}
      {requestItems ? (
        <QuoteRequestDialog
          items={requestItems}
          locale={locale}
          onClose={() => setRequestItems(null)}
        />
      ) : null}
    </section>
  );
}
