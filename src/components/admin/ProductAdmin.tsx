"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = buildProductPayload(form);

      if (editingProductId) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProductId)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        const savedProduct = data as Product;
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === savedProduct.id ? savedProduct : product
          )
        );
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        setProducts((currentProducts) => [data as Product, ...currentProducts]);
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

    const { data, error } = await supabase
      .from("products")
      .update({ is_published: !product.is_published })
      .eq("id", product.id)
      .select("*")
      .single();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const savedProduct = data as Product;
    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === savedProduct.id ? savedProduct : currentProduct
      )
    );
    router.refresh();
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
      <div className="min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Lista prodotti</h2>
          <p className="mt-1 text-sm text-gray-500">
            {products.length} prodotti in catalogo
          </p>
        </div>

        {products.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Nessun prodotto presente.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => {
              const categoryName = product.category_id
                ? categoryById.get(product.category_id)?.name
                : null;

              return (
                <article key={product.id} className="p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {product.name_it}
                        </h3>
                        <span
                          className={
                            product.is_published
                              ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                          }
                        >
                          {product.is_published ? "Pubblicato" : "Bozza"}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-1 text-sm text-gray-600 sm:grid-cols-2">
                        <p>Nome EN: {product.name_en || "-"}</p>
                        <p>Codice: {product.code || "-"}</p>
                        <p>Categoria: {categoryName || "-"}</p>
                        <p>
                          Dimensioni: {product.width_mm} x {product.height_mm} x{" "}
                          {product.depth_mm} mm
                        </p>
                        <p>Spessore: {product.thickness_mm ?? "-"} mm</p>
                        <p>
                          Prezzo:{" "}
                          {product.price === null || product.price === undefined
                            ? "-"
                            : `${product.price}`}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        {product.preview_image_url ? <span>Preview</span> : null}
                        {product.model_url ? <span>Modello 3D</span> : null}
                        {product.technical_file_url ? (
                          <span>File tecnico</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublished(product)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
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
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
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
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
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
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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
            <select
              value={form.category_id}
              onChange={(event) => updateForm("category_id", event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-gray-950"
            >
              <option value="">Senza categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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

          <TextField
            label="URL immagine preview opzionale"
            value={form.preview_image_url}
            onChange={(value) => updateForm("preview_image_url", value)}
            type="url"
          />
          <TextField
            label="URL modello 3D opzionale"
            value={form.model_url}
            onChange={(value) => updateForm("model_url", value)}
            type="url"
          />
          <TextField
            label="URL file tecnico opzionale"
            value={form.technical_file_url}
            onChange={(value) => updateForm("technical_file_url", value)}
            type="url"
          />

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700">
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
            disabled={isSaving}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
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
        className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950"
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
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min="0"
        step={step}
        className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950"
      />
    </label>
  );
}
