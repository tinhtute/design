'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteResource } from '@/components/delete-resource';

export const notes =
  'Keep the dialog open on failure, preserve the confirmation, and let the operator retry. This simulated delete fails once per opening. A real app removes the row only after success and moves focus to a stable control if the original trigger disappears.';

export const deps = ['button'];

export function Demo() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleted, setDeleted] = useState(false);

  async function deleteWorker() {
    const shouldFail = !errorMessage;
    setIsDeleting(true);
    setErrorMessage('');
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsDeleting(false);
    if (shouldFail) {
      setErrorMessage('Could not delete the worker. Try again.');
    } else {
      setDeleted(true);
      setOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => {
          setErrorMessage('');
          setDeleted(false);
          setOpen(true);
        }}
      >
        Delete worker
      </Button>
      <p role="status" className="text-sm text-kumo-subtle">
        {deleted ? 'Deleted api-gateway.' : ''}
      </p>
      <DeleteResource
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isDeleting) setOpen(nextOpen);
        }}
        resourceType="worker"
        resourceName="api-gateway"
        isDeleting={isDeleting}
        errorMessage={errorMessage}
        onDelete={deleteWorker}
      />
    </>
  );
}
