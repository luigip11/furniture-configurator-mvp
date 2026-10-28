"use client";

import { useEffect } from "react";

import type { Locale } from "@/types/configurator";

// Allinea <html lang> alla lingua mostrata, così gli screen reader usano la pronuncia corretta.
// All'uscita ripristina l'italiano del layout, lingua delle pagine non tradotte come la home.
export function useDocumentLanguage(locale: Locale) {
  useEffect(() => {
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = "it";
    };
  }, [locale]);
}
