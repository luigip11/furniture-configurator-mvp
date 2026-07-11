"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  CatalogPanel,
  createDefaultCatalogCollapsedGroups,
  type CatalogCollapsedGroups,
} from "@/components/configurator/CatalogPanel";
import { ConfiguratorScene } from "@/components/configurator/ConfiguratorScene";
import { ProductPropertiesPanel } from "@/components/configurator/ProductPropertiesPanel";
import { QuotePanel } from "@/components/configurator/QuotePanel";
import { Product } from "@/types/configurator";
import { useConfiguratorStore } from "@/store/configurator-store";
import { dictionary } from "@/lib/i18n/dictionary";

type ConfiguratorWorkspaceProps = {
  products: Product[];
};

export function ConfiguratorWorkspace({ products }: ConfiguratorWorkspaceProps) {
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);
  const [catalogExpandedWithSelection, setCatalogExpandedWithSelection] =
    useState(false);
  const [catalogCollapsedGroups, setCatalogCollapsedGroups] =
    useState<CatalogCollapsedGroups>(() => createDefaultCatalogCollapsedGroups());
  const locale = useConfiguratorStore((state) => state.locale);
  const selectedItemId = useConfiguratorStore((state) => state.selectedItemId);
  const t = dictionary[locale];
  const mobileSelectionCollapsed =
    Boolean(selectedItemId) && !catalogExpandedWithSelection;

  // Mantiene stabile l'apertura delle sezioni anche se il pannello viene rimontato dal layout responsive.
  function toggleCatalogGroup(groupId: string, collapsed: boolean) {
    setCatalogCollapsedGroups((currentGroups) => ({
      ...currentGroups,
      [groupId]: collapsed,
    }));
  }

  const gridClassName = catalogCollapsed
    ? "grid min-w-0 flex-1 gap-4 transition-[grid-template-columns] lg:h-full lg:min-h-0 lg:grid-cols-[40px_minmax(0,1fr)_300px]"
    : "grid min-w-0 flex-1 gap-4 transition-[grid-template-columns] lg:h-full lg:min-h-0 lg:grid-cols-[260px_minmax(0,1fr)_300px]";

  return (
    <div className={gridClassName}>
      <div className="order-2 min-h-[56px] min-w-0 lg:order-1 lg:h-full lg:min-h-0 lg:overflow-hidden">
        {catalogCollapsed ? (
          <CollapsedCatalogPanel
            expandLabel={t.expandCatalog}
            title={t.catalog}
            onExpand={() => {
              setCatalogCollapsed(false);
              setCatalogExpandedWithSelection(true);
            }}
          />
        ) : mobileSelectionCollapsed ? (
          <>
            <div className="lg:hidden">
              <CollapsedCatalogPanel
                expandLabel={t.expandCatalog}
                title={t.catalog}
                onExpand={() => setCatalogExpandedWithSelection(true)}
              />
            </div>
            <div className="hidden h-full lg:block">
              <CatalogPanel
                collapsedGroups={catalogCollapsedGroups}
                products={products}
                onCollapse={() => {
                  setCatalogExpandedWithSelection(false);
                  setCatalogCollapsed(true);
                }}
                onToggleGroup={toggleCatalogGroup}
              />
            </div>
          </>
        ) : (
          <CatalogPanel
            collapsedGroups={catalogCollapsedGroups}
            products={products}
            onCollapse={() => {
              setCatalogExpandedWithSelection(false);
              setCatalogCollapsed(true);
            }}
            onToggleGroup={toggleCatalogGroup}
          />
        )}
      </div>

      <div className="order-1 min-h-[420px] min-w-0 sm:min-h-[520px] lg:order-2 lg:h-full lg:min-h-0">
        <ConfiguratorScene compactHint={catalogCollapsed} products={products} />
      </div>

      <div className="order-3 min-w-0 space-y-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
        <ProductPropertiesPanel />
        <QuotePanel />
      </div>
    </div>
  );
}

type CollapsedCatalogPanelProps = {
  expandLabel: string;
  onExpand: () => void;
  title: string;
};

// Mostra il catalogo collassato in modo compatto su desktop e contestuale su mobile.
function CollapsedCatalogPanel({
  expandLabel,
  onExpand,
  title,
}: CollapsedCatalogPanelProps) {
  return (
    <>
      <aside className="rounded-2xl border bg-white p-4 shadow-sm lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label={expandLabel}
            title={expandLabel}
            onClick={onExpand}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="hidden h-full min-h-[40px] items-start justify-center lg:flex">
        <button
          type="button"
          aria-label={expandLabel}
          title={expandLabel}
          onClick={onExpand}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
