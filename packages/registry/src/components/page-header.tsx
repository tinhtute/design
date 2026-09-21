/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 *
 * PageHeader — page-level header combining breadcrumbs, title/description,
 * and an optional tab bar with an actions slot. `breadcrumbs` is a required
 * node (render the registry's `Breadcrumbs`); `tabs` accepts `TabsItem[]`
 * rendered through `Tabs`; `children` lands in the actions slot to the
 * right of the tabs. `spacing` controls vertical rhythm.
 */
import { ReactNode } from 'react';
import { Tabs, type TabsItem } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export const KUMO_PAGE_HEADER_VARIANTS = {
  spacing: {
    compact: {
      classes: 'gap-1',
      description: 'Compact spacing between header elements',
    },
    base: {
      classes: 'gap-2',
      description: 'Default spacing between header elements',
    },
    relaxed: {
      classes: 'gap-4',
      description: 'Relaxed spacing for more prominent headers',
    },
  },
} as const;

export const KUMO_PAGE_HEADER_DEFAULT_VARIANTS = {
  spacing: 'base',
} as const;

export type KumoPageHeaderSpacing = keyof typeof KUMO_PAGE_HEADER_VARIANTS.spacing;

export interface KumoPageHeaderVariantsProps {
  spacing?: KumoPageHeaderSpacing;
}

export function pageHeaderVariants({
  spacing = KUMO_PAGE_HEADER_DEFAULT_VARIANTS.spacing,
}: KumoPageHeaderVariantsProps = {}) {
  return cn('flex flex-col', KUMO_PAGE_HEADER_VARIANTS.spacing[spacing].classes);
}

/** PageHeader component props. */
export interface PageHeaderProps extends KumoPageHeaderVariantsProps {
  /** Breadcrumb trail (required) — render the registry's `Breadcrumbs` component */
  breadcrumbs: ReactNode;
  /** Page heading (h1) */
  title?: string;
  /** Supporting paragraph under the title */
  description?: string;
  /** Optional tab items rendered as page navigation */
  tabs?: TabsItem[];
  /** Initially selected tab value */
  defaultTab?: string;
  /** Called with the new tab value when the user switches tabs */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes on the header container */
  className?: string;
  /** Actions slot rendered to the right of the tabs; only rendered when `tabs` is set */
  children?: React.ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  tabs,
  defaultTab,
  onValueChange,
  spacing = 'base',
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn(pageHeaderVariants({ spacing }), className)}>
      <div className="border-b border-kumo-line">{breadcrumbs}</div>

      {(title || description) && (
        <div className="flex flex-col gap-2 py-3 pl-3">
          {title && (
            <h1 className="font-heading text-3xl font-semibold text-kumo-default">{title}</h1>
          )}
          {description && <p className="max-w-prose text-base text-kumo-subtle">{description}</p>}
        </div>
      )}

      {tabs && (
        <div className="flex w-full items-center justify-between border-b border-kumo-line pt-1 pb-3 pl-3">
          <Tabs
            tabs={tabs}
            selectedValue={defaultTab}
            onValueChange={(nextValue) => {
              const stringValue = String(nextValue);
              onValueChange?.(stringValue);
            }}
          />

          <div className="flex items-center gap-2">{children}</div>
        </div>
      )}
    </div>
  );
}
