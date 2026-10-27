"use client";

import { hasParametricBillOfMaterials } from "@/lib/configurator/parametric-bom";
import { getEffectiveDoorConfiguration } from "@/lib/configurator/module-capabilities";
import { technicalDictionary } from "@/lib/i18n/technical-dictionary";
import { DoorConfigurationDialog } from "./DoorConfigurationDialog";
import { ModuleNumberField as NumberField } from "./ModuleNumberField";
import {
  getModuleDimensionMinimums,
  MAX_MODULE_DIMENSION_MM,
} from "@/lib/configurator/composition-constraints";
import { useState } from "react";
import { Check, ChevronDown, Minus, Plus, RotateCw } from "lucide-react";
import {
  CONFIGURATOR_GRID_SIZE,
  useConfiguratorStore,
} from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";
import {
  DEFAULT_DOOR_CONFIGURATION,
  DEFAULT_BASE_FINISH_CONFIGURATION,
  DEFAULT_MODULE_VARIANT,
  PRODUCT_VARIANT_OPTIONS,
  ProductVariantKey,
  getDoorConfigurationSummary,
} from "@/types/configurator";
import {
  getAvailableModuleVariants,
  hasConfigurableModuleVariants,
} from "@/lib/configurator/module-technical-catalog";
import { getProductVariantKeys } from "@/lib/configurator/product-variants";
import { canConfigureBaseFinish } from "@/lib/configurator/parametric-bom";

export function ProductPropertiesPanel() {
  const [doorDialogOpen, setDoorDialogOpen] = useState(false);
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);
  const [positionExpanded, setPositionExpanded] = useState(false);
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const sceneMode = useConfiguratorStore((state) => state.sceneMode);
  const allowFreeMovementInOpenScene = useConfiguratorStore(
    (state) => state.settings.allowFreeMovementInOpenScene,
  );
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const updateDoorConfiguration = useConfiguratorStore(
    (state) => state.updateDoorConfiguration,
  );
  const updateItem = useConfiguratorStore((state) => state.updateItem);
  const updateVariant = useConfiguratorStore((state) => state.updateVariant);
  const updateBaseFinishConfiguration = useConfiguratorStore(
    (state) => state.updateBaseFinishConfiguration,
  );
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
  const minimums = getModuleDimensionMinimums(selectedItem.code);
  const dimensionsEditable = hasParametricBillOfMaterials(selectedItem.code);
  const technical = technicalDictionary[locale];
  const zMovementDisabled =
    sceneMode !== "open" || !allowFreeMovementInOpenScene;
  const familyVariants = getProductVariantKeys(selectedItem.variantProducts);
  const availableVariants =
    familyVariants.length > 0
      ? familyVariants
      : getAvailableModuleVariants(selectedItem.code);
  const variantConfigurable =
    familyVariants.length > 1 ||
    hasConfigurableModuleVariants(selectedItem.code);
  const baseFinishConfigurable = canConfigureBaseFinish(selectedItem.code);
  const baseFinishConfiguration =
    selectedItem.baseFinishConfiguration || DEFAULT_BASE_FINISH_CONFIGURATION;
  const baseFinishLabels = {
    it: {
      title: "Top e ante",
      top: "Includi top",
      doors: "Ante nominali",
      noDoors: "Nessuna anta",
      oneDoor: "1 anta",
      twoDoors: "2 ante",
    },
    en: {
      title: "Top and doors",
      top: "Include top",
      doors: "Nominal doors",
      noDoors: "No doors",
      oneDoor: "1 door",
      twoDoors: "2 doors",
    },
    fr: {
      title: "Dessus et portes",
      top: "Inclure le dessus",
      doors: "Portes nominales",
      noDoors: "Aucune porte",
      oneDoor: "1 porte",
      twoDoors: "2 portes",
    },
  }[locale];
  const effectiveDoorConfiguration =
    getEffectiveDoorConfiguration(selectedItem);
  const doorConfiguration =
    effectiveDoorConfiguration || DEFAULT_DOOR_CONFIGURATION;
  const doorConfigurationSummary = getDoorConfigurationSummary(
    effectiveDoorConfiguration,
    locale,
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
                      value={
                        selectedItem.productVariantKey ||
                        selectedItem.variantKey ||
                        DEFAULT_MODULE_VARIANT
                      }
                      onChange={(event) =>
                        updateVariant(
                          selectedItem.id,
                          event.target.value as ProductVariantKey,
                        )
                      }
                      className="w-full appearance-none rounded-lg border bg-white py-2 pl-3 pr-12 text-sm outline-none focus:border-gray-500"
                    >
                      {PRODUCT_VARIANT_OPTIONS.filter((variant) =>
                        availableVariants.includes(variant.key),
                      ).map((variant) => (
                        <option key={variant.key} value={variant.key}>
                          {locale === "it"
                            ? variant.labelIt
                            : locale === "fr"
                              ? variant.labelFr
                              : variant.labelEn}
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
                        {doorConfigurationSummary.length
                          ? doorConfigurationSummary.join(" · ")
                          : technical.noDoors}
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

              {baseFinishConfigurable ? (
                <fieldset className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                  <legend className="px-1 text-sm font-semibold text-gray-900">
                    {baseFinishLabels.title}
                  </legend>
                  <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                    <input
                      checked={baseFinishConfiguration.hasTop}
                      type="checkbox"
                      onChange={(event) =>
                        updateBaseFinishConfiguration(selectedItem.id, {
                          hasTop: event.target.checked,
                        })
                      }
                    />
                    {baseFinishLabels.top}
                  </label>
                  <label className="mt-3 block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">{baseFinishLabels.doors}</span>
                    <select
                      value={baseFinishConfiguration.doorCount}
                      onChange={(event) =>
                        updateBaseFinishConfiguration(selectedItem.id, {
                          doorCount: event.target.value as
                            | "none"
                            | "one"
                            | "two",
                        })
                      }
                      className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                    >
                      <option value="none">{baseFinishLabels.noDoors}</option>
                      <option value="one">{baseFinishLabels.oneDoor}</option>
                      <option value="two">{baseFinishLabels.twoDoors}</option>
                    </select>
                  </label>
                </fieldset>
              ) : null}

              <p className="text-xs font-medium text-gray-600">
                {technical.nominalDimensions}
              </p>
              <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                {dimensionsEditable
                  ? technical.parametricPreview
                  : technical.dimensionsLocked}
              </p>
              {selectedItem.catalogDimensions &&
              (["widthMm", "heightMm", "depthMm"] as const).some(
                (axis) =>
                  selectedItem[axis] !== selectedItem.catalogDimensions![axis],
              ) ? (
                <button
                  type="button"
                  onClick={() =>
                    updateItem(selectedItem.id, {
                      ...selectedItem.catalogDimensions!,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  {technical.restoreDimensions}
                </button>
              ) : null}
              <p className="text-xs text-gray-500">
                {baseFinishConfigurable
                  ? technical.doorNotes
                  : technical.documentaryDoors}
              </p>

              <NumberField
                id="module-width"
                disabled={!dimensionsEditable}
                min={minimums.widthMm}
                max={MAX_MODULE_DIMENSION_MM}
                label={`${t.width} mm`}
                value={selectedItem.widthMm}
                onChange={(value) =>
                  updateItem(selectedItem.id, { widthMm: value })
                }
              />

              <NumberField
                id="module-height"
                disabled={!dimensionsEditable}
                min={minimums.heightMm}
                max={MAX_MODULE_DIMENSION_MM}
                label={`${t.height} mm`}
                value={selectedItem.heightMm}
                onChange={(value) =>
                  updateItem(selectedItem.id, { heightMm: value })
                }
              />

              <NumberField
                id="module-depth"
                disabled={!dimensionsEditable}
                min={minimums.depthMm}
                max={MAX_MODULE_DIMENSION_MM}
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
                      onChange={(value) =>
                        moveItem(selectedItem.id, "x", value)
                      }
                    />

                    <NumberField
                      id="module-position-z"
                      label={t.positionZ}
                      value={Number(selectedItem.position[2].toFixed(2))}
                      step={positionStep}
                      disabled={zMovementDisabled}
                      onChange={(value) =>
                        moveItem(selectedItem.id, "z", value)
                      }
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
                                2,
                              ),
                            ),
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
                                2,
                              ),
                            ),
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
                                2,
                              ),
                            ),
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
                                2,
                              ),
                            ),
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
            {variantConfigurable && effectiveDoorConfiguration ? (
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
          key={selectedItem.id}
          configuration={doorConfiguration}
          itemCode={selectedItem.code}
          itemId={selectedItem.id}
          itemName={name}
          locale={locale}
          onChange={(data) => updateDoorConfiguration(selectedItem.id, data)}
          onClose={() => setDoorDialogOpen(false)}
        />
      ) : null}
    </>
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
