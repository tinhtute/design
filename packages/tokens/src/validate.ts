import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "..", "schemas", "registry-item.json");
const registryDir = path.resolve(__dirname, "..", "dist", "registry");

async function main() {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  const validate = ajv.compile(schema);

  const files = (await readdir(registryDir)).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    throw new Error(`no registry items in ${registryDir} — run generate first`);
  }

  let failed = 0;
  for (const file of files) {
    const item = JSON.parse(await readFile(path.join(registryDir, file), "utf8"));
    if (validate(item)) {
      console.log(`OK   ${file}`);
    } else {
      failed += 1;
      console.error(`FAIL ${file}`);
      for (const err of validate.errors ?? []) {
        console.error(`  ${err.instancePath} ${err.message}`);
      }
    }
  }

  if (failed > 0) process.exit(1);
  console.log(`validated ${files.length} registry item(s) against ${schemaPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
