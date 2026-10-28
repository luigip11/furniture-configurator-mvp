"use client";

import { useRef, type ChangeEvent } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import {
  getProductAssetAccept,
  PRODUCT_ASSET_CONFIG,
  type ProductAssetField,
} from "@/lib/admin/product-assets";
import { useConfiguratorStore } from "@/store/configurator-store";
import { adminDictionary } from "@/lib/i18n/admin-dictionary";
import { adminWorkflowDictionary } from "@/lib/i18n/admin-workflow-dictionary";

type Props = {
  field: ProductAssetField;
  helperText: string;
  isUploading: boolean;
  label: string;
  uploadLabel: string;
  value: string;
  pendingFile?: File;
  onChange: (value: string) => void;
  onRemoveFile: () => void;
  onUpload: (
    field: ProductAssetField,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

// Distingue URL già associati e file solo selezionati; i controlli restano raggiungibili da tastiera.
export function ProductAssetFieldInput({
  field,
  helperText,
  isUploading,
  label,
  uploadLabel,
  value,
  pendingFile,
  onChange,
  onRemoveFile,
  onUpload,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useConfiguratorStore((state) => state.locale);
  const t = adminDictionary[locale];
  const workflow = adminWorkflowDictionary[locale];
  const inputId = `asset-upload-${field}`;
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <label
          htmlFor={`${field}-url`}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        {value && !pendingFile ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 size={14} aria-hidden="true" />
            {t.connected}
          </span>
        ) : null}
      </div>
      <input
        id={`${field}-url`}
        type="url"
        value={value}
        disabled={!!pendingFile}
        maxLength={2048}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm disabled:bg-gray-100"
      />
      <p className="mt-2 text-xs leading-5 text-gray-500">{helperText}</p>
      <p className="text-xs leading-5 text-gray-500">
        {workflow.maxSize}: {PRODUCT_ASSET_CONFIG[field].maxSizeMb} MB.{" "}
        {workflow.storageLimit}
      </p>
      {pendingFile ? (
        <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
          <p className="break-all font-semibold">
            {workflow.selectedFile}: {pendingFile.name}
          </p>
          <p className="mt-1">{workflow.pendingFile}</p>
          <button
            type="button"
            onClick={onRemoveFile}
            className="mt-2 inline-flex items-center gap-1 rounded border border-blue-200 bg-white px-2 py-1"
          >
            <X size={14} aria-hidden="true" />
            {workflow.removeFile}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        aria-label={uploadLabel}
        className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        {isUploading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <Upload size={16} aria-hidden="true" />
        )}
        {isUploading ? t.loading : workflow.selectFile}
      </button>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={getProductAssetAccept(field)}
        disabled={isUploading}
        tabIndex={-1}
        onChange={(event) => onUpload(field, event)}
        className="sr-only"
      />
    </div>
  );
}
