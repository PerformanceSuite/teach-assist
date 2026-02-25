import Link from "next/link";

export default function Today() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Today Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          This is the teacher home base. In v0, it includes quick links into Sunday Rescue Mode.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white" href="/app/grade">
            Sunday Rescue: Grade Batch
          </Link>
          <Link className="rounded-md border px-3 py-2 text-sm" href="/app/plan">
            Plan Tuesday / Week
          </Link>
          <Link className="rounded-md border px-3 py-2 text-sm" href="/app/notebook">
            Notebook
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Draft Inbox (placeholder)</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Feedback drafts, message drafts, lesson drafts.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Instant Capture (placeholder)</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">One-click capture of insights, linked to context.</p>
        </div>
      </section>
    </div>
  );
}
