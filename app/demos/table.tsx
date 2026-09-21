'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';

export const notes =
  'Semantic data table with striped rows. Compose Header/Body/Row/Head/Cell — `layout=fixed` for controlled column widths, `sticky` on Head/Cell to pin columns, and `CheckHead`/`CheckCell` plus `Row variant=selected` for accessible row selection.';

const WORKERS = [
  { id: 'api-gateway', name: 'api-gateway', status: 'Active', requests: '1.2M' },
  { id: 'auth-service', name: 'auth-service', status: 'Active', requests: '842K' },
  { id: 'image-resizer', name: 'image-resizer', status: 'Paused', requests: '96K' },
];

export function Demo() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(['api-gateway']));
  const allSelected = selected.size === WORKERS.length;

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(WORKERS.map((worker) => worker.id)) : new Set<string>());
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.CheckHead
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onCheckedChange={toggleAll}
              label="Select all workers"
            />
            <Table.Head>Name</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Requests (24h)</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {WORKERS.map((worker) => (
            <Table.Row key={worker.id} variant={selected.has(worker.id) ? 'selected' : 'default'}>
              <Table.CheckCell
                checked={selected.has(worker.id)}
                onCheckedChange={(checked) => toggleRow(worker.id, checked)}
                label={`Select ${worker.name}`}
              />
              <Table.Cell>{worker.name}</Table.Cell>
              <Table.Cell>
                <Badge variant={worker.status === 'Active' ? 'success' : 'warning'}>
                  {worker.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>{worker.requests}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
