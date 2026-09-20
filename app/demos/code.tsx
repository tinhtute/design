"use client";

import { Code } from "@/components/ui/code";

export const notes =
  "Plain monospace snippets via `Code`; `Code.Block` adds Shiki syntax highlighting with the mono dual themes, a filename title bar, line numbers, and a copy button. Pass pre-highlighted `html` for server-rendered docs, or `code` only to highlight lazily in the browser.";

export function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Code lang="bash" code="npx wrangler deploy --minify" />
      <Code.Block
        title="worker.ts"
        lang="ts"
        code={`import { AutoRouter } from "itty-router";

const router = AutoRouter();

router.get("/hello", () => new Response("Hello, mono!"));

export default router;`}
      />
      <Code.Block
        title="wrangler.jsonc"
        lang="jsonc"
        showLineNumbers={false}
        code={`{
  // Deployment config for the mono worker
  "name": "mono-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-09-20"
}`}
      />
    </div>
  );
}
