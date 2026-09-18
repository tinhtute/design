"use client";

import { Button } from "@/components/ui/button";
import { useKumoToastManager } from "@/components/ui/toasty";

export const notes =
  "App-level toast system — wrap the app once in `<Toasty>` (the showroom already does), then call `useKumoToastManager().add()` from any child. Toasts take `title`, `description`, `variant` (success/error/warning/info), and optional `actions` buttons; they auto-dismiss, swipe away, and are announced to screen readers.";

export function Demo() {
  const toasts = useKumoToastManager();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          toasts.add({
            title: "Worker deployed",
            description: "api-gateway is now live in production.",
            variant: "success",
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toasts.add({
            title: "Deployment failed",
            description: "Build timed out after 30 seconds.",
            variant: "error",
          })
        }
      >
        Error toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toasts.add({
            title: "Worker deleted",
            description: "api-gateway was removed from production.",
            variant: "info",
            actions: [
              {
                variant: "secondary",
                size: "sm",
                children: "Undo",
                onClick: () =>
                  toasts.add({
                    title: "Worker restored",
                    variant: "success",
                  }),
              },
            ],
          })
        }
      >
        Toast with action
      </Button>
    </div>
  );
}
