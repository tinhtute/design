/**
 * Adapted from cloudflare/kumo (MIT), commit 69ff967a00448619feb72367cbbc4d0fa37ecc14 (@cloudflare/kumo@2.15.0).
 */
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import React, { useEffect, useRef } from 'react';

type UseMenuNavigationProps = {
  menuRef: React.RefObject<HTMLElement | null>;
  direction?: 'horizontal' | 'vertical'; // Default: horizontal
};

/** Arrow-key roving focus across the bar (inlined from upstream use-menu-navigation.ts). */
const useMenuNavigation = ({ menuRef, direction = 'horizontal' }: UseMenuNavigationProps) => {
  const activeElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    const focusableElements = Array.from(
      menuRef.current.querySelectorAll(
        'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
      ),
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeElementRef.current) return;

      const currentIndex = focusableElements.indexOf(activeElementRef.current);
      let nextIndex = currentIndex;

      const isHorizontal = direction === 'horizontal';
      const forwardKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const backwardKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      if (e.key === forwardKey) {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % focusableElements.length;
      } else if (e.key === backwardKey) {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
      } else {
        return;
      }

      const nextElement = focusableElements[nextIndex];
      activeElementRef.current = nextElement;
      nextElement.focus();
    };

    const addKeyListener = () => document.addEventListener('keydown', handleKeyDown);
    const removeKeyListener = () => document.removeEventListener('keydown', handleKeyDown);

    const handleFocusIn = () => {
      activeElementRef.current = document.activeElement as HTMLElement;
      addKeyListener();
    };

    const handleFocusOut = () => {
      activeElementRef.current = null;
      removeKeyListener();
    };

    menuRef.current.addEventListener('focusin', handleFocusIn);
    menuRef.current.addEventListener('focusout', handleFocusOut);

    return () => {
      menuRef.current?.removeEventListener('focusin', handleFocusIn);
      menuRef.current?.removeEventListener('focusout', handleFocusOut);
      removeKeyListener();
    };
  }, [menuRef, direction]);
};

/** MenuBar variant definitions (currently empty, reserved for future additions). */
export const KUMO_MENUBAR_VARIANTS = {
  // MenuBar currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_MENUBAR_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_MENUBAR_VARIANTS
export interface KumoMenuBarVariantsProps {}

export function menuBarVariants(_props: KumoMenuBarVariantsProps = {}) {
  return cn(
    // Base styles
    'flex rounded-lg bg-kumo-recessed pl-px shadow-xs ring ring-kumo-line',
  );
}

/** Props for an individual menu option within a MenuBar. */
type MenuOptionProps = {
  /** Hugeicons icon data or a React element, rendered at 18px */
  icon: IconSvgElement | React.ReactNode;
  /** Unique identifier for the option (used when `optionIds` is true) */
  id?: number | string;
  /** Currently active value from the parent MenuBar */
  isActive?: number | boolean | string | undefined;
  /** Callback when this option is clicked */
  onClick: () => void;
  /** Tooltip text shown on hover */
  tooltip: string;
};

const MenuOption = ({ icon, id, isActive, onClick, tooltip }: MenuOptionProps) => {
  const button = (
    <button
      data-kumo-component="MenuBar"
      data-kumo-part="option"
      aria-label={tooltip}
      className={cn(
        'relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none bg-kumo-recessed first:rounded-l-lg last:rounded-r-lg focus:z-3 focus:ring-kumo-focus/50 focus:outline-none focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand',
        {
          'z-2 bg-kumo-base shadow-xs': isActive === id,
        },
      )}
      onClick={onClick}
    >
      {Array.isArray(icon) ? (
        <HugeiconsIcon icon={icon as IconSvgElement} size={18} />
      ) : (
        (icon as React.ReactNode)
      )}
    </button>
  );

  return <Tooltip content={tooltip} render={button} />;
};

/**
 * MenuBar component props.
 *
 * Horizontal icon-button toolbar with keyboard navigation and tooltip labels.
 *
 * @deprecated Use `Tabs` with `variant="segmented"` instead. `MenuBar` will be removed in a future release.
 *
 * @example
 * ```tsx
 * <MenuBar
 *   isActive={activeIndex}
 *   options={[
 *     { icon: Menu01Icon, tooltip: "List view", onClick: () => setView("list") },
 *     { icon: GridViewIcon, tooltip: "Grid view", onClick: () => setView("grid") },
 *   ]}
 * />
 * ```
 */
type MenuBarProps = {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** The currently active option value — matched against option index or `id`. */
  isActive: number | boolean | string | undefined;
  /** Array of menu option configurations. */
  options: MenuOptionProps[];
  /** When true, each option's `id` field is used for matching instead of its array index. */
  optionIds?: boolean;
};

/**
 * MenuBar — horizontal icon-button toolbar with keyboard arrow-key navigation.
 *
 * Each option renders as a `<button>` with a Tooltip. The active option is
 * visually highlighted with an elevated background.
 *
 * @deprecated Use `Tabs` with `variant="segmented"` instead. `MenuBar` will be removed in a future release.
 *
 * @example
 * ```tsx
 * <MenuBar
 *   isActive={0}
 *   options={[
 *     { icon: Menu01Icon, tooltip: "List", onClick: () => {} },
 *     { icon: GridViewIcon, tooltip: "Grid", onClick: () => {} },
 *   ]}
 * />
 * ```
 */
export const MenuBar = ({
  className,
  isActive,
  options,
  optionIds = false, // if option needs an extra unique ID
}: MenuBarProps) => {
  const menuRef = useRef<HTMLElement | null>(null);

  useMenuNavigation({ menuRef, direction: 'horizontal' });

  return (
    <nav
      className={cn(
        'isolate flex rounded-lg bg-kumo-recessed pl-px shadow-xs ring ring-kumo-line',
        className,
      )}
      ref={menuRef}
    >
      {options.map((option, index) => (
        <MenuOption
          key={index}
          {...option}
          isActive={isActive}
          id={optionIds ? option.id : index}
        />
      ))}
    </nav>
  );
};
