import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl, highlightHtml, typeIcons, type SearchDoc } from './search';

describe('search utils', () => {
  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")&\'</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&amp;&#39;&lt;/script&gt;'
      );
    });

    it('handles empty string', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('allows relative paths and anchors', () => {
      expect(sanitizeUrl('/projekte/klima')).toBe('/projekte/klima');
      expect(sanitizeUrl('#details')).toBe('#details');
    });

    it('allows safe http and https URLs', () => {
      expect(sanitizeUrl('https://example.com/api?q=1')).toBe('https://example.com/api?q=1');
      expect(sanitizeUrl('http://insecure.org')).toBe('http://insecure.org');
      expect(sanitizeUrl('mailto:info@ok-lab-karlsruhe.de')).toBe(
        'mailto:info@ok-lab-karlsruhe.de'
      );
    });

    it('blocks dangerous javascript: URIs', () => {
      expect(sanitizeUrl('javascript:alert(document.cookie)')).toBe('#');
      expect(
        sanitizeUrl('javascript:/*--></title></style></textarea>*/<script>alert(1)</script>')
      ).toBe('#');
    });

    it('blocks invalid/unsupported protocols', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
    });

    it('handles empty or undefined values', () => {
      expect(sanitizeUrl('')).toBe('#');
      expect(sanitizeUrl(undefined)).toBe('#');
    });
  });

  describe('highlightHtml', () => {
    it('highlights matching term with strong tag', () => {
      const result = highlightHtml('Offene Daten für Karlsruhe', 'Daten');
      expect(result).toBe('Offene <strong class="highlight-match">Daten</strong> für Karlsruhe');
    });

    it('is case-insensitive', () => {
      const result = highlightHtml('Karlsruhe Open Data', 'karlsruhe');
      expect(result).toBe('<strong class="highlight-match">Karlsruhe</strong> Open Data');
    });

    it('handles multiple search terms', () => {
      const result = highlightHtml('Klima und Mobilität in Karlsruhe', 'Klima Mobilität');
      expect(result).toBe(
        '<strong class="highlight-match">Klima</strong> und <strong class="highlight-match">Mobilität</strong> in Karlsruhe'
      );
    });

    it('does not corrupt HTML entities when searching for entity substrings', () => {
      // If user searches "amp", it must not corrupt &amp;
      const result = highlightHtml('Klima & Umwelt', 'amp');
      expect(result).toBe('Klima &amp; Umwelt');
    });

    it('safely escapes special characters inside matching query', () => {
      const result = highlightHtml('Comparison: A < B', '<');
      expect(result).toBe('Comparison: A <strong class="highlight-match">&lt;</strong> B');
    });

    it('returns escaped string when query is empty', () => {
      expect(highlightHtml('A & B', '')).toBe('A &amp; B');
      expect(highlightHtml('A & B', '   ')).toBe('A &amp; B');
    });
  });

  describe('SearchDoc person filtering & indexing', () => {
    const sampleDocs = [
      {
        id: 'project-baum',
        title: 'Baumkataster',
        description: 'Baumdaten visualisieren',
        type: 'project' as const,
        typeLabel: 'Lab-Projekt',
        url: '/projekte/baumkataster',
        personIds: ['andreas-kugel', 'daniel-schwarz'],
        personNames: ['Dr. Andreas Kugel', 'Daniel Schwarz'],
      },
      {
        id: 'event-odd24',
        title: 'Open Data Day 2024',
        description: 'Hackathon für Open Data',
        type: 'event' as const,
        typeLabel: 'Event',
        url: '/events/odd24',
        personIds: ['andreas-kugel', 'martin-weis'],
        personNames: ['Dr. Andreas Kugel', 'Martin Weis'],
      },
      {
        id: 'dataset-fahrrad',
        title: 'Fahrradunfälle',
        description: 'Unfalldaten der Polizei',
        type: 'dataset' as const,
        typeLabel: 'Datensatz',
        url: '/daten/ka-fahrradunfaelle',
        personIds: ['max-liesegang'],
        personNames: ['Maximilian Liesegang'],
      },
    ];

    it('filters documents accurately by personId', () => {
      const andreasDocs = sampleDocs.filter((doc) => doc.personIds?.includes('andreas-kugel'));
      expect(andreasDocs).toHaveLength(2);
      expect(andreasDocs.map((d) => d.id)).toEqual(['project-baum', 'event-odd24']);

      const maxDocs = sampleDocs.filter((doc) => doc.personIds?.includes('max-liesegang'));
      expect(maxDocs).toHaveLength(1);
      expect(maxDocs[0].id).toBe('dataset-fahrrad');
    });

    it('finds documents by person name via Fuse.js keys', async () => {
      const Fuse = (await import('fuse.js')).default;
      const fuse = new Fuse(sampleDocs, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'personNames', weight: 0.25 },
        ],
        threshold: 0.35,
      });

      const results = fuse.search('Andreas');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.map((r) => r.item.id)).toContain('project-baum');
      expect(results.map((r) => r.item.id)).toContain('event-odd24');

      const maxResults = fuse.search('Liesegang');
      expect(maxResults).toHaveLength(1);
      expect(maxResults[0].item.id).toBe('dataset-fahrrad');
    });
  });

  describe('tag & organization search support', () => {
    it('provides SVG icon paths for tag, organization and blog types', () => {
      expect(typeIcons.tag).toBeTruthy();
      expect(typeIcons.organization).toBeTruthy();
      expect(typeIcons.blog).toBeTruthy();
    });

    it('filters SearchDocs by tag and organizationIds and matches pill groups', async () => {
      const docs: SearchDoc[] = [
        {
          id: 'project-1',
          title: 'Klimadashboard',
          description: 'Klima',
          type: 'project',
          typeLabel: 'Lab-Projekt',
          url: '/projekte/klimadashboard',
          tags: ['Klima', 'Open Data'],
          organizationIds: ['stadt-karlsruhe'],
          organizationNames: ['Stadt Karlsruhe'],
        },
        {
          id: 'idea-1',
          title: 'Baum-Idee',
          description: 'Idee',
          type: 'idea',
          typeLabel: 'Ideenschmiede',
          url: '/projekte/baum-idee',
          tags: ['Umwelt'],
          organizationIds: [],
          organizationNames: [],
        },
        {
          id: 'portal-1',
          title: 'Transparenzportal',
          description: 'Portal',
          type: 'portal',
          typeLabel: 'Portal',
          url: 'https://transparenz.karlsruhe.de',
          tags: [],
        },
      ];

      const matchesTag = (tag: string) =>
        docs.filter((d) => d.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()));
      expect(matchesTag('open data').map((d) => d.id)).toEqual(['project-1']);

      const byOrg = docs.filter((d) => d.organizationIds?.includes('stadt-karlsruhe'));
      expect(byOrg.map((d) => d.id)).toEqual(['project-1']);

      const projectGroup = docs.filter((d) => d.type === 'project' || d.type === 'idea');
      expect(projectGroup.map((d) => d.id)).toEqual(['project-1', 'idea-1']);

      const datasetGroup = docs.filter((d) => d.type === 'dataset' || d.type === 'portal');
      expect(datasetGroup.map((d) => d.id)).toEqual(['portal-1']);

      const blogDoc: SearchDoc = {
        id: 'blog-1',
        title: 'Zu Gast bei Effekte',
        description: 'Rückblick',
        type: 'blog',
        typeLabel: 'Blog',
        url: '/blog/2026-effekte',
        tags: ['Open Data'],
      };
      expect([...docs, blogDoc].filter((d) => d.type === 'blog').map((d) => d.id)).toEqual([
        'blog-1',
      ]);
    });
  });
});
