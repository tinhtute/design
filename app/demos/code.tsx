"use client";

import { Code } from "@/components/ui/code";

export const notes =
  "Monospace code snippet without syntax highlighting. Pass the source string via `code` and a `lang` hint (ts, tsx, jsonc, bash, css); use `Code.Block` when the snippet needs a bordered surface.";

export function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Code lang="bash" code="npx wrangler deploy --minify" />
      <Code.Block
        lang="ts"
        code={`export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cached = await env.CACHE.get(url.pathname);
    return cached
      ? new Response(cached, { headers: { "x-cache": "hit" } })
      : fetch(request);
  },
};`}
      />
    </div>
  );
}
