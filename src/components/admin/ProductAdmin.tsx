"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileBox,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import type { Category, Product } from "@/types/configurator";
import {
  buildProductPayload,
  emptyProductForm,
  productToForm,
  type ProductFormValues,
} from "@/lib/admin/product-form";
import {
  getProductAssetAccept,
  uploadProductAsset,
  type ProductAssetField,
} from "@/lib/admin/product-assets";
import {
  filterAndSortAdminProducts,
  type ProductSortOrder,
} from "@/lib/admin/product-list";

type ProductAdminProps = {
  initialProducts: Product[];
  categories: Category[];
};

export function ProductAdmin({
  initialProducts,
  categories,
}: ProductAdminProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("newest");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [uploadingField, setUploadingField] = useState<ProductAssetField | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);
  const categoryNameById = useMemo(() => {
    return new Map(
      categories.map((category) => [category.id, category.name] as const)
    );
  }, [categories]);
  const visibleProducts = useMemo(
    () =>
      filterAndSortAdminProducts(products, {
        categoryNameById,
        searchText,
        sortOrder,
      }),
    [categoryNameById, products, searchText, sortOrder]
  );
  const hasActiveSearch = searchText.trim().length > 0;

  const editingProduct = products.find(
    (product) => product.id === editingProductId
  );

  function updateForm<Key extends keyof ProductFormValues>(
    key: Key,
    value: ProductFormValues[Key]
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function resetForm() {
    setForm(emptyProductForm);
    setEditingProductId(null);
    setErrorMessage(null);
  }

  function startEdit(product: Product) {
    setForm(productToForm(product));
    setEditingProductId(product.id);
    setErrorMessage(null);
  }

  // Alterna il campo ricerca lasciando pulita la lista quando viene chiuso.
  function toggleSearch() {
    setSearchExpanded((expanded) => {
      if (expanded) {
        setSearchText("");
      }

      return !expanded;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = buildProductPayload(form);

      if (editingProductId) {
        const response = await fetch(`/api/admin/products/${editingProductId}`, {
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
        });
        const result = (await response.json().catch(() => null)) as
          | { message?: string; product?: Product }
          | null;

        if (!response.ok || !result?.product) {
          throw new Error(result?.message || "Impossibile salvare il prodotto.");
        }

        const savedProduct = result.product;
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === savedProduct.id ? savedProduct : product
          )
        );
      } else {
        const response = await fetch("/api/admin/products", {
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const result = (await response.json().catch(() => null)) as
          | { message?: string; product?: Product }
          | null;

        if (!response.ok || !result?.product) {
          throw new Error(result?.message || "Impossibile creare il prodotto.");
        }

        setProducts((currentProducts) => [result.product as Product, ...currentProducts]);
      }

      resetForm();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossibile salvare il prodotto."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function togglePublished(product: Product) {
    setErrorMessage(null);
    const nextPublishedValue = !product.is_published;

    const response = await fetch(`/api/admin/products/${product.id}/publish`, {
      body: JSON.stringify({ is_published: nextPublishedValue }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });
    const result = (await response.json().catch(() => null)) as
      | { message?: string; product?: Product }
      | null;

    if (!response.ok || !result?.product) {
      setErrorMessage(
        result?.message || "Impossibile aggiornare la pubblicazione."
      );
      return;
    }

    const savedProduct = result.product;
    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === savedProduct.id ? savedProduct : currentProduct
      )
    );
    router.refresh();
  }

  // Carica un asset prodotto su Supabase Storage e aggiorna il campo URL relativo.
  async function handleAssetUpload(
    field: ProductAssetField,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setUploadingField(field);
    setErrorMessage(null);

    try {
      const publicUrl = await uploadProductAsset({
        field,
        file,
        productCode: form.code || editingProduct?.code,
      });

      updateForm(field, publicUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossibile caricare il file su Supabase Storage."
      );
    } finally {
      setUploadingField(null);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Eliminare il prodotto "${product.name_it}"?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((currentProduct) => currentProduct.id !== product.id)
    );

    if (editingProductId === product.id) {
      resetForm();
    }

    router.refresh();
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Lista prodotti</h2>
            <p className="mt-1 text-sm text-gray-500">
              {products.length} prodotti in catalogo
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as ProductSortOrder)
                }
                className="h-8 appearance-none rounded-full border border-gray-200 bg-white pl-3 pr-8 text-xs font-medium text-gray-700 shadow-sm outline-none transition hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                aria-label="Ordina prodotti"
              >
                <option value="newest">Più recenti</option>
                <option value="oldest">Meno recenti</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-100">
              {products.filter((product) => product.is_published).length} online
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600 ring-1 ring-gray-200">
              {products.filter((product) => !product.is_published).length} bozze
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          {searchExpanded ? (
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Cerca prodotti"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                autoFocus
              />
              {hasActiveSearch ? (
                <button
                  type="button"
                  aria-label="Cancella ricerca"
                  title="Cancella ricerca"
                  onClick={() => setSearchText("")}
                  className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : (
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-600">
              Catalogo prodotti
            </p>
          )}
          <button
            type="button"
            aria-label={searchExpanded ? "Chiudi ricerca" : "Cerca"}
            title={searchExpanded ? "Chiudi ricerca" : "Cerca"}
            onClick={toggleSearch}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {products.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Nessun prodotto presente.</p>
        ) : visibleProducts.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">
            Nessun prodotto corrisponde alla ricerca.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleProducts.map((product) => {
              const categoryName = product.category_id
                ? categoryById.get(product.category_id)?.name
                : null;

              return (
                <article
                  key={product.id}
                  className="group relative p-4 transition hover:bg-gray-50/80"
                >
                  <span
                    className={`absolute left-0 top-4 h-[calc(100%-2rem)] w-1 rounded-r-full ${
                      product.is_published ? "bg-emerald-400" : "bg-gray-300"
                    }`}
                  />
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold transition group-hover:text-gray-700">
                          {product.name_it}
                        </h3>
                        <span
                          className={
                            product.is_published
                              ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100"
                              : "inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200"
                          }
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              product.is_published
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          />
                          {product.is_published ? "Pubblicato" : "Bozza"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                        <ProductDetail label="Nome EN" value={product.name_en || "-"} />
                        <ProductDetail label="Codice" value={product.code || "-"} />
                        <ProductDetail label="Categoria" value={categoryName || "-"} />
                        <p>
                          <span className="font-medium text-gray-500">
                            Dimensioni:
                          </span>{" "}
                          {product.width_mm} x {product.height_mm} x{" "}
                          {product.depth_mm} mm
                        </p>
                        <p>
                          <span className="font-medium text-gray-500">
                            Spessore:
                          </span>{" "}
                          {product.thickness_mm ?? "-"} mm
                        </p>
                        <p>
                          <span className="font-medium text-gray-500">
                            Prezzo:
                          </span>{" "}
                          {product.price === null || product.price === undefined
                            ? "-"
                            : `${product.price}`}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                        {product.preview_image_url ? (
                          <ResourceChip icon={ImageIcon} label="Preview" />
                        ) : null}
                        {product.model_url ? (
                          <ResourceChip icon={Box} label="Modello 3D" />
                        ) : null}
                        {product.technical_file_url ? (
                          <ResourceChip icon={FileBox} label="File tecnico" />
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublished(product)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        {product.is_published ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                        {product.is_published ? "Nascondi" : "Pubblica"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Elimina
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto"
      >
        <div className="-mx-4 -mt-4 mb-4 flex items-start justify-between gap-3 rounded-t-2xl border-b border-gray-200 bg-gray-50 px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {editingProduct ? "Modifica prodotto" : "Nuovo prodotto"}
            </h2>
            {editingProduct ? (
              <p className="mt-1 text-sm text-gray-500">
                {editingProduct.name_it}
              </p>
            ) : null}
          </div>
          {editingProduct ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Annulla
            </button>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Categoria
            <div className="relative mt-1">
              <select
                value={form.category_id}
                onChange={(event) =>
                  updateForm("category_id", event.target.value)
                }
                className="h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-12 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="">Senza categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Nome IT"
              value={form.name_it}
              onChange={(value) => updateForm("name_it", value)}
              required
            />
            <TextField
              label="Nome EN"
              value={form.name_en}
              onChange={(value) => updateForm("name_en", value)}
            />
          </div>

          <TextField
            label="Codice"
            value={form.code}
            onChange={(value) => updateForm("code", value)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Larghezza mm"
              value={form.width_mm}
              onChange={(value) => updateForm("width_mm", value)}
              required
            />
            <NumberField
              label="Altezza mm"
              value={form.height_mm}
              onChange={(value) => updateForm("height_mm", value)}
              required
            />
            <NumberField
              label="Profondità mm"
              value={form.depth_mm}
              onChange={(value) => updateForm("depth_mm", value)}
              required
            />
            <NumberField
              label="Spessore mm"
              value={form.thickness_mm}
              onChange={(value) => updateForm("thickness_mm", value)}
            />
          </div>

          <NumberField
            label="Prezzo opzionale"
            value={form.price}
            onChange={(value) => updateForm("price", value)}
            step="0.01"
          />

          <AssetUrlField
            field="preview_image_url"
            helperText="JPG, PNG o WebP."
            isUploading={uploadingField === "preview_image_url"}
            label="URL immagine preview opzionale"
            uploadLabel="Carica preview"
            value={form.preview_image_url}
            onChange={(value) => updateForm("preview_image_url", value)}
            onUpload={handleAssetUpload}
          />
          <AssetUrlField
            field="model_url"
            helperText="GLB o GLTF. Questo file viene caricato dal configuratore 3D."
            isUploading={uploadingField === "model_url"}
            label="URL modello 3D opzionale"
            uploadLabel="Carica GLB"
            value={form.model_url}
            onChange={(value) => updateForm("model_url", value)}
            onUpload={handleAssetUpload}
          />
          <AssetUrlField
            field="technical_file_url"
            helperText="RFA, PDF, DWG o ZIP. Gli RFA restano file sorgente tecnico, non vengono renderizzati in scena."
            isUploading={uploadingField === "technical_file_url"}
            label="URL file tecnico opzionale"
            uploadLabel="Carica RFA"
            value={form.technical_file_url}
            onChange={(value) => updateForm("technical_file_url", value)}
            onUpload={handleAssetUpload}
          />

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(event) =>
                updateForm("is_published", event.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            Pubblicato nel configuratore
          </label>

          <button
            type="submit"
            disabled={isSaving || uploadingField !== null}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : editingProduct ? (
              <Save className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            {editingProduct ? "Salva modifiche" : "Crea prodotto"}
          </button>
        </div>
      </form>
    </section>
  );
}

type AssetUrlFieldProps = {
  field: ProductAssetField;
  helperText: string;
  isUploading: boolean;
  label: string;
  uploadLabel: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (
    field: ProductAssetField,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
};

// Unisce URL manuale e upload diretto per gli asset collegati al prodotto.
function AssetUrlField({
  field,
  helperText,
  isUploading,
  label,
  uploadLabel,
  value,
  onChange,
  onUpload,
}: AssetUrlFieldProps) {
  const inputId = `asset-upload-${field}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={`${field}-url`}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        {value ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Collegato
          </span>
        ) : null}
      </div>

      <input
        id={`${field}-url`}
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
      />

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-gray-500">{helperText}</p>
        <label
          htmlFor={inputId}
          className={`inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 ${
            isUploading ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          {isUploading ? "Caricamento" : uploadLabel}
        </label>
      </div>

      <input
        id={inputId}
        type="file"
        accept={getProductAssetAccept(field)}
        disabled={isUploading}
        onChange={(event) => onUpload(field, event)}
        className="sr-only"
      />
    </div>
  );
}

function ProductDetail({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-gray-500">{label}:</span> {value}
    </p>
  );
}

type ResourceChipProps = {
  icon: typeof ImageIcon;
  label: string;
};

function ResourceChip({ icon: Icon, label }: ResourceChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 ring-1 ring-gray-200">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "url";
};

function TextField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: TextFieldProps) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
      />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  step?: string;
};

function NumberField({
  label,
  value,
  onChange,
  required = false,
  step = "1",
}: NumberFieldProps) {
  const hintId = `number-field-${label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        pattern="[0-9]+([,.][0-9]+)?"
        aria-describedby={hintId}
        className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
      />
      <span id={hintId} className="sr-only">
        Inserisci un numero positivo, usando punto o virgola per i decimali.
        Precisione suggerita: {step}.
      </span>
    </label>
  );
}
