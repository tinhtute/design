'use client';

import {
  ArrowClockwiseIcon,
  DotsThreeIcon,
  FunnelSimpleIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { Toolbar } from '@/components/ui/toolbar';

export const notes =
  'Compact control strip that groups related actions into one card. Compose `Toolbar.Button` (icon + optional label), `Toolbar.Link`, `Toolbar.Input`, and `Toolbar.InputGroup`. Icon-only buttons need `aria-label`; arrow-key roving tabindex is built in.';

export function Demo() {
  return (
    <Toolbar>
      <Toolbar.Button icon={PlusIcon}>Create</Toolbar.Button>
      <Toolbar.Button icon={FunnelSimpleIcon} aria-label="Filter" />
      <Toolbar.Button icon={ArrowClockwiseIcon} aria-label="Refresh" />
      <Toolbar.Input placeholder="Filter workers…" aria-label="Filter workers" />
      <Toolbar.Button icon={DotsThreeIcon} aria-label="More actions" />
    </Toolbar>
  );
}
