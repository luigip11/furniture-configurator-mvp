"use client";

import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";
import {
  DEFAULT_MODULE_VARIANT,
  MODULE_VARIANT_OPTIONS,
  ModuleVariantKey,
} from "@/types/configurator";

export function ProductPropertiesPanel() {
  const locale = useConfiguratorStore((state) => state.locale);
  const items = useConfiguratorStore((state) => state.items);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const updateItem = useConfiguratorStore((state) => state.updateItem);
  const updateVariant = useConfiguratorStore((state) => state.updateVariant);
  const duplicateItem = useConfiguratorStore((state) => state.duplicateItem);
  const moveItem = useConfiguratorStore((state) => state.moveItem);
  const removeItem = useConfiguratorStore((state) => state.removeItem);

  const t = dictionary[locale];

  const selectedItem = items.find((item) => item.id === selectedItemId);

  if (!selectedItem) {
    return (
      <aside className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{t.properties}</h2>
        <p className="text-sm text-gray-500">{t.noSelection}</p>
      </aside>
    );
  }

  const name =
    locale === "it"
      ? selectedItem.nameIt
      : selectedItem.nameEn || selectedItem.nameIt;

  return (
    <aside className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{t.properties}</h2>

      <div className="mb-4 rounded-xl bg-gray-50 p-3">
        <p className="font-medium">{name}</p>
        {selectedItem.code ? (
          <p className="text-xs text-gray-500">
            {t.code}: {selectedItem.code}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            {t.variant}
          </span>
          <select
            value={selectedItem.variantKey || DEFAULT_MODULE_VARIANT}
            onChange={(event) =>
              updateVariant(
                selectedItem.id,
                event.target.value as ModuleVariantKey
              )
            }
            className="mb-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-black"
          >
            {MODULE_VARIANT_OPTIONS.map((variant) => (
              <option key={variant.key} value={variant.key}>
                {locale === "it" ? variant.labelIt : variant.labelEn}
              </option>
            ))}
          </select>
        </label>

        <NumberField
          label={`${t.width} mm`}
          value={selectedItem.widthMm}
          onChange={(value) =>
            updateItem(selectedItem.id, { widthMm: value })
          }
        />

        <NumberField
          label={`${t.height} mm`}
          value={selectedItem.heightMm}
          onChange={(value) =>
            updateItem(selectedItem.id, { heightMm: value })
          }
        />

        <NumberField
          label={`${t.depth} mm`}
          value={selectedItem.depthMm}
          onChange={(value) =>
            updateItem(selectedItem.id, { depthMm: value })
          }
        />

        <div className="border-t pt-3">
          <p className="mb-2 text-sm font-semibold text-gray-800">
            Posizione elemento
          </p>

          <NumberField
            label="Posizione X"
            value={Number(selectedItem.position[0].toFixed(2))}
            step={0.05}
            onChange={(value) => moveItem(selectedItem.id, "x", value)}
          />

          <NumberField
            label="Posizione Z"
            value={Number(selectedItem.position[2].toFixed(2))}
            step={0.05}
            onChange={(value) => moveItem(selectedItem.id, "z", value)}
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                moveItem(
                  selectedItem.id,
                  "x",
                  Number((selectedItem.position[0] - 0.1).toFixed(2))
                )
              }
              className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
            >
              ← Sinistra
            </button>

            <button
              type="button"
              onClick={() =>
                moveItem(
                  selectedItem.id,
                  "x",
                  Number((selectedItem.position[0] + 0.1).toFixed(2))
                )
              }
              className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
            >
              Destra →
            </button>

            <button
              type="button"
              onClick={() =>
                moveItem(
                  selectedItem.id,
                  "z",
                  Number((selectedItem.position[2] - 0.1).toFixed(2))
                )
              }
              className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
            >
              ↑ Avanti
            </button>

            <button
              type="button"
              onClick={() =>
                moveItem(
                  selectedItem.id,
                  "z",
                  Number((selectedItem.position[2] + 0.1).toFixed(2))
                )
              }
              className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
            >
              Indietro ↓
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => duplicateItem(selectedItem.id)}
        className="mt-4 w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
      >
        {t.duplicate}
      </button>

      <button
        type="button"
        onClick={() => removeItem(selectedItem.id)}
        className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        {t.remove}
      </button>
    </aside>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
};

function NumberField({ label, value, step = 1, onChange }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
      />
    </label>
  );
}
