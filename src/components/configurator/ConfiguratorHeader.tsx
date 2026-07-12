"use client";

import { useState } from "react";
import Link from "next/link";

import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

// Gestisce la barra superiore del configuratore e la simulazione della vista cliente.
export function ConfiguratorHeader() {
  const locale = useConfiguratorStore((state) => state.locale);
  const setLocale = useConfiguratorStore((state) => state.setLocale);
  const [customerPreview, setCustomerPreview] = useState(false);

  const t = dictionary[locale];

  return (
    <header className="mb-3 flex flex-col justify-between gap-2 rounded-xl border bg-white px-3 py-2.5 shadow-sm sm:px-4 md:flex-row md:items-center">
      <div>
        <p className="text-xs font-medium text-gray-500">
          Furniture Configurator MVP
        </p>
        <h1 className="text-xl font-bold leading-tight">{t.configurator}</h1>
      </div>

      <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {!customerPreview ? (
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-lg border border-blue-600 bg-blue-500 px-2 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-600 sm:px-3 sm:text-sm"
            >
              {t.adminArea}
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setCustomerPreview((isActive) => !isActive)}
            className={`whitespace-nowrap rounded-lg border px-2 py-1.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
              customerPreview
                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {customerPreview ? t.internalView : t.customerView}
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-gray-100 p-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setLocale("it")}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
              locale === "it" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            <span className="mr-1" aria-hidden="true">
              🇮🇹
            </span>
            IT
          </button>

          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
              locale === "en" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            <span className="mr-1" aria-hidden="true">
              🇬🇧
            </span>
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
