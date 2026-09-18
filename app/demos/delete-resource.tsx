"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DeleteResource } from "@/components/delete-resource";

export const notes =
  "Type-to-confirm dialog for destructive deletes — the Delete button stays disabled until the input matches `resourceName`. Control `open`/`onOpenChange` in the parent so a row action can trigger it; `onDelete` runs after confirmation.";

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={<Button variant="destructive">Delete worker</Button>}
      />
      <DeleteResource
        open={open}
        onOpenChange={setOpen}
        resourceType="worker"
        resourceName="api-gateway"
        onDelete={() => setOpen(false)}
      />
    </Dialog.Root>
  );
}
