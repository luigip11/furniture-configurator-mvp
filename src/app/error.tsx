"use client"; // I confini di errore devono essere Client Component.

import { useEffect } from "react";

import { SystemMessage } from "@/components/shared/SystemMessage";

// Sostituisce la pagina di errore generica di Next: il codice digest collega l'errore ai log del server.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SystemMessage
      variant="error"
      digest={error.digest}
      onRetry={() => unstable_retry()}
    />
  );
}
