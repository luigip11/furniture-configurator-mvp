"use client";

import type { ConfiguratorItem, Locale } from "@/types/configurator";
import {
  getDoorConfigurationSummary,
  getModuleVariantLabel,
} from "@/types/configurator";
import { getEffectiveDoorConfiguration } from "@/lib/configurator/module-capabilities";
import { canConfigureBaseFinish } from "@/lib/configurator/parametric-bom";
import { quoteDictionary } from "@/lib/i18n/quote-dictionary";
import { technicalDictionary } from "@/lib/i18n/technical-dictionary";
import { QuoteItemPrice, QuotePricingSummary } from "./QuotePricing";

// Mostra la fotografia esatta inclusa nella simulazione, con una riga per ogni modulo.
export function QuoteRequestComposition({
  items,
  locale,
}: {
  items: ConfiguratorItem[];
  locale: Locale;
}) {
  const technical = technicalDictionary[locale];
  return (
    <section
      className="space-y-3 rounded-xl border bg-gray-50 p-4"
      aria-label={quoteDictionary[locale].attachment}
    >
      <h3 className="font-semibold">
        {quoteDictionary[locale].attachment} · {items.length}
      </h3>
      <ol className="max-h-64 space-y-3 overflow-y-auto break-words pr-2">
        {items.map((item, index) => (
          <li key={item.id} className="border-b pb-3 text-sm last:border-0">
            <p className="font-semibold">
              {index + 1}.{" "}
              {locale === "it" ? item.nameIt : item.nameEn || item.nameIt}
            </p>
            <p className="text-xs text-gray-600">{item.code}</p>
            <p>
              L {item.widthMm} × A {item.heightMm} × P {item.depthMm} mm
            </p>
            <p>
              {getModuleVariantLabel(
                item.productVariantKey || item.variantKey,
                locale,
              )}
            </p>
            {canConfigureBaseFinish(item.code) ? (
              <p>
                {item.baseFinishConfiguration?.hasTop
                  ? technical.topIncluded
                  : technical.topExcluded}
              </p>
            ) : null}
            <p>
              {getDoorConfigurationSummary(
                getEffectiveDoorConfiguration(item),
                locale,
              ).join(" · ") || technical.noDoors}
            </p>
            <QuoteItemPrice item={item} locale={locale} />
          </li>
        ))}
      </ol>
      <QuotePricingSummary items={items} locale={locale} />
    </section>
  );
}
