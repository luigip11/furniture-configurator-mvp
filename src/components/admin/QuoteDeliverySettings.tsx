"use client";

import { LockKeyhole } from "lucide-react";
import { quoteDictionary } from "@/lib/i18n/quote-dictionary";
import type { Locale } from "@/types/configurator";

// Riserva lo spazio al futuro destinatario, senza simulare una configurazione email operativa.
export function QuoteDeliverySettings({ locale }: { locale: Locale }) {
  const t = quoteDictionary[locale];
  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      aria-labelledby="quote-delivery-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="quote-delivery-title" className="text-lg font-semibold">
          {t.recipientEmail}
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
          <LockKeyhole size={14} aria-hidden="true" />
          {t.futureFeature}
        </span>
      </div>
      <label
        htmlFor="future-quote-recipient"
        className="mt-4 block text-sm font-medium"
      >
        {t.email}
      </label>
      <input
        id="future-quote-recipient"
        type="email"
        disabled
        placeholder="preventivi@azienda.it"
        aria-describedby="future-quote-hint"
        className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-100 px-3 py-2 text-sm text-gray-500"
      />
      <p
        id="future-quote-hint"
        className="mt-3 text-sm leading-relaxed text-gray-500"
      >
        {t.futureHint}
      </p>
    </section>
  );
}
