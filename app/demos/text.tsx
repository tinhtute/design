"use client";

import { Text } from "@/components/ui/text";

export const notes =
  "Typography primitive for consistent styling. `variant` sets color and weight (heading, body, secondary, success, error, mono), `size` adjusts density, and `as` picks the rendered element — pass real heading tags so the document outline stays accessible.";

export function Demo() {
  return (
    <div className="flex flex-col gap-2">
      <Text variant="heading" as="h3">
        api-gateway
      </Text>
      <Text>
        Handles REST traffic for the billing API and caches responses in KV.
      </Text>
      <Text variant="secondary" size="sm">
        Last deployed 12 minutes ago · version 4f9c2e71
      </Text>
      <Text variant="mono-secondary">
        https://api-gateway.my-account.workers.dev
      </Text>
      <Text variant="error" size="sm">
        Route api.example.com/* conflicts with another worker.
      </Text>
    </div>
  );
}
