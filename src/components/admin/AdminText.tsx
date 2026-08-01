"use client";

import { adminDictionary } from "@/lib/i18n/admin-dictionary";
import { useConfiguratorStore } from "@/store/configurator-store";

type AdminTextKey = "catalog" | "archive" | "experience" | "products" | "categories" | "configurator" | "totalProducts" | "published" | "drafts" | "availableCategories" | "total" | "online" | "settings" | "catalogStatus" | "modulesVisible" | "noPublishedModules";

// Renderizza una stringa della dashboard lato client seguendo la lingua globale.
export function AdminText({ textKey, value }: { textKey: AdminTextKey; value?: number }) {
  const locale = useConfiguratorStore((state) => state.locale);
  const translation = adminDictionary[locale][textKey];

  return typeof translation === "function" ? translation(value ?? 0) : translation;
}
