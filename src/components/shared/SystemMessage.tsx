"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, SearchX } from "lucide-react";

import { useDocumentLanguage } from "@/components/shared/useDocumentLanguage";
import { systemDictionary } from "@/lib/i18n/system-dictionary";
import { useConfiguratorStore } from "@/store/configurator-store";

type SystemMessageProps =
  | { variant: "error"; digest?: string; onRetry: () => void }
  | { variant: "notFound" };

// Pagina di cortesia per errori imprevisti e indirizzi inesistenti, nello stile della home e nella lingua scelta.
export function SystemMessage(props: SystemMessageProps) {
  const locale = useConfiguratorStore((state) => state.locale);
  const hydrateLocale = useConfiguratorStore((state) => state.hydrateLocale);
  const t = systemDictionary[locale];
  const isError = props.variant === "error";
  const Icon = isError ? AlertTriangle : SearchX;

  useDocumentLanguage(locale);
  // Queste pagine non hanno il selettore lingua: leggono comunque la preferenza salvata.
  useEffect(() => {
    hydrateLocale();
  }, [hydrateLocale]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 text-gray-950 sm:p-6">
      <section className="w-full max-w-xl rounded-3xl border bg-white p-6 text-center shadow-sm sm:p-8">
        <span
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            isError ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>

        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
          {isError ? t.errorTitle : t.notFoundTitle}
        </h1>
        <p className="mb-6 text-gray-600">
          {isError ? t.errorDescription : t.notFoundDescription}
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {props.variant === "error" ? (
            <button
              type="button"
              onClick={props.onRetry}
              className="inline-flex justify-center rounded-xl bg-gray-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {t.retry}
            </button>
          ) : (
            <Link
              href="/configuratore"
              className="inline-flex justify-center rounded-xl bg-gray-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {t.openConfigurator}
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            {t.backHome}
          </Link>
        </div>

        {props.variant === "error" && props.digest ? (
          <p className="mt-6 break-all text-xs text-gray-400">
            {t.errorCode(props.digest)}
          </p>
        ) : null}
      </section>
    </main>
  );
}
