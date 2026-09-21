'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export const notes =
  'Binary or multi-select toggle for settings and lists. `label` gives an accessible name (dev warns without one); use `checked`/`onCheckedChange` for controlled state, `indeterminate` for mixed selection, and `Checkbox.Group`/`Item` for fieldset-style groups with a `legend`.';

export function Demo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="grid gap-6">
      <Checkbox label="Enable health checks" checked={enabled} onCheckedChange={setEnabled} />
      <Checkbox.Group
        legend="Notification channels"
        defaultValue={['email']}
        description="Choose how deployment alerts reach your team."
      >
        <Checkbox.Item value="email" label="Email" />
        <Checkbox.Item value="slack" label="Slack" />
        <Checkbox.Item value="pagerduty" label="PagerDuty" disabled />
      </Checkbox.Group>
    </div>
  );
}
