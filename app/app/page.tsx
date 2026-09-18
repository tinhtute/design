import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Playground } from "@/components/playground";

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

export default function Home() {
  return <Playground sources={readDemoSources()} />;
}
