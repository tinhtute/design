import { notFound } from 'next/navigation';
import { DocsShell } from '@/components/docs-shell';
import { getDoc, getDocNeighbours, getDocs, getDocSlugs } from '@/lib/docs';
import { renderMarkdown } from '@/lib/markdown';

export function generateStaticParams() {
  return getDocSlugs().map((slug) => ({ slug }));
}

export default async function DocsTopicPage({ params }: PageProps<'/docs/[slug]'>) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const docs = getDocs();
  const html = await renderMarkdown(doc.markdown);
  const { previous, next } = getDocNeighbours(doc.slug);

  return <DocsShell doc={doc} docs={docs} previous={previous} next={next} html={html} />;
}
