"use client";

import { useState } from "react";
import { Collapsible } from "@/components/ui/collapsible";
import { Text } from "@/components/ui/text";

export const notes =
  "Disclosure component for showing and hiding content. Control it with `open` + `onOpenChange` or leave it uncontrolled; `DefaultTrigger` and `DefaultPanel` give the pre-styled caret header and bordered panel. Keyboard and screen-reader semantics come from Base UI.";

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Collapsible.DefaultTrigger>
        Deployment details
      </Collapsible.DefaultTrigger>
      <Collapsible.DefaultPanel>
        <Text variant="secondary" size="sm">
          Version 4f9c2e71 · deployed 12 minutes ago via wrangler
        </Text>
        <Text variant="secondary" size="sm">
          Routes: api.example.com/* · Bindings: CACHE (KV), DB (D1)
        </Text>
      </Collapsible.DefaultPanel>
    </Collapsible>
  );
}
