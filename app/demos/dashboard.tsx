'use client';

import { Dashboard } from '@/components/dashboard';

export const notes =
  'Full-page dashboard shell composing a header, sidebar nav, stat cards, and a recent-orders data table — a copy-paste starting point rather than a configured component.';

export function Demo() {
  return (
    <div className="h-140 min-w-0 max-w-full overflow-y-auto rounded-md ring ring-kumo-line">
      <Dashboard />
    </div>
  );
}
