"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ChartBar,
  Gear,
  Package,
  SquaresFour,
  Users,
  type Icon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayerCard } from "@/components/ui/layer-card";
import { DataTable } from "@/components/data-table";

const navItems: { icon: Icon; label: string; active?: boolean }[] = [
  { icon: SquaresFour, label: "Overview", active: true },
  { icon: ChartBar, label: "Analytics" },
  { icon: Users, label: "Customers" },
  { icon: Package, label: "Products" },
  { icon: Gear, label: "Settings" },
];

const stats = [
  {
    label: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
  },
  { label: "Active Users", value: "2,350", change: "+180 this week" },
  { label: "Orders", value: "1,204", change: "+19% from last month" },
];

interface Order {
  id: string;
  customer: string;
  status: string;
  total: string;
}

const columns: ColumnDef<Order>[] = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "total", header: "Total" },
];

const orders: Order[] = [
  {
    id: "ORD-001",
    customer: "Ada Lovelace",
    status: "Completed",
    total: "$129.00",
  },
  {
    id: "ORD-002",
    customer: "Grace Hopper",
    status: "Processing",
    total: "$84.50",
  },
  {
    id: "ORD-003",
    customer: "Katherine Johnson",
    status: "Completed",
    total: "$249.99",
  },
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-kumo-canvas">
      <header className="border-b border-kumo-line">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="font-semibold">therealtinhtute</div>
          <Button variant="ghost" size="sm">
            Log out
          </Button>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-64 flex-col gap-1 border-r border-kumo-line p-4 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              icon={item.icon}
              className="w-full justify-start"
            >
              {item.label}
            </Button>
          ))}
        </aside>
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-kumo-subtle">
                Welcome back, here's what's happening today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Export</Button>
              <Button variant="primary">New report</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <LayerCard key={stat.label}>
                <p className="text-sm text-kumo-subtle">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-kumo-subtle">{stat.change}</p>
              </LayerCard>
            ))}
          </div>
          <LayerCard>
            <LayerCard.Secondary className="justify-between">
              <span>Recent orders</span>
              <Badge variant="success" appearance="dot">
                Live
              </Badge>
            </LayerCard.Secondary>
            <LayerCard.Primary>
              <p className="text-sm text-kumo-subtle">
                Latest activity across your store
              </p>
              <DataTable columns={columns} data={orders} />
            </LayerCard.Primary>
          </LayerCard>
        </main>
      </div>
    </div>
  );
}
