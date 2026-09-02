"use client";

import * as React from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterBarProps extends React.ComponentProps<"div"> {
  value: string;
  onValueChange: (value: string) => void;
  onFilter?: () => void;
  placeholder?: string;
  filterLabel?: string;
}

export function FilterBar({
  value,
  onValueChange,
  onFilter,
  placeholder = "Search...",
  filterLabel = "Filter",
  className,
  ...props
}: FilterBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div className="relative w-full max-w-sm">
        <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-kumo-subtle" />
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-8"
        />
        {value ? (
          <Button
            type="button"
            shape="square"
            size="sm"
            variant="ghost"
            icon={X}
            aria-label="Clear search"
            onClick={() => onValueChange("")}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          />
        ) : null}
      </div>
      <Button type="button" onClick={onFilter}>
        {filterLabel}
      </Button>
    </div>
  );
}
