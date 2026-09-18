"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

export const notes =
  "Hint shown on hover or keyboard focus. Pass `content` and wrap a trigger element, or use `render` for button triggers; `side`, `align`, and `delay` tune behavior. Wrap the app in `TooltipProvider` for shared delay grouping.";

export function Demo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-6">
        <Tooltip content="Requests answered from the nearest Cloudflare data center">
          <Text>Edge requests</Text>
        </Tooltip>
        <Tooltip
          content="Deploy a new version"
          side="right"
          render={<Button variant="secondary" />}
        >
          Deploy
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
