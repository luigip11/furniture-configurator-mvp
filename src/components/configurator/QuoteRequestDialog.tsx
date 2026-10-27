"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ConfiguratorItem, Locale } from "@/types/configurator";
import {
  createDemoQuoteRequest,
  type DemoQuoteRequest,
} from "@/lib/configurator/quote-request";
import { quoteDictionary } from "@/lib/i18n/quote-dictionary";
import { QuoteRequestComposition } from "./QuoteRequestComposition";

type Props = { items: ConfiguratorItem[]; locale: Locale; onClose: () => void };

// Valida contatti e allegato senza chiamare servizi o salvare la sessione: è una demo esplicita.
export function QuoteRequestDialog({ items, locale, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<DemoQuoteRequest | null>(null);
  const [error, setError] = useState(false);
  const t = quoteDictionary[locale];

  // Chiude prima della rimozione dal DOM, così il browser può ripristinare il focus sul pulsante iniziale.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  // Annuncia l'esito anche a chi usa tastiera o lettore di schermo.
  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  // Conserva il modulo se i dati non sono validi; chiudendo, elimina la bozza dalla memoria.
  function simulateRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      setResult(
        createDemoQuoteRequest(
          {
            name: String(data.get("name") || ""),
            email: String(data.get("email") || ""),
            phone: String(data.get("phone") || ""),
            message: String(data.get("message") || ""),
            confirmed: data.get("confirmed") === "on",
          },
          items,
          locale,
        ),
      );
      setError(false);
    } catch {
      setError(true);
    }
  }

  // Scarica solo su richiesta una copia dimostrativa, marcata come non inviata.
  function downloadDemo() {
    if (!result) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "preventivo-demo-non-inviato.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="quote-request-title"
      aria-describedby="quote-demo-notice"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 text-gray-950 shadow-2xl backdrop:bg-black/60"
    >
      <header className="flex items-start justify-between gap-3 border-b p-5">
        <h2 id="quote-request-title" className="text-xl font-semibold">
          {t.requestTitle}
        </h2>
        <button
          type="button"
          aria-label={t.close}
          onClick={onClose}
          className="rounded-lg border p-2 focus:ring-2 focus:ring-blue-600"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>
      <div className="space-y-5 p-5">
        <p
          id="quote-demo-notice"
          className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950"
        >
          {t.demo}
        </p>
        {result ? (
          <div
            ref={resultRef}
            tabIndex={-1}
            role="status"
            className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <p className="font-semibold">{t.simulated}</p>
            <button
              type="button"
              onClick={downloadDemo}
              className="rounded-lg border border-blue-300 bg-white px-3 py-2 font-semibold"
            >
              {t.downloadDemo}
            </button>
          </div>
        ) : (
          <form onSubmit={simulateRequest} className="space-y-4">
            <p className="text-sm text-gray-600">{t.requestHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                {t.contactName}
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                {t.email}
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                {t.phone}
                <input
                  name="phone"
                  type="tel"
                  maxLength={40}
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                {t.message}
                <textarea
                  name="message"
                  maxLength={2000}
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                name="confirmed"
                type="checkbox"
                required
                className="mt-1"
              />
              <span>{t.confirmDetails}</span>
            </label>
            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
              >
                {t.invalid}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {t.simulate}
            </button>
          </form>
        )}
        <QuoteRequestComposition items={items} locale={locale} />
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
        >
          {t.close}
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
