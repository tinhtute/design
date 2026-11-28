'use client';

import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { Table } from '@/components/ui/table';
import { FilterBar } from '@/components/filter-bar';

export const notes =
  'Keep draft and applied queries separate. Clear search edits the draft only; Apply filter (or Enter in the field, wired by this recipe) commits it. Reset filter in the empty state clears both.';

interface Worker {
  name: string;
  status: 'Active' | 'Paused' | 'Error';
  requests: string;
}

const statusVariant = {
  Active: 'success',
  Paused: 'warning',
  Error: 'error',
} as const;

const workers: Worker[] = [
  { name: 'api-gateway', status: 'Active', requests: '1.28M' },
  { name: 'auth-service', status: 'Active', requests: '962K' },
  { name: 'image-resizer', status: 'Active', requests: '432K' },
  { name: 'checkout-webhook', status: 'Active', requests: '389K' },
  { name: 'cache-purger', status: 'Paused', requests: '152K' },
  { name: 'rate-limiter', status: 'Error', requests: '75K' },
];

export const deps = ['badge', 'button', 'empty', 'table'];

export function Demo() {
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const results = useRef<HTMLParagraphElement>(null);
  const applyFilter = () => setQuery(value.trim());

  const filtered = workers.filter((worker) =>
    worker.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-4">
      <FilterBar
        className="flex-wrap"
        value={value}
        onValueChange={setValue}
        onFilter={applyFilter}
        filterLabel="Apply filter"
        placeholder="Filter workers…"
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
      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-lg ring ring-kumo-line">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Requests (24h)</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((worker) => (
                <Table.Row key={worker.name}>
                  <Table.Cell>{worker.name}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={statusVariant[worker.status]}>{worker.status}</Badge>
                  </Table.Cell>
                  <Table.Cell>{worker.requests}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <Empty
          size="sm"
          title="No matching workers"
          description="Clear the filter to see all workers."
          contents={
            <Button
              variant="secondary"
              onClick={() => {
                setValue('');
                setQuery('');
                results.current?.focus();
              }}
            >
              Reset filter
            </Button>
          }
        />
      )}
      <p ref={results} tabIndex={-1} role="status" className="text-sm text-kumo-subtle">
        Showing {filtered.length} of {workers.length} workers.
      </p>
    </div>
  );
}
