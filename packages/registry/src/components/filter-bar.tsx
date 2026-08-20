"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
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
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          className="pl-8"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <Button type="button" onClick={onFilter}>
        {filterLabel}
      </Button>
    </div>
  );
}
