"use client";

import * as React from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { InputGroup } from "@/components/ui/input-group";
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
      <InputGroup className="w-full max-w-sm">
        <InputGroup.Addon align="start">
          <MagnifyingGlass />
        </InputGroup.Addon>
        <InputGroup.Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value ? (
          <InputGroup.Addon align="end">
            <InputGroup.Button
              icon={X}
              aria-label="Clear search"
              onClick={() => onValueChange("")}
            />
          </InputGroup.Addon>
        ) : null}
      </InputGroup>
      <Button type="button" onClick={onFilter}>
        {filterLabel}
      </Button>
    </div>
  );
}
