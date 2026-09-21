'use client';

import { Tabs } from '@/components/ui/tabs';

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'deployments', label: 'Deployments' },
  { value: 'settings', label: 'Settings' },
];

export const notes =
  'Switches between sibling views or filters. Pass a `tabs` array of { value, label }; `variant` chooses segmented vs underline styling, `size` tunes density, and `value`/`onValueChange` make it controlled. Arrow keys move focus between tabs.';

export function Demo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Tabs tabs={tabs} />
      <Tabs variant="underline" tabs={tabs} />
    </div>
  );
}
