// Distingue l'aggiunta/rimozione di moduli dai normali aggiornamenti di un elemento esistente.
export function hasSceneCompositionChanged(
  previousItemIds: string[],
  currentItemIds: string[]
) {
  if (previousItemIds.length !== currentItemIds.length) return true;

  const previousIds = new Set(previousItemIds);

  return currentItemIds.some((itemId) => !previousIds.has(itemId));
}
