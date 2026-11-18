import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildBlogRssXml } from '../../utils/blog';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('blog');
  const xml = buildBlogRssXml(posts, site?.toString());

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
