/**
 * FilterBar — controlled search input with an explicit apply action.
 *
 * Composes `InputGroup` (leading search icon, trailing clear button) and a
 * `Button`. `value`/`onValueChange` track the query as the user types;
 * `onFilter` fires on the apply button — wire it to the actual filtering so
 * typing does not refilter on every keystroke.
 */
"use client";

import * as React from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { InputGroup } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/** FilterBar component props. */
interface FilterBarProps extends React.ComponentProps<"div"> {
  /** Current query text (controlled) */
  value: string;
  /** Called with the new query on every keystroke, and with `""` when cleared */
  onValueChange: (value: string) => void;
  /** Called when the apply button is clicked; perform the actual filtering here */
  onFilter?: () => void;
  /** Input placeholder; also used as the input's aria-label @default "Search..." */
  placeholder?: string;
  /** Apply-button label @default "Filter" */
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
