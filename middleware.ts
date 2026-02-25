import { updateSession } from "./lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_EMAILS = new Set([
  "shanie@wildvine.com",
  "shanieh@comcast.net",
  "danieldconnolly@gmail.com",
  "dan@wildvine.com",
]);

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/shanie") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  ) {
    return supabaseResponse;
  }

  // Build redirect URL preserving the original host (for wildvine.net proxy)
  function buildRedirect(path: string, params?: Record<string, string>) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    // When accessed through a reverse proxy (e.g. wildvine.net),
    // preserve the original host so redirects stay on that domain
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    if (forwardedHost) {
      url.host = forwardedHost;
      url.port = "";
      if (forwardedProto) url.protocol = forwardedProto + ":";
    }
    return NextResponse.redirect(url);
  }

  // No session — redirect to login
  if (!user) {
    return buildRedirect("/login");
  }

  // Email allowlist check
  const email = user.email?.toLowerCase();
  if (!email || !ALLOWED_EMAILS.has(email)) {
    // Sign out by clearing supabase cookies and redirect to login
    const response = buildRedirect("/login", { error: "unauthorized" });
    // Clear auth cookies
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.delete(cookie.name);
      }
    });
    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js).*)",
  ],
};
