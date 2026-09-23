'use client';

import {
  AnalyticsUpIcon as ChartLineIcon,
  Copy01Icon as CopyIcon,
  PencilEdit01Icon as PencilSimpleIcon,
  Delete02Icon as TrashIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

export const notes =
  'Anchored menu for contextual actions on a resource. Compose `DropdownMenu` + `.Trigger` + `.Content` with `.Item` (`icon`, `variant="danger"`) and `.Separator`; keyboard navigable with managed focus.';

export const deps = ['button'];

export function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<Button variant="secondary">Worker actions</Button>} />
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={PencilSimpleIcon}>Edit code</DropdownMenu.Item>
        <DropdownMenu.Item icon={CopyIcon}>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Item icon={ChartLineIcon}>View metrics</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="danger" icon={TrashIcon}>
          Delete worker
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
