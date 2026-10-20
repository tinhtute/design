'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { LayerDialog } from '@/components/ui/layer-dialog';

export const notes =
  'Responsive dialog: a centered layer card on desktop and a swipeable bottom sheet below 640px. Compose `.Content` with `.Title`, `.Description`, `.Body`, and `.Actions` holding exactly one `.Action` (pass `menu` for a split button). Drive visibility with `open`; never render it conditionally.';

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <LayerDialog open={open} onOpenChange={setOpen}>
      <LayerDialog.Trigger render={<Button variant="secondary">Edit Worker</Button>} />
      <LayerDialog.Content>
        <LayerDialog.Title>Edit Worker</LayerDialog.Title>
        <LayerDialog.Description>Update this Worker&apos;s settings.</LayerDialog.Description>
        <LayerDialog.Body>
          <p className="text-sm text-kumo-subtle">
            Changes apply to the next deployment of this Worker.
          </p>
        </LayerDialog.Body>
        <LayerDialog.Actions>
          <LayerDialog.Action
            onClick={() => setOpen(false)}
            menu={[<DropdownMenu.Item key="draft">Save as draft</DropdownMenu.Item>]}
          >
            Save
          </LayerDialog.Action>
        </LayerDialog.Actions>
      </LayerDialog.Content>
    </LayerDialog>
  );
}
