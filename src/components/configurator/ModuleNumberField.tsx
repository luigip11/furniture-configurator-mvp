"use client";

import { useEffect, useRef } from "react";

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

// Applica subito gli incrementi delle frecce e conferma la digitazione al blur o con Invio.
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
  const inputRef = useRef<HTMLInputElement>(null);
  const steppingRef = useRef(false);

  // Sincronizza le quote esterne senza rimontare il campo e interrompere focus o clic prolungati.
  useEffect(() => {
    if (inputRef.current) inputRef.current.value = String(value);
  }, [value]);

  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="number"
        defaultValue={value}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        aria-describedby={min !== undefined ? `${id}-limits` : undefined}
        onPointerDown={() => {
          steppingRef.current = true;
        }}
        onPaste={() => {
          steppingRef.current = false;
        }}
        onDrop={() => {
          steppingRef.current = false;
        }}
        onChange={(event) => {
          if (steppingRef.current) onChange(event.currentTarget.valueAsNumber);
        }}
        onBlur={(event) => {
          steppingRef.current = false;
          onChange(event.currentTarget.valueAsNumber);
          event.currentTarget.value = String(value);
        }}
        onKeyDown={(event) => {
          steppingRef.current =
            event.key === "ArrowUp" || event.key === "ArrowDown";
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
