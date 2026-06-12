"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderTree, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import {
  buildCategoryPayload,
  categoryToForm,
  emptyCategoryForm,
  type CategoryFormValues,
} from "@/lib/admin/category-form";
import { supabase } from "@/lib/supabase/client";
import type { Category } from "@/types/configurator";

type CategoryAdminProps = {
  initialCategories: Category[];
};

export function CategoryAdmin({ initialCategories }: CategoryAdminProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<CategoryFormValues>(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editingCategory = categories.find(
    (category) => category.id === editingCategoryId
  );

  function updateForm<Key extends keyof CategoryFormValues>(
    key: Key,
    value: CategoryFormValues[Key]
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function resetForm() {
    setForm(emptyCategoryForm);
    setEditingCategoryId(null);
    setErrorMessage(null);
  }

  function startEdit(category: Category) {
    setForm(categoryToForm(category));
    setEditingCategoryId(category.id);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = buildCategoryPayload(form);

      if (editingCategoryId) {
        const { data, error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategoryId)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        const savedCategory = data as Category;
        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === savedCategory.id ? savedCategory : category
          )
        );
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert(payload)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        setCategories((currentCategories) => [
          data as Category,
          ...currentCategories,
        ]);
      }

      resetForm();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossibile salvare la categoria."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Eliminare la categoria "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.filter(
        (currentCategory) => currentCategory.id !== category.id
      )
    );

    if (editingCategoryId === category.id) {
      resetForm();
    }

    router.refresh();
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold">Lista categorie</h2>
            <p className="mt-1 text-sm text-gray-500">
              {categories.length} categorie disponibili
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 text-gray-800">
            <FolderTree className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        {categories.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">
            Nessuna categoria presente.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <article
                key={category.id}
                className="group relative p-4 transition hover:bg-gray-50/80"
              >
                <span className="absolute left-0 top-4 h-[calc(100%-2rem)] w-1 rounded-r-full bg-gray-300 transition group-hover:bg-gray-500" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold transition group-hover:text-gray-700">
                      {category.name}
                    </h3>
                    <p className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                      /{category.slug}
                    </p>
                    {category.description ? (
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {category.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-gray-500">
                      Ordine: {category.sort_order ?? "-"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Modifica
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Elimina
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:self-start"
      >
        <div className="-mx-4 -mt-4 mb-4 flex items-start justify-between gap-3 rounded-t-2xl border-b border-gray-200 bg-gray-50 px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {editingCategory ? "Modifica categoria" : "Nuova categoria"}
            </h2>
            {editingCategory ? (
              <p className="mt-1 text-sm text-gray-500">
                {editingCategory.name}
              </p>
            ) : null}
          </div>
          {editingCategory ? (
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
          <TextField
            label="Nome"
            value={form.name}
            onChange={(value) => updateForm("name", value)}
            required
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(value) => updateForm("slug", value)}
          />
          <label className="block text-sm font-medium text-gray-700">
            Descrizione
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </label>
          <TextField
            label="Ordine"
            value={form.sort_order}
            onChange={(value) => updateForm("sort_order", value)}
            type="number"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : editingCategory ? (
              <Save className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            {editingCategory ? "Salva modifiche" : "Crea categoria"}
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
  type?: "text" | "number";
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
