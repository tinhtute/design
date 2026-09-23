/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */
import {
  type CSSProperties,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
} from 'react';
import { HugeiconsIcon, type IconSvgElement as Icon } from '@hugeicons/react';
import {
  Button,
  type ButtonProps,
  type KumoButtonSize,
  type KumoButtonVariant,
} from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { resolveVariant } from '@/lib/resolve-variant';
import { cn } from '@/lib/utils';

/** Structural base styles applied to all banners; size-specific spacing/alignment lives in `KUMO_BANNER_VARIANTS.size`. */
export const KUMO_BANNER_BASE_STYLES = 'flex w-full';

/** Banner variant definitions mapping style options to their Tailwind classes and descriptions. */
export const KUMO_BANNER_VARIANTS = {
  variant: {
    default: {
      classes: 'bg-kumo-info-tint text-kumo-info',
      iconClasses: 'fill-kumo-info',
      description: 'Informational banner for general messages',
    },
    alert: {
      classes: 'bg-kumo-warning-tint text-kumo-warning',
      iconClasses: 'fill-kumo-warning',
      description: 'Warning banner for cautionary messages',
    },
    error: {
      classes: 'bg-kumo-danger-tint text-kumo-danger',
      iconClasses: 'fill-kumo-danger',
      description: 'Error banner for critical issues',
    },
    secondary: {
      classes: 'bg-kumo-contrast/5 text-kumo-default/70',
      iconClasses: 'fill-kumo-interact',
      description: 'Neutral banner for secondary messages',
    },
  },
  size: {
    base: {
      classes: 'items-start gap-3 rounded-lg px-4 py-3 text-base',
      description: 'Default banner size',
    },
    sm: {
      classes: 'items-center gap-2 rounded-md px-3 py-2 text-sm',
      description: 'Compact banner for dialogs and tight spaces',
    },
  },
} as const;

export const KUMO_BANNER_DEFAULT_VARIANTS = {
  variant: 'default',
  size: 'base',
} as const;

// Derived types from KUMO_BANNER_VARIANTS
export type KumoBannerVariant = keyof typeof KUMO_BANNER_VARIANTS.variant;
export type KumoBannerSize = keyof typeof KUMO_BANNER_VARIANTS.size;

/**
 * Visual variant for a `Banner.Action`, aligned with `Button`'s `variant` naming.
 * - `"primary"` — filled accent gradient for the main action.
 * - `"secondary"` — transparent with an accent-hued outline (same hue as the banner).
 * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
 */
export type BannerActionVariant = Extract<KumoButtonVariant, 'primary' | 'secondary' | 'ghost'>;

/**
 * Size of a `Banner.Action`, matching the equivalent `Button` size specs.
 * - `"xs"` — extra small for dense/compact banners.
 * - `"sm"` — small (default), the standard banner CTA size.
 */
export type BannerActionSize = Extract<KumoButtonSize, 'xs' | 'sm'>;

/** Value shared from the `Banner` root to its `Banner.Action` children. */
export interface BannerActionContextValue {
  /** Banner variant, used to pick the matching accent color. */
  variant: KumoBannerVariant;
  /** Action size derived from the banner's own size. */
  size: BannerActionSize;
}

/**
 * Propagates the banner's variant and action size to `Banner.Action`
 * children so each CTA can self-style without prop drilling:
 * - `variant` — selects the matching accent color.
 * - `size` — a compact `size="sm"` banner renders actions at `"xs"`, and a
 *   `"base"` banner renders them at `"sm"`.
 *
 * The `Banner` root always overrides these defaults via a Provider; the literals
 * mirror a default, base-size banner.
 */
export const BannerActionContext = createContext<BannerActionContextValue>({
  variant: 'default',
  size: 'sm',
});

/** Per-banner-variant colors passed to the underlying `Button`. */
const BANNER_ACTION_ACCENTS: Record<
  KumoBannerVariant,
  { accent: string; secondary: string; ghost: string }
> = {
  default: {
    accent: 'var(--color-kumo-info)',
    secondary:
      'text-inherit ring-kumo-info/50 fill-kumo-info hover:!text-inherit hover:!ring-kumo-info/50 hover:bg-kumo-info/10',
    ghost: 'text-inherit fill-kumo-info hover:bg-kumo-info/10',
  },
  alert: {
    accent: 'var(--color-kumo-warning)',
    secondary:
      'text-inherit ring-kumo-warning/50 fill-kumo-warning hover:!text-inherit hover:!ring-kumo-warning/50 hover:bg-kumo-warning/10',
    ghost: 'text-inherit fill-kumo-warning hover:bg-kumo-warning/10',
  },
  error: {
    accent: 'var(--color-kumo-danger)',
    secondary:
      'text-inherit ring-kumo-danger/50 fill-kumo-danger hover:!text-inherit hover:!ring-kumo-danger/50 hover:bg-kumo-danger/10',
    ghost: 'text-inherit fill-kumo-danger hover:bg-kumo-danger/10',
  },
  secondary: {
    accent: 'var(--color-neutral-700, oklch(37.1% 0 0))',
    secondary:
      'text-inherit ring-kumo-focus/20 fill-kumo-subtle hover:!text-inherit hover:!ring-kumo-focus/20 hover:bg-kumo-contrast/10',
    ghost: 'text-inherit fill-kumo-subtle hover:bg-kumo-contrast/10',
  },
};

function bannerActionAccentVars(accent: string) {
  return {
    '--kumo-button-emphasis-ring': `color-mix(in oklch, ${accent}, black 10%)`,
    '--kumo-button-emphasis-bg': `color-mix(in oklch, ${accent}, white 30%)`,
    '--kumo-button-emphasis-gradient-start': `color-mix(in oklch, ${accent}, white 15%)`,
    '--kumo-button-emphasis-gradient-end': accent,
  } satisfies CSSProperties & Record<`--${string}`, string>;
}

/** Props for {@link BannerAction}. */
type WithBannerActionVariants<Props> = Props extends ButtonProps
  ? Omit<Props, 'size' | 'variant'> & {
      /**
       * Visual variant of the CTA, aligned with `Button`'s `variant` naming.
       * - `"primary"` — filled accent gradient for the main action (default).
       * - `"secondary"` — transparent with an accent-hued outline matching the banner.
       * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
       * @default "primary"
       */
      variant?: BannerActionVariant;
    }
  : never;

export type BannerActionProps = WithBannerActionVariants<ButtonProps>;

/**
 * A banner CTA built on Kumo's `Button`. It inherits Button's sizing, interaction,
 * loading, and accessibility behavior while supplying banner-specific accent styles.
 *
 * @example
 * ```tsx
 * <Banner.Action onClick={retry}>Retry</Banner.Action>
 * <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
 * ```
 */
export const BannerAction = forwardRef<HTMLButtonElement, BannerActionProps>(function BannerAction(
  { variant = 'primary', className, style, ...props },
  ref,
) {
  const banner = useContext(BannerActionContext);
  const styles = BANNER_ACTION_ACCENTS[banner.variant];
  const buttonVariant = variant === 'secondary' ? 'outline' : variant;

  return (
    <Button
      ref={ref}
      variant={buttonVariant}
      size={banner.size}
      className={cn(variant !== 'primary' && styles[variant], className)}
      style={variant === 'primary' ? { ...bannerActionAccentVars(styles.accent), ...style } : style}
      {...props}
    />
  );
});

BannerAction.displayName = 'Banner.Action';

/**
 * Per-size render-site classes not carried by `bannerVariants` (which only emits
 * the container classes). `row` is the title↔action flex gap, `icon` the icon
 * wrapper height, `description` the description text size, and `action` the size
 * that child `Banner.Action`s inherit via {@link BannerActionContext}.
 */
const BANNER_SIZE_PARTS: Record<
  KumoBannerSize,
  { row: string; icon: string; description: string; action: BannerActionSize }
> = {
  base: {
    row: 'gap-3',
    icon: 'h-[1.375em]',
    description: 'text-sm',
    action: 'sm',
  },
  sm: {
    row: 'gap-2',
    icon: 'h-[1.25em]',
    description: 'text-sm',
    action: 'xs',
  },
};

export interface KumoBannerVariantsProps {
  /**
   * Visual style of the banner.
   * - `"default"` — Informational banner for general messages
   * - `"alert"` — Warning banner for cautionary messages
   * - `"error"` — Error banner for critical issues
   * - `"secondary"` — Neutral banner for secondary messages
   * @default "default"
   */
  variant?: KumoBannerVariant;
  /**
   * Size of the banner.
   * - `"base"` — Default full-size banner
   * - `"sm"` — Compact banner for dialogs and other tight spaces
   * @default "base"
   */
  size?: KumoBannerSize;
}

export function bannerVariants({
  variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
  size = KUMO_BANNER_DEFAULT_VARIANTS.size,
}: KumoBannerVariantsProps = {}) {
  const resolvedVariant = resolveVariant(
    KUMO_BANNER_VARIANTS.variant,
    variant,
    KUMO_BANNER_DEFAULT_VARIANTS.variant,
  );
  const resolvedSize = resolveVariant(
    KUMO_BANNER_VARIANTS.size,
    size,
    KUMO_BANNER_DEFAULT_VARIANTS.size,
  );

  return cn(
    // Structural base styles (exported as KUMO_BANNER_BASE_STYLES for Figma plugin)
    KUMO_BANNER_BASE_STYLES,
    // Apply variant styles from KUMO_BANNER_VARIANTS
    resolvedVariant.classes,
    // Apply size styles (spacing / radius / text) from KUMO_BANNER_VARIANTS
    resolvedSize.classes,
  );
}

// Legacy enum for backwards compatibility
export enum BannerVariant {
  DEFAULT,
  ALERT,
  ERROR,
}

/**
 * Banner component props.
 *
 * @example
 * ```tsx
 * <Banner title="Update available" description="A new version is ready to install." />
 * <Banner variant="alert" title="Session expiring" description="Your session will expire soon." />
 * <Banner variant="error" title="Save failed" description="We couldn't save your changes." />
 * ```
 */
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** Icon element rendered before the banner content (e.g. from `@hugeicons/core-free-icons`). */
  icon?: Icon | ReactNode;
  /** Primary heading text for the banner. Use for i18n string injection. */
  title?: string;
  /** Secondary description text displayed below the title. Use for i18n string injection. */
  description?: ReactNode;
  /**
   * Action slot for a CTA button or link. Compact banners render a Kumo `Link`
   * inline with the description; CTAs render at the trailing end.
   * Use `Banner.Action` for accent-aware CTAs that self-style to the banner
   * variant; other nodes are rendered as-is. Multiple actions can be passed in
   * a Fragment. Only used in structured mode (with `title` or `description`).
   */
  action?: ReactNode;
  /** @deprecated Use `title` and `description` instead. Will be removed in a future major version. */
  text?: string;
  /** @deprecated Use `title` and `description` instead for better i18n support. */
  children?: ReactNode;
  /**
   * Visual style of the banner.
   * - `"default"` — Informational blue banner for general messages
   * - `"alert"` — Warning yellow banner for cautionary messages
   * - `"error"` — Error red banner for critical issues
   * - `"secondary"` — Neutral banner for secondary messages
   * @default "default"
   */
  variant?: KumoBannerVariant;
  /**
   * Size of the banner. A `"sm"` banner uses tighter spacing and `text-sm`,
   * renders a Kumo `Link` action inline with the description, and sets its
   * `Banner.Action` children to the `"xs"` size — suited to dialogs and other
   * tight spaces.
   * @default "base"
   */
  size?: KumoBannerSize;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

/**
 * Full-width message bar for informational, warning, or error notices.
 * Supports structured title/description for i18n, or simple children for basic usage.
 *
 * @example
 * ```tsx
 * // Structured (recommended for i18n)
 * <Banner
 *   variant="alert"
 *   icon={<AlertCircleIcon />}
 *   title="Review required"
 *   description="Please review your billing information."
 * />
 *
 * // Simple (backwards compatible)
 * <Banner variant="alert" icon={<AlertCircleIcon />}>
 *   Review your billing information.
 * </Banner>
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

const BannerRoot = forwardRef<HTMLDivElement, BannerProps>(function BannerRoot(
  {
    icon,
    title,
    description,
    action,
    children,
    text,
    variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
    size = KUMO_BANNER_DEFAULT_VARIANTS.size,
    className,
    ...props
  },
  ref,
) {
  const variantConfig = resolveVariant(
    KUMO_BANNER_VARIANTS.variant,
    variant,
    KUMO_BANNER_DEFAULT_VARIANTS.variant,
  );
  const sizeParts = BANNER_SIZE_PARTS[size];
  // Compact banners keep the title and description on one line (inline spans)
  // rather than stacking them, to stay short in dialogs and other tight spaces.
  const isCompact = size === 'sm';
  const hasInlineLinkAction = isCompact && isValidElement(action) && action.type === Link;

  // Structured mode: title and/or description provided
  if (title || description) {
    return (
      <BannerActionContext.Provider value={{ variant, size: sizeParts.action }}>
        <div ref={ref} className={cn(bannerVariants({ variant, size }), className)} {...props}>
          {icon && (
            <span
              className={cn(
                'flex shrink-0 items-center',
                sizeParts.icon,
                variantConfig.iconClasses,
              )}
            >
              {renderIconNode(icon)}
            </span>
          )}
          <div
            className={cn(
              'flex min-w-0 flex-1 items-center justify-between',
              sizeParts.row,
              !title && 'pt-px',
            )}
          >
            {isCompact ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                {title && (
                  <span className="leading-snug font-medium">
                    {title}
                    {!description && hasInlineLinkAction && (
                      <span className="ml-1.5 [&_[data-kumo-component=Link]]:inline">{action}</span>
                    )}
                  </span>
                )}
                {description && (
                  <span className={cn(sizeParts.description, 'leading-snug')}>
                    {description}
                    {hasInlineLinkAction && (
                      <span className="ml-1.5 [&_[data-kumo-component=Link]]:inline">{action}</span>
                    )}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {title && <p className="leading-snug font-medium">{title}</p>}
                {description && (
                  <div className={cn(sizeParts.description, 'leading-snug')}>
                    {isValidElement(description) ? description : <p>{description}</p>}
                  </div>
                )}
              </div>
            )}
            {!hasInlineLinkAction && action != null && (
              <div className="flex shrink-0 items-center gap-2">{action}</div>
            )}
          </div>
        </div>
      </BannerActionContext.Provider>
    );
  }

  // Legacy mode: children or text prop
  const value = children ?? text;
  const content = isValidElement(value) ? value : <p>{value}</p>;

  return (
    <BannerActionContext.Provider value={{ variant, size: sizeParts.action }}>
      <div ref={ref} className={cn(bannerVariants({ variant, size }), className)} {...props}>
        {icon && (
          <span className={cn('shrink-0', variantConfig.iconClasses)}>{renderIconNode(icon)}</span>
        )}
        {content}
      </div>
    </BannerActionContext.Provider>
  );
});

BannerRoot.displayName = 'Banner';

/**
 * Full-width message bar with an optional trailing CTA slot.
 *
 * `Banner.Action` is an accent-aware CTA button
 * (`variant="primary" | "secondary" | "ghost"`).
 */
export const Banner = Object.assign(BannerRoot, {
  Action: BannerAction,
});
