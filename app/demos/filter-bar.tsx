"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import { FilterBar } from "@/components/filter-bar";

export const notes =
  "Search input with a clear button and a Filter action for narrowing resource lists. Control `value`/`onValueChange` yourself and apply the query in `onFilter`; the input is labelled for assistive tech via `placeholder`.";

interface Worker {
  name: string;
  status: "Active" | "Paused" | "Error";
  requests: string;
}

const statusVariant = {
  Active: "success",
  Paused: "warning",
  Error: "error",
} as const;

const workers: Worker[] = [
  { name: "api-gateway", status: "Active", requests: "1.28M" },
  { name: "auth-service", status: "Active", requests: "962K" },
  { name: "image-resizer", status: "Active", requests: "432K" },
  { name: "checkout-webhook", status: "Active", requests: "389K" },
  { name: "cache-purger", status: "Paused", requests: "152K" },
  { name: "rate-limiter", status: "Error", requests: "75K" },
];

export const deps = ["badge", "table"];

export function Demo() {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");

  const filtered = workers.filter((worker) =>
    worker.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-4">
      <FilterBar
        value={value}
        onValueChange={setValue}
        onFilter={() => setQuery(value)}
        placeholder="Filter workers…"
      />
      <div className="overflow-x-auto rounded-lg ring ring-kumo-line">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Requests (24h)</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.length ? (
              filtered.map((worker) => (
                <Table.Row key={worker.name}>
                  <Table.Cell>{worker.name}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={statusVariant[worker.status]}>
                      {worker.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{worker.requests}</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={3} className="text-center">
                  No workers match &quot;{query}&quot;.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
      <p className="text-sm text-kumo-subtle">
        Showing {filtered.length} of {workers.length} workers.
      </p>
    </div>
  );
}
