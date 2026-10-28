import { NextResponse, type NextRequest } from "next/server";
import {
  adminAccessResponse,
  checkAdminAccess,
} from "@/lib/admin/admin-access";

// Primo livello di protezione: chiude pagine e API admin prima del rendering. Route e dati ripetono il controllo.
export function proxy(request: NextRequest) {
  const denial = checkAdminAccess(request.method, request.headers);
  if (!denial) return NextResponse.next();
  return adminAccessResponse(
    denial,
    request.nextUrl.pathname.startsWith("/api/") ? "json" : "text",
  );
}

// "/admin/:path*" copre anche "/admin"; il configuratore pubblico resta fuori dal proxy.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
