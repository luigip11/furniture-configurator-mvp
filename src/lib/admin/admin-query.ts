// Esito di una lettura admin: un elenco vuoto non va confuso con un errore del database.
export type AdminRowsResult<T> = { rows: T[]; failed: boolean };

// Esegue la query e segnala errori restituiti, risultati non validi ed eccezioni di rete o configurazione.
export async function loadAdminRows<T>(
  label: string,
  query: () => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<AdminRowsResult<T>> {
  try {
    const { data, error } = await query();
    if (error || !Array.isArray(data)) {
      console.error(`Error loading ${label}`, error);
      return { rows: [], failed: true };
    }
    return { rows: data, failed: false };
  } catch (error) {
    console.error(`Error loading ${label}`, error);
    return { rows: [], failed: true };
  }
}
