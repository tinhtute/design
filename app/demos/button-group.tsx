'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon as CaretDownIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

export const notes =
  'Joins tightly-coupled buttons into one control — most often a split button: a primary action plus a dropdown trigger for related actions. Children keep their own variant and size; the group only flattens inner corners and shares seams.';

export const deps = ['button', 'dropdown-menu'];

export function Demo() {
  return (
    <ButtonGroup aria-label="Deploy actions">
      <Button variant="primary">Deploy</Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          render={
            <Button
              aria-label="More deploy actions"
              icon={<HugeiconsIcon icon={CaretDownIcon} />}
              shape="square"
              variant="primary"
            />
          }
        />
        <DropdownMenu.Content>
          <DropdownMenu.Item>Deploy to preview</DropdownMenu.Item>
          <DropdownMenu.Item>Save as draft</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </ButtonGroup>
  );
}
