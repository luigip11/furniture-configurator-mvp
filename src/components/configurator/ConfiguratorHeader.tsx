"use client";

import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

export function ConfiguratorHeader() {
  const locale = useConfiguratorStore((state) => state.locale);
  const setLocale = useConfiguratorStore((state) => state.setLocale);

  const t = dictionary[locale];

  return (
    <header className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row md:items-center">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Furniture Configurator MVP
        </p>
        <h1 className="text-2xl font-bold">{t.configurator}</h1>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setLocale("it")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            locale === "it" ? "bg-white shadow-sm" : "text-gray-500"
          }`}
        >
          IT
        </button>

        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            locale === "en" ? "bg-white shadow-sm" : "text-gray-500"
          }`}
        >
          EN
        </button>
      </div>
    </header>
  );
}
