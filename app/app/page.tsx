import { Playground } from '@/components/playground';
import { getCatalog, readDemoSources } from '@/lib/agent-catalog';
import { highlightCode } from '@/lib/highlight';

export default async function Home() {
  const sources = readDemoSources();
  const highlighted: Record<string, string> = {};
  await Promise.all(
    Object.entries(sources).map(async ([slug, source]) => {
      highlighted[slug] = await highlightCode(source, 'tsx');
    }),
  );
  return <Playground sources={sources} highlighted={highlighted} catalog={getCatalog(sources)} />;
}
