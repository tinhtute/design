"use client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const notes =
  "Navigation trail showing the current page's place in the hierarchy. Compose `Link`, `Separator`, and `Current` — the current item is marked `aria-current` for screen readers — and add `Clipboard` for a hover-revealed copy-deeplink action.";

export function Demo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="/">Account</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="/workers">Workers</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>api-gateway</Breadcrumbs.Current>
      <Breadcrumbs.Clipboard text="https://dash.cloudflare.com/8f3a2c1d9e4b/workers/services/api-gateway" />
    </Breadcrumbs>
  );
}
