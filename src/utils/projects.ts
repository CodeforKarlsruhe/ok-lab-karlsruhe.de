import type { CollectionEntry } from 'astro:content';

export type RelatedProjectsType = 'explicit' | 'category' | 'fallback';

export interface RelatedProjectsResult {
  projects: CollectionEntry<'projects'>[];
  title: string;
  type: RelatedProjectsType;
}

/**
 * Resolves related projects (or ideas) for a given project entry.
 *
 * Priority order:
 * 1. Explicitly linked projects via `relatedProjectIds` (if defined and non-empty).
 * 2. Projects within the same category (matching scope: idea vs non-idea).
 * 3. Global fallback to other projects (matching scope: idea vs non-idea).
 */
export function getRelatedProjects(
  currentProject: CollectionEntry<'projects'>,
  allProjects: CollectionEntry<'projects'>[],
  limit = 3
): RelatedProjectsResult {
  const isIdea = currentProject.data.scope === 'idea';
  const explicitRelatedIds = currentProject.data.relatedProjectIds || [];

  // 1. Explicit related projects
  if (explicitRelatedIds.length > 0) {
    const explicitProjects = explicitRelatedIds
      .map((pRef) => {
        const id = typeof pRef === 'string' ? pRef : (pRef as any)?.id || (pRef as any)?.slug;
        return allProjects.find((p) => p.id === id);
      })
      .filter(
        (p): p is CollectionEntry<'projects'> => p !== undefined && p.id !== currentProject.id
      )
      .slice(0, limit);

    if (explicitProjects.length > 0) {
      return {
        projects: explicitProjects,
        title: 'Verknüpfte Projekte',
        type: 'explicit',
      };
    }
  }

  // 2. Same category resolution
  const categoryProjects = allProjects
    .filter((p) => {
      if (p.id === currentProject.id) return false;
      if (isIdea) {
        return p.data.scope === 'idea' && p.data.category === currentProject.data.category;
      }
      return p.data.scope !== 'idea' && p.data.category === currentProject.data.category;
    })
    .slice(0, limit);

  if (categoryProjects.length > 0) {
    const categoryName = currentProject.data.category;
    const title = isIdea ? `Weitere ${categoryName} Ideen` : `Weitere ${categoryName} Projekte`;

    return {
      projects: categoryProjects,
      title,
      type: 'category',
    };
  }

  // 3. Global fallback
  const fallbackProjects = allProjects
    .filter((p) => {
      if (p.id === currentProject.id) return false;
      if (isIdea) {
        return p.data.scope === 'idea';
      }
      return p.data.scope !== 'idea';
    })
    .slice(0, limit);

  const title = isIdea ? 'Weitere Ideen' : 'Weitere Projekte';

  return {
    projects: fallbackProjects,
    title,
    type: 'fallback',
  };
}

const DEFAULT_LIGHTHOUSE_IDS = ['ris-ki', 'platachat', 'klimadashboard'];

/** Selects up to 3 curated lighthouse projects, filling remaining slots with recent featured projects. */
export function getLighthouseProjects(
  allProjects: CollectionEntry<'projects'>[],
  configuredIds?: string[]
): CollectionEntry<'projects'>[] {
  const targetIds =
    configuredIds && configuredIds.length > 0 ? configuredIds : DEFAULT_LIGHTHOUSE_IDS;
  const selected = targetIds
    .map((id) => allProjects.find((p) => p.id === id))
    .filter((p): p is CollectionEntry<'projects'> => Boolean(p));

  if (selected.length < 3) {
    const used = new Set(selected.map((p) => p.id));
    const sortedFallbacks = allProjects
      .filter((p) => !used.has(p.id) && p.data.featured)
      .sort((a, b) => {
        const da = a.data.date ? new Date(a.data.date).getTime() : 0;
        const db = b.data.date ? new Date(b.data.date).getTime() : 0;
        return db - da;
      });
    for (const fp of sortedFallbacks) {
      if (selected.length >= 3) break;
      selected.push(fp);
    }
  }
  return selected;
}
