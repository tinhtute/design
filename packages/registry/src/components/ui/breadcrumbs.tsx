/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */
'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ComponentType,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react';
import { HugeiconsIcon, type IconSvgElement as Icon } from '@hugeicons/react';
import { Tick02Icon as CheckIcon, Copy01Icon as CopyIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { SkeletonLine } from '@/components/ui/loader';
import { useLinkComponent } from '@/lib/link-provider';
import { cn } from '@/lib/utils';
import { resolveVariant } from '@/lib/resolve-variant';

/** Breadcrumbs size variant definitions. */
export const KUMO_BREADCRUMBS_VARIANTS = {
  size: {
    sm: {
      classes: 'text-sm h-10 gap-0.5',
      description: 'Compact breadcrumbs for dense UIs',
    },
    base: {
      classes: 'text-sm h-12 gap-1',
      description: 'Default breadcrumbs size',
    },
  },
} as const;

export const KUMO_BREADCRUMBS_DEFAULT_VARIANTS = {
  size: 'base',
} as const;

export type KumoBreadcrumbsSize = keyof typeof KUMO_BREADCRUMBS_VARIANTS.size;

export interface KumoBreadcrumbsVariantsProps {
  /**
   * Size of the breadcrumbs.
   * - `"sm"` — Compact breadcrumbs for dense UIs
   * - `"base"` — Default breadcrumbs size
   * @default "base"
   */
  size?: KumoBreadcrumbsSize;
}

export function breadcrumbsVariants({
  size = KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size,
}: KumoBreadcrumbsVariantsProps = {}) {
  return cn(
    'group mr-4 flex min-w-0 grow items-center overflow-hidden whitespace-nowrap',
    resolveVariant(KUMO_BREADCRUMBS_VARIANTS.size, size, KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size)
      .classes,
  );
}

const renderIconNode = (icon?: Icon | ReactNode) => {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (Array.isArray(icon)) return <HugeiconsIcon icon={icon as Icon} />;
  if (typeof icon === 'function') {
    const Comp = icon as ComponentType<Record<string, unknown>>;
    return <Comp />;
  }
  return icon as ReactNode;
};

export interface BreadcrumbsItemProps {
  href: string;
  icon?: Icon | ReactNode;
}

const Link = ({ href, icon, children }: PropsWithChildren<BreadcrumbsItemProps>) => {
  const LinkComponent = useLinkComponent();

  return (
    <LinkComponent
      data-kumo-component="Breadcrumbs"
      data-kumo-part="link"
      to={href}
      // Ancestors do not shrink. Letting every crumb truncate proportionally
      // turns the whole trail into unreadable stubs ("Com… › Anal… › Acco…");
      // the current page is the only crumb allowed to give up width.
      className="flex shrink-0 items-center gap-1 whitespace-nowrap text-kumo-subtle no-underline"
    >
      {!!icon && <span className="flex shrink-0 items-center">{renderIconNode(icon)}</span>}
      <span>{children}</span>
    </LinkComponent>
  );
};

interface BreadcrumbsCurrentProps {
  loading?: boolean;
  icon?: Icon | ReactNode;
}

function Current({ children, icon, loading }: PropsWithChildren<BreadcrumbsCurrentProps>) {
  if (loading) {
    return (
      <div className="flex w-[125px] min-w-0 items-center gap-1">
        {icon && <span className="flex shrink-0 items-center">{renderIconNode(icon)}</span>}
        <SkeletonLine />
      </div>
    );
  }

  return (
    <div className="flex max-w-full min-w-0 items-center gap-1 font-medium" aria-current="page">
      {icon && <span className="flex shrink-0 items-center">{renderIconNode(icon)}</span>}
      <span className="truncate">{children}</span>
    </div>
  );
}

function Separator() {
  return (
    <span className="flex shrink-0 items-center text-kumo-inactive" aria-hidden="true">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M10.75 8.75L14.25 12L10.75 15.25"
        />
      </svg>
    </span>
  );
}

function MobileEllipsis() {
  return (
    <span className="flex shrink-0 items-center text-kumo-subtle" aria-hidden>
      ...
    </span>
  );
}

function Clipboard({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timeoutId = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleCopyDeeplink = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy deeplink:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      shape="square"
      size="sm"
      className="opacity-0 transition-[opacity] group-hover:opacity-100"
      onClick={handleCopyDeeplink}
      title="Click to copy"
      aria-label="Copy"
    >
      {isCopied ? (
        <HugeiconsIcon icon={CheckIcon} strokeWidth={2} className="text-kumo-success" />
      ) : (
        <HugeiconsIcon icon={CopyIcon} />
      )}
    </Button>
  );
}

/**
 * Breadcrumbs component props.
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Current>Current Page</Breadcrumbs.Current>
 * </Breadcrumbs>
 * ```
 */
export interface BreadcrumbsProps extends PropsWithChildren, KumoBreadcrumbsVariantsProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

/**
 * Navigation breadcrumb trail showing the current page's location in a hierarchy.
 * Compound component with `Breadcrumbs.Link`, `Breadcrumbs.Current`, `Breadcrumbs.Separator`, and `Breadcrumbs.Clipboard`.
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Current>Dashboard</Breadcrumbs.Current>
 * </Breadcrumbs>
 * ```
 */
export function Breadcrumb({ children, size = 'base', className }: BreadcrumbsProps) {
  const childArray = Children.toArray(children);
  const mobileChildren = getMobileBreadcrumbChildren(childArray);

  return (
    <nav className={cn(breadcrumbsVariants({ size }), className)} aria-label="breadcrumb">
      <div className="contents sm:hidden">{mobileChildren}</div>
      <div className="hidden sm:contents">{childArray}</div>
    </nav>
  );
}

function isComponentElement(child: ReactNode, component: unknown): child is ReactElement {
  return isValidElement(child) && child.type === component;
}

function getMobileBreadcrumbChildren(children: ReactNode[]): ReactNode[] {
  const breadcrumbItems = children.filter(
    (child) => isComponentElement(child, Link) || isComponentElement(child, Current),
  ) as ReactElement[];

  if (breadcrumbItems.length <= 2) {
    return children;
  }

  const [parentItem, currentItem] = breadcrumbItems.slice(-2);
  const trailingItems: ReactNode[] = [
    <MobileEllipsis key="kumo-breadcrumb-mobile-ellipsis" />,
    <Separator key="kumo-breadcrumb-mobile-separator-leading" />,
    cloneElement(parentItem, { key: 'kumo-breadcrumb-mobile-parent' }),
    <Separator key="kumo-breadcrumb-mobile-separator-trailing" />,
    cloneElement(currentItem, { key: 'kumo-breadcrumb-mobile-current' }),
  ];

  const extras = children.filter(
    (child) =>
      !isComponentElement(child, Link) &&
      !isComponentElement(child, Current) &&
      !isComponentElement(child, Separator),
  );

  return [...trailingItems, ...extras];
}

Breadcrumb.Link = Link;
Breadcrumb.Current = Current;
Breadcrumb.Separator = Separator;
Breadcrumb.Clipboard = Clipboard;

export { Breadcrumb as Breadcrumbs };
