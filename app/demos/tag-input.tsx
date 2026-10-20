'use client';

import { useState } from 'react';
import { TagInput } from '@/components/ui/tag-input';

export const notes =
  'Text input that turns entries into removable tags on Enter or comma. Control with `value` + `onValueChange`; `validateValue` rejects bad entries with an inline error and `maxValues` caps the list. Backspace on an empty input removes the last tag.';

export function Demo() {
  const [domains, setDomains] = useState(['example.com', 'api.example.com']);

  return (
    <div className="w-full max-w-sm">
      <TagInput
        label="Allowed domains"
        description="Press Enter to add a domain."
        value={domains}
        onValueChange={setDomains}
        validateValue={(value) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)}
        maxValues={5}
      />
    </div>
  );
}
