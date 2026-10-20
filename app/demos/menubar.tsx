'use client';

import { useState } from 'react';
import {
  Menu01Icon as ListIcon,
  GridViewIcon,
  Analytics01Icon as ChartIcon,
} from '@hugeicons/core-free-icons';
import { MenuBar } from '@/components/ui/menubar';

export const notes =
  'Deprecated icon-button bar with arrow-key navigation and tooltip labels; prefer `Tabs` with `variant="segmented"` in new code. `isActive` matches the option index, or each option `id` when `optionIds` is set.';

export function Demo() {
  const [view, setView] = useState(0);

  return (
    <MenuBar
      isActive={view}
      options={[
        { icon: ListIcon, tooltip: 'List view', onClick: () => setView(0) },
        { icon: GridViewIcon, tooltip: 'Grid view', onClick: () => setView(1) },
        { icon: ChartIcon, tooltip: 'Chart view', onClick: () => setView(2) },
      ]}
    />
  );
}
