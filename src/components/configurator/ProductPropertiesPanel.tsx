"use client";

import { useState } from "react";
import { Minus, Plus, RotateCw } from "lucide-react";
import {
  CONFIGURATOR_GRID_SIZE,
  useConfiguratorStore,
} from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";
import {
  DEFAULT_MODULE_VARIANT,
  MODULE_VARIANT_OPTIONS,
  ModuleVariantKey,
} from "@/types/configurator";

export function ProductPropertiesPanel() {
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);
  const [positionExpanded, setPositionExpanded] = useState(false);
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const sceneMode = useConfiguratorStore((state) => state.sceneMode);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
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
  const zMovementDisabled = sceneMode !== "open";
  const positionButtonClassName =
    "rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100";

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
        <>
          <div className="mb-4 mt-4 rounded-xl bg-gray-50 p-3">
            <p className="font-medium">{name}</p>
            {selectedItem.code ? (
              <p className="text-xs text-gray-500">
                {t.code}: {selectedItem.code}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <label className="block" htmlFor="module-variant">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {t.variant}
              </span>
              <select
                id="module-variant"
                value={selectedItem.variantKey || DEFAULT_MODULE_VARIANT}
                onChange={(event) =>
                  updateVariant(
                    selectedItem.id,
                    event.target.value as ModuleVariantKey
                  )
                }
                className="mb-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
              >
                {MODULE_VARIANT_OPTIONS.map((variant) => (
                  <option key={variant.key} value={variant.key}>
                    {locale === "it" ? variant.labelIt : variant.labelEn}
                  </option>
                ))}
              </select>
            </label>

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
        <p className="mt-2 text-xs text-gray-500">
          {name}
          {selectedItem.code ? (
            <>
              {" "}
              · {t.code}: {selectedItem.code}
            </>
          ) : null}
        </p>
      )}
    </aside>
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
  id: string;
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
};

function NumberField({
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
        onChange={(event) => onChange(Number(event.target.value))}
        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-500"
      />
    </label>
  );
}
