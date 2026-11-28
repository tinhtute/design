/**
 * render-check.tsx — SSR smoke check for the e2e consumer.
 *
 * Copied into the temp consumer app by `scripts/e2e-smoke.sh`, then run with
 * `tsx`. Renders the installed Kumo Button/Badge plus FilterBar, DataTable,
 * and Dashboard (layer-card, no Card) with react-dom/server and asserts that
 * expected content appears in the output HTML.
 *
 * Uses the consumer's `@/*` path alias (tsconfig paths), which tsx resolves.
 */
import { renderToString } from 'react-dom/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterBar } from '@/components/filter-bar';
import { DataTable, type ColumnDef } from '@/components/data-table';
import { Dashboard } from '@/components/dashboard';
import { FileUpload } from '@/components/file-upload';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

const rows: Row[] = [
  { id: '1', name: 'Ada' },
  { id: '2', name: 'Grace' },
];

const html = renderToString(
  <div>
    <Button>Click me</Button>
    <Badge>v1</Badge>
    <FilterBar value="q" onValueChange={() => {}} filterLabel="Apply filter" />
    <DataTable columns={columns} data={rows} />
    <Dashboard />
    <FileUpload items={[]} onFilesAdd={() => {}} />
  </div>,
);

const expected = [
  'Click me', // Kumo Button
  'v1', // Kumo Badge
  'Apply filter', // filter-bar
  'Ada', // data-table row
  'Grace', // data-table row
  'Dashboard', // dashboard block
  'Recent orders', // dashboard layer-card
  'ORD-001', // dashboard recent-orders table
  'Choose files', // file-upload block
];

let failed = 0;
for (const needle of expected) {
  if (html.includes(needle)) {
    console.log(`OK   rendered contains: ${needle}`);
  } else {
    console.error(`FAIL rendered missing: ${needle}`);
    failed += 1;
  }
}

if (failed > 0) process.exit(1);
console.log('render-check: all expected strings present in SSR output');
