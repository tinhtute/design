'use client';

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  Cancel01Icon,
  CloudUploadIcon,
  Delete02Icon,
  File01Icon,
  RefreshIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { Field } from '@/components/ui/field';
import { cn } from '@/lib/utils';

export type FileUploadStatus = 'queued' | 'uploading' | 'success' | 'canceled' | 'error';

export type FileUploadErrorKind = 'network' | 'validation';

export type FileUploadProgressSize = 'sm' | 'base';

export interface FileUploadItem {
  /** Stable unique identifier for this file entry. */
  id: string;
  /** Original file name. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** Current transfer state. */
  status: FileUploadStatus;
  /** Upload progress from 0 to 100. */
  progress?: number;
  /** Optional remaining duration label shown beside the progress bar (e.g. "~3s left"). */
  eta?: string;
  /** Error explanation shown when status is "error". */
  errorMessage?: string;
  /**
   * Distinguishes transient errors ("network", retryable by default) from
   * client/server validation rejections ("validation", not retryable).
   */
  errorKind?: FileUploadErrorKind;
  /** Overrides whether the retry button is available for a failed or canceled item. */
  retryable?: boolean;
}

export interface FileValidationOptions {
  /** Comma-separated MIME types or extensions (same format as HTML input accept). */
  accept?: string;
  /** Maximum allowed file size in bytes. */
  maxFileSize?: number;
}

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function validateFile(
  file: Pick<File, 'name' | 'size' | 'type'>,
  options: FileValidationOptions = {},
): FileValidationResult {
  const { accept, maxFileSize } = options;

  if (maxFileSize != null && file.size > maxFileSize) {
    return {
      valid: false,
      reason: `Exceeds the ${formatFileSize(maxFileSize)} per-file limit.`,
    };
  }

  if (accept && accept.trim().length > 0) {
    const tokens = accept
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const lowerName = file.name.toLowerCase();
    const lowerType = (file.type || '').toLowerCase();

    const matches = tokens.some((token) => {
      if (token.startsWith('.')) {
        return lowerName.endsWith(token);
      }
      if (token.endsWith('/*')) {
        const prefix = token.slice(0, -1);
        return lowerType.startsWith(prefix);
      }
      return lowerType === token;
    });

    if (!matches) {
      return {
        valid: false,
        reason: `Unsupported file type. Accepted: ${accept}.`,
      };
    }
  }

  return { valid: true };
}

export interface FileUploadProps {
  /** Current list of files managed by the parent application. */
  items: FileUploadItem[];
  /** Called when the user selects files via the picker or drops files onto the zone. */
  onFilesAdd: (files: File[]) => void;
  /** Called to cancel a queued or uploading item. */
  onCancel?: (id: string) => void;
  /** Called to retry a single failed or canceled item without affecting other items. */
  onRetry?: (id: string) => void;
  /** Called to remove a single item from the list. */
  onRemove?: (id: string) => void;
  /** Called to clear all completed items from the list. */
  onClearCompleted?: () => void;
  /** Called to clear all items from the list. */
  onClearAll?: () => void;
  /** Field label displayed above the dropzone. */
  label?: ReactNode;
  /** Helper description displayed below the dropzone (e.g. allowed formats and size limit). */
  description?: ReactNode;
  /** Field-level error message (e.g. when the form is submitted with no files). */
  error?: string;
  /** Whether the field is required (false displays "(optional)"). */
  required?: boolean;
  /** Comma-separated MIME types or file extensions passed to the native file input. */
  accept?: string;
  /** Allow selecting multiple files at once. @default true */
  multiple?: boolean;
  /** Disable file selection and drag-and-drop. @default false */
  disabled?: boolean;
  /** Visual height of the native progress bars. @default "base" */
  progressSize?: FileUploadProgressSize;
  /** Title shown in the empty dropzone state. @default "Upload files" */
  emptyTitle?: string;
  /** Supporting copy in the empty dropzone state. */
  emptyDescription?: string;
  /** Label for the file picker trigger button. @default "Choose files" */
  buttonLabel?: string;
  /** Restrained status announcement string managed by the caller (optional). */
  announcement?: string;
  /** Additional CSS classes for the outer wrapper. */
  className?: string;
}

const PROGRESS_SIZE_CLASSES: Record<FileUploadProgressSize, string> = {
  sm: 'h-1.5',
  base: 'h-2.5',
};

function progressBarClasses(size: FileUploadProgressSize, tone: 'brand' | 'success' | 'danger') {
  const fill =
    tone === 'success'
      ? '[&::-webkit-progress-value]:bg-kumo-success [&::-moz-progress-bar]:bg-kumo-success'
      : tone === 'danger'
        ? '[&::-webkit-progress-value]:bg-kumo-danger [&::-moz-progress-bar]:bg-kumo-danger'
        : '[&::-webkit-progress-value]:bg-kumo-brand [&::-moz-progress-bar]:bg-kumo-brand';

  return cn(
    'w-full appearance-none overflow-hidden rounded-full bg-kumo-fill',
    '[&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-kumo-fill',
    '[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200 [&::-webkit-progress-value]:ease-out',
    'motion-reduce:[&::-webkit-progress-value]:transition-none',
    '[&::-moz-progress-bar]:rounded-full',
    PROGRESS_SIZE_CLASSES[size],
    fill,
  );
}

function getStatusBadge(item: FileUploadItem) {
  switch (item.status) {
    case 'queued':
      return { variant: 'secondary' as const, label: 'Queued' };
    case 'uploading':
      return { variant: 'info' as const, label: 'Uploading' };
    case 'success':
      return { variant: 'success' as const, label: 'Uploaded' };
    case 'canceled':
      return { variant: 'warning' as const, label: 'Canceled' };
    case 'error':
      return {
        variant: 'error' as const,
        label: item.errorKind === 'validation' ? 'Invalid file' : 'Upload failed',
      };
  }
}

function isRetryable(item: FileUploadItem): boolean {
  if (typeof item.retryable === 'boolean') return item.retryable;
  if (item.status === 'canceled') return true;
  if (item.status === 'error') return item.errorKind !== 'validation';
  return false;
}

export function FileUpload({
  items,
  onFilesAdd,
  onCancel,
  onRetry,
  onRemove,
  onClearCompleted,
  onClearAll,
  label = 'Attachments',
  description,
  error,
  required,
  accept,
  multiple = true,
  disabled = false,
  progressSize = 'base',
  emptyTitle = 'Upload files',
  emptyDescription = 'Choose files from your device or drag and drop them here.',
  buttonLabel = 'Choose files',
  announcement,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const listHeadingId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragFileCount, setDragFileCount] = useState<number | null>(null);
  const [localAnnouncement, setLocalAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setLocalAnnouncement(message);
  }, []);

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';
      if (files.length === 0) return;
      onFilesAdd(files);
      announce(
        files.length === 1
          ? `Added ${files[0].name} to the upload list.`
          : `Added ${files.length} files to the upload list.`,
      );
    },
    [onFilesAdd, announce],
  );

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current += 1;
      setIsDragging(true);
      const count = event.dataTransfer?.items?.length || event.dataTransfer?.files?.length || 0;
      setDragFileCount(count > 0 ? count : null);
    },
    [disabled],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
      if (!isDragging) setIsDragging(true);
    },
    [disabled, isDragging],
  );

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDragging(false);
        setDragFileCount(null);
      }
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = 0;
      setIsDragging(false);
      setDragFileCount(null);
      const dropped = Array.from(event.dataTransfer?.files ?? []);
      if (dropped.length === 0) return;
      const selected = multiple ? dropped : dropped.slice(0, 1);
      onFilesAdd(selected);
      announce(
        selected.length === 1
          ? `Added ${selected[0].name} to the upload list.`
          : `Added ${selected.length} files to the upload list.`,
      );
    },
    [disabled, multiple, onFilesAdd, announce],
  );

  const totalCount = items.length;
  const completedCount = items.filter((item) => item.status === 'success').length;
  const uploadingCount = items.filter((item) => item.status === 'uploading').length;
  const queuedCount = items.filter((item) => item.status === 'queued').length;
  const failedCount = items.filter((item) => item.status === 'error').length;
  const canceledCount = items.filter((item) => item.status === 'canceled').length;

  const activeItems = items.filter((item) => item.status !== 'error' && item.status !== 'canceled');
  const overallProgress =
    activeItems.length === 0
      ? 0
      : Math.round(
          activeItems.reduce((sum, item) => {
            if (item.status === 'success') return sum + 100;
            if (item.status === 'uploading')
              return sum + Math.max(0, Math.min(100, item.progress ?? 0));
            return sum;
          }, 0) / activeItems.length,
        );

  const batchSummaryParts: string[] = [];
  if (completedCount > 0) batchSummaryParts.push(`${completedCount} of ${totalCount} uploaded`);
  else if (totalCount > 0)
    batchSummaryParts.push(`${totalCount} ${totalCount === 1 ? 'file' : 'files'}`);
  if (uploadingCount > 0) batchSummaryParts.push(`${uploadingCount} uploading`);
  if (queuedCount > 0) batchSummaryParts.push(`${queuedCount} queued`);
  if (failedCount > 0) batchSummaryParts.push(`${failedCount} failed`);
  if (canceledCount > 0) batchSummaryParts.push(`${canceledCount} canceled`);

  const batchBadge =
    totalCount === 0
      ? null
      : uploadingCount > 0 || queuedCount > 0
        ? { variant: 'info' as const, label: `${overallProgress}%` }
        : completedCount === totalCount
          ? { variant: 'success' as const, label: 'Complete' }
          : completedCount > 0 && (failedCount > 0 || canceledCount > 0)
            ? { variant: 'warning' as const, label: 'Partial success' }
            : { variant: 'error' as const, label: 'Needs attention' };

  const liveMessage = announcement ?? localAnnouncement;

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-3', className)}>
      <Field
        label={label}
        required={required}
        description={description}
        error={error ? { message: error, match: true } : undefined}
      >
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-dragging={isDragging ? 'true' : undefined}
          className={cn(
            'relative w-full min-w-0 rounded-xl transition-colors duration-200 ease-out motion-reduce:transition-none',
            isDragging && 'ring-2 ring-kumo-brand ring-offset-2 ring-offset-kumo-base',
            disabled && 'opacity-60',
          )}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />

          {totalCount === 0 ? (
            <Empty
              size="sm"
              icon={
                <span className="flex size-10 items-center justify-center rounded-lg bg-kumo-tint text-kumo-default ring-1 ring-kumo-line">
                  <HugeiconsIcon icon={CloudUploadIcon} size={20} aria-hidden="true" />
                </span>
              }
              title={
                isDragging
                  ? dragFileCount
                    ? `Drop ${dragFileCount} ${dragFileCount === 1 ? 'file' : 'files'} to upload`
                    : 'Drop files to upload'
                  : emptyTitle
              }
              description={emptyDescription}
              contents={
                <Button
                  type="button"
                  variant="primary"
                  size="base"
                  disabled={disabled}
                  onClick={openPicker}
                >
                  <HugeiconsIcon icon={CloudUploadIcon} size={16} aria-hidden="true" />
                  {buttonLabel}
                </Button>
              }
            />
          ) : (
            <div
              className={cn(
                'flex flex-col items-start gap-3 rounded-xl border border-dashed px-4 py-3 transition-colors duration-200 ease-out motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between',
                isDragging ? 'border-kumo-brand bg-kumo-tint' : 'border-kumo-line bg-kumo-control',
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-kumo-tint text-kumo-default ring-1 ring-kumo-line">
                  <HugeiconsIcon icon={CloudUploadIcon} size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-kumo-default">
                    {isDragging
                      ? dragFileCount
                        ? `Drop ${dragFileCount} ${dragFileCount === 1 ? 'file' : 'files'} to add`
                        : 'Drop files to add'
                      : 'Add more files'}
                  </p>
                  <p className="text-sm text-kumo-subtle">
                    Drop files here or use the file picker.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="base"
                disabled={disabled}
                onClick={openPicker}
              >
                {buttonLabel}
              </Button>
            </div>
          )}
        </div>
      </Field>

      {totalCount > 0 && (
        <section
          aria-labelledby={listHeadingId}
          className="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-kumo-line bg-kumo-base p-3 sm:p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 id={listHeadingId} className="text-sm font-semibold text-kumo-default">
                Upload queue
              </h3>
              {batchBadge && <Badge variant={batchBadge.variant}>{batchBadge.label}</Badge>}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {onClearCompleted && completedCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearCompleted();
                    announce('Cleared completed uploads.');
                  }}
                >
                  Clear completed
                </Button>
              )}
              {onClearAll && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearAll();
                    announce('Cleared upload queue.');
                  }}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-kumo-subtle">
              <span>{batchSummaryParts.join(' · ')}</span>
              {activeItems.length > 0 && (
                <span className="font-mono text-kumo-default">{overallProgress}%</span>
              )}
            </div>
            {activeItems.length > 0 && (
              <progress
                value={overallProgress}
                max={100}
                aria-label={`Overall upload progress, ${overallProgress} percent`}
                className={progressBarClasses(
                  progressSize,
                  completedCount === totalCount ? 'success' : 'brand',
                )}
              />
            )}
          </div>

          <ul className="flex flex-col divide-y divide-kumo-line border-t border-kumo-line">
            {items.map((item) => {
              const badge = getStatusBadge(item);
              const canRetry = Boolean(onRetry && isRetryable(item));
              const canCancel = Boolean(
                onCancel && (item.status === 'uploading' || item.status === 'queued'),
              );
              const canRemove = Boolean(onRemove && item.status !== 'uploading');
              const itemProgress =
                item.status === 'success' ? 100 : Math.max(0, Math.min(100, item.progress ?? 0));

              return (
                <li key={item.id} className="flex min-w-0 flex-col gap-2 py-3 first:pt-3 last:pb-0">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <span
                        className={cn(
                          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-kumo-line',
                          item.status === 'error'
                            ? 'bg-kumo-danger-tint text-kumo-danger'
                            : item.status === 'success'
                              ? 'bg-kumo-success-tint text-kumo-success'
                              : 'bg-kumo-control text-kumo-subtle',
                        )}
                      >
                        <HugeiconsIcon
                          icon={
                            item.status === 'error'
                              ? AlertCircleIcon
                              : item.status === 'success'
                                ? Tick02Icon
                                : File01Icon
                          }
                          size={16}
                          aria-hidden="true"
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p
                          title={item.name}
                          className="text-sm font-medium break-all text-kumo-default sm:truncate"
                        >
                          {item.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-kumo-subtle">
                          <span>{formatFileSize(item.size)}</span>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          {item.status === 'uploading' && item.eta && (
                            <span className="font-mono text-kumo-subtle">{item.eta}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {canRetry && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          aria-label={`Retry ${item.name}`}
                          onClick={() => {
                            onRetry?.(item.id);
                            announce(`Retrying ${item.name}.`);
                          }}
                        >
                          <HugeiconsIcon icon={RefreshIcon} size={14} aria-hidden="true" />
                          Retry
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Cancel ${item.name}`}
                          onClick={() => {
                            onCancel?.(item.id);
                            announce(`Canceled ${item.name}.`);
                          }}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={14} aria-hidden="true" />
                          Cancel
                        </Button>
                      )}
                      {canRemove && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          shape="square"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => {
                            onRemove?.(item.id);
                            announce(`Removed ${item.name}.`);
                          }}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {(item.status === 'uploading' || item.status === 'queued') && (
                    <div className="flex items-center gap-2.5 pl-10">
                      <progress
                        value={item.status === 'uploading' ? itemProgress : 0}
                        max={100}
                        aria-label={
                          item.status === 'uploading'
                            ? `Uploading ${item.name}, ${itemProgress} percent`
                            : `${item.name} queued for upload`
                        }
                        className={progressBarClasses(progressSize, 'brand')}
                      />
                      <span className="w-9 shrink-0 text-right font-mono text-xs text-kumo-subtle">
                        {item.status === 'uploading' ? `${itemProgress}%` : '0%'}
                      </span>
                    </div>
                  )}

                  {item.status === 'error' && item.errorMessage && (
                    <p className="pl-10 text-sm text-kumo-danger">{item.errorMessage}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>
    </div>
  );
}

FileUpload.displayName = 'FileUpload';
