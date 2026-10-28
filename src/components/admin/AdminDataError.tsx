"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { adminDictionary } from "@/lib/i18n/admin-dictionary";
import { useConfiguratorStore } from "@/store/configurator-store";

// Sostituisce elenchi vuoti fuorvianti quando il database non risponde; Riprova rilegge i dati senza ricaricare la pagina.
export function AdminDataError() {
  const locale = useConfiguratorStore((state) => state.locale);
  const t = adminDictionary[locale];
  const router = useRouter();
  const [retrying, startRetry] = useTransition();

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex min-w-0 items-start gap-2">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <span>{t.dataLoadError}</span>
      </p>
      <button
        type="button"
        disabled={retrying}
        onClick={() => startRetry(() => router.refresh())}
        className="shrink-0 self-start rounded-lg border border-amber-400 bg-white px-3 py-2 font-semibold transition hover:bg-amber-100 disabled:opacity-50 sm:self-auto"
      >
        {retrying ? t.retrying : t.retry}
      </button>
    </div>
  );
}
