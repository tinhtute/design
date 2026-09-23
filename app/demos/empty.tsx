'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { DatabaseIcon, PlusSignIcon as PlusIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';

export const notes =
  'Placeholder shown when a list, table, or page has no content. Provide `icon`, `title`, and `description`; `commandLine` renders a copyable shell command and `contents` slots in action buttons. `size` adjusts padding for smaller containers.';

export function Demo() {
  return (
    <Empty
      icon={<HugeiconsIcon icon={DatabaseIcon} size={48} className="text-kumo-inactive" />}
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
