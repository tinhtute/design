import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Motion timing must come from the theme scale (`duration-fast|base|slow`,
 * `ease-standard|emphasized`). Raw values are allowed only where a component
 * tracks a gesture or a caller-supplied timing; each exception is listed here.
 */
const RAW_MOTION =
  /\bduration-(?:[1-9]\d*|\[[^\]]+\])|\bease-(?:in|out|in-out|linear|\[[^\]]+\])(?![\w-])/g;

const EXCEPTIONS: Record<string, string> = {
  'components/ui/layer-dialog.tsx': 'drawer follows the swipe gesture (450ms, swipe-strength exit)',
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
    if (EXCEPTIONS[rel]) continue;
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(RAW_MOTION)) {
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
