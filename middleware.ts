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

  // No session — redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Email allowlist check
  const email = user.email?.toLowerCase();
  if (!email || !ALLOWED_EMAILS.has(email)) {
    // Sign out by clearing supabase cookies and redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "unauthorized");
    const response = NextResponse.redirect(url);
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
