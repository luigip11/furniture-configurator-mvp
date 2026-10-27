"use client";

type Props = {
  disabled?: boolean;
  id: string;
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

// Conferma il numero al blur o con Invio: consente di digitare senza applicare valori intermedi vuoti.
export function ModuleNumberField({
  disabled = false,
  id,
  label,
  value,
  step = 1,
  min,
  max,
  onChange,
}: Props) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        key={`${id}:${value}`}
        id={id}
        type="number"
        defaultValue={value}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        aria-describedby={min !== undefined ? `${id}-limits` : undefined}
        onBlur={(event) => {
          onChange(event.currentTarget.valueAsNumber);
          event.currentTarget.value = String(value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            event.currentTarget.value = String(value);
            event.currentTarget.blur();
          }
        }}
        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      />
      {min !== undefined ? (
        <span id={`${id}-limits`} className="mb-2 block text-xs text-gray-500">
          Min {min} · Max {max} mm
        </span>
      ) : null}
    </label>
  );
}
