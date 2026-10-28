// Cancellazioni admin dal browser: passano dalle API protette invece che dal client Supabase anon.
export type AdminDeleteTarget = "products" | "categories";

// Restituisce un esito esplicito anche per errori di rete o risposte non JSON, senza lanciare eccezioni.
export async function deleteAdminRecord(
  target: AdminDeleteTarget,
  id: string,
): Promise<{ ok: true } | { ok: false; message: string | null }> {
  let response: Response;
  try {
    response = await fetch(
      `/api/admin/${target}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  } catch {
    return { ok: false, message: null };
  }
  if (response.ok) return { ok: true };
  const result = await response.json().catch(() => null);
  return {
    ok: false,
    message: typeof result?.message === "string" ? result.message : null,
  };
}
