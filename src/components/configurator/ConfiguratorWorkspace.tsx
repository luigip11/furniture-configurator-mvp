"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CatalogPanel } from "@/components/configurator/CatalogPanel";
import { ConfiguratorScene } from "@/components/configurator/ConfiguratorScene";
import { ProductPropertiesPanel } from "@/components/configurator/ProductPropertiesPanel";
import { QuotePanel } from "@/components/configurator/QuotePanel";
import { Product } from "@/types/configurator";

type ConfiguratorWorkspaceProps = {
  products: Product[];
};

export function ConfiguratorWorkspace({ products }: ConfiguratorWorkspaceProps) {
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);

  const gridClassName = catalogCollapsed
    ? "grid min-w-0 flex-1 gap-4 transition-[grid-template-columns] lg:h-full lg:min-h-0 lg:grid-cols-[40px_minmax(0,1fr)_320px]"
    : "grid min-w-0 flex-1 gap-4 transition-[grid-template-columns] lg:h-full lg:min-h-0 lg:grid-cols-[280px_minmax(0,1fr)_320px]";

  return (
    <div className={gridClassName}>
      <div className="min-h-[56px] min-w-0 lg:h-full lg:min-h-0 lg:overflow-hidden">
        {catalogCollapsed ? (
          <div className="flex h-full min-h-[40px] items-start justify-center">
            <button
              type="button"
              aria-label="Espandi catalogo"
              title="Espandi catalogo"
              onClick={() => setCatalogCollapsed(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <CatalogPanel
            products={products}
            onCollapse={() => setCatalogCollapsed(true)}
          />
        )}
      </div>

      <div className="min-h-[520px] min-w-0 lg:h-full lg:min-h-0">
        <ConfiguratorScene />
      </div>

      <div className="min-w-0 space-y-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
        <ProductPropertiesPanel />
        <QuotePanel />
      </div>
    </div>
  );
}
