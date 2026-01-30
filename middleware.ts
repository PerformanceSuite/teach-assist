export { default } from "next-auth/middleware";

export const config = {
  // Protect all authenticated routes
  matcher: [
    "/app/:path*",
    "/narratives/:path*",
    "/sources/:path*",
    "/chat/:path*",
    "/council/:path*",
  ],
};
