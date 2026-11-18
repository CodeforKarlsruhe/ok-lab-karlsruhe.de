import { getCollection, type CollectionEntry } from 'astro:content';
import { parseDateSafe, getEffectiveEventDate, getEventPrimaryDate } from './events';
import { stripMarkdown } from './qrcode';

export interface ProjectListItem {
  lab: string;
  title: string;
  year: string;
  date: string;
  categories: string[];
  status: string;
  link: string;
  img: string;
  teaser: string;
  lang: string;
}

export interface ProjectListPayload {
  name: string;
  version: number;
  lab: {
    city: string;
    url: string;
    members: string[];
    socials: {
      github: string;
    };
  };
  projects: ProjectListItem[];
}

const DEFAULT_BASE_URL = 'https://ok-lab-karlsruhe.de';

const CODEFOR_CATEGORIES = ['environment', 'politics', 'society', 'mobility'];

const CATEGORY_MAP: Record<string, string[]> = {
  'Umwelt & Klima': ['environment'],
  Politik: ['politics'],
  Barrierefreiheit: ['society', 'mobility'],
  'Urban Data': ['mobility', 'society'],
  'Open Data': ['politics', 'society'],
  'Civic Tech': ['politics', 'society'],
};

function formatItemDate(dateVal?: string | Date | null): { year: string; date: string } {
  if (!dateVal) {
    const now = new Date();
    const y = String(now.getFullYear());
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return { year: y, date: `${y}${m}${d}` };
  }
  const dObj = parseDateSafe(dateVal);
  if (isNaN(dObj.getTime())) {
    const now = new Date();
    const y = String(now.getFullYear());
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return { year: y, date: `${y}${m}${d}` };
  }
  const y = String(dObj.getFullYear());
  const m = String(dObj.getMonth() + 1).padStart(2, '0');
  const d = String(dObj.getDate()).padStart(2, '0');
  return { year: y, date: `${y}${m}${d}` };
}

function formatTeaser(teaser?: string, body?: string): string {
  const raw = teaser || (body ? stripMarkdown(body) : '');
  const clean = raw
    .replace(/<[^>]+>/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length > 200) {
    return clean.slice(0, 200).trimEnd() + ' ...';
  }
  return clean;
}

function formatImageUrl(image: string | null | undefined, baseUrl: string): string {
  if (!image) {
    return `${baseUrl}/assets/images/okl.svg`;
  }
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const cleanPath = image.startsWith('/') ? image : `/${image}`;
  return `${baseUrl}${cleanPath}`;
}

function getProjectStatus(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'fertig':
    case 'archived':
    case 'past':
      return 'Abgeschlossen';
    case 'active':
    case 'laufend':
    case 'recurring':
    default:
      return 'Laufend';
  }
}

function getEventStatus(status?: string, eventDateStr?: string | null): string {
  if (status === 'past') return 'Abgeschlossen';
  if (status === 'active' || status === 'recurring') return 'Laufend';
  if (eventDateStr) {
    const d = parseDateSafe(eventDateStr);
    if (!isNaN(d.getTime()) && d.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      return 'Abgeschlossen';
    }
  }
  return 'Laufend';
}

export function generateProjectList({
  projects,
  events,
  persons,
  baseUrl = DEFAULT_BASE_URL,
}: {
  projects: CollectionEntry<'projects'>[];
  events: CollectionEntry<'events'>[];
  persons: CollectionEntry<'persons'>[];
  baseUrl?: string;
}): ProjectListPayload {
  const normalizedBase = baseUrl.replace(/\/+$/, '');

  const members = persons
    .filter((p) => p.data?.isCoreTeam)
    .map((p) => p.data.name.replace(/^Dr\.\s*/, '').trim())
    .filter(Boolean);

  // 1. Own projects (scope: internal)
  const ownProjects = projects.filter((p) => p.data.scope === 'internal');
  const projectItems: ProjectListItem[] = ownProjects.map((p) => {
    const { year, date } = formatItemDate(p.data.date);
    const categories = CATEGORY_MAP[p.data.category] || CODEFOR_CATEGORIES;

    return {
      lab: 'OK Lab Karlsruhe',
      title: p.data.title,
      year,
      date,
      categories,
      status: getProjectStatus(p.data.status),
      link: `${normalizedBase}/projekte/${p.id}`,
      img: formatImageUrl(p.data.image, normalizedBase),
      teaser: formatTeaser(p.data.teaser, p.body),
      lang: 'de',
    };
  });

  // 2. Own events (organized by ok-lab-karlsruhe)
  const ownEvents = events.filter(
    (e) => !e.data.organizationIds || e.data.organizationIds.includes('ok-lab-karlsruhe')
  );
  const eventItems: ProjectListItem[] = ownEvents.map((e) => {
    const effDate = getEffectiveEventDate(e) || getEventPrimaryDate(e);
    const { year, date } = formatItemDate(effDate);

    return {
      lab: 'OK Lab Karlsruhe',
      title: e.data.title,
      year,
      date,
      categories: CODEFOR_CATEGORIES,
      status: getEventStatus(e.data.status, effDate),
      link: `${normalizedBase}/events/${e.id}`,
      img: formatImageUrl(e.data.image, normalizedBase),
      teaser: formatTeaser(e.data.teaser, e.body),
      lang: 'de',
    };
  });

  // shortcut: only exports German ('de') entries because site content is currently German-only, expand once multilingual content exists
  const allItems = [...projectItems, ...eventItems].sort((a, b) => b.date.localeCompare(a.date));

  return {
    name: 'Projectlist',
    version: 0.1,
    lab: {
      city: 'Karlsruhe',
      url: normalizedBase,
      members,
      socials: {
        github: 'https://github.com/CodeforKarlsruhe',
      },
    },
    projects: allItems,
  };
}

export async function buildProjectList(baseUrl = DEFAULT_BASE_URL): Promise<ProjectListPayload> {
  const [projects, events, persons] = await Promise.all([
    getCollection('projects'),
    getCollection('events'),
    getCollection('persons'),
  ]);

  return generateProjectList({ projects, events, persons, baseUrl });
}
