import { SystemMessage } from "@/components/shared/SystemMessage";

// Pagina 404 nello stile dell'app e nella lingua scelta dall'utente.
export default function NotFound() {
  return <SystemMessage variant="notFound" />;
}
