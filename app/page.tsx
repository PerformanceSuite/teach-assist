import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">TeachAssist</h1>
      <p className="text-neutral-700">
        Teacher-first professional operating system (friend-only pilot). Plan, grade, capture insights, and
        manage relationships — with human-centered AI guardrails.
      </p>
      <div className="flex gap-3">
        <Link className="rounded-md bg-black px-4 py-2 text-white" href="/api/auth/signin">Sign in with Google</Link>
        <Link className="rounded-md border px-4 py-2" href="/app/principles">Read principles</Link>
      </div>
      <p className="text-xs text-neutral-500">
        Pilot note: access is restricted to allowlisted teacher emails.
      </p>
    </main>
  );
}
