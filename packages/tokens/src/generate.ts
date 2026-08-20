import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildThemeCss } from "./generator/css";
import { buildThemeRegistryItem } from "./generator/registry";
import type { Theme } from "./generator/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themesDir = path.resolve(__dirname, "themes");
const distDir = path.resolve(__dirname, "..", "dist");

export function assertValidTheme(theme: Theme): void {
  if (!theme.name) throw new Error(`theme missing "name"`);
  if (!theme.radius) throw new Error(`theme "${theme.name}" missing "radius"`);
  if (!theme.colors?.light || !theme.colors?.dark) {
    throw new Error(`theme "${theme.name}" requires colors.light and colors.dark`);
  }
}

async function loadThemes(): Promise<Theme[]> {
  const entries = await readdir(themesDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  const themes: Theme[] = [];
  for (const dir of dirs) {
    const file = path.join(themesDir, dir.name, "theme.json");
    const theme = JSON.parse(await readFile(file, "utf8")) as Theme;
    assertValidTheme(theme);
    themes.push(theme);
  }
  if (themes.length === 0) {
    throw new Error(`no themes found under ${themesDir}`);
  }
  return themes;
}

async function main() {
  const themes = await loadThemes();
  await mkdir(path.join(distDir, "themes"), { recursive: true });
  await mkdir(path.join(distDir, "registry"), { recursive: true });

  for (const theme of themes) {
    const css = buildThemeCss(theme);
    await writeFile(path.join(distDir, "themes", `${theme.name}.css`), css, "utf8");
    const item = buildThemeRegistryItem(theme);
    await writeFile(
      path.join(distDir, "registry", `theme-${theme.name}.json`),
      `${JSON.stringify(item, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `generated ${theme.name}: dist/themes/${theme.name}.css + dist/registry/theme-${theme.name}.json`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
