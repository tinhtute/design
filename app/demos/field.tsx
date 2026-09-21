'use client';

import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export const notes =
  'Wrapper that binds a label, helper `description`, and `error` message to any form control. Reach for it when the child doesn\'t carry its own label; `required={false}` renders an "(optional)" hint, `error` takes `{ message, match }` tied to browser validity, and `controlFirst` flips layout for toggles.';

export const deps = ['input'];

export function Demo() {
  return (
    <div className="grid gap-6">
      <Field label="Email" required description="We'll only use this for account recovery.">
        <Input type="email" placeholder="ada@example.com" />
      </Field>
      <Field label="Worker name" error={{ message: 'api-gateway is already taken.', match: true }}>
        <Input defaultValue="api-gateway" />
      </Field>
    </div>
  );
}
