"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { dictionary } from "@/lib/i18n/dictionary";
import { technicalDictionary } from "@/lib/i18n/technical-dictionary";
import {
  DOOR_COATING_OPTIONS,
  DOOR_COUNT_OPTIONS,
  DOOR_MACHINING_OPTIONS,
  DOOR_MOUNT_OPTIONS,
  getDoorConfigurationSummary,
} from "@/types/configurator";
import type { DoorConfiguration, Locale } from "@/types/configurator";

type DoorConfigurationDialogProps = {
  configuration: DoorConfiguration;
  itemCode?: string | null;
  itemId: string;
  itemName: string;
  locale: Locale;
  onChange: (data: Partial<DoorConfiguration>) => void;
  onClose: () => void;
};

const DOOR_IMAGE_BASE = "/door-configurator-assets";

const DOOR_OPTION_IMAGES = {
  count: {
    one: {
      src: `${DOOR_IMAGE_BASE}/door-count-one.jpg`,
    },
    two: {
      src: `${DOOR_IMAGE_BASE}/door-count-two.jpg`,
    },
  },
  mount: {
    flush_floor: {
      src: `${DOOR_IMAGE_BASE}/door-mount-flush-floor.jpg`,
    },
    visible_plinth: {
      src: `${DOOR_IMAGE_BASE}/door-mount-visible-plinth.jpg`,
    },
  },
  coating: {
    spv_basin: {
      src: `${DOOR_IMAGE_BASE}/door-coating-spv-basin.jpg`,
    },
    gs_no_basin: {
      src: `${DOOR_IMAGE_BASE}/door-coating-gs-no-basin.jpg`,
    },
    sa_painting: {
      src: `${DOOR_IMAGE_BASE}/door-coating-sa-painting.jpg`,
    },
    mgr_basin_handle: {
      src: `${DOOR_IMAGE_BASE}/door-coating-mgr-basin-handle.jpg`,
    },
  },
  machining: {
    smooth: null,
    protruding_shutter: {
      src: `${DOOR_IMAGE_BASE}/door-machining-protruding-shutter.jpg`,
    },
    inward_shutter: {
      src: `${DOOR_IMAGE_BASE}/door-machining-inward-shutter.jpg`,
    },
    h10_vents: {
      src: `${DOOR_IMAGE_BASE}/door-machining-h10-vents.jpg`,
    },
  },
} as const;

// Mostra il flusso guidato delle ante con card visuali basate sugli allegati tecnici.
export function DoorConfigurationDialog({
  configuration: initialConfiguration,
  itemCode,
  itemId,
  itemName,
  locale,
  onChange,
  onClose,
}: DoorConfigurationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [configuration, setConfiguration] = useState<DoorConfiguration>(() => ({
    ...initialConfiguration,
  }));
  const t = dictionary[locale];
  // Il dialog nativo confina il focus e lo restituisce al comando di apertura prima dello smontaggio.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  // Porta la lettura e la tabulazione al contenuto del passaggio appena selezionato.
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [activeStep]);
  const configurationSummary = getDoorConfigurationSummary(
    configuration,
    locale,
  );
  const steps = [
    {
      description: t.doorCountHint,
      label: t.doorCount,
      summary: configurationSummary[0],
    },
    {
      description: t.doorMountHint,
      label: t.doorMount,
      summary: configurationSummary[1],
    },
    {
      description: t.doorCoatingHint,
      label: t.doorCoating,
      summary: configurationSummary[2],
    },
    {
      description: t.doorMachiningHint,
      label: t.doorMachining,
      summary: configurationSummary[3],
    },
    {
      description: t.doorSummaryHint,
      label: t.doorSummary,
      summary: t.doorReadyForBill,
    },
  ];
  const lastStep = steps.length - 1;
  const activeStepData = steps[activeStep];
  const goToNextStep = () => {
    if (activeStep < lastStep) {
      setActiveStep((step) => step + 1);
      return;
    }

    onClose();
  };
  const dialog = (
    <dialog
      ref={dialogRef}
      aria-labelledby="door-dialog-title"
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-2xl border-0 bg-white p-0 text-gray-950 shadow-2xl backdrop:bg-black/60"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <section className="flex max-h-[92dvh] w-full flex-col overflow-hidden">
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id="door-dialog-title" className="text-lg font-semibold">
              {t.doorDialogTitle}
            </h2>
            <p className="mt-1 truncate text-sm text-gray-500" title={itemName}>
              {t.linkedElement}: {itemName}
              {itemCode ? ` (${itemCode})` : ""}
            </p>
          </div>
          <button
            type="button"
            aria-label={t.closeDialog}
            title={t.closeDialog}
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[240px_1fr]">
          <nav className="border-b bg-gray-50 p-4 md:border-b-0 md:border-r">
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li key={step.label}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                      index === activeStep
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-blue-50"
                    }`}
                    aria-current={index === activeStep ? "step" : undefined}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        index === activeStep
                          ? "bg-white text-blue-700"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{step.label}</span>
                      <span
                        className={`mt-1 block truncate text-xs ${
                          index === activeStep
                            ? "text-blue-50"
                            : "text-gray-500"
                        }`}
                      >
                        {step.summary}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="p-5 md:p-6">
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
              {technicalDictionary[locale].doorNotes}
            </p>
            <div className="mb-5 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-700">
                  {activeStep + 1} / {steps.length}
                </p>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-1 text-xl font-semibold text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {activeStepData.label}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeStepData.description}
                </p>
              </div>
              {activeStep < lastStep ? (
                <p className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                  {activeStepData.summary}
                </p>
              ) : null}
            </div>

            {activeStep === 0 ? (
              <DoorOptionSection
                locale={locale}
                options={DOOR_COUNT_OPTIONS}
                selectedKey={configuration.count}
                imageMap={DOOR_OPTION_IMAGES.count}
                onSelect={(count) =>
                  setConfiguration((current) => ({ ...current, count }))
                }
              />
            ) : null}
            {activeStep === 1 ? (
              <DoorOptionSection
                locale={locale}
                options={DOOR_MOUNT_OPTIONS}
                selectedKey={configuration.mount}
                imageMap={DOOR_OPTION_IMAGES.mount}
                onSelect={(mount) =>
                  setConfiguration((current) => ({ ...current, mount }))
                }
              />
            ) : null}
            {activeStep === 2 ? (
              <DoorOptionSection
                locale={locale}
                options={DOOR_COATING_OPTIONS}
                selectedKey={configuration.coating}
                imageMap={DOOR_OPTION_IMAGES.coating}
                onSelect={(coating) =>
                  setConfiguration((current) => ({ ...current, coating }))
                }
              />
            ) : null}
            {activeStep === 3 ? (
              <DoorOptionSection
                locale={locale}
                options={DOOR_MACHINING_OPTIONS}
                selectedKey={configuration.machining}
                imageMap={DOOR_OPTION_IMAGES.machining}
                onSelect={(machining) =>
                  setConfiguration((current) => ({ ...current, machining }))
                }
              />
            ) : null}
            {activeStep === lastStep ? (
              <DoorConfigurationSummary
                configurationSummary={configurationSummary}
                itemCode={itemCode}
                itemId={itemId}
                itemName={itemName}
                onEdit={() => setActiveStep(0)}
                onSubmit={() => {
                  onChange(configuration);
                  onClose();
                }}
                t={t}
              />
            ) : null}
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            {configurationSummary.join(" · ")}
          </p>
          <div className="flex gap-2 sm:justify-end">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              {t.doorPrevious}
            </button>
            {activeStep < lastStep ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                {t.doorNext}
              </button>
            ) : null}
          </div>
        </footer>
      </section>
    </dialog>
  );

  if (typeof document === "undefined") return null;

  return createPortal(dialog, document.body);
}

type DoorConfigurationSummaryProps = {
  configurationSummary: string[];
  itemCode?: string | null;
  itemId: string;
  itemName: string;
  onEdit: () => void;
  onSubmit: () => void;
  t: Record<string, string>;
};

// Mostra la conferma finale collegando esplicitamente la configurazione al modulo selezionato.
function DoorConfigurationSummary({
  configurationSummary,
  itemCode,
  itemId,
  itemName,
  onEdit,
  onSubmit,
  t,
}: DoorConfigurationSummaryProps) {
  const rows = [
    [t.linkedElement, itemName],
    [t.moduleId, itemId],
    [t.code, itemCode || "-"],
    [t.doorCount, configurationSummary[0]],
    [t.doorMount, configurationSummary[1]],
    [t.doorCoating, configurationSummary[2]],
    [t.doorMachining, configurationSummary[3]],
  ];

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
      <h3 className="text-base font-semibold text-blue-700">
        {t.doorSummaryTitle}
      </h3>
      <dl className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid items-start gap-1 sm:grid-cols-[180px_1fr] sm:items-center"
          >
            <dt className="text-xs font-semibold uppercase leading-5 text-gray-500">
              {label}
            </dt>
            <dd className="min-w-0 break-words text-sm font-medium leading-5 text-gray-900">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          {t.edit}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          {t.addToBill}
        </button>
      </div>
    </section>
  );
}

type DoorOptionImage = {
  src: string;
} | null;

type DoorOptionSectionProps<Key extends string> = {
  imageMap: Record<Key, DoorOptionImage>;
  locale: Locale;
  onSelect: (key: Key) => void;
  options: { key: Key; labelIt: string; labelEn: string; labelFr: string }[];
  selectedKey: Key;
};

// Mostra solo le opzioni dello step attivo, con card grandi per leggere meglio gli allegati.
function DoorOptionSection<Key extends string>({
  imageMap,
  locale,
  onSelect,
  options,
  selectedKey,
}: DoorOptionSectionProps<Key>) {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <DoorOptionCard
            key={option.key}
            image={imageMap[option.key]}
            label={
              locale === "it"
                ? option.labelIt
                : locale === "fr"
                  ? option.labelFr
                  : option.labelEn
            }
            selected={option.key === selectedKey}
            onClick={() => onSelect(option.key)}
          />
        ))}
      </div>
    </section>
  );
}

type DoorOptionCardProps = {
  image: DoorOptionImage;
  label: string;
  onClick: () => void;
  selected: boolean;
};

// Rappresenta una scelta tecnica con immagine ampia, testo e spunta di selezione.
function DoorOptionCard({
  image,
  label,
  onClick,
  selected,
}: DoorOptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`group flex min-h-[310px] flex-col overflow-hidden rounded-xl border bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
        selected
          ? "border-blue-600 shadow-sm ring-1 ring-blue-600"
          : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className="relative h-60 w-full bg-gray-100">
        {image ? (
          <Image
            alt=""
            className="bg-white object-contain p-3"
            fill
            sizes="(max-width: 768px) 90vw, 420px"
            src={image.src}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="h-40 w-28 rounded-sm border border-gray-300 bg-white shadow-inner" />
          </div>
        )}
        {selected ? (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
            <Check size={17} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <span className="flex min-h-[66px] items-center px-4 py-3 text-base font-semibold leading-tight text-gray-900">
        {label}
      </span>
    </button>
  );
}
