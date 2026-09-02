/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */
import React, {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  useMemo,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";
import { type ButtonProps, Button as ButtonExternal } from "@/components/ui/button";
import { Field, type FieldProps } from "@/components/ui/field";
import {
  Input as InputExternal,
  inputVariants,
  type InputProps,
  type KumoInputSize,
} from "@/components/ui/input";
import { Tooltip, type KumoTooltipSide } from "@/components/ui/tooltip";

// Spacing model
//
// Each element type has a fixed outer padding. The container uses has-[] CSS
// to reduce the input's padding on sides that touch an addon.
//
//   Input outer:       px-3 (12px base) — full padding when at the edge
//   Input seam:        pl-2 / pr-2 (8px base) — applied by container has-[]
//   Addon outer:       pl-2 / pr-2 (8px base) — on the container-edge side
//   Addon seam:        nothing — input owns the gap entirely
//
// has-[] rules on the container override [&_input]:pl-{seam} when a start
// addon is present, and [&_input]:pr-{seam} when an end addon is present.

export interface InputGroupSizeTokens {
  /** Full outer padding — matches standalone Input (e.g. px-3). */
  inputOuter: string;
  /**
   * Directional outer padding for Addon at the container edge.
   *
   * These MUST be static pl-/pr- strings (not derived at runtime via
   * `"px-N".replace(…)`) so Tailwind JIT can detect them during its
   * source-file scan. Dynamic string construction produces class names
   * that never appear as literals, so Tailwind never generates the CSS.
   */
  addonOuterStart: string;
  addonOuterEnd: string;
  /**
   * Reduced outer padding when the Addon contains a Button.
   * Buttons have their own internal padding, so the Addon can use
   * less outer padding to keep the visual gap balanced.
   */
  addonButtonOuterStart: string;
  addonButtonOuterEnd: string;
  /** pr- for suffix when no end addon. */
  suffixPad: string;
  fontSize: string;
  /** Icon size in px. */
  iconSize: number;
}

export const INPUT_GROUP_SIZE: Record<KumoInputSize, InputGroupSizeTokens> = {
  xs: {
    inputOuter: "px-1.5",
    addonOuterStart: "pl-1.5",
    addonOuterEnd: "pr-1.5",
    addonButtonOuterStart: "pl-1",
    addonButtonOuterEnd: "pr-1",
    suffixPad: "pr-1.5",
    fontSize: "text-xs",
    iconSize: 10,
  },
  sm: {
    inputOuter: "px-2",
    addonOuterStart: "pl-1.5",
    addonOuterEnd: "pr-1.5",
    addonButtonOuterStart: "pl-1",
    addonButtonOuterEnd: "pr-1",
    suffixPad: "pr-2",
    fontSize: "text-xs",
    iconSize: 13,
  },
  base: {
    inputOuter: "px-3",
    addonOuterStart: "pl-2",
    addonOuterEnd: "pr-2",
    addonButtonOuterStart: "pl-1",
    addonButtonOuterEnd: "pr-1",
    suffixPad: "pr-3",
    fontSize: "text-base",
    iconSize: 18,
  },
  lg: {
    inputOuter: "px-4",
    addonOuterStart: "pl-2.5",
    addonOuterEnd: "pr-2.5",
    addonButtonOuterStart: "pl-1.5",
    addonButtonOuterEnd: "pr-0.5",
    suffixPad: "pr-4",
    fontSize: "text-base",
    iconSize: 20,
  },
};

// Build the has-[] container classes that reduce input padding when addons
// are present. These are static strings so Tailwind JIT can detect them.
export const INPUT_GROUP_HAS_CLASSES: Record<KumoInputSize, string> = {
  xs: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-1",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-1",
  ].join(" "),
  sm: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-1.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-1.5",
  ].join(" "),
  base: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2",
  ].join(" "),
  lg: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2.5",
  ].join(" "),
};

/**
 * Props for `InputGroup.Root`. Focus mode is auto-detected from children
 * (see `detectFocusMode`), so it is not part of the public or internal API.
 */
export interface InputGroupRootPropsInternal
  extends
    HTMLAttributes<HTMLElement>,
    Partial<
      Pick<
        FieldProps,
        "label" | "description" | "error" | "required" | "labelTooltip"
      >
    > {
  size?: KumoInputSize | undefined;
  disabled?: boolean;
}

/** Public InputGroup.Root props — identical to the internal type. */
export type InputGroupRootProps = InputGroupRootPropsInternal;

export interface InputGroupContextValue {
  size?: KumoInputSize;
  focusMode: "container" | "individual" | "hybrid";
  disabled: boolean;
  error?: FieldProps["error"];
  /** Auto-generated id for the input element; used by the invisible label overlay. */
  inputId: string;
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(
  null,
);

/**
 * Set to `true` by `InputGroup.Addon` so that `InputGroup.Button` can detect
 * whether it's wrapped in an Addon. Ghost buttons should always live inside
 * an Addon for correct spacing.
 */
export const InputGroupAddonContext = createContext(false);

/**
 * Reads InputGroupContext and warns in development when the context is null
 * (i.e. when a sub-component is rendered outside of `<InputGroup>`).
 */
export function useInputGroupContext(componentName: string) {
  const context = useContext(InputGroupContext);
  if (process.env.NODE_ENV !== "production" && !context) {
    console.warn(
      `<InputGroup.${componentName}> must be used within <InputGroup>. Falling back to default values.`,
    );
  }
  return context;
}

/**
 * Partitions InputGroup children for hybrid focus mode.
 *
 * Container zone: Addon, Input, Suffix, text nodes — everything that should
 * share a single container-style border.
 *
 * Individual zone: Direct `InputGroup.Button` elements that manage their own
 * border and focus ring.
 *
 * Uses `displayName` comparison to identify elements, avoiding circular
 * imports between `context.ts` and the sub-component files.
 */
export function partitionChildren(children: ReactNode): {
  containerZone: ReactNode[];
  individualZone: ReactNode[];
} {
  const containerZone: ReactNode[] = [];
  const individualZone: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type as { displayName?: string })?.displayName ===
        "InputGroup.Button"
    ) {
      individualZone.push(child);
    } else {
      containerZone.push(child);
    }
  });

  return { containerZone, individualZone };
}

/**
 * Analyzes the direct children of `InputGroup` to determine the focus mode.
 *
 * Returns `"hybrid"` when BOTH an `InputGroup.Addon` AND a non-ghost direct
 * `InputGroup.Button` are present. In hybrid mode, Addon+Input share a
 * container-style border while Buttons get individual borders.
 *
 * Returns `"individual"` when a non-ghost direct `InputGroup.Button` is
 * present WITHOUT any `InputGroup.Addon`. This signals a toolbar/pagination
 * layout where each element manages its own focus ring.
 *
 * Returns `"container"` (default) in all other cases — the container owns a
 * single shared focus ring.
 *
 * Uses `displayName` comparison to identify elements, avoiding circular
 * imports between `context.ts` and the sub-component files.
 */
export function detectFocusMode(
  children: ReactNode,
): "container" | "individual" | "hybrid" {
  let hasNonGhostDirectButton = false;
  let hasAddon = false;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    // Identify components by displayName to avoid circular imports.
    const type = child.type;
    const typeMeta =
      typeof type === "function" || typeof type === "object"
        ? (type as { displayName?: string })
        : undefined;
    const displayName = typeMeta?.displayName;

    if (displayName === "InputGroup.Addon") {
      hasAddon = true;
      return;
    }

    if (displayName !== "InputGroup.Button") return;

    // A direct-child Button is by definition NOT inside an Addon (Addon's
    // children are children of the Addon element, not of InputGroup).
    // Check whether the variant is explicitly non-ghost.
    const buttonProps = child.props as { variant?: string };
    const variant = buttonProps.variant;
    if (variant !== undefined && variant !== "ghost") {
      hasNonGhostDirectButton = true;
    }
  });

  if (hasNonGhostDirectButton && hasAddon) return "hybrid";
  if (hasNonGhostDirectButton) return "individual";
  return "container";
}

/** Props for InputGroup.Input — omits Field props since InputGroup handles them. */
export type InputGroupInputProps = Omit<
  InputProps,
  "label" | "labelTooltip" | "description" | "error" | "size" | "disabled"
>;

/**
 * Text input that inherits size, disabled, and error state from InputGroup context.
 * Automatically sets `aria-invalid` when parent has an error.
 */
const Input = forwardRef<HTMLInputElement, InputGroupInputProps>(
  (props, ref) => {
    const context = useInputGroupContext("Input");
    // Omitted Field/size keys still arrive at runtime when callers misuse the API.
    const extraProps = props as InputGroupInputProps & {
      size?: unknown;
      disabled?: boolean;
      label?: unknown;
      description?: unknown;
    };

    // Warn when props that belong on <InputGroup> are passed directly
    if (process.env.NODE_ENV !== "production" && context) {
      if (extraProps.size !== undefined) {
        console.warn(
          "InputGroup.Input: Set `size` on <InputGroup> instead of <InputGroup.Input>.",
        );
      }
      if (extraProps.disabled !== undefined) {
        console.warn(
          "InputGroup.Input: Set `disabled` on <InputGroup> instead of <InputGroup.Input>.",
        );
      }
      if (extraProps.label !== undefined) {
        console.warn(
          "InputGroup.Input: Use the `label` prop on <InputGroup> instead of <InputGroup.Input>.",
        );
      }
      if (extraProps.description !== undefined) {
        console.warn(
          "InputGroup.Input: Use <InputGroup.Suffix> instead of passing `description` to <InputGroup.Input>.",
        );
      }
    }

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];
    const isIndividual = context?.focusMode === "individual";

    // Auto-set aria-invalid when error is present in context
    const hasError = Boolean(context?.error);

    // Use explicit id if provided, otherwise fall back to context id
    // (links the input to the invisible label overlay for click-to-focus).
    const inputId = props.id ?? context?.inputId;

    return (
      <InputExternal
        ref={ref}
        size={context?.size}
        disabled={context?.disabled || extraProps.disabled}
        aria-invalid={hasError || props["aria-invalid"]}
        {...props}
        id={inputId}
        className={cn(
          // Base input layout: fill height, allow shrinking, strip native border/radius
          "flex h-full min-w-0 grow items-center rounded-none border-0 bg-transparent font-sans",
          // Always use full outer padding — the container's has-[] rules reduce pl/pr to inputSeam on sides that touch an addon.
          tokens.inputOuter,
          // Truncate overflowing text with "…" instead of expanding the input
          "text-ellipsis",
          // Individual mode: each element owns its own border instead of sharing a container ring
          isIndividual
            ? [
                // Own border replaces the container's shared ring; suppress the base Input's focus:ring so only the border-swap shows
                "relative ring-0 focus:ring-0 border border-kumo-line",
                "first:rounded-l-[inherit] last:rounded-r-[inherit]",
                // Negative margin (not border-l-0) so the border is still paintable on focus
                "not-first:-ml-px",
                "hover:z-1 hover:border-kumo-line",
                // z-[2] lifts above hovered siblings so focus border isn't clipped
                "focus:z-2 focus:border-kumo-focus/50",
              ].join(" ")
            : // Container mode: kill all focus indicators — the container handles them z-1 lifts the input above the invisible label overlay so cursor/selection work
              "relative z-1 shadow-none ring-0! outline-none focus:ring-0! focus:outline-none",
          props.className,
        )}
      />
    );
  },
);
Input.displayName = "InputGroup.Input";

/**
 * In container mode, buttons render "one size down" so they stay visually
 * subordinate to the input.  In individual mode the size passes through
 * unchanged (pagination / toolbar buttons should match the input height).
 */
const COMPACT_BUTTON_SIZE: Record<KumoInputSize, KumoInputSize> = {
  xs: "xs",
  sm: "xs",
  base: "sm",
  lg: "base",
};

export type InputGroupButtonProps = ButtonProps & {
  /**
   * When provided, wraps the button in a `Tooltip` showing this content on hover.
   * Automatically sets `aria-label` from a string value when no `aria-label` is set.
   *
   * @example
   * ```tsx
   * <InputGroup.Addon align="end">
   *   <InputGroup.Button tooltip="Query language help" aria-label="Query language help">
   *     <QuestionIcon size={16} />
   *   </InputGroup.Button>
   * </InputGroup.Addon>
   * ```
   */
  tooltip?: ReactNode;
  /**
   * Preferred side for the tooltip popup.
   * @default "bottom"
   */
  tooltipSide?: KumoTooltipSide;
};

/**
 * Button for secondary actions rendered inside `InputGroup.Addon`
 * (toggle, copy, help).
 *
 * In `focusMode="container"` (default), renders as a compact ghost button
 * subordinate to the input. In `focusMode="individual"`, renders as a full
 * standalone button with its own focus ring, matching toolbar/pagination usage.
 *
 * Pass a `tooltip` prop to show a tooltip on hover.
 */
const Button = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<InputGroupButtonProps>
>(
  (
    {
      children,
      className,
      variant,
      size,
      disabled,
      tooltip,
      tooltipSide = "bottom",
      icon,
      ...props
    }: PropsWithChildren<InputGroupButtonProps>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const context = useInputGroupContext("Button");
    const isInsideAddon = useContext(InputGroupAddonContext);
    const isDisabled = disabled ?? context?.disabled;
    const isIndividual =
      context?.focusMode === "individual" || context?.focusMode === "hybrid";
    const effectiveVariant = variant ?? "ghost";

    if (
      process.env.NODE_ENV !== "production" &&
      context &&
      effectiveVariant === "ghost" &&
      !isInsideAddon
    ) {
      console.warn(
        "InputGroup.Button: Ghost buttons should be wrapped in <InputGroup.Addon> for correct spacing.",
      );
    }

    if (
      process.env.NODE_ENV !== "production" &&
      context &&
      size !== undefined
    ) {
      console.warn(
        "InputGroup.Button: Set `size` on <InputGroup> instead of <InputGroup.Button>.",
      );
    }

    // Derive aria-label from tooltip string when the button has no explicit label.
    // Icon-only buttons require an aria-label for a11y.
    const tooltipAriaLabel =
      typeof tooltip === "string" && !props["aria-label"] ? tooltip : undefined;

    // Pre-render the icon with the context-derived size so it matches the
    // Addon icon sizing (e.g. 18px at "base"). Without this, Button's
    // internal renderIconNode renders `<Icon />` with no size prop,
    // falling back to CSS font-size (~14px).
    const contextIconSize = context
      ? INPUT_GROUP_SIZE[context.size ?? "base"].iconSize
      : undefined;

    const sizedIcon =
      icon &&
      contextIconSize &&
      (typeof icon === "function" ||
        (typeof icon === "object" &&
          icon !== null &&
          !React.isValidElement(icon)))
        ? React.createElement(icon as React.ComponentType<{ size?: number }>, {
            size: contextIconSize,
          })
        : icon;

    const btn = (
      <ButtonExternal
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-label={tooltipAriaLabel}
        {...props}
        icon={sizedIcon}
        variant={variant ?? "ghost"}
        // Individual: use the group's size directly so buttons match the input height.
        // Container: render one size down so the button stays subordinate to the input.
        size={
          size ??
          (isIndividual
            ? (context?.size ?? "sm")
            : (COMPACT_BUTTON_SIZE[context?.size ?? "base"] ?? "sm"))
        }
        className={cn(
          // Ensure clicks register even when parent has pointer-events-none (e.g. disabled overlay)
          "pointer-events-auto",
          // Suppress the base Button's drop shadow so InputGroup matches the flat
          // appearance of the standalone Input (ghost already sets shadow-none,
          // but secondary/primary/outline etc. inherit shadow-xs from Button base)
          "shadow-none",
          // Suppress the base Button's non-visible focus ring in all modes
          "focus:ring-0",
          // Container-zone buttons: use a subtle ring as focus indicator
          // (outline doesn't work because the base Button's `focus:outline-none`
          // sets `outline-style: none` which our outline-width/color can't override)
          !isIndividual &&
            "focus-visible:ring-[1.5px] focus-visible:ring-kumo-focus/50",
          // Individual mode: each button owns its own border and focus indicator
          isIndividual && [
            // Own border replaces the container's shared ring; force full height
            "relative h-full! rounded-none border border-kumo-line ring-0 focus-visible:ring-0",
            "first:rounded-l-[inherit] last:rounded-r-[inherit]",
            // Negative margin (not border-l-0) so the border is still paintable on focus
            "not-first:-ml-px",
            "hover:z-1",
            // z-2 lifts above hovered siblings so focus border isn't clipped
            "focus:z-2",
            "focus-visible:border-kumo-focus/50",
            "disabled:bg-kumo-overlay disabled:text-kumo-inactive!",
          ],
          className,
        )}
      >
        {children}
      </ButtonExternal>
    );

    if (tooltip) {
      return (
        <Tooltip content={tooltip} side={tooltipSide} asChild>
          {btn}
        </Tooltip>
      );
    }

    return btn;
  },
);
Button.displayName = "InputGroup.Button";

export interface InputGroupAddonProps {
  /** Position relative to the input. @default "start" */
  align?: "start" | "end";
  /** Additional CSS classes. */
  className?: string;
  /** Addon content: icons, buttons, spinners, text. */
  children?: ReactNode;
}

/**
 * Container for icons, text, or compact buttons positioned at the start or end
 * of the input. Automatically sizes icon children to match the input size.
 */
const Addon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ align = "start", className, children }, ref) => {
    const context = useInputGroupContext("Addon");

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];

    // Inject size into direct icon children that don't already have one set.
    // Skips buttons (which have their own size handling) and non-element nodes.
    // Also tracks whether a Button is present so we can reduce outer padding.
    let containsButton = false;
    const sizedChildren = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      if (child.type === Button) {
        containsButton = true;
        return child;
      }
      const props = child.props as { size?: unknown };
      if (props.size !== undefined) return child;
      return cloneElement(child as ReactElement<{ size?: number }>, {
        size: tokens.iconSize,
      });
    });

    // Always use flex-based positioning. CSS order controls visual placement.
    return (
      <div
        ref={ref}
        data-slot={
          align === "start"
            ? "input-group-addon-start"
            : "input-group-addon-end"
        }
        className={cn(
          "pointer-events-none relative z-[1] flex shrink-0 items-center gap-1.5",
          "text-kumo-subtle",
          tokens.fontSize,
          "*:pointer-events-auto",
          align === "start"
            ? cn(
                "-order-1",
                containsButton
                  ? tokens.addonButtonOuterStart
                  : tokens.addonOuterStart,
                "pr-0",
              )
            : cn(
                "order-1",
                "pl-0",
                containsButton
                  ? tokens.addonButtonOuterEnd
                  : tokens.addonOuterEnd,
              ),
          className,
        )}
      >
        <InputGroupAddonContext.Provider value={true}>
          {sizedChildren}
        </InputGroupAddonContext.Provider>
      </div>
    );
  },
);
Addon.displayName = "InputGroup.Addon";

export interface InputGroupSuffixProps {
  /** Additional CSS classes. */
  className?: string;
  /** Suffix content (e.g., ".workers.dev"). */
  children?: ReactNode;
}

/**
 * Inline suffix that flows seamlessly next to the typed input value.
 * Input width adjusts automatically via CSS `field-sizing: content`.
 */
const Suffix = forwardRef<HTMLDivElement, InputGroupSuffixProps>(
  ({ className, children }, ref) => {
    const context = useInputGroupContext("Suffix");

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];

    return (
      <div
        ref={ref}
        data-slot="input-group-suffix"
        className={cn(
          "pointer-events-none flex min-w-0 grow items-center text-kumo-subtle select-none",
          tokens.fontSize,
          tokens.suffixPad,
          className,
        )}
      >
        <span className="truncate">{children}</span>
      </div>
    );
  },
);
Suffix.displayName = "InputGroup.Suffix";

export const KUMO_INPUT_GROUP_VARIANTS = {
  size: {
    xs: {
      classes: "h-6 text-xs",
      description: "Extra small size.",
    },
    sm: {
      classes: "h-7 text-xs",
      description: "Small size.",
    },
    base: {
      classes: "h-9 text-base",
      description: "Default size.",
    },
    lg: {
      classes: "h-11 text-base",
      description: "Large size.",
    },
  },
} as const;

export const KUMO_INPUT_GROUP_DEFAULT_VARIANTS = {
  size: "base",
} as const;

/**
 * Compound input component for building inputs with icons, addons, inline
 * suffixes, and action buttons. Accepts Field props and wraps content in
 * Field when label is provided.
 *
 * Renders as `<label>` only in standalone container mode (single input, no
 * sibling buttons) so clicking empty space focuses the input. Otherwise
 * renders as `<div>` to avoid nested `<label>` (when Field provides one) or
 * the browser's `:hover` propagation from `<label>` to its first labelable
 * descendant (when multiple labelable controls are siblings).
 *
 * @note Do not wrap InputGroup inside an external Field without using the `label` prop —
 * this creates invalid nested `<label>` elements. Use InputGroup's own `label` prop instead.
 *
 * @example
 * ```tsx
 * <InputGroup label="Email" error={{ message: "Invalid", match: true }}>
 *   <InputGroup.Addon><EnvelopeIcon /></InputGroup.Addon>
 *   <InputGroup.Input placeholder="you@example.com" />
 * </InputGroup>
 * ```
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroup.Input placeholder="my-worker" />
 *   <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
 * </InputGroup>
 * ```
 */
const Root = forwardRef<
  HTMLElement,
  PropsWithChildren<InputGroupRootPropsInternal>
>(
  (
    {
      size = "base",
      children,
      className,
      disabled = false,
      label,
      description,
      error,
      required,
      labelTooltip,
      ...rest
    },
    forwardedRef,
  ) => {
    const inputId = useId();
    const focusMode = detectFocusMode(children);

    const contextValue = useMemo(
      () => ({
        size,
        focusMode,
        disabled,
        error,
        inputId,
      }),
      [size, focusMode, disabled, error, inputId],
    );

    // When label is provided, Field already renders a <label> with htmlFor
    // that handles click-to-focus. Using <div> avoids nested <label> elements
    // (invalid HTML with undefined assistive technology behavior).
    // When standalone (no label), a native <label> preserves click-to-focus.
    const containerClassName = cn(
      // Establish positioning context and make the whole area a click target
      "relative w-full cursor-text",
      // inputVariants provides base ring-kumo-line; must come before state overrides
      inputVariants({ size }),
      // Disabled state: prevent interaction and dim the entire group
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Container mode: clip children to rounded corners and show a shared focus ring
      // Individual mode: disable container ring/shadow so each child owns its own border
      focusMode === "container"
        ? [
            "overflow-hidden",
            // Focus state must come AFTER inputVariants to override ring-kumo-line
            "focus-within:ring-[1.5px] focus-within:ring-kumo-focus/50",
          ]
        : // isolate creates a new stacking context so z-index in children doesn't leak out
          "isolate overflow-visible shadow-none ring-0",
      // Error state must also come after inputVariants
      "has-[input[aria-invalid=true]]:ring-kumo-danger",
      // Reset horizontal padding — children handle their own spacing
      "px-0",
      // Horizontal layout with no gap — children control their own internal spacing
      "flex items-center gap-0",
      // When a suffix is present, let the input shrink to its content width
      // so the suffix stays visually adjacent
      "has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content]",
      "has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full",
      "has-[[data-slot=input-group-suffix]]:[&_input]:grow-0",
      "has-[[data-slot=input-group-suffix]]:[&_input]:pr-0",
      // Size-specific padding adjustments when addons or suffixes are present
      INPUT_GROUP_HAS_CLASSES[size],
      // Reset bottom margin to avoid inherited spacing from parent <label> styles
      "!mb-0",
      className,
    );

    // Data attributes drive CSS selectors in kumo-binding.css (focus outline)
    // and enable child components to query their parent's state.
    const dataProps = {
      "data-slot": "input-group" as const,
      "data-focus-mode": focusMode,
      "data-disabled": disabled ? ("" as const) : undefined,
    };

    // Hybrid mode: splits children into two rendering zones:
    // 1. Container zone (Addon + Input + Suffix) — shares a single border/ring
    // 2. Individual zone (standalone Buttons) — each button owns its own border
    // This lets inputs and addons look unified while buttons remain independent.
    if (focusMode === "hybrid") {
      // Partition children by type: addons/inputs/suffixes → container, buttons → individual
      const { containerZone, individualZone } = partitionChildren(children);

      // Override focusMode to "container" for children inside the zone
      // so InputGroup.Input uses container-mode styling (ring-0!, no own border).
      const containerZoneContext = {
        ...contextValue,
        focusMode: "container" as const,
      };

      const hybridContent = (
        <>
          {/* Container zone wrapper — shares a single border/ring */}
          <InputGroupContext.Provider value={containerZoneContext}>
            <div
              data-slot="input-group-container-zone"
              className={cn(
                // Base input sizing/shape from shared variant function
                inputVariants({ size }),
                // Clip children to rounded corners within the zone
                "overflow-hidden",
                // Show red ring on validation error
                "has-[input[aria-invalid=true]]:ring-kumo-danger",
                // Reset horizontal padding — children handle their own spacing
                "px-0",
                // Fill available width but allow shrinking when sibling buttons are present
                "flex min-w-0 flex-1 items-center gap-0",
                // Use a clean 1px CSS border instead of ring+shadow from inputVariants
                // so the zone matches adjacent individual-mode buttons exactly.
                "shadow-none ring-0",
                "border border-kumo-line",
                "focus-within:border-kumo-focus/50",
                // z-[2] lifts above adjacent button's -ml-px overlap so focus border shows
                "focus-within:z-2",
                // Negative margin (not border-l-0) so the border is still paintable on focus
                "not-first:-ml-px",
                // Outer edges inherit radius; inner edges are flat against sibling buttons
                "rounded-none first:rounded-l-[inherit] last:rounded-r-[inherit]",
                // Size-specific padding adjustments when addons or suffixes are present
                INPUT_GROUP_HAS_CLASSES[size],
                // When a suffix is present, let the input shrink to its content width
                "has-data-[slot=input-group-suffix]:[&_input]:field-sizing-content",
                "has-data-[slot=input-group-suffix]:[&_input]:max-w-full",
                "has-data-[slot=input-group-suffix]:[&_input]:grow-0",
                "has-data-[slot=input-group-suffix]:[&_input]:pr-0",
              )}
            >
              {/* When label exists, an invisible <label> overlay enables click-to-focus inside the container zone without nesting visible <label> elements */}
              {label && (
                // Invisible overlay for click-to-focus; the visible Field label handles a11y
                <label
                  htmlFor={inputId}
                  // Positioned behind children (z-0) so it catches clicks on empty space
                  className="absolute inset-0 z-0 mb-0! cursor-text"
                  aria-hidden="true"
                />
              )}
              {containerZone}
            </div>
          </InputGroupContext.Provider>
          {/* Individual zone — buttons with their own borders */}
          {individualZone}
        </>
      );

      // Hybrid always uses a <div> container (never <label>) because individual-zone buttons are siblings — wrapping them in a <label> would be semantically incorrect.
      const hybridContainer = (
        <InputGroupContext.Provider value={contextValue}>
          <div
            ref={forwardedRef as Ref<HTMLDivElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {hybridContent}
          </div>
        </InputGroupContext.Provider>
      );

      if (label) {
        return (
          <Field
            label={label}
            description={description}
            error={error}
            required={required}
            labelTooltip={labelTooltip}
          >
            {hybridContainer}
          </Field>
        );
      }

      return hybridContainer;
    }

    // Container / Individual mode (non-hybrid)
    // Use <label> only when there's exactly one labelable descendant; otherwise <label> would propagate :hover to its first labelable descendant.
    const useLabelContainer = !label && focusMode === "container";
    const container = (
      <InputGroupContext.Provider value={contextValue}>
        {/* When label is set, use <div> to avoid nested <label> (Field provides one). An invisible <label> overlay handles click-to-focus on empty space. */}
        {label ? (
          <div
            ref={forwardedRef as Ref<HTMLDivElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {/* Invisible overlay for click-to-focus; the visible Field label handles a11y */}
            <label
              htmlFor={inputId}
              // Positioned behind children (z-0) so it catches clicks on empty space
              className="absolute inset-0 z-0 mb-0!"
              aria-hidden="true"
            />
            {children}
          </div>
        ) : useLabelContainer ? (
          // Standalone container mode: <label> enables click-to-focus on empty space.
          <label
            ref={forwardedRef as Ref<HTMLLabelElement>}
            {...dataProps}
            className={cn(containerClassName, "mb-0!")}
            {...rest}
          >
            {children}
          </label>
        ) : (
          // Individual mode: <div> avoids :hover propagating to the first labelable sibling.
          <div
            ref={forwardedRef as Ref<HTMLDivElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {children}
          </div>
        )}
      </InputGroupContext.Provider>
    );

    if (label) {
      return (
        <Field
          label={label}
          description={description}
          error={error}
          required={required}
          labelTooltip={labelTooltip}
        >
          {container}
        </Field>
      );
    }

    return container;
  },
);
Root.displayName = "InputGroup";

/** @deprecated Use `InputGroup.Addon` instead. */
const Label = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Addon>
>((props, ref) => <Addon ref={ref} align="start" {...props} />);
Label.displayName = "InputGroup.Label";

/** @deprecated Use `InputGroup.Suffix` instead. */
const Description = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Suffix>
>((props, ref) => <Suffix ref={ref} {...props} />);
Description.displayName = "InputGroup.Description";

export const InputGroup = Object.assign(Root, {
  Input,
  Button,
  Addon,
  Suffix,
  /** @deprecated Use `InputGroup.Addon` instead. */
  Label,
  /** @deprecated Use `InputGroup.Suffix` instead. */
  Description,
});
