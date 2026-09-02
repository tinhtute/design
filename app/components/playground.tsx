"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge as KumoBadge } from "@/components/kumo/badge";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Row {
  id: string;
  name: string;
  status: string;
}

const rows: Row[] = [
  { id: "ORD-1042", name: "Ada Lovelace", status: "Paid" },
  { id: "ORD-1043", name: "Grace Hopper", status: "Pending" },
  { id: "ORD-1044", name: "Alan Turing", status: "Paid" },
  { id: "ORD-1045", name: "Katherine Johnson", status: "Refunded" },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "name", header: "Customer" },
  { accessorKey: "status", header: "Status" },
];

export function Playground() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.id.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-16">
      <section id="primitives" className="flex flex-col gap-8">
        <SectionHeading
          kicker="primitive"
          title="Buttons, badges, input, checkbox"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <KumoBadge variant="success" appearance="dot">
            Healthy
          </KumoBadge>
          <KumoBadge variant="warning" appearance="dot">
            Degraded
          </KumoBadge>
          <KumoBadge variant="error" appearance="dot">
            Down
          </KumoBadge>
          <KumoBadge variant="outline">kumo outline</KumoBadge>
          <KumoBadge variant="green">Active</KumoBadge>
        </div>
        <div className="flex max-w-sm flex-col gap-3">
          <Input placeholder="Search projects" aria-label="Search projects" />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked />
            Show archived
          </label>
        </div>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card</CardTitle>
            <CardDescription>Header, content, tokens from theme-default.</CardDescription>
          </CardHeader>
          <CardContent>Neutral palette, light and dark.</CardContent>
        </Card>
      </section>

      <section id="patterns" className="flex flex-col gap-8">
        <SectionHeading kicker="pattern" title="Filter bar and data table" />
        <FilterBar
          value={query}
          onValueChange={setQuery}
          placeholder="Filter orders"
          filterLabel="Apply"
        />
        <DataTable columns={columns} data={filtered} />
      </section>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
        {kicker}
      </p>
      <h2 className="text-xl font-medium tracking-tight">{title}</h2>
    </div>
  );
}
