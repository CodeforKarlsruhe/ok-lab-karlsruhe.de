import type { APIContext } from 'astro';
import { buildProjectList } from '../../utils/projectList';

export const prerender = true;

export async function GET(context: APIContext) {
  const baseUrl = context.site ? context.site.origin : 'https://ok-lab-karlsruhe.de';
  const data = await buildProjectList(baseUrl);

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
