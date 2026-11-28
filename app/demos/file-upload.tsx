'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload, validateFile, type FileUploadItem } from '@/components/file-upload';

export const notes =
  'Composable file upload block built from Field, Button, Badge, Empty, and native `<progress>`. Uses simulated client-side progress with no backend: validation rejections (oversized or unsupported type) cannot be retried, while transient network errors can be retried individually without clearing other files.';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = '.pdf,.json,.csv,.md,.txt,.png,.jpg,.jpeg';

const INITIAL_ITEMS: FileUploadItem[] = [
  {
    id: 'seed-1',
    name: 'quarterly-report-q4-2026.pdf',
    size: 1_887_436,
    status: 'success',
    progress: 100,
  },
  {
    id: 'seed-2',
    name: 'design-tokens-bundle-production-release-v2.15.0.json',
    size: 430_080,
    status: 'uploading',
    progress: 64,
    eta: '~2s left',
  },
  {
    id: 'seed-3',
    name: 'edge-telemetry-snapshot-2026-11-28.csv',
    size: 3_565_158,
    status: 'error',
    errorKind: 'network',
    errorMessage: 'Connection interrupted before the transfer finished.',
  },
  {
    id: 'seed-4',
    name: 'raw-production-database-dump-very-long-filename-for-overflow-check.sql',
    size: 19_293_798,
    status: 'error',
    errorKind: 'validation',
    errorMessage: 'Exceeds the 10 MB per-file limit.',
  },
  {
    id: 'seed-5',
    name: 'release-notes-vi-ban-cap-nhat-thang-11.md',
    size: 131_072,
    status: 'queued',
    progress: 0,
  },
];

export function Demo() {
  const [items, setItems] = useState<FileUploadItem[]>(INITIAL_ITEMS);
  const [announcement, setAnnouncement] = useState('');
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const nextIdRef = useRef(1);

  const stopTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const stopAllTimers = useCallback(() => {
    for (const timer of timersRef.current.values()) {
      clearInterval(timer);
    }
    timersRef.current.clear();
  }, []);

  useEffect(() => stopAllTimers, [stopAllTimers]);

  const startSimulatedUpload = useCallback(
    (id: string, name: string) => {
      stopTimer(id);
      let progress = 0;

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'uploading',
                progress: 10,
                eta: '~3s left',
                errorMessage: undefined,
                errorKind: undefined,
              }
            : item,
        ),
      );
      progress = 10;

      const timer = setInterval(() => {
        progress = Math.min(100, progress + 30);
        if (progress >= 100) {
          stopTimer(id);
          setItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: 'success', progress: 100, eta: undefined } : item,
            ),
          );
          setAnnouncement(`Finished uploading ${name}.`);
          return;
        }
        const remainingSeconds = Math.max(1, Math.ceil((100 - progress) / 30));
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: 'uploading', progress, eta: `~${remainingSeconds}s left` }
              : item,
          ),
        );
      }, 300);

      timersRef.current.set(id, timer);
    },
    [stopTimer],
  );

  const handleFilesAdd = useCallback(
    (files: File[]) => {
      const created: FileUploadItem[] = [];
      const toUpload: { id: string; name: string }[] = [];

      for (const file of files) {
        const id = `upload-${nextIdRef.current++}`;
        const result = validateFile(file, {
          accept: ACCEPTED_TYPES,
          maxFileSize: MAX_FILE_SIZE,
        });

        if (!result.valid) {
          created.push({
            id,
            name: file.name,
            size: file.size,
            status: 'error',
            errorKind: 'validation',
            errorMessage: result.reason,
          });
        } else {
          created.push({
            id,
            name: file.name,
            size: file.size,
            status: 'queued',
            progress: 0,
          });
          toUpload.push({ id, name: file.name });
        }
      }

      setItems((prev) => [...created, ...prev]);

      const rejectedCount = created.length - toUpload.length;
      if (rejectedCount > 0 && toUpload.length > 0) {
        setAnnouncement(
          `Queued ${toUpload.length} ${toUpload.length === 1 ? 'file' : 'files'}; ${rejectedCount} rejected by validation.`,
        );
      } else if (rejectedCount > 0) {
        setAnnouncement(
          `${rejectedCount} ${rejectedCount === 1 ? 'file was' : 'files were'} rejected by validation.`,
        );
      } else if (toUpload.length > 0) {
        setAnnouncement(
          `Uploading ${toUpload.length} ${toUpload.length === 1 ? 'file' : 'files'}.`,
        );
      }

      for (const entry of toUpload) {
        startSimulatedUpload(entry.id, entry.name);
      }
    },
    [startSimulatedUpload],
  );

  const handleCancel = useCallback(
    (id: string) => {
      stopTimer(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'canceled', eta: undefined } : item,
        ),
      );
    },
    [stopTimer],
  );

  const handleRetry = useCallback(
    (id: string) => {
      const target = items.find((item) => item.id === id);
      if (!target) return;
      startSimulatedUpload(id, target.name);
    },
    [items, startSimulatedUpload],
  );

  const handleRemove = useCallback(
    (id: string) => {
      stopTimer(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [stopTimer],
  );

  const handleClearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.status !== 'success'));
  }, []);

  const handleClearAll = useCallback(() => {
    stopAllTimers();
    setItems([]);
  }, [stopAllTimers]);

  const handleSimulateBatch = useCallback(() => {
    const validFile = new File(['{"version":"2.15.0"}'], 'worker-routes-config.json', {
      type: 'application/json',
    });
    const oversizedFile = new File([new Uint8Array(1024)], 'archive-backup-full.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(oversizedFile, 'size', { value: 14 * 1024 * 1024 });
    handleFilesAdd([validFile, oversizedFile]);
  }, [handleFilesAdd]);

  const handleReset = useCallback(() => {
    stopAllTimers();
    setItems(INITIAL_ITEMS);
    setAnnouncement('Reset demo to initial upload queue.');
  }, [stopAllTimers]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={handleSimulateBatch}>
          Simulate batch
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleClearAll}>
          Empty state
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          Reset demo
        </Button>
      </div>

      <FileUpload
        items={items}
        onFilesAdd={handleFilesAdd}
        onCancel={handleCancel}
        onRetry={handleRetry}
        onRemove={handleRemove}
        onClearCompleted={handleClearCompleted}
        onClearAll={handleClearAll}
        label="Release artifacts"
        description="PDF, JSON, CSV, Markdown, text, or images up to 10 MB per file. Simulated locally with no backend."
        accept={ACCEPTED_TYPES}
        announcement={announcement}
      />
    </div>
  );
}
