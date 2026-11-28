/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */
import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogRoot, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Tick02Icon as CheckIcon,
  Copy01Icon as CopyIcon,
  AlertCircleIcon as WarningCircleIcon,
  Cancel01Icon as XIcon,
} from '@hugeicons/core-free-icons';
import { Banner } from '@/components/ui/banner';

export const KUMO_DELETE_RESOURCE_VARIANTS = {
  size: {
    sm: {
      classes: '',
      description: 'Small dialog for simple delete confirmations',
    },
    base: {
      classes: '',
      description: 'Default delete confirmation dialog size',
    },
  },
} as const;

export const KUMO_DELETE_RESOURCE_DEFAULT_VARIANTS = {
  size: 'base',
} as const;

export type KumoDeleteResourceSize = keyof typeof KUMO_DELETE_RESOURCE_VARIANTS.size;

export interface KumoDeleteResourceVariantsProps {
  size?: KumoDeleteResourceSize;
}

export interface DeleteResourceProps extends KumoDeleteResourceVariantsProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** The type of resource being deleted (e.g., "Zone", "Worker", "KV Namespace") */
  resourceType: string;
  /** The name of the specific resource being deleted */
  resourceName: string;
  /** Callback when delete is confirmed */
  onDelete: () => void | Promise<void>;
  /** Whether the delete action is in progress */
  isDeleting?: boolean;
  /** Whether the confirmation input should be case-sensitive (default: true) */
  caseSensitive?: boolean;
  /** Custom delete button text (defaults to "Delete {resourceType}") */
  deleteButtonText?: string;
  /** Additional className for the dialog */
  className?: string;
  /** Error message to display if the delete action fails */
  errorMessage?: string;
}

export function DeleteResource({
  open,
  onOpenChange,
  resourceType,
  resourceName,
  onDelete,
  isDeleting = false,
  caseSensitive = true,
  deleteButtonText,
  size = KUMO_DELETE_RESOURCE_DEFAULT_VARIANTS.size,
  errorMessage,
  className,
}: DeleteResourceProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmationInput('');
      setCopied(false);
    }
  }, [open]);

  const normalizeForComparison = useCallback(
    (str: string) => (caseSensitive ? str : str.toLowerCase()),
    [caseSensitive],
  );

  const isConfirmed =
    normalizeForComparison(confirmationInput) === normalizeForComparison(resourceName);

  const handleDelete = useCallback(async () => {
    if (!isConfirmed || isDeleting) return;
    await onDelete();
  }, [isConfirmed, isDeleting, onDelete]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(resourceName);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [resourceName]);

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog size={size} className={className}>
        <div className="flex items-center justify-between border-b border-kumo-line px-6 py-4">
          <DialogTitle>Delete {resourceName}</DialogTitle>
          <DialogClose
            render={(props) => (
              <Button
                {...props}
                variant="ghost"
                shape="square"
                size="sm"
                aria-label="Close"
                disabled={isDeleting}
              >
                <HugeiconsIcon icon={XIcon} size={18} />
              </Button>
            )}
          />
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <div role="alert" className="empty:absolute">
              {errorMessage && (
                <Banner icon={<HugeiconsIcon icon={WarningCircleIcon} />} variant="error">
                  {errorMessage}
                </Banner>
              )}
            </div>
            <p className="max-w-prose text-base text-pretty text-kumo-subtle">
              This action cannot be undone. This will permanently delete the{' '}
              <span className="font-medium text-kumo-default">{resourceName}</span>{' '}
              {resourceType.toLowerCase()}.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-base">
              <span>
                Type{' '}
                <button
                  className="group inline rounded-md bg-kumo-tint px-2 py-1 font-mono text-sm font-semibold hover:cursor-pointer hover:bg-kumo-fill"
                  onClick={handleCopy}
                  aria-label={`Copy ${resourceName} to clipboard`}
                >
                  {resourceName}

                  {copied ? (
                    <HugeiconsIcon
                      icon={CheckIcon}
                      size={12}
                      strokeWidth={2}
                      className="ml-1.5 inline"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={CopyIcon}
                      size={12}
                      strokeWidth={2}
                      className="ml-1.5 inline text-kumo-subtle group-hover:text-kumo-default"
                    />
                  )}
                </button>{' '}
                to confirm:
              </span>
            </div>
            <Input
              placeholder={resourceName}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              disabled={isDeleting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label={`Type ${resourceName} to confirm deletion`}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-kumo-line px-6 py-4">
          <DialogClose
            render={(props) => (
              <Button {...props} variant="secondary" disabled={isDeleting}>
                Cancel
              </Button>
            )}
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            loading={isDeleting}
          >
            {deleteButtonText || `Delete ${resourceType}`}
          </Button>
        </div>
      </Dialog>
    </DialogRoot>
  );
}

DeleteResource.displayName = 'DeleteResource';
