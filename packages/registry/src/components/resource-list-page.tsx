/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 *
 * ResourceListPage — layout shell for resource list pages. Provides the
 * standard page scaffold: icon + title + description header, a flexible
 * main column for `children` (typically a `DataTable`), and a sticky aside
 * for `usage` / `additionalContent` that collapses below the xl breakpoint.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** ResourceListPage component props. */
export interface ResourceListPageProps {
  /** Page heading (h1) */
  title?: string;
  /** Subtitle paragraph under the title (hidden below md) */
  description?: string;
  /** Leading icon rendered before the title */
  icon?: ReactNode;
  /** Aside slot — usage/quota content, sticky at xl */
  usage?: ReactNode;
  /** Aside slot below `usage`; moves under the main column below xl */
  additionalContent?: ReactNode;
  /** Main column content — typically a DataTable or card list */
  children: ReactNode;
  /** Additional CSS classes on the page container */
  className?: string;
}

/**
 * Renders the resource list page scaffold. `children` fills the main
 * column; `usage` and `additionalContent` render in the aside.
 */
export function ResourceListPage({
  title,
  description,
  icon,
  usage,
  additionalContent,
  children,
  className,
}: ResourceListPageProps) {
  return (
    <div
      className={cn("h-full min-h-screen w-full bg-kumo-overlay", className)}
    >
      <div className="mx-auto flex max-w-350 flex-col p-6 md:gap-4 md:p-8 lg:px-10 lg:py-9 xl:gap-6">
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-1.5">
            {icon}
            <h1 className="font-heading m-0 p-0 text-3xl font-semibold">
              {title}
            </h1>
          </div>
          <p className="hidden p-0 text-lg leading-normal text-pretty text-kumo-subtle md:block">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-6 xl:flex-row xl:gap-8">
          <div className="min-w-0 grow">{children}</div>

          {(usage || additionalContent) && (
            <div
              className="top-22 flex h-fit w-full shrink-0 flex-col gap-4 xl:sticky xl:w-95"
            >
              {usage}

              <div className={cn("hidden xl:block", usage ? "mt-6" : "")}>
                {additionalContent}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 xl:hidden">{additionalContent}</div>
      </div>
    </div>
  );
}
