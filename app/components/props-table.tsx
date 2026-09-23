import { Table } from '@/components/ui/table';
import type { ComponentPropsDoc } from '@/lib/props';

/**
 * Auto-generated props table for a registry component — one table per
 * exported component (e.g. `button` → `Button`, `LinkButton`,
 * `RefreshButton`). Data comes from `app/lib/props.ts`, extracted from the
 * registry source types at prerender.
 */
export function PropsTable({ docs }: { docs: ComponentPropsDoc[] }) {
  if (docs.length === 0) return null;
  return (
    <div className="grid gap-6">
      {docs.map((doc) => (
        <section key={doc.displayName} className="grid gap-2">
          <h3 className="text-base font-semibold text-kumo-default">{doc.displayName} props</h3>
          <div
            className="overflow-x-auto rounded-md ring ring-kumo-line"
            role="region"
            aria-label={`${doc.displayName} props table`}
            tabIndex={0}
          >
            <Table>
              <Table.Header variant="compact">
                <Table.Row>
                  <Table.Head>Prop</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Required</Table.Head>
                  <Table.Head>Default</Table.Head>
                  <Table.Head>Description</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {doc.props.map((prop) => (
                  <Table.Row key={prop.name}>
                    <Table.Cell>
                      <code className="font-mono text-sm text-kumo-default">{prop.name}</code>
                    </Table.Cell>
                    <Table.Cell>
                      <code className="font-mono text-xs text-kumo-subtle">{prop.type}</code>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-kumo-subtle">
                        {prop.required ? 'required' : '—'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <code className="font-mono text-xs text-kumo-subtle">
                        {prop.defaultValue ?? '—'}
                      </code>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-kumo-subtle">{prop.description || '—'}</span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          {doc.inheritsDomProps ? (
            <p className="text-xs text-kumo-subtle">
              …also accepts the underlying element&apos;s native attributes.
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}
