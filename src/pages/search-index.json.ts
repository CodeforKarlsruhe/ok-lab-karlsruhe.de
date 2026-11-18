import { buildSearchDocs } from '../utils/searchDocs';
import type { SearchDoc } from '../utils/search';

export const prerender = true;

export type { SearchDoc };

export async function GET() {
  const docs = await buildSearchDocs();

  return new Response(JSON.stringify(docs), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
