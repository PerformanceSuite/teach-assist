import { readFileSync } from "node:fs";
import { join } from "node:path";

export default function Principles() {
  // Render PRD principles excerpt by reading the local PRD.md (server-side).
  // This is intentionally simple for v0.
  const prdPath = join(process.cwd(), "PRD.md");
  const prd = readFileSync(prdPath, "utf8");
  const start = prd.indexOf("## 2. Foundational Principles");
  const end = prd.indexOf("## 3.", start);
  const excerpt = start >= 0 && end > start ? prd.slice(start, end) : prd;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Principles</h1>
      <p className="text-neutral-700">
        Read-only reference: ethics, pedagogy, and guardrails that TeachAssist must preserve.
      </p>
      <pre className="whitespace-pre-wrap rounded-lg border bg-neutral-50 p-4 text-sm leading-relaxed">
        {excerpt}
      </pre>
    </div>
  );
}
