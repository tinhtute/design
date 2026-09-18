"use client";

import { ClipboardText } from "@/components/ui/clipboard-text";

export const notes =
  "Read-only field with a one-click copy button — use for resource IDs, tokens, and install commands. `textToCopy` copies a different value than displayed, `size` controls density, and `tooltip` adds hover and copied-toast feedback; the copy button's aria-label is configurable via `labels`.";

export function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <ClipboardText
        text="npx wrangler kv namespace create CACHE"
        tooltip={{ text: "Copy command", copiedText: "Copied" }}
      />
      <ClipboardText
        text="api-gateway.my-account.workers.dev"
        textToCopy="https://api-gateway.my-account.workers.dev"
        size="sm"
      />
    </div>
  );
}
