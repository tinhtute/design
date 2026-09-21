'use client';

import { InputArea } from '@/components/ui/input-area';

export const notes =
  "Multi-line textarea for longer freeform content. Shares Input's `label`/`description`/`error` Field props, and adds `autoResize` with `minRows`/`maxRows` so the field grows with content; `onValueChange` hands you the string directly.";

export function Demo() {
  return (
    <div className="grid gap-6">
      <InputArea
        label="Notes"
        placeholder="Write something…"
        description="Visible to everyone on the team."
        rows={3}
      />
      <InputArea
        label="Changelog"
        placeholder="Describe what changed in this deploy…"
        autoResize
        minRows={2}
        maxRows={6}
      />
    </div>
  );
}
