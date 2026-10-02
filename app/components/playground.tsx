'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon, type IconSvgElement as Icon } from '@hugeicons/react';
import {
  CursorPointer01Icon as CursorClickIcon,
  ClipboardIcon as ClipboardTextIcon,
  Tag01Icon as TagIcon,
  ArrowRight01Icon as CaretRightIcon,
  SourceCodeIcon as CodeIcon,
  ArrowDown01Icon as CaretDownIcon,
  InboxIcon as TrayIcon,
  Layers01Icon as StackIcon,
  DashboardSpeed01Icon as GaugeIcon,
  TextFontIcon as TextAaIcon,
  Megaphone01Icon as MegaphoneIcon,
  Loading03Icon as SpinnerGapIcon,
  Notification02Icon as BellIcon,
  CheckmarkSquare01Icon as CheckSquareIcon,
  SearchList01Icon as ListMagnifyingGlassIcon,
  TextSelectionIcon as TextboxIcon,
  TextIcon as TextTIcon,
  TextAlignLeftIcon,
  Layout3RowIcon as RowsIcon,
  RadioButtonIcon,
  ArrowUpDownIcon as CaretUpDownIcon,
  ToggleOffIcon as ToggleLeftIcon,
  Search01Icon as MagnifyingGlassIcon,
  MoreHorizontalIcon as DotsThreeIcon,
  WebDesign01Icon as BrowsersIcon,
  FullScreenIcon as FrameCornersIcon,
  LeftToRightListBulletIcon as ListBulletsIcon,
  BubbleChatIcon as ChatCircleTextIcon,
  InformationCircleIcon as InfoIcon,
  GridIcon as GridFourIcon,
  Layout01Icon as LayoutIcon,
  LeftToRightListDashIcon as ListDashesIcon,
  Analytics01Icon as ChartBarIcon,
  AnalyticsUpIcon as ChartLineIcon,
  WorkflowSquare01Icon as TreeStructureIcon,
  Location01Icon as MapPinIcon,
  Globe02Icon as GlobeIcon,
  FilterIcon as FunnelSimpleIcon,
  Calendar01Icon as CalendarBlankIcon,
  Link01Icon as LinkIcon,
  ViewOffIcon as EyeSlashIcon,
  SidebarLeftIcon as SidebarSimpleIcon,
  TableIcon,
  LeftToRightListNumberIcon as ListNumbersIcon,
  ToolsIcon as ToolboxIcon,
  Delete02Icon as TrashIcon,
  DashboardSquare01Icon as SquaresFourIcon,
} from '@hugeicons/core-free-icons';

import Link from 'next/link';
import { ComponentSearch } from '@/components/component-search';
import { Button } from '@/components/ui/button';
import { ClipboardText } from '@/components/ui/clipboard-text';
import { Code } from '@/components/ui/code';
import { Sidebar } from '@/components/ui/sidebar';
import { Text } from '@/components/ui/text';
import { ToastProvider } from '@/components/ui/toasty';
import { TooltipProvider } from '@/components/ui/tooltip';

import { ThemeToggle } from '@/components/theme-toggle';
import { CodeThemeToggle } from '@/components/code-theme-toggle';
import { PropsTable } from '@/components/props-table';
import { DEMOS } from '@/demos';
import type { PropsBySlug } from '@/lib/props';
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
  props,
}: {
  sources: Record<string, string>;
  highlighted: Record<string, string>;
  props: PropsBySlug;
}) {
  const [slug, setSlug] = useState<Slug>('button');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

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
  const groupIndex = GROUPS.findIndex((group) => group.items.some(([id]) => id === slug));
  const groupTitle = groupIndex >= 0 ? GROUPS[groupIndex].title : '';

  const entry = DEMOS[slug];

  const searchItems = GROUPS.flatMap((group) =>
    group.items.map(([id, label]) => ({ id, label, group: group.title })),
  );

  const selectComponent = (id: Slug) => {
    setSlug(id);
    window.location.hash = id;
    setSearchOpen(false);
  };

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="mono-index">
          <Sidebar.Provider defaultOpen collapsible="offcanvas" className="h-dvh">
            <Sidebar>
              <Sidebar.Header className="h-auto flex-col items-stretch">
                <div className="flex min-w-0 flex-col gap-1.5 py-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <img src="/logo-solid.svg" alt="" className="size-6 shrink-0" />
                    <h1 className="font-serif text-lg text-kumo-default">mono</h1>
                  </div>
                  <p className="text-xs leading-snug whitespace-normal text-kumo-subtle">
                    Source-first shadcn registry — Base UI + Hugeicons.
                  </p>
                </div>
              </Sidebar.Header>
              <Sidebar.Content>
                {GROUPS.map((group, gi) => (
                  <Sidebar.Group key={group.title}>
                    <div className="flex items-baseline gap-2 px-3 pt-5 pb-1">
                      <span className="font-mono text-2xs leading-none text-kumo-subtle">
                        {String(gi + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-medium text-kumo-default">{group.title}</span>
                    </div>
                    <Sidebar.Menu>
                      {group.items.map(([id, label, Icon]) => (
                        <Sidebar.MenuItem key={id}>
                          <Sidebar.MenuButton
                            active={id === slug}
                            icon={Icon}
                            size="sm"
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
                <div className="flex min-w-0 items-center gap-3">
                  <Sidebar.Trigger />
                  <span className="font-mono text-2xs text-kumo-subtle">
                    {String(Math.max(groupIndex, 0) + 1).padStart(2, '0')}/{slug}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchOpen(true)}
                    aria-keyshortcuts="Meta+K Control+K"
                  >
                    <HugeiconsIcon icon={MagnifyingGlassIcon} className="size-4" />
                    Search
                    <kbd className="hidden rounded-sm bg-kumo-fill px-1 py-0.5 font-mono text-2xs leading-none text-kumo-subtle sm:inline-flex">
                      ⌘K
                    </kbd>
                  </Button>
                  <Link
                    href="/docs"
                    className="rounded-md px-2 py-1 text-sm text-kumo-subtle transition-colors duration-200 hover:bg-kumo-interact hover:text-kumo-default focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
                  >
                    Docs
                  </Link>
                  <ThemeToggle />
                  <CodeThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-y-auto px-8 py-8">
                <div className="mx-auto grid max-w-3xl gap-6">
                  <div className="grid gap-1.5">
                    <p className="font-mono text-2xs uppercase tracking-widest text-kumo-subtle">
                      {String(Math.max(groupIndex, 0) + 1).padStart(2, '0')} — {groupTitle}
                    </p>
                    <h2 className="font-heading text-xl tracking-tight text-kumo-default">
                      {title}
                    </h2>
                    <p className="text-sm text-kumo-subtle">{DESCRIPTIONS.get(slug)}</p>
                    {entry ? (
                      <p className="text-sm leading-6 text-kumo-default">{entry.notes}</p>
                    ) : null}
                  </div>
                  <div className="rounded-xl bg-kumo-base p-6 ring ring-kumo-line">
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
                  <PropsTable docs={props[slug] ?? []} />
                </div>
                <footer className="mx-auto mt-16 flex w-full max-w-3xl items-center justify-between border-t border-dashed border-kumo-line pt-4 pb-2 font-mono text-2xs text-kumo-subtle">
                  <span>mono — @therealtinhtute/design</span>
                  <div className="flex items-center gap-4">
                    <Link href="/docs" className="transition-colors hover:text-kumo-default">
                      docs
                    </Link>
                    <span>© 2026</span>
                  </div>
                </footer>
              </main>
            </div>
            <ComponentSearch
              open={searchOpen}
              onOpenChange={setSearchOpen}
              items={searchItems}
              onSelect={selectComponent}
            />
          </Sidebar.Provider>
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}
