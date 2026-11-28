/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { resolveVariant } from '@/lib/resolve-variant';

/** Loader size variant definitions mapping sizes to their pixel values. */
export const KUMO_LOADER_VARIANTS = {
  size: {
    sm: {
      value: 16,
      description: 'Small loader for inline use',
    },
    base: {
      value: 24,
      description: 'Default loader size',
    },
    lg: {
      value: 32,
      description: 'Large loader for prominent loading states',
    },
  },
} as const;

export const KUMO_LOADER_DEFAULT_VARIANTS = {
  size: 'base',
} as const;

// Derived types from KUMO_LOADER_VARIANTS
export type KumoLoaderSize = keyof typeof KUMO_LOADER_VARIANTS.size;

export interface KumoLoaderVariantsProps {
  /**
   * Size of the loader. Use a preset name or a custom pixel number.
   * - `"sm"` — 16px, small loader for inline use
   * - `"base"` — 24px, default loader size
   * - `"lg"` — 32px, large loader for prominent loading states
   * @default "base"
   */
  size?: KumoLoaderSize | number;
}

export function loaderVariants({
  size = KUMO_LOADER_DEFAULT_VARIANTS.size,
}: KumoLoaderVariantsProps = {}): number {
  if (typeof size === 'number') return size;
  return resolveVariant(KUMO_LOADER_VARIANTS.size, size, KUMO_LOADER_DEFAULT_VARIANTS.size).value;
}

/**
 * Loader component props.
 *
 * @example
 * ```tsx
 * <Loader />
 * <Loader size="sm" />
 * <Loader size={24} />
 * ```
 */
export interface LoaderProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /**
   * Size of the spinner. Use a preset name or a custom pixel number.
   * - `"sm"` — 16px, for inline use
   * - `"base"` — 24px, default size
   * - `"lg"` — 32px, for prominent loading states
   * @default "base"
   */
  size?: KumoLoaderSize | number;
  /**
   * Accessible label for the loader, announced by screen readers.
   * Pass a translated string for internationalization.
   * @default "Loading"
   */
  'aria-label'?: string;
}

/**
 * Animated circular spinner for indicating loading states.
 *
 * @example
 * ```tsx
 * <Loader />
 * ```
 */
export const Loader = ({
  className,
  size = KUMO_LOADER_DEFAULT_VARIANTS.size,
  'aria-label': ariaLabel = 'Loading',
}: LoaderProps) => {
  const sizeValue = loaderVariants({ size });
  const svgRef = useRef<SVGSVGElement>(null);

  // SMIL ignores prefers-reduced-motion, so freeze the spinner on a visible arc instead.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (query.matches) {
        svg.setCurrentTime(0.75);
        svg.pauseAnimations();
      } else {
        svg.unpauseAnimations();
      }
    };
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <svg
      ref={svgRef}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      className={className}
      style={{ height: sizeValue, width: sizeValue }}
      role="status"
      aria-label={ariaLabel}
    >
      <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="2" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="0 150;42 150;42 150"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="0;-16;-59"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        opacity={0.1}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const getRandomWidth = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const getRandomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);

export const SkeletonLine = ({
  minWidth = 30,
  maxWidth = 100,
  minDuration = 1.3,
  maxDuration = 1.7,
  minDelay = 0,
  maxDelay = 0.5,
  blockHeight,
  className,
}: {
  minWidth?: number;
  maxWidth?: number;
  minDuration?: number;
  maxDuration?: number;
  minDelay?: number;
  maxDelay?: number;
  blockHeight?: string | number;
  className?: string;
}) => {
  const { width, duration, delay } = useMemo(() => {
    return {
      width: getRandomWidth(minWidth, maxWidth),
      duration: getRandomFloat(minDuration, maxDuration),
      delay: getRandomFloat(minDelay, maxDelay),
    };
  }, [minWidth, maxWidth, minDuration, maxDuration, minDelay, maxDelay]);

  const lineStyle: React.CSSProperties & { [key: string]: string } = {
    '--skeleton-width': `${width}%`,
    '--shimmer-duration': `${duration}s`,
    '--shimmer-delay': `${delay}s`,
  };

  const line = <div className={cn('skeleton-line', className)} style={lineStyle}></div>;

  if (blockHeight !== undefined) {
    const height = typeof blockHeight === 'number' ? `${blockHeight}px` : blockHeight;
    return (
      <div className="flex items-center" style={{ height }}>
        {line}
      </div>
    );
  }

  return line;
};
