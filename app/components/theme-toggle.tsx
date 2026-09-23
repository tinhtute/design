'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon as Moon, Sun03Icon as Sun } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => {
        const root = document.documentElement;
        const next = root.getAttribute('data-mode') !== 'dark';
        root.setAttribute('data-mode', next ? 'dark' : 'light');
        root.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
      }}
    >
      <HugeiconsIcon icon={Sun} className="size-4 [[data-mode=dark]_&]:hidden" />
      <HugeiconsIcon icon={Moon} className="hidden size-4 [[data-mode=dark]_&]:block" />
      Theme
    </Button>
  );
}
