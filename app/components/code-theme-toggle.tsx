'use client';

import { useLayoutEffect, useState } from 'react';
import { Select } from '@/components/ui/select';

const STORAGE_KEY = 'code-theme';
const THEME_ATTR = 'data-code-theme';
const CODE_THEMES = { default: 'Default', hc: 'High contrast' } as const;

/**
 * End-user code theme picker — writes `data-code-theme` on `<html>` so
 * `code.css` recolors every Shiki block via CSS variables (zero
 * re-highlight). The inline `beforeInteractive` script in
 * `app/app/layout.tsx` restores the stored value before first paint.
 * Initial state must match SSR ('default'); `useLayoutEffect` syncs the
 * stored value before paint — no hydration mismatch, no flash — and
 * re-applies the attribute after dev StrictMode remounts (per the
 * Next.js "preventing flash before hydration" guide).
 */
export function CodeThemeToggle() {
  const [theme, setTheme] = useState('default');

  // Sync the persisted choice before paint and re-apply the attribute
  // after React clears <html> attributes on the dev remount.
  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== 'default') {
      document.documentElement.setAttribute(THEME_ATTR, stored);
      setTheme(stored);
    }
  }, []);

  function handleChange(value: unknown) {
    const next = String(value);
    setTheme(next);
    if (next === 'default') {
      document.documentElement.removeAttribute(THEME_ATTR);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      document.documentElement.setAttribute(THEME_ATTR, next);
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  return (
    <Select
      aria-label="Code theme"
      size="sm"
      items={CODE_THEMES}
      value={theme}
      onValueChange={handleChange}
    />
  );
}
