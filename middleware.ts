export { default } from "next-auth/middleware";

export const config = {
  // Protect all routes EXCEPT: /shanie*, /api/*, static assets
  // /shanie covers both /shanie (hub) and /shanieholman (public profile)
  matcher: [
    "/((?!shanie|api|_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js).*)",
  ],
};
