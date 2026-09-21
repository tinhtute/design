'use client';

import { Moon, Sun } from '@phosphor-icons/react';
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
      <Sun className="size-4 [[data-mode=dark]_&]:hidden" />
      <Moon className="hidden size-4 [[data-mode=dark]_&]:block" />
      Theme
    </Button>
  );
}
