import { describe, it, expect, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { getBlogPostsForEntity, extractBodyEntityIds, buildBlogRssXml } from './blog';

describe('getBlogPostsForEntity', () => {
  const mockPosts = [
    {
      id: 'post-old',
      body: 'Wir haben [Baumkataster](/projekte/baumkataster) und [Daten](/daten/ka-baeume) genutzt.',
      data: {
        date: '2025-05-01',
        projectIds: [],
        eventIds: ['odd-2025'],
        datasetIds: [],
      },
    },
    {
      id: 'post-new',
      body: 'Siehe [anderes Projekt](/projekte/baumkataster-v2).',
      data: {
        date: '2026-03-10',
        projectIds: ['baumkataster'],
        eventIds: [],
        datasetIds: ['ka-radverkehr'],
      },
    },
    {
      id: 'post-other',
      body: 'Nur [Baumkataster v2](/projekte/baumkataster-v2) erwähnt.',
      data: {
        date: '2026-04-01',
        projectIds: [],
        eventIds: [],
        datasetIds: [],
      },
    },
  ] as any[];

  it('matches frontmatter IDs and exact body links without substring false positives, sorted newest first', () => {
    const projectMatches = getBlogPostsForEntity(mockPosts, 'project', 'baumkataster');
    expect(projectMatches.map((p) => p.id)).toEqual(['post-new', 'post-old']);

    const eventMatches = getBlogPostsForEntity(mockPosts, 'event', 'odd-2025');
    expect(eventMatches.map((p) => p.id)).toEqual(['post-old']);

    const datasetMatches = getBlogPostsForEntity(mockPosts, 'dataset', 'ka-baeume');
    expect(datasetMatches.map((p) => p.id)).toEqual(['post-old']);
  });

  it('extracts deduplicated entity IDs from markdown body links', () => {
    const body =
      'Siehe [A](/projekte/baumkataster) und [B](/projekte/baumkataster#info) sowie [C](/events/odd24?ref=1).';
    expect(extractBodyEntityIds(body, 'project')).toEqual(['baumkataster']);
    expect(extractBodyEntityIds(body, 'event')).toEqual(['odd24']);
    expect(extractBodyEntityIds(body, 'dataset')).toEqual([]);
  });
});

describe('buildBlogRssXml', () => {
  it('sorts posts newest-first, escapes XML, falls back from empty title, and sets permalink guid', () => {
    const mockPosts = [
      {
        id: 'older-post',
        body: 'Spannender **Fund** & [Link](https://example.com) mit <tags> und "Anführungszeichen".',
        data: {
          title: '',
          date: '2025-05-01',
        },
      },
      {
        id: 'newer-post',
        body: 'Inhalt mit & und <script>.',
        data: {
          title: 'Neuer Beitrag & Impulse <2026>',
          date: '2026-03-10',
        },
      },
    ] as any[];

    const xml = buildBlogRssXml(mockPosts, 'https://ok-lab-karlsruhe.de/');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<atom:link href="https://ok-lab-karlsruhe.de/blog/rss.xml"');
    expect(xml).toContain('<title>Neuer Beitrag &amp; Impulse &lt;2026&gt;</title>');
    expect(xml).toContain(
      '<title>Spannender Fund &amp; Link mit &lt;tags&gt; und &quot;Anführungszeichen&quot;.</title>'
    );
    expect(xml).toContain('<link>https://ok-lab-karlsruhe.de/blog/newer-post</link>');
    expect(xml).toContain(
      '<guid isPermaLink="true">https://ok-lab-karlsruhe.de/blog/newer-post</guid>'
    );
    expect(xml).toContain('<link>https://ok-lab-karlsruhe.de/blog/older-post</link>');
    expect(xml).toContain(
      '<guid isPermaLink="true">https://ok-lab-karlsruhe.de/blog/older-post</guid>'
    );
    expect(xml).toContain('<description>Inhalt mit &amp; und &lt;script&gt;.</description>');

    const newerIndex = xml.indexOf('newer-post');
    const olderIndex = xml.indexOf('older-post');
    expect(newerIndex).toBeGreaterThan(-1);
    expect(olderIndex).toBeGreaterThan(newerIndex);
  });
});
