"use client";

import { useEffect } from "react";
import { FlagFr, FlagGb, FlagIt } from "@sankyu/react-circle-flags";

import { useConfiguratorStore } from "@/store/configurator-store";

// Mostra il selettore lingua condiviso tra configuratore e area amministrativa.
export function LanguageSwitcher() {
  const locale = useConfiguratorStore((state) => state.locale);
  const hydrateLocale = useConfiguratorStore((state) => state.hydrateLocale);
  const setLocale = useConfiguratorStore((state) => state.setLocale);

  useEffect(() => {
    hydrateLocale();
  }, [hydrateLocale]);

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-xl bg-gray-100 p-1 sm:gap-2">
      <LanguageButton
        active={locale === "it"}
        ariaLabel="Italiano"
        label="IT"
        onClick={() => setLocale("it")}
      >
        <FlagIt aria-hidden="true" height={16} width={16} />
      </LanguageButton>
      <LanguageButton
        active={locale === "en"}
        ariaLabel="English"
        label="EN"
        onClick={() => setLocale("en")}
      >
        <FlagGb aria-hidden="true" height={16} width={16} />
      </LanguageButton>
      <LanguageButton
        active={locale === "fr"}
        ariaLabel="Français"
        label="FR"
        onClick={() => setLocale("fr")}
      >
        <FlagFr aria-hidden="true" height={16} width={16} />
      </LanguageButton>
    </div>
  );
}

type LanguageButtonProps = {
  active: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
};

// Rende un singolo pulsante lingua accessibile con l'icona SVG corrispondente.
function LanguageButton({
  active,
  ariaLabel,
  children,
  label,
  onClick,
}: LanguageButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg px-2 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
        active ? "bg-white shadow-sm" : "text-gray-500"
      }`}
    >
      <span className="mr-1 inline-block align-[-0.2em]" aria-hidden="true">
        {children}
      </span>
      {label}
    </button>
  );
}
