'use client';

import { useEffect, useState } from 'react';
import type { Icon } from '@phosphor-icons/react';
import {
  CursorClickIcon,
  ClipboardTextIcon,
  TagIcon,
  CaretRightIcon,
  CodeIcon,
  CaretDownIcon,
  TrayIcon,
  StackIcon,
  GaugeIcon,
  TextAaIcon,
  MegaphoneIcon,
  SpinnerGapIcon,
  BellIcon,
  CheckSquareIcon,
  ListMagnifyingGlassIcon,
  TextboxIcon,
  TextTIcon,
  TextAlignLeftIcon,
  RowsIcon,
  RadioButtonIcon,
  CaretUpDownIcon,
  ToggleLeftIcon,
  MagnifyingGlassIcon,
  DotsThreeIcon,
  BrowsersIcon,
  FrameCornersIcon,
  ListBulletsIcon,
  ChatCircleTextIcon,
  InfoIcon,
  GridFourIcon,
  LayoutIcon,
  ListDashesIcon,
  ChartBarIcon,
  ChartLineIcon,
  TreeStructureIcon,
  MapPinIcon,
  GlobeIcon,
  FunnelSimpleIcon,
  CalendarBlankIcon,
  LinkIcon,
  EyeSlashIcon,
  SidebarSimpleIcon,
  TableIcon,
  ListNumbersIcon,
  ToolboxIcon,
  TrashIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';

import Link from 'next/link';
import { ClipboardText } from '@/components/ui/clipboard-text';
import { Code } from '@/components/ui/code';
import { Sidebar } from '@/components/ui/sidebar';
import { Text } from '@/components/ui/text';
import { ToastProvider } from '@/components/ui/toasty';
import { TooltipProvider } from '@/components/ui/tooltip';

import { ThemeToggle } from '@/components/theme-toggle';
import { DEMOS } from '@/demos';
import registry from '../../packages/registry/registry.json';

const DESCRIPTIONS = new Map(registry.items.map((item) => [item.name, item.description]));

type NavItem = readonly [id: string, label: string, icon: Icon];

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Action',
    items: [
      ['button', 'Button', CursorClickIcon],
      ['clipboard-text', 'Clipboard text', ClipboardTextIcon],
    ],
  },
  {
    title: 'Display',
    items: [
      ['badge', 'Badge', TagIcon],
      ['breadcrumbs', 'Breadcrumbs', CaretRightIcon],
      ['code', 'Code', CodeIcon],
      ['collapsible', 'Collapsible', CaretDownIcon],
      ['empty', 'Empty', TrayIcon],
      ['layer-card', 'Layer card', StackIcon],
      ['meter', 'Meter', GaugeIcon],
      ['text', 'Text', TextAaIcon],
    ],
  },
  {
    title: 'Feedback',
    items: [
      ['banner', 'Banner', MegaphoneIcon],
      ['loader', 'Loader', SpinnerGapIcon],
      ['toasty', 'Toasty', BellIcon],
    ],
  },
  {
    title: 'Input',
    items: [
      ['checkbox', 'Checkbox', CheckSquareIcon],
      ['combobox', 'Combobox', ListMagnifyingGlassIcon],
      ['field', 'Field', TextboxIcon],
      ['input', 'Input', TextTIcon],
      ['input-area', 'Input area', TextAlignLeftIcon],
      ['input-group', 'Input group', RowsIcon],
      ['radio', 'Radio', RadioButtonIcon],
      ['select', 'Select', CaretUpDownIcon],
      ['switch', 'Switch', ToggleLeftIcon],
    ],
  },
  {
    title: 'Navigation',
    items: [
      ['command-palette', 'Command palette', MagnifyingGlassIcon],
      ['pagination', 'Pagination', DotsThreeIcon],
      ['tabs', 'Tabs', BrowsersIcon],
    ],
  },
  {
    title: 'Overlay',
    items: [
      ['dialog', 'Dialog', FrameCornersIcon],
      ['dropdown-menu', 'Dropdown menu', ListBulletsIcon],
      ['popover', 'Popover', ChatCircleTextIcon],
      ['tooltip', 'Tooltip', InfoIcon],
    ],
  },
  {
    title: 'Layout',
    items: [
      ['grid', 'Grid', GridFourIcon],
      ['page-header', 'Page header', LayoutIcon],
      ['resource-list-page', 'Resource list page', ListDashesIcon],
    ],
  },
  {
    title: 'Data visualization',
    items: [
      ['chart', 'Chart', ChartBarIcon],
      ['timeseries-chart', 'Timeseries chart', ChartLineIcon],
      ['sankey-chart', 'Sankey chart', TreeStructureIcon],
      ['bubble-map', 'Bubble map', MapPinIcon],
      ['choropleth-map', 'Choropleth map', GlobeIcon],
    ],
  },
  {
    title: 'Other',
    items: [
      ['autocomplete', 'Autocomplete', FunnelSimpleIcon],
      ['date-picker', 'Date picker', CalendarBlankIcon],
      ['label', 'Label', TagIcon],
      ['link', 'Link', LinkIcon],
      ['sensitive-input', 'Sensitive input', EyeSlashIcon],
      ['sidebar', 'Sidebar', SidebarSimpleIcon],
      ['table', 'Table', TableIcon],
      ['table-of-contents', 'Table of contents', ListNumbersIcon],
      ['toolbar', 'Toolbar', ToolboxIcon],
      ['delete-resource', 'Delete resource', TrashIcon],
    ],
  },
  {
    title: 'Patterns',
    items: [
      ['data-table', 'Data table', TableIcon],
      ['filter-bar', 'Filter bar', FunnelSimpleIcon],
      ['dashboard', 'Dashboard', SquaresFourIcon],
    ],
  },
];

type Slug = string;

export function Playground({
  sources,
  highlighted,
}: {
  sources: Record<string, string>;
  highlighted: Record<string, string>;
}) {
  const [slug, setSlug] = useState<Slug>('button');

  useEffect(() => {
    const handleHash = () => {
      const fromHash = window.location.hash.replace(/^#/, '');
      if (GROUPS.some((group) => group.items.some(([id]) => id === fromHash))) {
        setSlug(fromHash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const title = GROUPS.flatMap((group) => group.items).find(([id]) => id === slug)?.[1] ?? slug;

  const entry = DEMOS[slug];

  return (
    <TooltipProvider>
      <ToastProvider>
        <Sidebar.Provider defaultOpen collapsible="offcanvas" className="h-dvh">
          <Sidebar>
            <Sidebar.Header>
              <div className="flex min-w-0 items-center gap-2">
                <img src="/logo-solid.svg" alt="" className="size-6 shrink-0" />
                <h1 className="text-xl font-bold text-kumo-default">mono</h1>
              </div>
            </Sidebar.Header>
            <Sidebar.Content>
              {GROUPS.map((group) => (
                <Sidebar.Group key={group.title}>
                  <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    {group.items.map(([id, label, Icon]) => (
                      <Sidebar.MenuItem key={id}>
                        <Sidebar.MenuButton
                          active={id === slug}
                          icon={Icon}
                          className={
                            id === slug ? undefined : 'text-kumo-subtle hover:text-kumo-default'
                          }
                          onClick={() => {
                            setSlug(id);
                            window.location.hash = id;
                          }}
                        >
                          {label}
                        </Sidebar.MenuButton>
                      </Sidebar.MenuItem>
                    ))}
                  </Sidebar.Menu>
                </Sidebar.Group>
              ))}
            </Sidebar.Content>
            <Sidebar.Footer>
              <Sidebar.Trigger />
            </Sidebar.Footer>
          </Sidebar>
          <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-kumo-base text-kumo-default">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-kumo-line bg-kumo-base px-6 py-3">
              <Sidebar.Trigger />
              <div className="flex items-center gap-2">
                <Link
                  href="/docs"
                  className="rounded-md px-2 py-1 text-sm text-kumo-subtle transition-colors duration-200 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
                >
                  Docs
                </Link>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto px-8 py-8">
              <div className="grid max-w-3xl gap-6">
                <div className="grid gap-1.5">
                  <h2 className="text-3xl font-bold tracking-tight text-kumo-default">{title}</h2>
                  <p className="text-sm text-kumo-subtle">{DESCRIPTIONS.get(slug)}</p>
                  {entry ? (
                    <p className="text-sm leading-6 text-kumo-default">{entry.notes}</p>
                  ) : null}
                </div>
                <div className="rounded-lg bg-kumo-base p-6 ring ring-kumo-line">
                  {entry ? <entry.Demo /> : <Text>Unknown component.</Text>}
                </div>
                {entry ? (
                  <div className="grid gap-4">
                    <ClipboardText
                      text={`pnpm dlx shadcn add @therealtinhtute/${slug}${(entry.deps ?? []).map((d) => ` @therealtinhtute/${d}`).join('')}`}
                    />
                    <Code.Block
                      html={highlighted[slug]}
                      code={sources[slug] ?? ''}
                      lang="tsx"
                      title={`${slug}.tsx`}
                    />
                  </div>
                ) : null}
              </div>
            </main>
          </div>
        </Sidebar.Provider>
      </ToastProvider>
    </TooltipProvider>
  );
}
