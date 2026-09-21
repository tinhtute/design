'use client';

import { Radio } from '@/components/ui/radio';

export const notes =
  'Single-choice selection within a group. Give `Radio.Group` a `legend` (or a `Radio.Legend` child) for an accessible group name; each `Radio.Item` takes `value` + `label`, and `appearance` / `orientation` control the layout.';

export function Demo() {
  return (
    <Radio.Group legend="Notification preference" defaultValue="email">
      <Radio.Item label="Email" value="email" />
      <Radio.Item label="SMS" value="sms" />
      <Radio.Item label="Push" value="push" />
    </Radio.Group>
  );
}
