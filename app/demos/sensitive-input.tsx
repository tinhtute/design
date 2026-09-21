'use client';

import { useState } from 'react';
import { SensitiveInput } from '@/components/ui/sensitive-input';

export const notes =
  'Password-style input for API keys, tokens, and secrets. The value stays masked until clicked, shows a copy button on hover, and re-masks on blur or Escape — all keyboard accessible. `label` and `description` wrap it in a Field.';

export function Demo() {
  const [token, setToken] = useState('kumo_live_9f4d2c8b7a51e0');

  return (
    <SensitiveInput
      label="API token"
      description="Click the masked value to reveal or edit it."
      value={token}
      onValueChange={setToken}
    />
  );
}
