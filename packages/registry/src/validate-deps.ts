import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

export interface RegistryFile {
  path: string;
  type?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  files?: RegistryFile[];
  registryDependencies?: string[];
}

const TS_EXTS: Record<string, true> = {
  ".ts": true,
  ".tsx": true,
  ".mts": true,
  ".cts": true,
};
const RESOLVE_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"];
const INDEX_FILES = ["index.ts", "index.tsx", "index.js", "index.jsx"];

function closureFiles(
  start: RegistryItem,
  byName: Map<string, RegistryItem>,
): Set<string> {
  const files = new Set<string>();
  const seen = new Set<string>();
  const stack = [start.name];
  while (stack.length > 0) {
    const name = stack.pop()!;
    if (seen.has(name)) continue;
    seen.add(name);
    const item = byName.get(name);
    if (!item) continue;
    for (const file of item.files ?? []) {
      files.add(file.path.replaceAll("\\", "/"));
    }
    for (const dep of item.registryDependencies ?? []) {
      if (/^https?:\/\//.test(dep)) continue;
      const namespaced = dep.match(/^@[^/]+\/(.+)$/);
      stack.push(namespaced ? namespaced[1] : dep);
    }
  }
  return files;
}

function resolveCandidates(fromFile: string, specifier: string): string[] {
  const base = (
    specifier.startsWith("@/")
      ? path.posix.normalize(`src/${specifier.slice(2)}`)
      : path.posix.normalize(
          path.posix.join(path.posix.dirname(fromFile), specifier),
        )
  ).replaceAll("\\", "/");
  if (path.posix.extname(base)) return [base];
  const out = [base];
  for (const ext of RESOLVE_EXTS) out.push(base + ext);
  for (const index of INDEX_FILES) out.push(path.posix.join(base, index));
  return out;
}

function collectSpecifiers(source: string, fileName: string): string[] {
  const kind = fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const specs: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const module = node.moduleSpecifier;
      if (module && ts.isStringLiteral(module)) specs.push(module.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      specs.push(node.moduleReference.expression.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) specs.push(arg.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return specs;
}

export async function validateDeps(
  root: string,
  registry: { items: RegistryItem[] },
): Promise<number> {
  const byName = new Map(registry.items.map((item) => [item.name, item]));
  let failed = 0;
  let checked = 0;

  for (const item of registry.items) {
    if (item.type === "registry:theme") continue;
    const allowed = closureFiles(item, byName);

    for (const file of item.files ?? []) {
      if (!TS_EXTS[path.posix.extname(file.path)]) continue;
      let source: string;
      try {
        source = await readFile(path.join(root, file.path), "utf8");
      } catch {
        continue;
      }
      checked += 1;
      const fromFile = file.path.replaceAll("\\", "/");
      for (const specifier of collectSpecifiers(source, file.path)) {
        if (
          !(
            specifier.startsWith("./") ||
            specifier.startsWith("../") ||
            specifier.startsWith("@/")
          ) ||
          /\.(css|json)(?:$|\?)/.test(specifier)
        ) {
          continue;
        }
        const hit = resolveCandidates(fromFile, specifier).some((candidate) =>
          allowed.has(candidate),
        );
        if (!hit) {
          failed += 1;
          console.error(
            `FAIL item ${item.name}: unresolved import "${specifier}"`,
          );
        }
      }
    }
  }

  if (failed === 0) {
    console.log(
      `OK   validate-deps: ${checked} TS/TSX files, local imports in registryDependencies closure`,
    );
  }
  return failed;
}
