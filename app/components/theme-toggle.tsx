'use client';

import { useSyncExternalStore } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon as Moon, Sun03Icon as Sun } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-mode'] });
  return () => observer.disconnect();
}

function isDarkTheme() {
  return document.documentElement.dataset.mode === 'dark';
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeToTheme, isDarkTheme, () => false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label="Dark theme"
      aria-pressed={dark}
      onClick={() => {
        const root = document.documentElement;
        const next = !isDarkTheme();
        root.dataset.mode = next ? 'dark' : 'light';
        root.classList.toggle('dark', next);
        try {
          localStorage.setItem('theme', next ? 'dark' : 'light');
        } catch {
          // The toggle still works when storage is unavailable.
        }
      }}
    >
      <HugeiconsIcon icon={Sun} className="size-4 [[data-mode=dark]_&]:hidden" />
      <HugeiconsIcon icon={Moon} className="hidden size-4 [[data-mode=dark]_&]:block" />
      <span className="hidden sm:inline">Theme</span>
    </Button>
  );
}
