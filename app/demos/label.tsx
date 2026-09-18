"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const notes =
  "Form field label rendered as a real `label` element — associate it with a control via `htmlFor`. `showOptional` appends \"(optional)\" and `tooltip` adds an info icon with hover text.";

export const deps = ["input"];

export function Demo() {
  return (
    <div className="flex max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="worker-name"
          tooltip="Must be unique across your account"
        >
          Worker name
        </Label>
        <Input id="worker-name" placeholder="api-gateway" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="worker-description" showOptional>
          Description
        </Label>
        <Input
          id="worker-description"
          placeholder="Handles inbound API traffic"
        />
      </div>
    </div>
  );
}
