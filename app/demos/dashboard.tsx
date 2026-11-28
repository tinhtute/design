'use client';

import { Dashboard } from '@/components/dashboard';
import { Banner } from '@/components/ui/banner';
import { Link } from '@/components/ui/link';

export const notes =
  'Use Dashboard as a source template for an overview. Put workspace-wide notices above the overview, and link to the resource list for filtering and destructive actions rather than adding them to summary cards.';

export const deps = ['banner', 'link'];

export function Demo() {
  return (
    <div className="grid min-w-0 gap-4">
      <Banner
        title="Review paused workers"
        description={
          <p>
            Paused workers do not receive traffic. Review them before retiring unused deployments.{' '}
            <Link href="/#resource-list-page">Open worker inventory</Link>
          </p>
        }
      />
      <div className="h-140 min-w-0 max-w-full overflow-auto rounded-md ring ring-kumo-line">
        <Dashboard />
      </div>
    </div>
  );
}
