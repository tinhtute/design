'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon as MagnifyingGlassIcon } from '@hugeicons/core-free-icons';
import { Tabs } from '@base-ui/react/tabs';

import Link from 'next/link';
import { ComponentSearch } from '@/components/component-search';
import { SkipLink } from '@/components/skip-link';
import { Button } from '@/components/ui/button';
import { ClipboardText } from '@/components/ui/clipboard-text';
import { Code } from '@/components/ui/code';
import { Sidebar, useSidebar } from '@/components/ui/sidebar';
import { Text } from '@/components/ui/text';
import { ToastProvider } from '@/components/ui/toasty';
import { TooltipProvider } from '@/components/ui/tooltip';

import { SiteBar, SiteBrand, SiteIndexLabel } from '@/components/site-frame';
import { PropsTable } from '@/components/props-table';
import { DEMOS } from '@/demos';
import type { PropsBySlug } from '@/lib/props';
import registry from '../../packages/registry/registry.json';

const DESCRIPTIONS = new Map(registry.items.map((item) => [item.name, item.description]));
const DEMO_CONTENT_ID = 'showroom-demo';

type NavItem = readonly [id: string, label: string];

// Each group answers one question about the item; no catch-all group.
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Action',
    items: [
      ['button', 'Button'],
      ['button-group', 'Button group'],
      ['toolbar', 'Toolbar'],
      ['link', 'Link'],
      ['clipboard-text', 'Clipboard text'],
      ['inline-copy-text', 'Inline copy text'],
    ],
  },
  {
    title: 'Form',
    items: [
      ['field', 'Field'],
      ['label', 'Label'],
      ['input', 'Input'],
      ['input-area', 'Input area'],
      ['input-group', 'Input group'],
      ['sensitive-input', 'Sensitive input'],
      ['tag-input', 'Tag input'],
    ],
  },
  {
    title: 'Selection',
    items: [
      ['checkbox', 'Checkbox'],
      ['radio', 'Radio'],
      ['switch', 'Switch'],
      ['slider', 'Slider'],
      ['select', 'Select'],
      ['combobox', 'Combobox'],
      ['autocomplete', 'Autocomplete'],
      ['date-picker', 'Date picker'],
      ['date-range-picker', 'Date range picker'],
    ],
  },
  {
    title: 'Display',
    items: [
      ['text', 'Text'],
      ['code', 'Code'],
      ['badge', 'Badge'],
      ['meter', 'Meter'],
    ],
  },
  {
    title: 'Feedback',
    items: [
      ['banner', 'Banner'],
      ['empty', 'Empty'],
      ['loader', 'Loader'],
      ['toasty', 'Toasty'],
    ],
  },
  {
    title: 'Layout',
    items: [
      ['surface', 'Surface'],
      ['layer-card', 'Layer card'],
      ['collapsible', 'Collapsible'],
      ['grid', 'Grid'],
      ['page-header', 'Page header'],
    ],
  },
  {
    title: 'Navigation',
    items: [
      ['sidebar', 'Sidebar'],
      ['tabs', 'Tabs'],
      ['breadcrumbs', 'Breadcrumbs'],
      ['pagination', 'Pagination'],
      ['menubar', 'Menu bar'],
      ['command-palette', 'Command palette'],
      ['table-of-contents', 'Table of contents'],
    ],
  },
  {
    title: 'Overlay',
    items: [
      ['dialog', 'Dialog'],
      ['layer-dialog', 'Layer dialog'],
      ['popover', 'Popover'],
      ['tooltip', 'Tooltip'],
      ['dropdown-menu', 'Dropdown menu'],
    ],
  },
  {
    title: 'Data',
    items: [
      ['table', 'Table'],
      ['chart', 'Chart'],
      ['timeseries-chart', 'Timeseries chart'],
      ['sankey-chart', 'Sankey chart'],
      ['bubble-map', 'Bubble map'],
      ['choropleth-map', 'Choropleth map'],
      ['globe-map', 'Globe map'],
    ],
  },
  {
    title: 'Patterns',
    items: [
      ['data-table', 'Data table'],
      ['filter-bar', 'Filter bar'],
      ['dashboard', 'Dashboard'],
      ['resource-list-page', 'Resource list page'],
      ['delete-resource', 'Delete resource'],
    ],
  },
];

type Slug = string;
type View = 'demo' | 'code' | 'props';

const VIEWS: { value: View; label: string }[] = [
  { value: 'demo', label: 'Demo' },
  { value: 'code', label: 'Code' },
  { value: 'props', label: 'Props' },
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Continuous 1-based index of every item across groups, for the rail's mono numbers. */
const ITEM_INDEX = new Map(GROUPS.flatMap((group) => group.items).map(([id], i) => [id, i + 1]));

function ShowroomSidebarTrigger() {
  const { isMobile, open, openMobile } = useSidebar();
  const expanded = isMobile ? openMobile : open;

  return (
    <Sidebar.Trigger
      aria-expanded={expanded}
      aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-controls="showroom-sidebar"
    />
  );
}

function ShowroomSidebarMenu({
  slug,
  onSelect,
  onMobileSelect,
}: {
  slug: Slug | null;
  onSelect: (id: Slug) => void;
  onMobileSelect: () => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar.Content>
      {GROUPS.map((group, gi) => (
        <Sidebar.Group key={group.title}>
          <div className="px-2 pt-4 pb-1">
            <SiteIndexLabel>
              {pad(gi + 1)} {group.title}
            </SiteIndexLabel>
          </div>
          <Sidebar.Menu>
            {group.items.map(([id, label]) => (
              <Sidebar.MenuItem key={id}>
                <Sidebar.MenuButton
                  active={id === slug}
                  aria-current={id === slug ? 'true' : undefined}
                  icon={
                    <span
                      aria-hidden="true"
                      className="w-4 shrink-0 font-mono text-2xs tabular-nums"
                    >
                      {pad(ITEM_INDEX.get(id) ?? 0)}
                    </span>
                  }
                  size="sm"
                  className={id === slug ? undefined : 'text-kumo-subtle hover:text-kumo-default'}
                  onClick={() => {
                    onSelect(id);
                    if (isMobile) {
                      setOpenMobile(false);
                      onMobileSelect();
                    }
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
  );
}

export function Playground({
  sources,
  highlighted,
  props,
}: {
  sources: Record<string, string>;
  highlighted: Record<string, string>;
  props: PropsBySlug;
}) {
  const [slug, setSlug] = useState<Slug | null>('button');
  const [view, setView] = useState<View>('demo');
  const [searchOpen, setSearchOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const recoveryTriggerRef = useRef<HTMLButtonElement>(null);
  const searchFromRecovery = useRef(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (!searchOpen) {
          searchFromRecovery.current = document.activeElement === recoveryTriggerRef.current;
        }
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [searchOpen]);

  // A deep link (`/#slug`) always opens on the Demo view.
  useEffect(() => {
    const handleHash = () => {
      const fromHash = window.location.hash.replace(/^#/, '');
      setSlug(fromHash === '' ? 'button' : ITEM_INDEX.has(fromHash) ? fromHash : null);
      setView('demo');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const title =
    GROUPS.flatMap((group) => group.items).find(([id]) => id === slug)?.[1] ??
    'Component not found';
  const groupIndex = GROUPS.findIndex((group) => group.items.some(([id]) => id === slug));

  const entry = slug === null ? undefined : DEMOS[slug];

  const searchItems = GROUPS.flatMap((group) =>
    group.items.map(([id, label]) => ({ id, label, group: group.title })),
  );

  const selectComponent = (id: Slug) => {
    setSlug(id);
    setView('demo');
    window.location.hash = id;
    setSearchOpen(false);
  };

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="mono-index">
          <SkipLink targetId={DEMO_CONTENT_ID}>Skip to demo</SkipLink>
          <Sidebar.Provider defaultOpen collapsible="offcanvas" className="h-dvh">
            <Sidebar id="showroom-sidebar">
              <Sidebar.Header className="h-auto flex-col items-stretch">
                <div className="flex min-w-0 flex-col gap-1.5 py-4">
                  <SiteBrand as="h1" />
                  <p className="text-xs leading-snug whitespace-normal text-kumo-subtle">
                    Source-first shadcn registry — Base UI + Hugeicons.
                  </p>
                </div>
              </Sidebar.Header>
              <ShowroomSidebarMenu
                slug={slug}
                onSelect={selectComponent}
                onMobileSelect={() => requestAnimationFrame(() => titleRef.current?.focus())}
              />
              <Sidebar.Footer>
                <ShowroomSidebarTrigger />
              </Sidebar.Footer>
            </Sidebar>
            <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-kumo-base text-kumo-default">
              <SiteBar
                section="showroom"
                start={
                  <>
                    <ShowroomSidebarTrigger />
                    <span className="hidden sm:inline">
                      {slug !== null && (
                        <SiteIndexLabel>
                          {pad(groupIndex + 1)}/{slug}
                        </SiteIndexLabel>
                      )}
                    </span>
                  </>
                }
                actions={
                  <Button
                    ref={searchTriggerRef}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      searchFromRecovery.current = false;
                      setSearchOpen(true);
                    }}
                    aria-label="Search ⌘K"
                    aria-keyshortcuts="Meta+K Control+K"
                  >
                    <HugeiconsIcon icon={MagnifyingGlassIcon} className="size-4" />
                    <span className="hidden sm:inline">Search</span>
                    <kbd
                      aria-hidden="true"
                      className="hidden rounded-sm bg-kumo-fill px-1 py-0.5 font-mono text-2xs leading-none text-kumo-subtle sm:inline-flex"
                    >
                      ⌘K
                    </kbd>
                  </Button>
                }
              />
              <main
                id={DEMO_CONTENT_ID}
                tabIndex={-1}
                className="flex-1 overflow-y-auto px-4 py-8 sm:px-8"
              >
                <div className="mx-auto grid max-w-3xl gap-4 max-sm:grid-cols-1">
                  <div className="grid gap-1.5">
                    {slug !== null && (
                      <SiteIndexLabel>
                        {pad(groupIndex + 1)} {GROUPS[groupIndex].title}
                      </SiteIndexLabel>
                    )}
                    <h2
                      ref={titleRef}
                      tabIndex={-1}
                      className="font-heading text-2xl text-kumo-default"
                    >
                      {title}
                    </h2>
                    <p className="max-w-prose text-sm text-kumo-subtle">
                      {slug === null
                        ? 'This link does not match a component in the showroom.'
                        : DESCRIPTIONS.get(slug)}
                    </p>
                  </div>
                  {slug === null ? (
                    <div>
                      <Button
                        ref={recoveryTriggerRef}
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          searchFromRecovery.current = true;
                          setSearchOpen(true);
                        }}
                      >
                        Find a component
                      </Button>
                    </div>
                  ) : (
                    <Tabs.Root value={view} onValueChange={(next) => setView(next as View)}>
                      <Tabs.List aria-label={`${title} views`} className="flex gap-3 pb-3">
                        {VIEWS.map(({ value, label }) => (
                          <Tabs.Tab
                            key={value}
                            value={value}
                            className="cursor-pointer rounded-sm font-mono text-sm text-kumo-subtle underline-offset-4 outline-none hover:text-kumo-default focus-visible:ring-2 focus-visible:ring-kumo-brand aria-selected:text-kumo-default aria-selected:underline"
                          >
                            {label}
                          </Tabs.Tab>
                        ))}
                      </Tabs.List>
                      <Tabs.Panel
                        value="demo"
                        className="grid gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-offset-2 focus-visible:ring-offset-kumo-base rounded-sm max-sm:grid-cols-1"
                      >
                        <div className="border border-dashed border-kumo-line p-4 max-sm:overflow-x-auto sm:p-6">
                          {entry ? <entry.Demo /> : <Text>Unknown component.</Text>}
                        </div>
                        {entry ? (
                          <p className="max-w-prose text-sm leading-6 text-kumo-default">
                            {entry.notes}
                          </p>
                        ) : null}
                      </Tabs.Panel>
                      <Tabs.Panel
                        value="code"
                        className="grid gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-offset-2 focus-visible:ring-offset-kumo-base rounded-sm"
                      >
                        {entry ? (
                          <>
                            <ClipboardText
                              text={`pnpm dlx shadcn add @therealtinhtute/${slug}${(entry.deps ?? []).map((d) => ` @therealtinhtute/${d}`).join('')}`}
                            />
                            <Link
                              href="/docs#configuration"
                              className="w-fit rounded-sm text-sm text-kumo-link underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-kumo-focus"
                            >
                              Configure the registry
                            </Link>
                            <Code.Block
                              html={highlighted[slug]}
                              code={sources[slug] ?? ''}
                              lang="tsx"
                              title={`${slug}.tsx`}
                            />
                          </>
                        ) : (
                          <Text>Unknown component.</Text>
                        )}
                      </Tabs.Panel>
                      <Tabs.Panel
                        value="props"
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-offset-2 focus-visible:ring-offset-kumo-base rounded-sm"
                      >
                        {props[slug]?.length ? (
                          <PropsTable docs={props[slug]} />
                        ) : (
                          <p className="text-sm text-kumo-subtle">No documented props.</p>
                        )}
                      </Tabs.Panel>
                    </Tabs.Root>
                  )}
                </div>
                <footer className="mx-auto mt-16 flex w-full max-w-3xl items-center justify-between border-t border-dashed border-kumo-line pt-4 pb-2 font-mono text-2xs text-kumo-subtle">
                  <span>mono — @therealtinhtute/design</span>
                  <div className="flex items-center gap-4">
                    <Link href="/docs" className="text-sm hover:text-kumo-default">
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
              finalFocus={() =>
                (searchFromRecovery.current ? recoveryTriggerRef.current : null) ??
                searchTriggerRef.current ??
                undefined
              }
              items={searchItems}
              onSelect={selectComponent}
            />
          </Sidebar.Provider>
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}
