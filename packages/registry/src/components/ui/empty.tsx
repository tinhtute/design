/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */
import { HugeiconsIcon, type IconSvgElement as Icon } from '@hugeicons/react';
import { Tick02Icon as CheckIcon, Copy01Icon as CopyIcon } from '@hugeicons/core-free-icons';
import { isValidElement, useState, type ComponentType, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveVariant } from '@/lib/resolve-variant';

/** Empty state size variant definitions mapping sizes to their Tailwind classes. */
export const KUMO_EMPTY_VARIANTS = {
  size: {
    sm: {
      classes: 'px-6 py-8 gap-4',
      description: 'Compact empty state for smaller containers',
    },
    base: {
      classes: 'px-10 py-16 gap-6',
      description: 'Default empty state size',
    },
    lg: {
      classes: 'px-12 py-20 gap-8',
      description: 'Large empty state for prominent placement',
    },
  },
} as const;

export const KUMO_EMPTY_DEFAULT_VARIANTS = {
  size: 'base',
} as const;

export type KumoEmptySize = keyof typeof KUMO_EMPTY_VARIANTS.size;

export interface KumoEmptyVariantsProps {
  /**
   * Size of the empty state container.
   * - `"sm"` — Compact empty state for smaller containers
   * - `"base"` — Default empty state size
   * - `"lg"` — Large empty state for prominent placement
   * @default "base"
   */
  size?: KumoEmptySize;
}

export function emptyVariants({
  size = KUMO_EMPTY_DEFAULT_VARIANTS.size,
}: KumoEmptyVariantsProps = {}) {
  return cn(
    'flex w-full flex-col items-center rounded-xl border border-kumo-fill bg-kumo-control text-kumo-default',
    resolveVariant(KUMO_EMPTY_VARIANTS.size, size, KUMO_EMPTY_DEFAULT_VARIANTS.size).classes,
  );
}

/**
 * Empty state component props.
 *
 * @example
 * ```tsx
 * <Empty
 *   icon={<PackageIcon size={48} />}
 *   title="No packages found"
 *   description="Get started by installing your first package."
 *   commandLine="npm install @cloudflare/kumo"
 * />
 * ```
 */
export interface EmptyProps extends KumoEmptyVariantsProps {
  /** Decorative icon displayed above the title (e.g. from `@hugeicons/core-free-icons`). */
  icon?: Icon | ReactNode;
  /** Primary heading text for the empty state. */
  title: string;
  /** Secondary description text displayed below the title. */
  description?: string;
  /** Shell command displayed in a copyable code block. */
  commandLine?: string;
  /** Additional content (buttons, links) rendered below the description. */
  contents?: ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

/**
 * Placeholder shown when a list, table, or page has no content to display.
 *
 * @example
 * ```tsx
 * <Empty title="No results found" description="Try adjusting your search." />
 * ```
 */
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

export function Empty({
  icon,
  title,
  description,
  commandLine,
  contents,
  size = 'base',
  className,
}: EmptyProps) {
  const [emptyStateCopied, setEmptyStateCopied] = useState<boolean>(false);

  return (
    <div className={cn(emptyVariants({ size }), className)}>
      {renderIconNode(icon)}
      <h2 className="text-2xl font-semibold">{title}</h2>

      {description && <p className="max-w-140 text-center text-kumo-subtle">{description}</p>}

      {commandLine && (
        <div
          className={cn(
            'group/cmd relative inline-flex h-10 max-w-8/10 transform-gpu items-center gap-2 rounded-lg font-mono shadow-sm',
            'bg-kumo-overlay pr-2 pl-3',
            'hover:shadow-md hover:ring-kumo-interact/80',
            'ring ring-kumo-fill/60',
          )}
        >
          <span className="text-xs text-kumo-inactive select-none">$</span>
          <span className="no-scrollbar overflow-scroll text-sm whitespace-nowrap text-kumo-brand">
            {commandLine}
          </span>
          <Button
            className="group"
            size="sm"
            variant="ghost"
            shape="square"
            aria-label="Copy command"
            onClick={async () => {
              setEmptyStateCopied(true);
              setTimeout(() => {
                setEmptyStateCopied(false);
              }, 1000);
              await navigator.clipboard.writeText(commandLine);
            }}
          >
            {emptyStateCopied ? (
              <HugeiconsIcon
                icon={CheckIcon}
                size={16}
                className="text-kumo-success transition-transform duration-fast ease-standard motion-reduce:transition-none"
              />
            ) : (
              <HugeiconsIcon
                icon={CopyIcon}
                size={16}
                className="text-kumo-inactive group-hover:text-kumo-brand"
              />
            )}
          </Button>
        </div>
      )}

      {contents}
    </div>
  );
}
