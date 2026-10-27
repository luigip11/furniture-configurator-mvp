"use client";

import { useConfiguratorStore } from "@/store/configurator-store";

const messages = {
  it: {
    unsupportedFinish:
      "Rimuovi prima top e ante nominali: la variante richiesta non supporta questi optional.",
    dimensionsLocked:
      "Le misure di questa variante sono fisse: mancano formule parametriche validate. Ripristina le quote di catalogo prima di cambiare variante.",
    invalidDimensions:
      "Modifica non applicata: rispetta i limiti dimensionali indicati nelle proprietà.",
    invalidCoordinates:
      "Modifica non applicata: inserisci coordinate numeriche valide.",
    capacityExceeded:
      "Spazio insufficiente: la composizione supera i limiti del piano. Riduci le dimensioni o rimuovi un modulo.",
    collision:
      "Modifica non applicata: il modulo si sovrapporrebbe a un altro elemento.",
    variantUnavailable:
      "La variante richiesta non è disponibile per questo prodotto.",
    dismiss: "Chiudi avviso",
  },
  en: {
    unsupportedFinish:
      "Remove the top and nominal doors first: the requested variant does not support these options.",
    dimensionsLocked:
      "This variant has fixed dimensions: validated parametric rules are unavailable. Restore the catalog dimensions before changing variants.",
    invalidDimensions:
      "Change rejected: use the dimension limits shown in properties.",
    invalidCoordinates: "Change rejected: enter valid numeric coordinates.",
    capacityExceeded:
      "Insufficient space: the composition exceeds the workspace. Reduce dimensions or remove a module.",
    collision: "Change rejected: the module would overlap another item.",
    variantUnavailable:
      "The requested variant is unavailable for this product.",
    dismiss: "Dismiss notification",
  },
  fr: {
    unsupportedFinish:
      "Retirez d'abord le dessus et les portes nominales : la variante demandée ne prend pas en charge ces options.",
    dimensionsLocked:
      "Les dimensions de cette variante sont fixes : les formules paramétriques validées sont indisponibles. Rétablissez les dimensions du catalogue avant de changer de variante.",
    invalidDimensions:
      "Modification refusée : respectez les limites indiquées dans les propriétés.",
    invalidCoordinates:
      "Modification refusée : saisissez des coordonnées numériques valides.",
    capacityExceeded:
      "Espace insuffisant : la composition dépasse le plan. Réduisez les dimensions ou retirez un module.",
    collision:
      "Modification refusée : le module chevaucherait un autre élément.",
    variantUnavailable:
      "La variante demandée est indisponible pour ce produit.",
    dismiss: "Fermer le message",
  },
};

// Segnala un'operazione rifiutata mantenendo utilizzabile l'ultima composizione valida.
export function ConfigurationNotice() {
  const error = useConfiguratorStore((state) => state.configurationError);
  const locale = useConfiguratorStore((state) => state.locale);
  const dismiss = useConfiguratorStore(
    (state) => state.dismissConfigurationError,
  );
  if (!error) return null;
  return (
    <div
      role="alert"
      className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p>{messages[locale][error]}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={messages[locale].dismiss}
        className="shrink-0 rounded px-2 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600"
      >
        ×
      </button>
    </div>
  );
}
