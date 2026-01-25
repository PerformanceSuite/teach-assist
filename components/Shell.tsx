import Link from "next/link";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/sources", label: "Knowledge Base" },
  { href: "/chat", label: "AI Chat" },
  { href: "/council", label: "Inner Council" },
  { href: "/app/notebook", label: "Notebook" },
  { href: "/app/plan", label: "Plan Studio" },
  { href: "/app/grade", label: "Grade Studio" },
];

export function Shell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/app" className="font-semibold tracking-tight">TeachAssist</Link>
          <div className="flex items-center gap-3 text-sm">
            {userEmail ? <span className="text-neutral-600">{userEmail}</span> : null}
            <Link className="rounded-md border px-3 py-1 hover:bg-neutral-50" href="/api/auth/signout">Sign out</Link>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-1 text-sm hover:bg-neutral-100",
                  "border border-transparent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
