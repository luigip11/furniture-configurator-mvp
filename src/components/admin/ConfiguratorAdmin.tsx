"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowUpRight, Eye, Move, ShieldCheck } from "lucide-react";

import { useConfiguratorStore } from "@/store/configurator-store";

// Espone i setting operativi del configuratore senza mescolarli alla gestione catalogo.
export function ConfiguratorAdmin() {
  const settings = useConfiguratorStore((state) => state.settings);
  const hydrateSettings = useConfiguratorStore((state) => state.hydrateSettings);
  const updateSettings = useConfiguratorStore((state) => state.updateSettings);

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Comportamento scena
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Impostazioni configuratore
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Default controllato
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <SettingToggle
              checked={settings.allowFreeMovementInOpenScene}
              description="Quando attivo, gli elementi possono essere trascinati liberamente sul piano X/Z solo nella vista Aperta. Nelle viste Filo parete e Filo fronte restano sempre vincolati."
              icon={Move}
              label="Movimento libero in modalità Aperta"
              onChange={(checked) =>
                updateSettings({ allowFreeMovementInOpenScene: checked })
              }
            />

            <SettingToggle
              checked={settings.showSceneDataOnStart}
              description="Quando attivo, all'apertura del configuratore l'occhio mostra subito nomi e quote degli elementi in scena. Di default resta spento per una vista più pulita."
              icon={Eye}
              label="Mostra dati elementi all'avvio"
              onChange={(checked) =>
                updateSettings({ showSceneDataOnStart: checked })
              }
            />
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:self-start">
        <p className="text-sm font-medium text-gray-500">Anteprima operativa</p>
        <h2 className="mt-1 text-xl font-semibold">Configuratore</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Apri la scena cliente per testare subito le impostazioni salvate in
          questa console.
        </p>
        <Link
          href="/configuratore"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Vai al configuratore
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </section>
  );
}

type SettingToggleProps = {
  checked: boolean;
  description: string;
  icon: typeof Move;
  label: string;
  onChange: (checked: boolean) => void;
};

// Rende un toggle accessibile con descrizione tecnica e stato immediatamente leggibile.
function SettingToggle({
  checked,
  description,
  icon: Icon,
  label,
  onChange,
}: SettingToggleProps) {
  return (
    <label className="flex cursor-pointer flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex min-w-0 gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 ring-1 ring-gray-200">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-gray-950">
            {label}
          </span>
          <span className="mt-1 block text-sm leading-6 text-gray-600">
            {description}
          </span>
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}
