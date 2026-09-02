import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import { validateDeps } from "./validate-deps";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

interface RegistryItem {
  name: string;
  type: string;
  files?: { path: string; type: string }[];
  registryDependencies?: string[];
}

async function main() {
  const registrySchema = JSON.parse(
    await readFile(path.join(root, "schemas", "registry.json"), "utf8"),
  );
  const itemSchema = JSON.parse(
    await readFile(path.join(root, "schemas", "registry-item.json"), "utf8"),
  );
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  ajv.addSchema(itemSchema, "https://ui.shadcn.com/schema/registry-item.json");
  const validateRegistry = ajv.compile(registrySchema) as {
    (data: unknown): boolean;
    errors?: Array<{ instancePath: string; message?: string }>;
  };
  const validateItem = ajv.compile(itemSchema) as typeof validateRegistry;

  const registry = JSON.parse(
    await readFile(path.join(root, "registry.json"), "utf8"),
  ) as { items: RegistryItem[] };

  let failed = 0;

  if (!validateRegistry(registry)) {
    failed += 1;
    console.error("FAIL registry.json against registry.json schema");
    for (const err of validateRegistry.errors ?? []) {
      console.error(`  ${err.instancePath} ${err.message}`);
    }
  } else {
    console.log("OK   registry.json against registry.json schema");
  }

  for (const item of registry.items) {
    if (!validateItem(item)) {
      failed += 1;
      console.error(`FAIL item ${item.name} (${item.type})`);
      for (const err of validateItem.errors ?? []) {
        console.error(`  ${err.instancePath} ${err.message}`);
      }
      continue;
    }
    console.log(`OK   item ${item.name} (${item.type})`);

    for (const file of item.files ?? []) {
      const filePath = path.join(root, file.path);
      if (!existsSync(filePath)) {
        failed += 1;
        console.error(`FAIL item ${item.name}: missing file ${file.path}`);
      }
    }
  }

  const noFiles = registry.items.filter(
    (item) => item.files?.length === 0 && item.type !== "registry:theme",
  );
  if (noFiles.length > 0) {
    failed += 1;
    console.error(
      `FAIL non-theme items with no files: ${noFiles.map((i) => i.name).join(", ")}`,
    );
  }
  failed += await validateDeps(root, registry);

  if (failed > 0) process.exit(1);
  console.log(
    `validated ${registry.items.length} registry items; all referenced files present`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
