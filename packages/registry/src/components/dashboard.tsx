"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";

const navItems: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Customers" },
  { icon: Package, label: "Products" },
  { icon: Settings, label: "Settings" },
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
  { id: "ORD-001", customer: "Ada Lovelace", status: "Completed", total: "$129.00" },
  { id: "ORD-002", customer: "Grace Hopper", status: "Processing", total: "$84.50" },
  { id: "ORD-003", customer: "Katherine Johnson", status: "Completed", total: "$249.99" },
];

export function Dashboard() {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="font-semibold">therealtinhtute</div>
          <Button variant="ghost" size="sm">
            Log out
          </Button>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-64 flex-col gap-1 border-r p-4 md:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                item.active && "bg-accent text-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </aside>
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Welcome back, here's what's happening today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Export</Button>
              <Button>New report</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest activity across your store</CardDescription>
              <Badge className="w-fit">Live</Badge>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={orders} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
