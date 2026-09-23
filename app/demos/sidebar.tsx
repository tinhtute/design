'use client';

import {
  DashboardSpeed01Icon as GaugeIcon,
  Globe02Icon as GlobeIcon,
  SearchList01Icon as ListMagnifyingGlassIcon,
} from '@hugeicons/core-free-icons';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';

export const notes =
  'Collapsible app-navigation shell. Wrap `Sidebar` in `SidebarProvider` (which owns open/collapsed state and the `collapsible`, `side`, and `variant` options) and compose Header/Content/Menu. `MenuButton` supports `icon`, `active`, `href`, and tooltips when collapsed.';

export function Demo() {
  return (
    <div className="h-48 overflow-hidden ring ring-kumo-line">
      <SidebarProvider contained>
        <Sidebar>
          <Sidebar.Header>Catalog</Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton icon={GaugeIcon} active>
                  Overview
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton icon={GlobeIcon}>Domains</Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton icon={ListMagnifyingGlassIcon}>Logs</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
