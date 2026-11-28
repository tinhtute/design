'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon as MagnifyingGlassIcon } from '@hugeicons/core-free-icons';
import { Tabs } from '@base-ui/react/tabs';

import Link from 'next/link';
import { ComponentSearch } from '@/components/component-search';
import { CopyForAgent } from '@/components/copy-for-agent';
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
import type { CatalogItem } from '@/lib/agent-catalog-model';
import { GROUPS } from '@/lib/showroom-groups';

const DEMO_CONTENT_ID = 'showroom-demo';

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
  catalog,
}: {
  sources: Record<string, string>;
  highlighted: Record<string, string>;
  catalog: CatalogItem[];
}) {
  const [slug, setSlug] = useState<Slug | null>('button');
  const [view, setView] = useState<View>('demo');
  const [searchOpen, setSearchOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
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
    const selectFromHash = () => {
      const fromHash = window.location.hash.slice(1);
      setSlug(fromHash === '' ? 'button' : ITEM_INDEX.has(fromHash) ? fromHash : null);
      setView('demo');
    };

    const handleHash = () => {
      const focusWasInPreview = previewRef.current?.contains(document.activeElement);
      selectFromHash();
      if (focusWasInPreview) {
        requestAnimationFrame(() => titleRef.current?.focus());
      }
    };

    selectFromHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const item = catalog.find((item) => item.slug === slug);
  const title = item?.title ?? 'Component not found';
  const groupIndex = GROUPS.findIndex((group) => group.items.some(([id]) => id === slug));

  const entry = slug === null ? undefined : DEMOS[slug];

  const searchItems = catalog.map(({ slug, title, group, aliases }) => ({
    id: slug,
    label: title,
    group,
    aliases,
  }));

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
                onShowroomNavigate={() => {
                  setSlug('button');
                  setView('demo');
                }}
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
                        : item?.description}
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
                        <div
                          ref={previewRef}
                          className="border border-dashed border-kumo-line p-4 max-sm:overflow-x-auto sm:p-6"
                        >
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
                            {item?.example && <CopyForAgent key={item.slug} item={item} />}
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
                        {item?.props.length ? (
                          <PropsTable docs={item.props} />
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
