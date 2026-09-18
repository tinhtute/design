"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export const notes =
  "Modal overlay for confirmations and focused tasks. Compose `Dialog.Root` + `Dialog.Trigger` + `Dialog`; control open state externally when the flow needs it. Focus is trapped and Escape closes.";

export const deps = ["button"];

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={<Button variant="secondary">Open dialog</Button>}
      />
      <Dialog>
        <Dialog.Title>Confirm</Dialog.Title>
        <Dialog.Description>Custom dialog description.</Dialog.Description>
      </Dialog>
    </Dialog.Root>
  );
}
