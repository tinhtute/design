'use client';

import type { ReactNode } from 'react';

export function SkipLink({ targetId, children }: { targetId: string; children: ReactNode }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-kumo-base focus:px-3 focus:py-2 focus:text-sm focus:text-kumo-default focus:ring-2 focus:ring-kumo-focus"
      onClick={(event) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        event.preventDefault();
        target.focus();
        target.scrollIntoView({ block: 'nearest' });
      }}
    >
      {children}
    </a>
  );
}
