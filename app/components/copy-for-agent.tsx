'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { agentContext, CATALOG_PATH, type CatalogItem } from '@/lib/agent-catalog-model';

export function CopyForAgent({ item }: { item: CatalogItem }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const content = agentContext(item);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="button" variant="secondary" onClick={copy}>
          Copy for agent
        </Button>
        <a
          href={CATALOG_PATH}
          className="rounded-sm text-sm text-kumo-link underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-kumo-focus"
        >
          Agent catalog (JSON)
        </a>
      </div>
      <p role="status" className="text-sm text-kumo-default">
        {status === 'copied' && 'Copied agent context.'}
        {status === 'error' && 'Could not copy. Select and copy the agent context below.'}
      </p>
      {status === 'error' && (
        <textarea
          aria-label="Agent context"
          readOnly
          value={content}
          className="w-full rounded-md bg-kumo-base p-3 font-mono text-sm text-kumo-default ring ring-kumo-line focus-visible:ring-2 focus-visible:ring-kumo-focus"
          rows={8}
        />
      )}
    </div>
  );
}
