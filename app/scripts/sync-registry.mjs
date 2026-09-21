import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(appRoot, '..', 'packages', 'registry', 'public', 'r');
const dest = join(appRoot, 'public', 'r');

if (!existsSync(src)) {
  throw new Error(`Registry output missing: ${src}`);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
