"use client";

import {
  ChartLineIcon,
  CopyIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

export const notes =
  "Anchored menu for contextual actions on a resource. Compose `DropdownMenu` + `.Trigger` + `.Content` with `.Item` (`icon`, `variant=\"danger\"`) and `.Separator`; keyboard navigable with managed focus.";

export function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={<Button variant="secondary">Worker actions</Button>}
      />
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={PencilSimpleIcon}>
          Edit code
        </DropdownMenu.Item>
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
