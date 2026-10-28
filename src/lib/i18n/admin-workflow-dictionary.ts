// Testi per selezione differita dei file e gestione di esiti di salvataggio non determinabili.
export const adminWorkflowDictionary = {
  it: {
    selectedFile: "File selezionato",
    pendingFile:
      "Il file verrà caricato solo salvando il prodotto. Annullando il form non verrà inviato.",
    removeFile: "Rimuovi selezione file",
    selectFile: "Seleziona file",
    maxSize: "Dimensione massima",
    storageLimit:
      "Il servizio di archiviazione può applicare un limite inferiore.",
    uncertainSave:
      "Esito del salvataggio non verificabile. Controlla l’elenco prodotti dopo aver ricaricato prima di riprovare. I nuovi file non sono stati rimossi perché potrebbero essere già associati.",
  },
  en: {
    selectedFile: "Selected file",
    pendingFile:
      "The file will upload only when you save the product. Cancelling the form sends nothing.",
    removeFile: "Remove selected file",
    selectFile: "Select file",
    maxSize: "Maximum size",
    storageLimit: "The storage service may apply a lower limit.",
    uncertainSave:
      "The save outcome could not be verified. Reload and check the product list before retrying. New files were retained because they may already be associated.",
  },
  fr: {
    selectedFile: "Fichier sélectionné",
    pendingFile:
      "Le fichier sera téléversé uniquement à l’enregistrement du produit. Annuler le formulaire n’envoie rien.",
    removeFile: "Retirer le fichier sélectionné",
    selectFile: "Sélectionner un fichier",
    maxSize: "Taille maximale",
    storageLimit:
      "Le service de stockage peut appliquer une limite inférieure.",
    uncertainSave:
      "Le résultat de l’enregistrement est incertain. Rechargez et vérifiez la liste des produits avant de réessayer. Les nouveaux fichiers sont conservés car ils peuvent déjà être associés.",
  },
};
