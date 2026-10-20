'use client';

import { InlineCopyText } from '@/components/ui/inline-copy-text';

export const notes =
  'Borderless copy control for IDs in dense layouts. The copy icon shows on hover/focus (or when an enclosing `group` row is hovered) and swaps to a check after copying. Pass `value` when the displayed content differs from what should be copied.';

export function Demo() {
  return (
    <div className="flex flex-col gap-2 text-sm text-kumo-default">
      <span>
        Database ID: <InlineCopyText>0c239dd2-5b2a-4e1d-9f7a-3c1e8d2a4b6f</InlineCopyText>
      </span>
      <span>
        Account:{' '}
        <InlineCopyText variant="body" value="acct_8f2e1c">
          Production account
        </InlineCopyText>
      </span>
    </div>
  );
}
