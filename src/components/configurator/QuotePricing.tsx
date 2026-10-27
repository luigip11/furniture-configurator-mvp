"use client";

import { dictionary } from "@/lib/i18n/dictionary";
import { quoteDictionary } from "@/lib/i18n/quote-dictionary";
import {
  formatQuoteMoney,
  getItemPrice,
  getQuotePricing,
} from "@/lib/configurator/quote-pricing";
import type { ConfiguratorItem, Locale } from "@/types/configurator";

// Evidenzia i prezzi mancanti e separa il riferimento di catalogo dal prezzo personalizzato.
export function QuoteItemPrice({
  item,
  locale,
}: {
  item: ConfiguratorItem;
  locale: Locale;
}) {
  const price = getItemPrice(item);
  const t = quoteDictionary[locale];
  return (
    <div className="mt-2 text-sm">
      {price.status === "catalog" ? (
        <p className="font-medium text-gray-700">
          {formatQuoteMoney(price.amountCents!, locale)}
        </p>
      ) : (
        <>
          <p className="font-semibold text-amber-800">
            {price.status === "missing" ? t.missingPrice : t.customPrice}
          </p>
          {price.catalogPrice !== null ? (
            <p className="text-xs text-gray-500">
              {t.catalogPrice}:{" "}
              {formatQuoteMoney(Math.round(price.catalogPrice * 100), locale)}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

// Il totale parziale esclude gli importi non determinabili e non equivale a un'offerta finale.
export function QuotePricingSummary({
  items,
  locale,
}: {
  items: ConfiguratorItem[];
  locale: Locale;
}) {
  const price = getQuotePricing(items);
  const t = quoteDictionary[locale];
  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex items-center justify-between gap-2 font-semibold">
        <p>{price.partial ? t.partialTotal : dictionary[locale].total}</p>
        <p>
          {price.pricedCount ? formatQuoteMoney(price.totalCents, locale) : "—"}
        </p>
      </div>
      {price.partial ? (
        <p className="text-xs text-amber-800">{t.pendingPrices}</p>
      ) : null}
      <p className="text-xs text-gray-500">{t.priceNotice}</p>
      <details className="text-xs leading-relaxed text-gray-600">
        <summary className="cursor-pointer font-medium">
          {t.priceDetails}
        </summary>
        <p className="mt-2">{t.priceRules}</p>
      </details>
    </div>
  );
}
