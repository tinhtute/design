'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteResource } from '@/components/delete-resource';

export const notes =
  'Type-to-confirm dialog for destructive deletes — the Delete button stays disabled until the input matches `resourceName`. Control `open`/`onOpenChange` in the parent so a row action can trigger it; `onDelete` runs after confirmation.';

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete worker
      </Button>
      <DeleteResource
        open={open}
        onOpenChange={setOpen}
        resourceType="worker"
        resourceName="api-gateway"
        onDelete={() => setOpen(false)}
      />
    </>
  );
}
