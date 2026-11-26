/**
 * Adapted from cloudflare/kumo (MIT), commit 69ff967a00448619feb72367cbbc4d0fa37ecc14 (@cloudflare/kumo@2.15.0).
 */
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon as CheckIcon, Copy01Icon as CopyIcon } from '@hugeicons/core-free-icons';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import {
  Text,
  type KumoTextSize,
  type KumoTextVariant,
  type TextProps,
} from '@/components/ui/text';

const COPIED_FEEDBACK_MS = 1500;

function resolveCopyValue(children: ReactNode, value: string | undefined) {
  if (value !== undefined) return value;
  if (typeof children === 'string') return children;

  throw new Error('InlineCopyText requires a value prop when children is not a string.');
}

/**
 * InlineCopyText has no visual variants. The required exports are kept for the
 * Kumo variant standard.
 */
export const KUMO_INLINE_COPY_TEXT_VARIANTS = {} as const;

export const KUMO_INLINE_COPY_TEXT_DEFAULT_VARIANTS = {} as const;

/** Base classes shared by every InlineCopyText. */
export const KUMO_INLINE_COPY_TEXT_STYLING = {
  baseClasses:
    'group/inline-copy flex min-w-0 max-w-full cursor-pointer items-center gap-1 rounded-xs border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand',
} as const;

export interface InlineCopyTextLabels {
  /** Copy action appended to the visible text in the accessible name. @default "Copy to clipboard" */
  copyAction?: string;
  /** Live-region message after copying. @default "Copied" */
  copied?: string;
}

type InlineCopyTextHeadingVariant = Extract<KumoTextVariant, `heading${string}`>;
type InlineCopyTextVariant = Exclude<KumoTextVariant, InlineCopyTextHeadingVariant>;
type InlineCopyTextCopyVariant = Exclude<InlineCopyTextVariant, 'mono' | 'mono-secondary'>;
type InlineCopyTextMonospaceVariant = Extract<InlineCopyTextVariant, 'mono' | 'mono-secondary'>;

type InlineCopyTextSharedTextProps = Pick<TextProps, 'as' | 'truncate'>;

type InlineCopyTextTextProps =
  | (InlineCopyTextSharedTextProps & {
      variant: InlineCopyTextCopyVariant;
      size?: KumoTextSize;
      bold?: boolean;
    })
  | (InlineCopyTextSharedTextProps & {
      /** @default "mono-secondary" */
      variant?: InlineCopyTextMonospaceVariant;
      size?: 'lg';
      bold?: never;
    });

type InlineCopyTextContentProps =
  | {
      /** Text content to display. Its value is copied unless `value` is provided. */
      children: string;
      /** The value to copy. Defaults to `children` when `children` is a string. */
      value?: string;
    }
  | {
      /** Rich content to display. */
      children: Exclude<ReactNode, string>;
      /** The value to copy. Required when `children` is not a string. */
      value: string;
    };

/**
 * InlineCopyText component props.
 *
 * @example
 * ```tsx
 * <InlineCopyText
 *   labels={{ copyAction: "Copy database ID", copied: "Copied" }}
 * >
 *   0c239dd2
 * </InlineCopyText>
 * ```
 */
export type InlineCopyTextProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'onCopy' | 'value'
> &
  InlineCopyTextTextProps &
  InlineCopyTextContentProps & {
    /** Callback fired after text is copied successfully. */
    onCopy?: () => void;
    /** Accessible labels for localization. */
    labels?: InlineCopyTextLabels;
  };

/**
 * Compact, borderless copy control for IDs and other short values displayed
 * inline or inside dense table cells.
 *
 * The copy icon appears when the control is hovered or focused. It also
 * responds to an enclosing unnamed Tailwind `group`, allowing table rows to
 * reveal the icon when the row is hovered. After a successful copy, the icon
 * changes to a checkmark and the copied message is announced.
 */
export const InlineCopyText = forwardRef<HTMLButtonElement, InlineCopyTextProps>(
  (
    {
      children,
      value,
      variant = 'mono-secondary',
      size,
      bold,
      truncate = true,
      as = 'span',
      className,
      onClick,
      onCopy,
      labels: { copyAction = 'Copy to clipboard', copied: copiedLabel = 'Copied' } = {},
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);
    const textId = useId();
    const actionId = useId();
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const valueToCopy = resolveCopyValue(children, value);

    useEffect(() => {
      return () => {
        if (resetTimeoutRef.current !== null) {
          clearTimeout(resetTimeoutRef.current);
        }
      };
    }, []);

    const copyToClipboard = useCallback(async () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current);
      }

      try {
        await navigator.clipboard.writeText(valueToCopy);
        setCopied(true);
        resetTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          resetTimeoutRef.current = null;
        }, COPIED_FEEDBACK_MS);
        onCopy?.();
      } catch (error) {
        setCopied(false);
        console.warn('Clipboard copy failed', error);
      }
    }, [onCopy, valueToCopy]);

    const textHoverClasses =
      variant === 'mono-secondary'
        ? 'group-hover/inline-copy:text-kumo-default group-focus-visible/inline-copy:text-kumo-default'
        : undefined;
    const renderedText =
      variant === 'mono' || variant === 'mono-secondary' ? (
        <Text<InlineCopyTextMonospaceVariant>
          id={textId}
          as={as}
          size={size === 'lg' ? size : undefined}
          truncate={truncate}
          variant={variant}
          DANGEROUS_className={textHoverClasses}
        >
          {children}
        </Text>
      ) : (
        <Text<InlineCopyTextCopyVariant>
          id={textId}
          as={as}
          bold={bold}
          size={size}
          truncate={truncate}
          variant={variant}
          DANGEROUS_className={textHoverClasses}
        >
          {children}
        </Text>
      );

    return (
      <button
        {...props}
        ref={ref}
        type="button"
        data-kumo-component="InlineCopyText"
        className={cn(KUMO_INLINE_COPY_TEXT_STYLING.baseClasses, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            void copyToClipboard();
          }
        }}
        aria-labelledby={props['aria-labelledby'] ?? `${textId} ${actionId}`}
      >
        {renderedText}
        <span id={actionId} className="sr-only">
          {copyAction}
        </span>
        {copied ? (
          <HugeiconsIcon icon={CheckIcon} aria-hidden size={14} className="shrink-0" />
        ) : (
          <HugeiconsIcon
            icon={CopyIcon}
            aria-hidden
            size={14}
            className={cn(
              'shrink-0 opacity-0 transition-opacity motion-reduce:transition-none',
              'group-hover/inline-copy:opacity-100 group-focus-visible/inline-copy:opacity-100',
              'group-focus-within:opacity-100 group-hover:opacity-100',
            )}
          />
        )}
        <span className="sr-only" aria-live="polite">
          {copied ? copiedLabel : ''}
        </span>
      </button>
    );
  },
);

InlineCopyText.displayName = 'InlineCopyText';
