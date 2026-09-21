'use client';

import { ResourceListPage } from '@/components/resource-list-page';
import { Table } from '@/components/ui/table';

export const notes =
  'Page-level layout for resource lists — heading with optional `icon`, `usage`/`additionalContent` sidebar slots, and a main content area that typically holds a `Table`.';

export const deps = ['table'];

export function Demo() {
  return (
    <ResourceListPage title="Workers" description="Manage workers deployed to the edge.">
      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>api-gateway</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    </ResourceListPage>
  );
}
