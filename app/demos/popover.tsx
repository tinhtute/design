"use client";

import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";

export const notes =
  "Non-modal panel anchored to a trigger for contextual details or small forms. Compose `Popover` + `.Trigger` + `.Content` (`side`, `align`, `sideOffset`) with `.Title`/`.Description`; Escape and outside click dismiss.";

export function Demo() {
  return (
    <Popover>
      <Popover.Trigger
        render={<Button variant="secondary">Route details</Button>}
      />
      <Popover.Content>
        <Popover.Title>api.example.com/*</Popover.Title>
        <Popover.Description>
          Served by worker api-gateway in production. Error rate 0.02% over
          the last 24 hours.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}
