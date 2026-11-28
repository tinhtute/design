import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Motion timing must come from the theme scale (`duration-fast|base|slow`,
 * `ease-standard|emphasized`). Raw values are allowed only where a component
 * tracks a gesture or a library's own timing; each exception is listed below.
 */
const RAW_MOTION = new RegExp(
  [
    String.raw`\bduration-(?:[1-9]\d*|\[[^\]]+\])`,
    String.raw`\bease-(?:in|out|in-out|linear|\[[^\]]+\])(?![\w-])`,
    String.raw`\[(?:transition|animation)(?:-duration)?:[^\]]*\d(?:ms|s)\b[^\]]*\]`,
  ].join('|'),
  'g',
);

/** Raw values that stay, by file, each with the reason. */
const EXCEPTIONS: Record<string, { values: string[]; reason: string }> = {
  'components/ui/layer-dialog.tsx': {
    values: [
      'duration-[450ms]',
      'ease-[cubic-bezier(0.32,0.72,0,1)]',
      'duration-[calc(var(--drawer-swipe-strength)*400ms)]',
    ],
    reason: 'mobile drawer follows the swipe gesture',
  },
  'components/ui/toasty.tsx': {
    values: [
      '[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]',
      '[transition-duration:250ms]',
    ],
    reason: 'Base UI toast stack timing (position, swipe, height)',
  },
};

async function listSources(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listSources(full);
      return Promise.resolve(/\.(tsx?|css)$/.test(entry.name) ? [full] : []);
    }),
  );
  return files.flat();
}

export async function validateMotion(root: string): Promise<number> {
  const srcRoot = path.join(root, 'src');
  let failed = 0;
  for (const file of await listSources(path.join(srcRoot, 'components'))) {
    const rel = path.relative(srcRoot, file).split(path.sep).join('/');
    const allowed = new Set(EXCEPTIONS[rel]?.values ?? []);
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(RAW_MOTION)) {
        if (allowed.has(match[0])) continue;
        failed += 1;
        console.error(
          `FAIL ${rel}:${index + 1} raw motion value "${match[0]}"; use duration-fast|base|slow and ease-standard|emphasized`,
        );
      }
    });
  }
  if (failed === 0) console.log('OK   motion classes use theme duration and easing tokens');
  return failed;
}
