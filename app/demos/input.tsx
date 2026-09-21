'use client';

import { Input } from '@/components/ui/input';

export const notes =
  'Single-line text field. Pass `label` to get the full Field treatment (helper `description`, `error` message) or `aria-label` for bare inputs — an accessible name is required; a truthy `error` auto-applies danger styling and `size` runs xs → lg.';

export function Demo() {
  return (
    <div className="grid gap-6">
      <Input label="Name" placeholder="Ada Lovelace" />
      <Input
        label="Email"
        type="email"
        placeholder="ada@example.com"
        description="Used for login and deployment notifications."
      />
      <Input
        label="Worker name"
        defaultValue="api gateway"
        error="Names can only contain lowercase letters, numbers, and hyphens."
      />
    </div>
  );
}
