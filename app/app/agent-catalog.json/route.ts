import { getCatalog } from '@/lib/agent-catalog';

export const dynamic = 'force-static';

export function GET() {
  return Response.json({ schemaVersion: 1, items: getCatalog() });
}
