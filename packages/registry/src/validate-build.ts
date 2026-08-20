import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const buildDir = path.join(root, "public", "r");

type Validator = {
  (data: unknown): boolean;
  errors?: Array<{ instancePath: string; message?: string }>;
};

async function main() {
  const registrySchema = JSON.parse(
    await readFile(path.join(root, "schemas", "registry.json"), "utf8"),
  );
  const itemSchema = JSON.parse(
    await readFile(path.join(root, "schemas", "registry-item.json"), "utf8"),
  );
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  ajv.addSchema(itemSchema, "https://ui.shadcn.com/schema/registry-item.json");
  const validateRegistry = ajv.compile(registrySchema) as Validator;
  const validateItem = ajv.compile(itemSchema) as Validator;

  let failed = 0;

  const files = (await readdir(buildDir)).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    throw new Error(`no built items in ${buildDir} — run build first`);
  }

  for (const file of files) {
    const item = JSON.parse(await readFile(path.join(buildDir, file), "utf8"));
    if (file === "registry.json") {
      if (validateRegistry(item)) {
        console.log("OK   public/r/registry.json against registry.json schema");
      } else {
        failed += 1;
        console.error("FAIL public/r/registry.json against registry.json schema");
        for (const err of validateRegistry.errors ?? []) {
          console.error(`  ${err.instancePath} ${err.message}`);
        }
      }
      continue;
    }
    if (validateItem(item)) {
      console.log(`OK   public/r/${file} against registry-item.json schema`);
    } else {
      failed += 1;
      console.error(`FAIL public/r/${file}`);
      for (const err of validateItem.errors ?? []) {
        console.error(`  ${err.instancePath} ${err.message}`);
      }
    }
  }

  if (failed > 0) process.exit(1);
  console.log(`validated ${files.length} built registry files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
