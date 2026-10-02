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

  // Sync the persisted choice before paint. Whitelists 'hc' exactly,
  // matching the beforeInteractive restore script in layout.tsx —
  // a corrupt stored value falls back to the default instead of
  // writing a stray attribute or an unknown Select value.
  useLayoutEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'hc') {
        document.documentElement.setAttribute(THEME_ATTR, 'hc');
        setTheme('hc');
      }
    } catch {
      // storage unavailable (private mode / blocked) — keep default
    }
  }, []);

  function handleChange(value: unknown) {
    const next = String(value) === 'hc' ? 'hc' : 'default';
    setTheme(next);
    if (next === 'default') {
      document.documentElement.removeAttribute(THEME_ATTR);
    } else {
      document.documentElement.setAttribute(THEME_ATTR, next);
    }
    try {
      if (next === 'default') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // attribute already applied; persistence is best-effort
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
