"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Minus, Plus, RotateCw, X } from "lucide-react";
import {
  CONFIGURATOR_GRID_SIZE,
  useConfiguratorStore,
} from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";
import {
  DEFAULT_DOOR_CONFIGURATION,
  DEFAULT_MODULE_VARIANT,
  DOOR_COATING_OPTIONS,
  DOOR_COUNT_OPTIONS,
  DOOR_MACHINING_OPTIONS,
  DOOR_MOUNT_OPTIONS,
  DoorConfiguration,
  MODULE_VARIANT_OPTIONS,
  ModuleVariantKey,
  getDoorConfigurationSummary,
} from "@/types/configurator";
import {
  getAvailableModuleVariants,
  hasConfigurableModuleVariants,
} from "@/lib/configurator/module-technical-catalog";

export function ProductPropertiesPanel() {
  const [doorDialogOpen, setDoorDialogOpen] = useState(false);
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);
  const [positionExpanded, setPositionExpanded] = useState(false);
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const sceneMode = useConfiguratorStore((state) => state.sceneMode);
  const allowFreeMovementInOpenScene = useConfiguratorStore(
    (state) => state.settings.allowFreeMovementInOpenScene
  );
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const updateDoorConfiguration = useConfiguratorStore(
    (state) => state.updateDoorConfiguration
  );
  const updateItem = useConfiguratorStore((state) => state.updateItem);
  const updateVariant = useConfiguratorStore((state) => state.updateVariant);
  const duplicateItem = useConfiguratorStore((state) => state.duplicateItem);
  const rotateItem = useConfiguratorStore((state) => state.rotateItem);
  const moveItem = useConfiguratorStore((state) => state.moveItem);
  const removeItem = useConfiguratorStore((state) => state.removeItem);

  const t = dictionary[locale];

  const selectedItem = items.find((item) => item.id === selectedItemId);

  if (!selectedItem) {
    return (
      <aside className="rounded-2xl border bg-white p-4 shadow-sm">
        <CollapsiblePanelHeader
          collapseLabel={t.collapseProperties}
          expanded={propertiesExpanded}
          expandLabel={t.expandProperties}
          title={t.properties}
          onToggle={() => setPropertiesExpanded((expanded) => !expanded)}
        />
        {propertiesExpanded ? (
          <p className="mt-4 text-sm text-gray-500">{t.noSelection}</p>
        ) : null}
      </aside>
    );
  }

  const name =
    locale === "it"
      ? selectedItem.nameIt
      : selectedItem.nameEn || selectedItem.nameIt;
  const positionStep = CONFIGURATOR_GRID_SIZE;
  const zMovementDisabled =
    sceneMode !== "open" || !allowFreeMovementInOpenScene;
  const availableVariants = getAvailableModuleVariants(selectedItem.code);
  const variantConfigurable = hasConfigurableModuleVariants(selectedItem.code);
  const doorConfiguration =
    selectedItem.doorConfiguration || DEFAULT_DOOR_CONFIGURATION;
  const doorConfigurationSummary = getDoorConfigurationSummary(
    doorConfiguration,
    locale
  );
  const positionButtonClassName =
    "rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100";

  return (
    <>
      <aside className="rounded-2xl border bg-white p-4 shadow-sm">
      <CollapsiblePanelHeader
        collapseLabel={t.collapseProperties}
        expanded={propertiesExpanded}
        expandLabel={t.expandProperties}
        title={t.properties}
        onToggle={() => setPropertiesExpanded((expanded) => !expanded)}
      />

      {propertiesExpanded ? (
        <>
          <div className="mb-4 mt-4 rounded-xl bg-gray-50 p-3">
            <p className="truncate font-medium" title={name}>
              {name}
            </p>
            {selectedItem.code ? (
              <p
                className="truncate text-xs text-gray-500"
                title={selectedItem.code}
              >
                {t.code}: {selectedItem.code}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            {variantConfigurable ? (
              <label className="block" htmlFor="module-variant">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  {t.variant}
                </span>
                <div className="relative mb-2">
                  <select
                    id="module-variant"
                    value={selectedItem.variantKey || DEFAULT_MODULE_VARIANT}
                    onChange={(event) =>
                      updateVariant(
                        selectedItem.id,
                        event.target.value as ModuleVariantKey
                      )
                    }
                    className="w-full appearance-none rounded-lg border bg-white py-2 pl-3 pr-12 text-sm outline-none focus:border-gray-500"
                  >
                    {MODULE_VARIANT_OPTIONS.filter((variant) =>
                      availableVariants.includes(variant.key)
                    ).map((variant) => (
                      <option key={variant.key} value={variant.key}>
                        {locale === "it" ? variant.labelIt : variant.labelEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  />
                </div>
              </label>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">{t.variant}</span>
                <p className="mt-1 text-xs">{t.noSideVariants}</p>
              </div>
            )}

            {variantConfigurable ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {t.doorConfiguration}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {doorConfigurationSummary.join(" · ")}
                    </p>
                  </div>
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
                    aria-hidden="true"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDoorDialogOpen(true)}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  {t.configureDoor}
                </button>
              </div>
            ) : null}

            <NumberField
              id="module-width"
              label={`${t.width} mm`}
              value={selectedItem.widthMm}
              onChange={(value) =>
                updateItem(selectedItem.id, { widthMm: value })
              }
            />

            <NumberField
              id="module-height"
              label={`${t.height} mm`}
              value={selectedItem.heightMm}
              onChange={(value) =>
                updateItem(selectedItem.id, { heightMm: value })
              }
            />

            <NumberField
              id="module-depth"
              label={`${t.depth} mm`}
              value={selectedItem.depthMm}
              onChange={(value) =>
                updateItem(selectedItem.id, { depthMm: value })
              }
            />

            <div className="border-t pt-3">
              <button
                type="button"
                aria-expanded={positionExpanded}
                onClick={() => setPositionExpanded((expanded) => !expanded)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-left transition hover:bg-gray-50"
              >
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">
                      {t.positionElement}
                    </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    X {Number(selectedItem.position[0].toFixed(2))} / Z{" "}
                    {Number(selectedItem.position[2].toFixed(2))}
                  </span>
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-800">
                  {positionExpanded ? (
                    <Minus size={15} aria-hidden="true" />
                  ) : (
                    <Plus size={15} aria-hidden="true" />
                  )}
                </span>
              </button>

              {positionExpanded ? (
                <div className="pt-2">
                  <NumberField
                    id="module-position-x"
                    label={t.positionX}
                    value={Number(selectedItem.position[0].toFixed(2))}
                    step={positionStep}
                    onChange={(value) => moveItem(selectedItem.id, "x", value)}
                  />

                  <NumberField
                    id="module-position-z"
                    label={t.positionZ}
                    value={Number(selectedItem.position[2].toFixed(2))}
                    step={positionStep}
                    disabled={zMovementDisabled}
                    onChange={(value) => moveItem(selectedItem.id, "z", value)}
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        moveItem(
                          selectedItem.id,
                          "x",
                          Number(
                            (selectedItem.position[0] - positionStep).toFixed(
                              2
                            )
                          )
                        )
                      }
                      className={positionButtonClassName}
                    >
                      ← {t.left}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveItem(
                          selectedItem.id,
                          "x",
                          Number(
                            (selectedItem.position[0] + positionStep).toFixed(
                              2
                            )
                          )
                        )
                      }
                      className={positionButtonClassName}
                    >
                      {t.right} →
                    </button>

                    <button
                      type="button"
                      disabled={zMovementDisabled}
                      onClick={() =>
                        moveItem(
                          selectedItem.id,
                          "z",
                          Number(
                            (selectedItem.position[2] - positionStep).toFixed(
                              2
                            )
                          )
                        )
                      }
                      className={positionButtonClassName}
                    >
                      ↑ {t.forward}
                    </button>

                    <button
                      type="button"
                      disabled={zMovementDisabled}
                      onClick={() =>
                        moveItem(
                          selectedItem.id,
                          "z",
                          Number(
                            (selectedItem.position[2] + positionStep).toFixed(
                              2
                            )
                          )
                        )
                      }
                      className={positionButtonClassName}
                    >
                      {t.back} ↓
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => rotateItem(selectedItem.id)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
            >
              <RotateCw size={16} aria-hidden="true" />
              {t.rotate90}
            </button>

            <button
              type="button"
              onClick={() => duplicateItem(selectedItem.id)}
              className="rounded-lg border border-gray-300 bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300"
            >
              {t.duplicate}
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(selectedItem.id)}
            className="mt-2 w-full rounded-lg border border-red-700 bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {t.remove}
          </button>
        </>
      ) : (
        <div className="mt-2 min-w-0 space-y-1 text-xs">
          <p className="flex min-w-0 flex-wrap items-center gap-x-1 text-gray-500">
            <span className="min-w-0 max-w-full truncate" title={name}>
              {name}
            </span>
            {selectedItem.code ? (
              <span
                className="min-w-0 max-w-full truncate"
                title={`${t.code}: ${selectedItem.code}`}
              >
                · {t.code}: {selectedItem.code}
              </span>
            ) : null}
          </p>
          {variantConfigurable && selectedItem.doorConfiguration ? (
            <p className="flex min-w-0 items-center gap-1.5 font-medium text-green-700">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{t.doorConfigured}</span>
            </p>
          ) : null}
        </div>
      )}
      </aside>

      {variantConfigurable && doorDialogOpen ? (
        <DoorConfigurationDialog
          configuration={doorConfiguration}
          itemCode={selectedItem.code}
          itemId={selectedItem.id}
          itemName={name}
          locale={locale}
          onChange={(data) =>
            updateDoorConfiguration(selectedItem.id, data)
          }
          onClose={() => setDoorDialogOpen(false)}
        />
      ) : null}
    </>
  );
}

type DoorConfigurationDialogProps = {
  configuration: DoorConfiguration;
  itemCode?: string | null;
  itemId: string;
  itemName: string;
  locale: "it" | "en";
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
function DoorConfigurationDialog({
  configuration,
  itemCode,
  itemId,
  itemName,
  locale,
  onChange,
  onClose,
}: DoorConfigurationDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const t = dictionary[locale];
  const configurationSummary = getDoorConfigurationSummary(
    configuration,
    locale
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
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      style={{ zIndex: 2147483647 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="door-dialog-title"
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
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
            <div className="mb-5 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-700">
                  {activeStep + 1} / {steps.length}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">
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
                onSelect={(count) => onChange({ count })}
              />
            ) : null}
            {activeStep === 1 ? (
              <DoorOptionSection
                locale={locale}
                options={DOOR_MOUNT_OPTIONS}
                selectedKey={configuration.mount}
                imageMap={DOOR_OPTION_IMAGES.mount}
                onSelect={(mount) => onChange({ mount })}
              />
            ) : null}
            {activeStep === 2 ? (
              <DoorOptionSection
                locale={locale}
                options={DOOR_COATING_OPTIONS}
                selectedKey={configuration.coating}
                imageMap={DOOR_OPTION_IMAGES.coating}
                onSelect={(coating) => onChange({ coating })}
              />
            ) : null}
            {activeStep === 3 ? (
              <DoorOptionSection
                locale={locale}
                options={DOOR_MACHINING_OPTIONS}
                selectedKey={configuration.machining}
                imageMap={DOOR_OPTION_IMAGES.machining}
                onSelect={(machining) => onChange({ machining })}
              />
            ) : null}
            {activeStep === lastStep ? (
              <DoorConfigurationSummary
                configurationSummary={configurationSummary}
                itemCode={itemCode}
                itemId={itemId}
                itemName={itemName}
                onEdit={() => setActiveStep(0)}
                onSubmit={onClose}
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
    </div>
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
          <div key={label} className="grid gap-1 sm:grid-cols-[180px_1fr]">
            <dt className="text-xs font-semibold uppercase text-gray-500">
              {label}
            </dt>
            <dd className="min-w-0 break-words text-sm font-medium text-gray-900">
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
  locale: "it" | "en";
  onSelect: (key: Key) => void;
  options: { key: Key; labelIt: string; labelEn: string }[];
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
            label={locale === "it" ? option.labelIt : option.labelEn}
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

type CollapsiblePanelHeaderProps = {
  collapseLabel: string;
  expanded: boolean;
  expandLabel: string;
  onToggle: () => void;
  title: string;
};

function CollapsiblePanelHeader({
  collapseLabel,
  expanded,
  expandLabel,
  onToggle,
  title,
}: CollapsiblePanelHeaderProps) {
  const toggleLabel = expanded ? collapseLabel : expandLabel;

  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={toggleLabel}
        title={toggleLabel}
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        {expanded ? (
          <Minus size={16} aria-hidden="true" />
        ) : (
          <Plus size={16} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

type NumberFieldProps = {
  disabled?: boolean;
  id: string;
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
};

function NumberField({
  disabled = false,
  id,
  label,
  value,
  step = 1,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        id={id}
        type="number"
        value={value}
        step={step}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      />
    </label>
  );
}
