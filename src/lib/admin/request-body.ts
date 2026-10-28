// Legge JSON piccoli senza accumulare corpi illimitati nelle funzioni server.
export async function readAdminJson(
  request: Request,
  maxBytes = 65536,
): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > maxBytes) throw new Error("Payload troppo grande.");
  if (!request.body) throw new Error("Payload JSON mancante.");
  const reader = request.body.getReader();
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new Error("Payload troppo grande.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Payload JSON non valido.");
  }
}

// Espone errori di input comprensibili senza includere dettagli di infrastruttura.
export function adminInputError(error: unknown) {
  return Response.json(
    { message: error instanceof Error ? error.message : "Dati non validi." },
    {
      status:
        error instanceof Error && error.message === "Payload troppo grande."
          ? 413
          : 400,
    },
  );
}
