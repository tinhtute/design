import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Playground } from "@/components/playground";
import { highlightCode } from "@/lib/highlight";

function readDemoSources(): Record<string, string> {
  const dir = path.join(process.cwd(), "demos");
  const sources: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (file.endsWith(".tsx")) {
      sources[file.slice(0, -".tsx".length)] = readFileSync(
        path.join(dir, file),
        "utf8",
      );
    }
  }
  return sources;
}

export default async function Home() {
  const sources = readDemoSources();
  const highlighted: Record<string, string> = {};
  await Promise.all(
    Object.entries(sources).map(async ([slug, source]) => {
      highlighted[slug] = await highlightCode(source, "tsx");
    }),
  );
  return <Playground sources={sources} highlighted={highlighted} />;
}
