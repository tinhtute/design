"use client";

import { useEffect, useState } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { GridComponent, TooltipComponent } from "echarts/components";
import {
  AppWindowIcon,
  ChartLineIcon,
  CompassIcon,
  DotsThreeOutlineIcon,
  KeyboardIcon,
  LightningIcon,
  MegaphoneIcon,
  PlusIcon,
  SquaresFourIcon,
  TagIcon,
} from "@phosphor-icons/react";
import {
  Autocomplete,
  Badge,
  Banner,
  Breadcrumbs,
  Button,
  Checkbox,
  ClipboardText,
  CloudflareLogo,
  Code,
  Collapsible,
  Combobox,
  CommandPalette,
  DatePicker,
  DateRangePicker,
  Dialog,
  DropdownMenu,
  Empty,
  Field,
  Flow,
  Grid,
  GridItem,
  Input,
  InputArea,
  InputGroup,
  Label,
  LayerCard,
  Link,
  Loader,
  MenuBar,
  Meter,
  Pagination,
  Popover,
  Radio,
  Select,
  SensitiveInput,
  Sidebar,
  SidebarProvider,
  Surface,
  Switch,
  Table,
  TableOfContents,
  Tabs,
  Text,
  TimeseriesChart,
  Toasty,
  ToastProvider,
  Toolbar,
  Tooltip,
  TooltipProvider,
} from "@cloudflare/kumo";
import { ThemeToggle } from "@/components/theme-toggle";

echarts.use([LineChart, CanvasRenderer, GridComponent, TooltipComponent]);

const fruits = ["Apple", "Banana", "Cherry"];

const GROUPS = [
  {
    title: "Action",
    icon: LightningIcon,
    items: [
      ["button", "Button"],
      ["clipboard-text", "Clipboard text"],
    ],
  },
  {
    title: "Display",
    icon: TagIcon,
    items: [
      ["badge", "Badge"],
      ["breadcrumbs", "Breadcrumbs"],
      ["code", "Code"],
      ["collapsible", "Collapsible"],
      ["empty", "Empty"],
      ["layer-card", "Layer card"],
      ["meter", "Meter"],
      ["text", "Text"],
    ],
  },
  {
    title: "Feedback",
    icon: MegaphoneIcon,
    items: [
      ["banner", "Banner"],
      ["loader", "Loader"],
      ["toast", "Toast"],
    ],
  },
  {
    title: "Input",
    icon: KeyboardIcon,
    items: [
      ["checkbox", "Checkbox"],
      ["combobox", "Combobox"],
      ["date-range-picker", "Date range picker"],
      ["field", "Field"],
      ["input", "Input"],
      ["input-area", "Input area"],
      ["input-group", "Input group"],
      ["radio", "Radio"],
      ["select", "Select"],
      ["switch", "Switch"],
    ],
  },
  {
    title: "Navigation",
    icon: CompassIcon,
    items: [
      ["command-palette", "Command palette"],
      ["menu-bar", "Menu bar"],
      ["pagination", "Pagination"],
      ["tabs", "Tabs"],
    ],
  },
  {
    title: "Overlay",
    icon: AppWindowIcon,
    items: [
      ["dialog", "Dialog"],
      ["dropdown", "Dropdown"],
      ["popover", "Popover"],
      ["tooltip", "Tooltip"],
    ],
  },
  {
    title: "Layout",
    icon: SquaresFourIcon,
    items: [
      ["grid", "Grid"],
      ["surface", "Surface"],
      ["page-header", "Page header"],
      ["resource-list", "Resource list"],
    ],
  },
  {
    title: "Data visualization",
    icon: ChartLineIcon,
    items: [
      ["timeseries", "Timeseries"],
      ["maps", "Maps"],
      ["sankey", "Sankey"],
    ],
  },
  {
    title: "Other",
    icon: DotsThreeOutlineIcon,
    items: [
      ["autocomplete", "Autocomplete"],
      ["cloudflare-logo", "Cloudflare logo"],
      ["date-picker", "Date picker"],
      ["label", "Label"],
      ["link", "Link"],
      ["sensitive-input", "Sensitive input"],
      ["sidebar", "Sidebar"],
      ["table", "Table"],
      ["table-of-contents", "Table of contents"],
      ["toolbar", "Toolbar"],
      ["flow", "Flow"],
      ["delete-resource", "Delete resource"],
    ],
  },
];

type Slug = string;
function Canvas({
  slug,
  dialogOpen,
  setDialogOpen,
  paletteOpen,
  setPaletteOpen,
  page,
  setPage,
}: {
  slug: Slug;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  page: number;
  setPage: (page: number) => void;
}) {
  switch (slug) {
    case "button":
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary" icon={PlusIcon}>
            Create worker
          </Button>
        </div>
      );
    case "badge":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      );
    case "banner":
      return (
        <Banner
          title="Notice"
          description="Official @cloudflare/kumo 2.13.0 catalog."
        />
      );
    case "breadcrumbs":
      return (
        <Breadcrumbs>
          <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Playground</Breadcrumbs.Current>
        </Breadcrumbs>
      );
    case "clipboard-text":
      return <ClipboardText text="0c239dd2" />;
    case "cloudflare-logo":
      return <CloudflareLogo />;
    case "code":
      return <Code code={`const greeting = "hello";`} />;
    case "collapsible":
      return (
        <Collapsible>
          <Collapsible.DefaultTrigger>Details</Collapsible.DefaultTrigger>
          <Collapsible.DefaultPanel>Hidden content</Collapsible.DefaultPanel>
        </Collapsible>
      );
    case "empty":
      return <Empty title="No items" description="Nothing here yet." />;
    case "layer-card":
      return <Text>Surface for grouping related content.</Text>;
    case "meter":
      return <Meter label="Storage used" value={65} />;
    case "text":
      return <Text>Content text is 14px.</Text>;
    case "loader":
      return <Loader />;
    case "toast":
      return (
        <Toasty>
          <Text>Toast viewport is mounted.</Text>
        </Toasty>
      );
    case "checkbox":
      return <Checkbox label="Accept" />;
    case "input":
      return <Input label="Name" placeholder="Ada Lovelace" />;
    case "input-area":
      return <InputArea label="Notes" placeholder="Write something…" />;
    case "input-group":
      return (
        <InputGroup>
          <InputGroup.Input placeholder="Search…" />
        </InputGroup>
      );
    case "field":
      return (
        <Field label="Email">
          <Input placeholder="ada@example.com" />
        </Field>
      );
    case "label":
      return <Label>Email</Label>;
    case "radio":
      return (
        <Radio.Group defaultValue="a">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </Radio.Group>
      );
    case "switch":
      return <Switch label="Enabled" />;
    case "sensitive-input":
      return <SensitiveInput label="Token" />;
    case "select":
      return (
        <Select
          label="Fruit"
          placeholder="Pick a fruit"
          items={{ apple: "Apple", banana: "Banana", cherry: "Cherry" }}
        />
      );
    case "autocomplete":
      return (
        <Autocomplete items={fruits} label="Fruit">
          <Autocomplete.InputGroup placeholder="Search fruits…" />
          <Autocomplete.Content>
            <Autocomplete.List>
              {(item: string) => (
                <Autocomplete.Item key={item} value={item}>
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Content>
        </Autocomplete>
      );
    case "combobox":
      return (
        <Combobox items={fruits} label="Fruit">
          <Combobox.TriggerInput placeholder="Pick a fruit…" />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>
      );
    case "date-picker":
      return <DatePicker mode="single" />;
    case "date-range-picker":
      return (
        <DateRangePicker
          onStartDateChange={() => undefined}
          onEndDateChange={() => undefined}
        />
      );
    case "link":
      return <Link href="https://kumo-ui.com">kumo-ui.com</Link>;
    case "grid":
      return (
        <Grid>
          <GridItem>
            <Text>A</Text>
          </GridItem>
          <GridItem>
            <Text>B</Text>
          </GridItem>
        </Grid>
      );
    case "surface":
      return (
        <Surface>
          <Text>Deprecated surface — still in the 2.13 catalog.</Text>
        </Surface>
      );
    case "tabs":
      return (
        <Tabs
          tabs={[
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
          ]}
        />
      );
    case "pagination":
      return (
        <Pagination page={page} setPage={setPage} perPage={10} totalCount={80}>
          <Pagination.Info />
          <Pagination.Controls />
        </Pagination>
      );
    case "menu-bar":
      return <MenuBar isActive={false} options={[]} />;
    case "toolbar":
      return (
        <Toolbar>
          <Toolbar.Button icon={PlusIcon} aria-label="Add" />
        </Toolbar>
      );
    case "table-of-contents":
      return (
        <TableOfContents>
          <TableOfContents.Title>On this page</TableOfContents.Title>
          <TableOfContents.List>
            <TableOfContents.Item href="#button">Button</TableOfContents.Item>
          </TableOfContents.List>
        </TableOfContents>
      );
    case "sidebar":
      return (
        <div className="h-48 overflow-hidden ring ring-kumo-line">
          <SidebarProvider>
            <Sidebar>
              <Sidebar.Header>Catalog</Sidebar.Header>
              <Sidebar.Content>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton>Overview</Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.Content>
            </Sidebar>
          </SidebarProvider>
        </div>
      );
    case "table":
      return (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Worker A</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      );
    case "tooltip":
      return (
        <Tooltip content="Official Kumo tooltip">
          <Text>Hover me</Text>
        </Tooltip>
      );
    case "popover":
      return (
        <Popover>
          <Popover.Trigger
            render={<Button variant="secondary">Open popover</Button>}
          />
          <Popover.Content>
            <Text>Popover content</Text>
          </Popover.Content>
        </Popover>
      );
    case "dropdown":
      return (
        <DropdownMenu>
          <DropdownMenu.Trigger
            render={<Button variant="secondary">Open menu</Button>}
          />
          <DropdownMenu.Content>
            <DropdownMenu.Item>Edit</DropdownMenu.Item>
            <DropdownMenu.Item variant="danger">Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );
    case "dialog":
      return (
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger
            render={<Button variant="secondary">Open dialog</Button>}
          />
          <Dialog>
            <Dialog.Title>Confirm</Dialog.Title>
            <Dialog.Description>Official Kumo dialog.</Dialog.Description>
          </Dialog>
        </Dialog.Root>
      );
    case "command-palette":
      return (
        <div className="grid gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPaletteOpen(true)}
          >
            Open palette
          </Button>
          <CommandPalette.Root
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            items={fruits}
          >
            <CommandPalette.Input placeholder="Search…" />
            <CommandPalette.List>
              <CommandPalette.Empty>No results</CommandPalette.Empty>
            </CommandPalette.List>
          </CommandPalette.Root>
        </div>
      );
    case "flow":
      return (
        <Flow>
          <Flow.Node>Start</Flow.Node>
          <Flow.Node>Finish</Flow.Node>
        </Flow>
      );
    case "timeseries":
    case "sankey":
    case "maps":
      return (
        <div className="h-48">
          <TimeseriesChart
            echarts={echarts}
            data={[
              {
                name: "Requests",
                color: "#124b68",
                data: [
                  [0, 10],
                  [60_000, 18],
                  [120_000, 12],
                ],
              },
            ]}
          />
        </div>
      );
    case "page-header":
      return (
        <div className="grid gap-3">
          <Breadcrumbs>
            <Breadcrumbs.Link href="/">Account</Breadcrumbs.Link>
            <Breadcrumbs.Separator />
            <Breadcrumbs.Current>Workers</Breadcrumbs.Current>
          </Breadcrumbs>
          <Text as="h1" variant="heading1">
            Workers
          </Text>
          <Text>Deploy and manage Cloudflare Workers.</Text>
        </div>
      );
    case "resource-list":
      return (
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
      );
    case "delete-resource":
      return (
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger
            render={<Button variant="destructive">Delete worker</Button>}
          />
          <Dialog>
            <Dialog.Title>Delete worker</Dialog.Title>
            <Dialog.Description>
              This action cannot be undone.
            </Dialog.Description>
          </Dialog>
        </Dialog.Root>
      );
    default:
      return <Text>Unknown component.</Text>;
  }
}

export function Playground() {
  const [slug, setSlug] = useState<Slug>("button");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fromHash = window.location.hash.replace(/^#/, "") as Slug;
    const known = GROUPS.some((group) =>
      group.items.some(([id]) => id === fromHash),
    );
    if (known) setSlug(fromHash);
  }, []);

  const title =
    GROUPS.flatMap((group) => [...group.items]).find(([id]) => id === slug)?.[1] ??
    slug;

  return (
    <TooltipProvider>
      <ToastProvider>
        <Sidebar.Provider defaultOpen className="h-dvh">
          <Sidebar>
            <Sidebar.Header>
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src="/logo-solid.svg"
                  alt=""
                  className="size-6 shrink-0"
                />
                <Text as="h1" variant="heading3">
                  mono
                </Text>
              </div>
            </Sidebar.Header>
            <Sidebar.Content>
              {GROUPS.map((group) => (
                <Sidebar.Group key={group.title}>
                  <Sidebar.Menu>
                    <Sidebar.MenuItem>
                      <Sidebar.Collapsible defaultOpen={false}>
                        <Sidebar.CollapsibleTrigger
                          render={
                            <Sidebar.MenuButton
                              icon={group.icon}
                              tooltip={group.title}
                            >
                              {group.title} <Sidebar.MenuChevron />
                            </Sidebar.MenuButton>
                          }
                        />
                        <Sidebar.CollapsibleContent>
                          <Sidebar.MenuSub>
                            {group.items.map(([id, label]) => (
                              <Sidebar.MenuSubButton
                                key={id}
                                active={id === slug}
                                onClick={() => {
                                  setSlug(id);
                                  window.location.hash = id;
                                }}
                              >
                                {label}
                              </Sidebar.MenuSubButton>
                            ))}
                          </Sidebar.MenuSub>
                        </Sidebar.CollapsibleContent>
                      </Sidebar.Collapsible>
                    </Sidebar.MenuItem>
                  </Sidebar.Menu>
                </Sidebar.Group>
              ))}
            </Sidebar.Content>
            <Sidebar.Footer>
              <Sidebar.Trigger />
            </Sidebar.Footer>
          </Sidebar>
          <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-kumo-base text-kumo-default">
            <header className="sticky top-0 z-10 flex items-center justify-end border-b border-kumo-line bg-kumo-base px-6 py-3">
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto px-8 py-8">
              <div className="grid max-w-3xl gap-6">
                <div className="grid gap-1.5">
                  <Text as="h2" variant="heading1">
                    {title}
                  </Text>
                  <p className="text-sm text-kumo-subtle">
                    Live canvas from official @cloudflare/kumo.
                  </p>
                </div>
                <div className="rounded-lg bg-kumo-base p-6 ring ring-kumo-line">
                  <Canvas
                    slug={slug}
                    dialogOpen={dialogOpen}
                    setDialogOpen={setDialogOpen}
                    paletteOpen={paletteOpen}
                    setPaletteOpen={setPaletteOpen}
                    page={page}
                    setPage={setPage}
                  />
                </div>
              </div>
            </main>
          </div>
        </Sidebar.Provider>
      </ToastProvider>
    </TooltipProvider>
  );
}
