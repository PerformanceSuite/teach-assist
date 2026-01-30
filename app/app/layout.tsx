/**
 * App Layout - Layout for /app/* routes
 * Navigation is now handled by GlobalLayout, so this just passes through children
 */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
