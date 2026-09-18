"use client";

import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const notes =
  "Page-level header composing `Breadcrumbs`, title, description, and optional `tabs` plus action children. Sits at the top of resource pages to orient navigation.";

export const deps = ["breadcrumbs"];

export function Demo() {
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
}
