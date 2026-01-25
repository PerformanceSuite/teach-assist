export default function Page() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Notebook</h1>
      <p className="text-neutral-700">Grounded sources + transforms (NotebookLM-compatible workflow).</p>
      <div className="rounded-lg border p-4 text-sm text-neutral-600">
        v0 scaffolding: UI + routing + auth are in place. Implement core workflows next.
      </div>
    </div>
  );
}
