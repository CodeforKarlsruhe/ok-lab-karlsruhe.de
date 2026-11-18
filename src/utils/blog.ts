import { getCollection, type CollectionEntry } from 'astro:content';
import { parseDateSafe } from './events';

export const FEDIVERSE_DEFAULT_URL = 'https://feddit.org/c/opendata_ka';
export const FEDIVERSE_PROFILE_URL = 'https://feddit.org/u/codeforka';

export function formatBlogDate(date: string | Date): string {
  const parsed = parseDateSafe(date);
  if (isNaN(parsed.getTime())) return String(date || '');
  return parsed.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export async function loadBlogContext() {
  const [persons, projects, events, datasets] = await Promise.all([
    getCollection('persons'),
    getCollection('projects'),
    getCollection('events'),
    getCollection('datasets'),
  ]);

  return {
    personMap: new Map(persons.map((p) => [p.id, p])),
    projectMap: new Map(projects.map((p) => [p.id, p])),
    eventMap: new Map(events.map((e) => [e.id, e])),
    datasetMap: new Map(datasets.map((d) => [d.id, d])),
  };
}

export type BlogContext = Awaited<ReturnType<typeof loadBlogContext>>;

const ENTITY_PREFIX: Record<'project' | 'event' | 'dataset', string> = {
  project: '/projekte/',
  event: '/events/',
  dataset: '/daten/',
};
const ENTITY_END_BOUNDARY = '(?:[/?#"\'\\)\\s]|$)';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractBodyEntityIds(
  body: string | undefined,
  entityType: 'project' | 'event' | 'dataset'
): string[] {
  if (!body) return [];
  const pattern = new RegExp(
    `${escapeRegExp(ENTITY_PREFIX[entityType])}([a-zA-Z0-9_-]+)${ENTITY_END_BOUNDARY}`,
    'g'
  );
  const ids = new Set<string>();
  for (const match of body.matchAll(pattern)) {
    if (match[1]) ids.add(match[1]);
  }
  return Array.from(ids);
}

function resolveLinkedEntities<T>(
  frontmatterIds: string[] | undefined,
  body: string | undefined,
  entityType: 'project' | 'event' | 'dataset',
  entityMap: Map<string, T>
): T[] {
  const seen = new Set<string>();
  for (const id of [...(frontmatterIds || []), ...extractBodyEntityIds(body, entityType)]) {
    if (entityMap.has(id)) seen.add(id);
  }
  return Array.from(seen, (id) => entityMap.get(id)!);
}

export function resolveBlogMeta(post: CollectionEntry<'blog'>, ctx: BlogContext) {
  const author = post.data.authorId ? ctx.personMap.get(post.data.authorId) : undefined;
  const linkedProjects = resolveLinkedEntities(
    post.data.projectIds,
    post.body,
    'project',
    ctx.projectMap
  );
  const linkedEvents = resolveLinkedEntities(post.data.eventIds, post.body, 'event', ctx.eventMap);
  const linkedDatasets = resolveLinkedEntities(
    post.data.datasetIds,
    post.body,
    'dataset',
    ctx.datasetMap
  );

  return {
    author,
    linkedProjects,
    linkedEvents,
    linkedDatasets,
    formattedDate: formatBlogDate(post.data.date),
    discussionUrl: post.data.fediverseUrl || FEDIVERSE_DEFAULT_URL,
  };
}

export function getBlogPostsForEntity(
  posts: CollectionEntry<'blog'>[],
  entityType: 'project' | 'event' | 'dataset',
  entityId: string
): CollectionEntry<'blog'>[] {
  const escapedPath = escapeRegExp(`${ENTITY_PREFIX[entityType]}${entityId}`);
  const bodyPattern = new RegExp(`${escapedPath}${ENTITY_END_BOUNDARY}`);
  return posts
    .filter((post) => {
      const ids =
        entityType === 'project'
          ? post.data.projectIds
          : entityType === 'event'
            ? post.data.eventIds
            : post.data.datasetIds;
      return (ids || []).includes(entityId) || bodyPattern.test(post.body || '');
    })
    .sort((a, b) => parseDateSafe(b.data.date).getTime() - parseDateSafe(a.data.date).getTime());
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripMarkdown(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*>+\s?/gm, '')
    .replace(/[\r\n#*_`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an RSS 2.0 XML feed for blog posts, sorted newest-first.
 */
export function buildBlogRssXml(
  posts: CollectionEntry<'blog'>[],
  siteUrl = 'https://ok-lab-karlsruhe.de'
): string {
  const origin = siteUrl.replace(/\/$/, '');
  const sorted = [...posts].sort(
    (a, b) => parseDateSafe(b.data.date).getTime() - parseDateSafe(a.data.date).getTime()
  );

  const items = sorted
    .map((post) => {
      const plainBody = stripMarkdown(post.body || '');
      const explicitTitle = post.data.title?.trim();
      const fallbackTitle =
        plainBody.length > 70
          ? `${plainBody.slice(0, 67).trimEnd()}…`
          : plainBody || `Blog-Beitrag vom ${formatBlogDate(post.data.date)}`;
      const title = explicitTitle || fallbackTitle;
      const link = `${origin}/blog/${post.id}`;
      const parsedDate = parseDateSafe(post.data.date);
      const pubDateTag = !isNaN(parsedDate.getTime())
        ? `\n      <pubDate>${parsedDate.toUTCString()}</pubDate>`
        : '';

      return [
        '    <item>',
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>${pubDateTag}`,
        `      <description>${escapeXml(plainBody || title)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>OK Lab Karlsruhe — Blog &amp; Impulse</title>',
    `    <link>${escapeXml(`${origin}/blog`)}</link>`,
    '    <description>Kurze Eindrücke von Veranstaltungen, spannende Links und Neuigkeiten aus dem OK Lab Karlsruhe.</description>',
    '    <language>de-de</language>',
    `    <atom:link href="${escapeXml(`${origin}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
