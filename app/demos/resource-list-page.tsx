'use client';

import { useRef, useState } from 'react';
import { DeleteResource } from '@/components/delete-resource';
import { FilterBar } from '@/components/filter-bar';
import { ResourceListPage } from '@/components/resource-list-page';
import { Badge } from '@/components/ui/badge';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/collapsible';
import { Empty } from '@/components/ui/empty';
import { Loader } from '@/components/ui/loader';

export const notes =
  'Worker inventory mini-app: apply a filter, refresh the inventory, or retire a worker. The first refresh fails so you can try recovery. All data is local and resets when you leave the demo.';

export const deps = [
  'delete-resource',
  'filter-bar',
  'badge',
  'banner',
  'button',
  'collapsible',
  'empty',
  'loader',
];

const initialWorkers = [
  { name: 'api-gateway', active: true },
  { name: 'image-resizer', active: true },
  { name: 'cache-purger', active: false },
];

export function Demo() {
  const [workers, setWorkers] = useState(initialWorkers);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [refresh, setRefresh] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [target, setTarget] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleted, setDeleted] = useState('');
  const results = useRef<HTMLHeadingElement>(null);
  const filtered = workers.filter(({ name }) => name.includes(query.toLowerCase()));
  const applyFilter = () => setQuery(draft.trim());

  async function refreshWorkers() {
    if (refresh === 'loading') return;
    const shouldFail = refresh === 'idle';
    setRefresh('loading');
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefresh(shouldFail ? 'error' : 'success');
  }

  function deleteWorker() {
    setDeleteOpen(false);
    setWorkers((current) => current.filter(({ name }) => name !== target));
    setDeleted(target);
    requestAnimationFrame(() => results.current?.focus());
  }

  return (
    <ResourceListPage
      title="Worker inventory"
      description="Find and retire deployed workers."
      className="min-h-0 rounded-md"
    >
      <div className="grid min-w-0 gap-4">
        <FilterBar
          className="flex-wrap"
          placeholder="Filter workers…"
          value={draft}
          onValueChange={setDraft}
          onFilter={applyFilter}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.nativeEvent.isComposing &&
              event.target instanceof HTMLInputElement
            ) {
              event.preventDefault();
              applyFilter();
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            aria-disabled={refresh === 'loading'}
            onClick={refreshWorkers}
          >
            {refresh === 'error' ? 'Retry refresh' : 'Refresh inventory'}
          </Button>
          {refresh === 'loading' && (
            <span className="flex items-center gap-2 text-sm text-kumo-subtle">
              <Loader size="sm" aria-label="Refreshing inventory" />
              <span aria-hidden="true">Refreshing inventory…</span>
            </span>
          )}
        </div>
        {refresh === 'error' && (
          <Banner
            variant="error"
            role="alert"
            title="Inventory could not refresh"
            description="The last loaded inventory is still available. Retry to check for updates."
          />
        )}
        <p role="status" className="sr-only">
          {refresh === 'success' ? 'Inventory is up to date.' : ''}
        </p>
        <hr className="border-kumo-line" />
        <h2 ref={results} tabIndex={-1} className="font-heading text-lg text-kumo-default">
          Deployments
        </h2>
        <p role="status" className="text-sm text-kumo-subtle">
          {deleted ? `Deleted ${deleted}. ` : ''}Showing {filtered.length} of {workers.length}{' '}
          workers.
        </p>
        {filtered.length > 0 ? (
          <ul role="list" className="grid gap-2">
            {filtered.map(({ name, active }) => (
              <li
                key={name}
                className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-kumo-line bg-kumo-base p-3"
              >
                <span className="min-w-0 text-sm font-medium wrap-anywhere">{name}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={active ? 'success' : 'warning'}>
                    {active ? 'Active' : 'Paused'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={`Delete ${name}`}
                    onClick={() => {
                      setTarget(name);
                      setDeleteOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : workers.length === 0 ? (
          <Empty
            size="sm"
            title="No workers deployed"
            description="There are no workers left in this inventory."
          />
        ) : (
          <Empty
            size="sm"
            title="No matching workers"
            description="Clear the filter to see all deployments."
            contents={
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft('');
                  setQuery('');
                  results.current?.focus();
                }}
              >
                Reset filter
              </Button>
            }
          />
        )}
        <Collapsible>
          <Collapsible.DefaultTrigger>About worker states</Collapsible.DefaultTrigger>
          <Collapsible.DefaultPanel>
            <dl className="grid gap-1 text-sm text-kumo-subtle">
              <dt className="font-medium text-kumo-default">Active</dt>
              <dd>Receives traffic.</dd>
              <dt className="font-medium text-kumo-default">Paused</dt>
              <dd>Keeps its settings but does not receive traffic.</dd>
            </dl>
          </Collapsible.DefaultPanel>
        </Collapsible>
      </div>
      <DeleteResource
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resourceType="worker"
        resourceName={target}
        onDelete={deleteWorker}
      />
    </ResourceListPage>
  );
}
