import { DocsShell } from '@/components/docs-shell';
import { assertDocsComplete, getDoc, getDocNeighbours, getDocs } from '@/lib/docs';
import { renderMarkdown } from '@/lib/markdown';

export default async function DocsIndexPage() {
  assertDocsComplete();
  const docs = getDocs();
  const doc = getDoc('getting-started');
  if (!doc) throw new Error('docs: getting-started.md is missing');
  const html = await renderMarkdown(doc.markdown);
  const { previous, next } = getDocNeighbours(doc.slug);

  return <DocsShell doc={doc} docs={docs} previous={previous} next={next} html={html} />;
}
