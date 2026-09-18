"use client";

import { DatabaseIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

export const notes =
  "Placeholder shown when a list, table, or page has no content. Provide `icon`, `title`, and `description`; `commandLine` renders a copyable shell command and `contents` slots in action buttons. `size` adjusts padding for smaller containers.";

export function Demo() {
  return (
    <Empty
      icon={<DatabaseIcon size={48} className="text-kumo-inactive" />}
      title="No KV namespaces"
      description="Create a namespace to cache key-value data at the edge."
      commandLine="npx wrangler kv namespace create CACHE"
      contents={
        <Button variant="primary" icon={PlusIcon}>
          Create namespace
        </Button>
      }
    />
  );
}
