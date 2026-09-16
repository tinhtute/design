"use client";

import { useEffect, useState } from "react";
import * as echarts from "echarts/core";
import {
  LineChart,
  SankeyChart as EChartsSankey,
  MapChart,
  ScatterChart,
} from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
} from "echarts/components";
import type { Icon } from "@phosphor-icons/react";
import {
  PlusIcon,
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
} from "@phosphor-icons/react";

import { Autocomplete } from "@/components/ui/autocomplete";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardText } from "@/components/ui/clipboard-text";
import { Code } from "@/components/ui/code";
import { Collapsible } from "@/components/ui/collapsible";
import { Combobox } from "@/components/ui/combobox";
import { CommandPalette } from "@/components/ui/command-palette";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Empty } from "@/components/ui/empty";
import { Field } from "@/components/ui/field";
import { Grid, GridItem } from "@/components/ui/grid";
import { Input } from "@/components/ui/input";
import { InputArea } from "@/components/ui/input-area";
import { InputGroup } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { LayerCard } from "@/components/ui/layer-card";
import { Link } from "@/components/ui/link";
import { Loader } from "@/components/ui/loader";
import { Meter } from "@/components/ui/meter";
import { Pagination } from "@/components/ui/pagination";
import { Popover } from "@/components/ui/popover";
import { Radio } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { SensitiveInput } from "@/components/ui/sensitive-input";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Table } from "@/components/ui/table";
import { TableOfContents } from "@/components/ui/table-of-contents";
import { Tabs } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { BubbleMap, type MapGeoJson } from "@/components/ui/bubble-map";
import { TimeseriesChart } from "@/components/ui/timeseries-chart";
import { SankeyChart } from "@/components/ui/sankey-chart";
import { ChoroplethMap } from "@/components/ui/choropleth-map";
import { Toasty, ToastProvider } from "@/components/ui/toasty";
import { Toolbar } from "@/components/ui/toolbar";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

import { PageHeader } from "@/components/page-header";
import { DeleteResource } from "@/components/delete-resource";
import { ResourceListPage } from "@/components/resource-list-page";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/filter-bar";
import { Dashboard } from "@/components/dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import registry from "../../packages/registry/registry.json";

const DESCRIPTIONS = new Map(
  registry.items.map((item) => [item.name, item.description]),
);

echarts.use([
  LineChart,
  EChartsSankey,
  MapChart,
  ScatterChart,
  CanvasRenderer,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
]);

const sampleGeoJson: MapGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "US",
      properties: { name: "United States" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-125, 25],
            [-65, 25],
            [-65, 50],
            [-125, 50],
            [-125, 25],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: "VN",
      properties: { name: "Vietnam" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [102, 8],
            [110, 8],
            [110, 24],
            [102, 24],
            [102, 8],
          ],
        ],
      },
    },
  ],
};

const fruits = ["Apple", "Banana", "Cherry"];

type NavItem = readonly [id: string, label: string, icon: Icon];

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Action",
    items: [
      ["button", "Button", CursorClickIcon],
      ["clipboard-text", "Clipboard text", ClipboardTextIcon],
    ],
  },
  {
    title: "Display",
    items: [
      ["badge", "Badge", TagIcon],
      ["breadcrumbs", "Breadcrumbs", CaretRightIcon],
      ["code", "Code", CodeIcon],
      ["collapsible", "Collapsible", CaretDownIcon],
      ["empty", "Empty", TrayIcon],
      ["layer-card", "Layer card", StackIcon],
      ["meter", "Meter", GaugeIcon],
      ["text", "Text", TextAaIcon],
    ],
  },
  {
    title: "Feedback",
    items: [
      ["banner", "Banner", MegaphoneIcon],
      ["loader", "Loader", SpinnerGapIcon],
      ["toasty", "Toasty", BellIcon],
    ],
  },
  {
    title: "Input",
    items: [
      ["checkbox", "Checkbox", CheckSquareIcon],
      ["combobox", "Combobox", ListMagnifyingGlassIcon],
      ["field", "Field", TextboxIcon],
      ["input", "Input", TextTIcon],
      ["input-area", "Input area", TextAlignLeftIcon],
      ["input-group", "Input group", RowsIcon],
      ["radio", "Radio", RadioButtonIcon],
      ["select", "Select", CaretUpDownIcon],
      ["switch", "Switch", ToggleLeftIcon],
    ],
  },
  {
    title: "Navigation",
    items: [
      ["command-palette", "Command palette", MagnifyingGlassIcon],
      ["pagination", "Pagination", DotsThreeIcon],
      ["tabs", "Tabs", BrowsersIcon],
    ],
  },
  {
    title: "Overlay",
    items: [
      ["dialog", "Dialog", FrameCornersIcon],
      ["dropdown-menu", "Dropdown menu", ListBulletsIcon],
      ["popover", "Popover", ChatCircleTextIcon],
      ["tooltip", "Tooltip", InfoIcon],
    ],
  },
  {
    title: "Layout",
    items: [
      ["grid", "Grid", GridFourIcon],
      ["page-header", "Page header", LayoutIcon],
      ["resource-list-page", "Resource list page", ListDashesIcon],
    ],
  },
  {
    title: "Data visualization",
    items: [
      ["timeseries-chart", "Timeseries chart", ChartLineIcon],
      ["sankey-chart", "Sankey chart", TreeStructureIcon],
      ["bubble-map", "Bubble map", MapPinIcon],
      ["choropleth-map", "Choropleth map", GlobeIcon],
    ],
  },
  {
    title: "Other",
    items: [
      ["autocomplete", "Autocomplete", FunnelSimpleIcon],
      ["date-picker", "Date picker", CalendarBlankIcon],
      ["label", "Label", TagIcon],
      ["link", "Link", LinkIcon],
      ["sensitive-input", "Sensitive input", EyeSlashIcon],
      ["sidebar", "Sidebar", SidebarSimpleIcon],
      ["table", "Table", TableIcon],
      ["table-of-contents", "Table of contents", ListNumbersIcon],
      ["toolbar", "Toolbar", ToolboxIcon],
      ["delete-resource", "Delete resource", TrashIcon],
    ],
  },
  {
    title: "Patterns",
    items: [
      ["data-table", "Data table", TableIcon],
      ["filter-bar", "Filter bar", FunnelSimpleIcon],
      ["dashboard", "Dashboard", SquaresFourIcon],
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
          description="Official @therealtinhtute/ui component catalog."
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
      return (
        <LayerCard>
          <Text>Surface for grouping related content.</Text>
        </LayerCard>
      );
    case "meter":
      return <Meter label="Storage used" value={65} />;
    case "text":
      return <Text>Content text is 14px.</Text>;
    case "loader":
      return <Loader />;
    case "toasty":
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
    case "link":
      return <Link href="https://github.com">GitHub Repository</Link>;
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
                <Table.Cell>Worker A</Table.Cell>
                <Table.Cell>Active</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      );
    case "tooltip":
      return (
        <Tooltip content="Official tooltip">
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
    case "dropdown-menu":
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
            <Dialog.Description>Custom dialog description.</Dialog.Description>
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
    case "timeseries-chart":
      return (
        <div className="h-48 min-w-0 max-w-full overflow-hidden">
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
    case "sankey-chart":
      return (
        <div className="h-48 min-w-0 max-w-full overflow-hidden">
          <SankeyChart
            echarts={echarts}
            nodes={[{ name: "Ingress" }, { name: "Workers" }, { name: "Origin" }]}
            links={[
              { source: 0, target: 1, value: 80 },
              { source: 1, target: 2, value: 75 },
            ]}
          />
        </div>
      );
    case "bubble-map":
      return (
        <div className="h-64 min-w-0 max-w-full overflow-hidden">
          <BubbleMap
            echarts={echarts}
            geoJson={sampleGeoJson}
            data={[
              { city: "San Francisco", lon: -122.4, lat: 37.7, count: 120 },
              { city: "Hanoi", lon: 105.8, lat: 21.0, count: 85 },
            ]}
            lng="lon"
            lat="lat"
            name="city"
            value="count"
          />
        </div>
      );
    case "choropleth-map":
      return (
        <div className="h-64 min-w-0 max-w-full overflow-hidden">
          <ChoroplethMap
            echarts={echarts}
            geoJson={sampleGeoJson}
            data={[
              { country: "United States", count: 1200 },
              { country: "Vietnam", count: 850 },
            ]}
            name="country"
            value="count"
          />
        </div>
      );
    case "page-header":
      return (
        <PageHeader
          breadcrumbs={
            <Breadcrumbs>
              <Breadcrumbs.Link href="/">Account</Breadcrumbs.Link>
              <Breadcrumbs.Separator />
              <Breadcrumbs.Current>Workers</Breadcrumbs.Current>
            </Breadcrumbs>
          }
          title="Workers"
          description="Deploy and manage Cloudflare Workers."
        />
      );
    case "resource-list-page":
      return (
        <ResourceListPage
          title="Workers"
          description="Manage workers deployed to the edge."
        >
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
    case "delete-resource":
      return (
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger
            render={<Button variant="destructive">Delete worker</Button>}
          />
          <DeleteResource
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            resourceType="worker"
            resourceName="api-gateway"
            onDelete={() => setDialogOpen(false)}
          />
        </Dialog.Root>
      );
    case "data-table":
      return <DataTable columns={[]} data={[]} />;
    case "filter-bar":
      return <FilterBar value="" onValueChange={() => undefined} />;
    case "dashboard":
      return <Dashboard />;
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
    const handleHash = () => {
      const fromHash = window.location.hash.replace(/^#/, "");
      if (
        GROUPS.some((group) => group.items.some(([id]) => id === fromHash))
      ) {
        setSlug(fromHash);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const title =
    GROUPS.flatMap((group) => group.items).find(([id]) => id === slug)?.[1] ??
    slug;

  return (
    <TooltipProvider>
      <ToastProvider>
        <Sidebar.Provider defaultOpen collapsible="offcanvas" className="h-dvh">
          <Sidebar>
            <Sidebar.Header>
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src="/logo-solid.svg"
                  alt=""
                  className="size-6 shrink-0"
                />
                <h1 className="text-xl font-bold text-kumo-default">
                  mono
                </h1>
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
                            id === slug
                              ? undefined
                              : "text-kumo-subtle hover:text-kumo-default"
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
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto px-8 py-8">
              <div className="grid max-w-3xl gap-6">
                <div className="grid gap-1.5">
                  <h2 className="text-3xl font-bold tracking-tight text-kumo-default">
                    {title}
                  </h2>
                  <p className="text-sm text-kumo-subtle">
                    {DESCRIPTIONS.get(slug)}
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
