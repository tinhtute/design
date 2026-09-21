'use client';

import { Badge } from '@/components/ui/badge';

export const notes =
  'Compact status label for categorizing content. Pick `variant` by semantics — `success`/`warning`/`error` for states, `primary` for neutral emphasis.';

export function Demo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
    </div>
  );
}
