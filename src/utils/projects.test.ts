import { describe, it, expect } from 'vitest';
import { getRelatedProjects, getLighthouseProjects } from './projects';
import type { CollectionEntry } from 'astro:content';

function mockProject(
  id: string,
  category: string,
  scope: 'internal' | 'external' | 'idea' = 'internal',
  relatedProjectIds: any[] = []
): CollectionEntry<'projects'> {
  return {
    id,
    collection: 'projects',
    data: {
      title: `Project ${id}`,
      teaser: `Teaser for ${id}`,
      scope,
      category: category as any,
      relatedProjectIds,
      tags: [],
      personIds: [],
      organizationIds: [],
      datasetIds: [],
      externalLinks: [],
      featured: false,
      press: [],
      status: 'active',
    },
  } as CollectionEntry<'projects'>;
}

describe('getRelatedProjects', () => {
  it('returns explicit related projects and title "Verknüpfte Projekte"', () => {
    const current = mockProject('p1', 'Urban Data', 'internal', ['p2', 'p3']);
    const p2 = mockProject('p2', 'Open Data', 'internal');
    const p3 = mockProject('p3', 'Politik', 'external');
    const p4 = mockProject('p4', 'Urban Data', 'internal');

    const result = getRelatedProjects(current, [current, p2, p3, p4]);

    expect(result.type).toBe('explicit');
    expect(result.title).toBe('Verknüpfte Projekte');
    expect(result.projects.map((p) => p.id)).toEqual(['p2', 'p3']);
  });

  it('returns same-category projects and title "Weitere <Kategorie> Projekte" when no explicit related projects exist', () => {
    const current = mockProject('p1', 'Urban Data', 'internal');
    const p2 = mockProject('p2', 'Urban Data', 'internal');
    const p3 = mockProject('p3', 'Urban Data', 'external');
    const p4 = mockProject('p4', 'Politik', 'internal');

    const result = getRelatedProjects(current, [current, p2, p3, p4]);

    expect(result.type).toBe('category');
    expect(result.title).toBe('Weitere Urban Data Projekte');
    expect(result.projects.map((p) => p.id)).toEqual(['p2', 'p3']);
  });

  it('falls back to other projects and title "Weitere Projekte" if no project in the same category exists', () => {
    const current = mockProject('p1', 'Urban Data', 'internal');
    const p2 = mockProject('p2', 'Umwelt & Klima', 'internal');
    const p3 = mockProject('p3', 'Politik', 'external');

    const result = getRelatedProjects(current, [current, p2, p3]);

    expect(result.type).toBe('fallback');
    expect(result.title).toBe('Weitere Projekte');
    expect(result.projects.map((p) => p.id)).toEqual(['p2', 'p3']);
  });

  it('handles idea scope by finding other ideas in the same category', () => {
    const currentIdea = mockProject('i1', 'Umwelt & Klima', 'idea');
    const ideaSameCat = mockProject('i2', 'Umwelt & Klima', 'idea');
    const projectSameCat = mockProject('p1', 'Umwelt & Klima', 'internal');

    const result = getRelatedProjects(currentIdea, [currentIdea, ideaSameCat, projectSameCat]);

    expect(result.type).toBe('category');
    expect(result.title).toBe('Weitere Umwelt & Klima Ideen');
    expect(result.projects.map((p) => p.id)).toEqual(['i2']);
  });

  it('falls back to any ideas with title "Weitere Ideen" if no same category idea exists', () => {
    const currentIdea = mockProject('i1', 'Open Data', 'idea');
    const otherIdea = mockProject('i2', 'Politik', 'idea');
    const regularProject = mockProject('p1', 'Open Data', 'internal');

    const result = getRelatedProjects(currentIdea, [currentIdea, otherIdea, regularProject]);

    expect(result.type).toBe('fallback');
    expect(result.title).toBe('Weitere Ideen');
    expect(result.projects.map((p) => p.id)).toEqual(['i2']);
  });

  it('returns explicit related projects for ideas too', () => {
    const currentIdea = mockProject('i1', 'Urban Data', 'idea', ['p2']);
    const p2 = mockProject('p2', 'Open Data', 'internal');
    const result = getRelatedProjects(currentIdea, [currentIdea, p2]);

    expect(result.type).toBe('explicit');
    expect(result.title).toBe('Verknüpfte Projekte');
    expect(result.projects.map((p) => p.id)).toEqual(['p2']);
  });

  it('respects the limit argument', () => {
    const current = mockProject('p1', 'Civic Tech', 'internal');
    const p2 = mockProject('p2', 'Civic Tech', 'internal');
    const p3 = mockProject('p3', 'Civic Tech', 'internal');
    const p4 = mockProject('p4', 'Civic Tech', 'internal');

    const result = getRelatedProjects(current, [current, p2, p3, p4], 2);

    expect(result.projects).toHaveLength(2);
    expect(result.projects.map((p) => p.id)).toEqual(['p2', 'p3']);
  });

  it('never includes the current project itself', () => {
    const current = mockProject('p1', 'Urban Data', 'internal', ['p1']);
    const result = getRelatedProjects(current, [current]);

    expect(result.projects).toHaveLength(0);
  });
});

describe('getLighthouseProjects', () => {
  it('selects configured projects first and fills remaining slots with newest featured ones', () => {
    const makeProj = (id: string, featured = false, date?: string) => ({
      ...mockProject(id, 'Civic Tech', 'internal'),
      data: {
        ...mockProject(id, 'Civic Tech', 'internal').data,
        featured,
        date,
      },
    });
    const pool = [
      makeProj('a', true, '2024-01-01'),
      makeProj('b', true, '2026-01-01'),
      makeProj('c', false, '2026-05-01'),
      makeProj('picked', false),
    ];

    const selected = getLighthouseProjects(pool, ['picked', 'missing']);
    expect(selected.map((p) => p.id)).toEqual(['picked', 'b', 'a']);
  });
});
