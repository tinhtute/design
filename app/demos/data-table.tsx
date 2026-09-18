"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  CaretDownIcon,
  CaretUpDownIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

export const notes =
  "Sortable, selectable table built on @tanstack/react-table — pass `columns` (ColumnDef) and `data`; row selection, column visibility, and pagination are wired in. Opt a column into sorting by calling `column.toggleSorting` from its header.";

interface Worker {
  name: string;
  status: "Active" | "Paused" | "Error";
  requests: number;
  deployed: string;
}

const statusVariant = {
  Active: "success",
  Paused: "warning",
  Error: "error",
} as const;

function SortableHeader({
  column,
  label,
}: {
  column: Column<Worker, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={
        sorted === "asc"
          ? CaretUpIcon
          : sorted === "desc"
            ? CaretDownIcon
            : CaretUpDownIcon
      }
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
    </Button>
  );
}

const columns: ColumnDef<Worker>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "requests",
    header: ({ column }) => (
      <SortableHeader column={column} label="Requests (24h)" />
    ),
    cell: ({ row }) => row.original.requests.toLocaleString(),
  },
  { accessorKey: "deployed", header: "Last deployed" },
];

const workers: Worker[] = [
  {
    name: "api-gateway",
    status: "Active",
    requests: 1_284_500,
    deployed: "2 hours ago",
  },
  {
    name: "auth-service",
    status: "Active",
    requests: 962_300,
    deployed: "5 hours ago",
  },
  {
    name: "image-resizer",
    status: "Active",
    requests: 431_700,
    deployed: "Yesterday",
  },
  {
    name: "checkout-webhook",
    status: "Active",
    requests: 388_900,
    deployed: "Yesterday",
  },
  {
    name: "cache-purger",
    status: "Paused",
    requests: 152_400,
    deployed: "3 days ago",
  },
  {
    name: "log-drain",
    status: "Active",
    requests: 121_800,
    deployed: "4 days ago",
  },
  {
    name: "session-sync",
    status: "Active",
    requests: 98_200,
    deployed: "5 days ago",
  },
  {
    name: "rate-limiter",
    status: "Error",
    requests: 74_500,
    deployed: "1 week ago",
  },
  {
    name: "pdf-renderer",
    status: "Active",
    requests: 52_100,
    deployed: "1 week ago",
  },
  {
    name: "geo-redirect",
    status: "Paused",
    requests: 31_900,
    deployed: "2 weeks ago",
  },
  {
    name: "email-relay",
    status: "Active",
    requests: 18_400,
    deployed: "2 weeks ago",
  },
  {
    name: "metrics-collector",
    status: "Active",
    requests: 9_700,
    deployed: "3 weeks ago",
  },
];

export const deps = ["badge"];

export function Demo() {
  return <DataTable columns={columns} data={workers} />;
}
