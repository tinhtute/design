/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */
import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

/** TableOfContents item state variant definitions. */
export const KUMO_TABLE_OF_CONTENTS_VARIANTS = {
  state: {
    default: {
      classes:
        "text-kumo-subtle hover:border-kumo-line hover:text-kumo-default hover:font-medium",
      description: "Inactive section link",
    },
    active: {
      classes: "border-kumo-brand font-medium text-kumo-default",
      description: "Currently visible / active section",
    },
  },
} as const;

export const KUMO_TABLE_OF_CONTENTS_DEFAULT_VARIANTS = {
  state: "default",
} as const;

export type KumoTableOfContentsState =
  keyof typeof KUMO_TABLE_OF_CONTENTS_VARIANTS.state;

const ITEM_BASE =
  "block w-full truncate border-l-2 border-transparent py-0.5 pl-4 text-sm text-left no-underline";

export type TableOfContentsProps = React.HTMLAttributes<HTMLElement>;

const TableOfContentsRoot = forwardRef<HTMLElement, TableOfContentsProps>(
  (
    { className, "aria-label": ariaLabel = "Table of contents", ...props },
    ref,
  ) => (
    <nav ref={ref} aria-label={ariaLabel} className={className} {...props} />
  ),
);

export type TableOfContentsTitleProps =
  React.HTMLAttributes<HTMLParagraphElement>;

const TableOfContentsTitle = forwardRef<
  HTMLParagraphElement,
  TableOfContentsTitleProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mb-3 text-xs font-semibold tracking-wide text-kumo-subtle uppercase",
      className,
    )}
    {...props}
  />
));

export type TableOfContentsListProps = React.HTMLAttributes<HTMLUListElement>;

const TableOfContentsList = forwardRef<
  HTMLUListElement,
  TableOfContentsListProps
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "flex flex-col gap-2 border-l-2 border-kumo-hairline",
      className,
    )}
    {...props}
  />
));

export interface TableOfContentsItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Whether this item represents the currently active section. */
  active?: boolean;
  /**
   * Custom element to render as the link. Use this to integrate with
   * framework routers (e.g., Next.js `<Link>`, React Router `<NavLink>`).
   * The element receives all anchor props including `href`, `className`, and `children`.
   *
   * @example
   * ```tsx
   * <TableOfContents.Item render={<Link />} href="/intro" active>
   *   Introduction
   * </TableOfContents.Item>
   * ```
   */
  render?: React.ReactElement;
}

const TableOfContentsItem = forwardRef<
  HTMLAnchorElement,
  TableOfContentsItemProps
>(({ active = false, className, children, render, ...props }, ref) => {
  const stateClasses = active
    ? KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes
    : KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes;

  const combinedClassName = cn(ITEM_BASE, stateClasses, className);

  const innerContent = (
    <span className="block min-w-0 leading-5">{children}</span>
  );

  const sharedProps = {
    ref,
    "aria-current": active ? ("true" as const) : undefined,
    "data-kumo-component": "TableOfContents",
    "data-kumo-part": "item",
    className: combinedClassName,
    children: innerContent,
    ...props,
  };

  // If a render prop is provided, clone it with our props
  if (render && isValidElement(render)) {
    return <li className="-ml-0.5">{cloneElement(render, sharedProps)}</li>;
  }

  // Default to anchor tag
  return (
    <li className="-ml-0.5">
      {/* oxlint-disable-next-line anchor-has-content -- children are in sharedProps */}
      <a {...sharedProps} />
    </li>
  );
});

export interface TableOfContentsGroupProps extends Omit<
  React.HTMLAttributes<HTMLLIElement>,
  "title"
> {
  /** Label displayed above the group's items. */
  label: string;
  /** URL the group label links to. When provided, the label renders as a clickable link with item styling. */
  href?: string;
  /** Whether this group's label represents the currently active section. Only applies when `href` is provided. */
  active?: boolean;
}

const NESTED_UL_CLASSES =
  "flex flex-col gap-2 border-l-2 border-kumo-hairline [&>li>a]:pl-7 [&>li>button]:pl-7";

const TableOfContentsGroup = forwardRef<
  HTMLLIElement,
  TableOfContentsGroupProps
>(
  (
    { label, href, active = false, className, children, onClick, ...props },
    ref,
  ) => {
    if (href) {
      const stateClasses = active
        ? KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes
        : KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes;

      return (
        <li
          ref={ref}
          className={cn("-ml-0.5 flex flex-col gap-2", className)}
          {...props}
        >
          {/* onClick goes on the label link, not the <li>: the <li> also wraps
            the nested items, so a handler there would fire for child clicks
            too and override the child's own selection. */}
          <a
            href={href}
            onClick={onClick as React.MouseEventHandler | undefined}
            aria-current={active ? ("true" as const) : undefined}
            data-kumo-component="TableOfContents"
            data-kumo-part="group-link"
            className={cn(ITEM_BASE, stateClasses)}
          >
            <span className="block min-w-0 leading-5">{label}</span>
          </a>
          <ul className={cn(NESTED_UL_CLASSES)}>{children}</ul>
        </li>
      );
    }

    // Without an href the label is a non-interactive title, so `onClick` is
    // intentionally not rendered — putting it on the <li> would also catch
    // clicks bubbling up from the nested items.
    return (
      <li
        ref={ref}
        className={cn("-ml-0.5 flex flex-col gap-2", className)}
        {...props}
      >
        <p className="py-0.5 pl-4 text-sm leading-5 font-medium text-kumo-subtle">
          {label}
        </p>
        <ul className={cn(NESTED_UL_CLASSES)}>{children}</ul>
      </li>
    );
  },
);

TableOfContentsRoot.displayName = "TableOfContents";
TableOfContentsTitle.displayName = "TableOfContents.Title";
TableOfContentsList.displayName = "TableOfContents.List";
TableOfContentsItem.displayName = "TableOfContents.Item";
TableOfContentsGroup.displayName = "TableOfContents.Group";

/**
 * TableOfContents — presentational compound component for section navigation.
 *
 * Purely visual; all interaction logic (scroll tracking, active state management)
 * is left to the consumer.
 *
 * @example
 * ```tsx
 * <TableOfContents>
 *   <TableOfContents.Title>On this page</TableOfContents.Title>
 *   <TableOfContents.List>
 *     <TableOfContents.Item href="#intro" active>Introduction</TableOfContents.Item>
 *     <TableOfContents.Group label="Getting Started">
 *       <TableOfContents.Item href="#install">Installation</TableOfContents.Item>
 *       <TableOfContents.Item href="#setup">Setup</TableOfContents.Item>
 *     </TableOfContents.Group>
 *   </TableOfContents.List>
 * </TableOfContents>
 * ```
 */
export const TableOfContents = Object.assign(TableOfContentsRoot, {
  Title: TableOfContentsTitle,
  List: TableOfContentsList,
  Item: TableOfContentsItem,
  Group: TableOfContentsGroup,
});

export interface UseTableOfContentsActiveIdOptions {
  /**
   * The ids of the section anchor elements to track, in document order.
   * Elements are resolved via `document.getElementById` on the client, so ids
   * that aren't in the DOM yet are simply ignored until they appear on a
   * subsequent change to `ids`.
   */
  ids: string[];
  /**
   * Distance in px from the top of the viewport (or `root`) to the scrollspy
   * activation line — typically the fixed header height, so the topmost
   * section actually in view is the one highlighted.
   *
   * @default 0
   */
  offset?: number;
  /**
   * The scroll container to track. Defaults to the viewport.
   *
   * @default null
   */
  root?: Element | null;
  /**
   * When enabled, the section named by `location.hash` is selected on mount
   * and on `hashchange`, so deep links highlight the right section.
   *
   * @default true
   */
  trackHash?: boolean;
}

export interface UseTableOfContentsActiveIdResult {
  /** The id of the section currently considered active, or `null`. */
  activeId: string | null;
  /**
   * Force a section active (e.g. from a ToC item's `onClick`), temporarily
   * pausing scrollspy so the chosen section sticks even when it's too short
   * to reach the activation line. Scrollspy resumes once scrolling settles.
   */
  selectSection: (id: string) => void;
}

/** How long scrolling must be quiet before a selected section unpins. */
const SCROLL_SETTLE_MS = 150;

/**
 * Table-of-contents scroll tracking.
 *
 * Derives the currently-active section from scroll position via an
 * `IntersectionObserver` (the topmost tracked section in view wins), and
 * exposes a `selectSection` action that pins a section on click — held until
 * scrolling settles, so short sections stay highlighted after a jump.
 * Hash deep-links are handled automatically unless `trackHash` is disabled.
 *
 * The `TableOfContents` component itself is purely presentational — pair this
 * hook with it to drive the `active` prop of each item.
 *
 * All DOM work happens in effects, so the hook is SSR-safe (`activeId` is
 * `null` on the server).
 *
 * @example
 * ```tsx
 * const { activeId, selectSection } = useTableOfContentsActiveId({
 *   ids: headings.map((h) => h.slug),
 *   offset: HEADER_HEIGHT,
 * });
 *
 * <TableOfContents.Item
 *   href="#intro"
 *   active={activeId === "intro"}
 *   onClick={() => selectSection("intro")}
 * >
 *   Introduction
 * </TableOfContents.Item>
 * ```
 */
export function useTableOfContentsActiveId({
  ids,
  offset = 0,
  root = null,
  trackHash = true,
}: UseTableOfContentsActiveIdOptions): UseTableOfContentsActiveIdResult {
  const [activeId, setActiveId] = useState<string | null>(null);

  // While pinned (after selectSection), scrollspy keeps tracking but doesn't
  // overwrite the active id until scrolling settles and it unpins.
  const pinned = useRef(false);

  // `ids` is typically rebuilt every render; key effects on its content.
  // \0 can't appear in a document id, so the round-trip is unambiguous.
  const idsKey = ids.join("\0");

  useEffect(() => {
    const elements = idsKey
      .split("\0")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Latest known intersection state per element, since observer callbacks
    // only include entries that changed.
    const intersecting = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.add(entry.target);
          } else {
            intersecting.delete(entry.target);
          }
        }

        // Topmost tracked section in view, in document order. When nothing is
        // in view (e.g. inside a long section body), keep the last active id.
        const first = elements.find((el) => intersecting.has(el));
        if (first && !pinned.current) {
          setActiveId(first.id);
        }
      },
      { root, rootMargin: `-${offset}px 0px 0px 0px` },
    );

    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  }, [idsKey, offset, root]);

  // Pending unpin work, torn down on unmount and superseded by rapid clicks.
  const settleTimer = useRef<number | undefined>(undefined);
  const cancelPendingUnpin = useRef<(() => void) | null>(null);

  const selectSection = useCallback(
    (id: string) => {
      cancelPendingUnpin.current?.();
      pinned.current = true;
      setActiveId(id);

      // Unpin once scrolling has been quiet for a beat: every scroll event
      // (including the smooth scroll to the target) pushes the deadline back.
      // Works without `scrollend`, which Safari didn't support until 18.2.
      const scrollTarget: EventTarget = root ?? window;

      const armSettleTimer = () => {
        window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(() => {
          cancelPendingUnpin.current?.();
          pinned.current = false;
        }, SCROLL_SETTLE_MS);
      };

      scrollTarget.addEventListener("scroll", armSettleTimer, {
        passive: true,
      });
      cancelPendingUnpin.current = () => {
        window.clearTimeout(settleTimer.current);
        scrollTarget.removeEventListener("scroll", armSettleTimer);
        cancelPendingUnpin.current = null;
      };

      armSettleTimer();
    },
    [root],
  );

  useEffect(() => () => cancelPendingUnpin.current?.(), []);

  // Deep links: select the hash section on mount and whenever the hash
  // changes, but only if it's one of the tracked sections.
  useEffect(() => {
    if (!trackHash) return;

    const knownIds = new Set(idsKey.split("\0"));
    const syncFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && knownIds.has(id)) selectSection(id);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [trackHash, idsKey, selectSection]);

  return { activeId, selectSection };
}
