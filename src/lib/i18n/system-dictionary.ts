import type { Locale } from "@/types/configurator";

// Testi delle pagine di sistema (errore imprevisto e pagina inesistente), condivisi da tutta l'app.
export const systemDictionary = {
  it: {
    errorTitle: "Qualcosa è andato storto",
    errorDescription:
      "Si è verificato un errore imprevisto. Le modifiche già salvate non sono andate perse: riprova o torna alla pagina iniziale.",
    errorCode: (digest: string) => `Codice errore: ${digest}`,
    retry: "Riprova",
    notFoundTitle: "Pagina non trovata",
    notFoundDescription:
      "L'indirizzo non corrisponde a nessuna pagina. Controlla il link o riparti dal configuratore.",
    openConfigurator: "Apri configuratore",
    backHome: "Torna alla home",
  },
  en: {
    errorTitle: "Something went wrong",
    errorDescription:
      "An unexpected error occurred. Changes already saved have not been lost: try again or go back to the home page.",
    errorCode: (digest: string) => `Error code: ${digest}`,
    retry: "Try again",
    notFoundTitle: "Page not found",
    notFoundDescription:
      "This address does not match any page. Check the link or start again from the configurator.",
    openConfigurator: "Open configurator",
    backHome: "Back to home",
  },
  fr: {
    errorTitle: "Une erreur s'est produite",
    errorDescription:
      "Une erreur inattendue s'est produite. Les modifications déjà enregistrées ne sont pas perdues : réessayez ou revenez à l'accueil.",
    errorCode: (digest: string) => `Code d'erreur : ${digest}`,
    retry: "Réessayer",
    notFoundTitle: "Page introuvable",
    notFoundDescription:
      "Cette adresse ne correspond à aucune page. Vérifiez le lien ou repartez du configurateur.",
    openConfigurator: "Ouvrir le configurateur",
    backHome: "Retour à l'accueil",
  },
} satisfies Record<Locale, object>;
