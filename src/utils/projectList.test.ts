import { describe, it, expect, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { generateProjectList } from './projectList';
import type { CollectionEntry } from 'astro:content';

function mockProject(
  id: string,
  overrides: Partial<CollectionEntry<'projects'>['data']> = {},
  body = ''
): CollectionEntry<'projects'> {
  return {
    id,
    collection: 'projects',
    body,
    data: {
      title: `Project ${id}`,
      teaser: `Teaser for ${id}`,
      scope: 'internal',
      category: 'Umwelt & Klima',
      status: 'active',
      date: '2026-08-01',
      tags: [],
      personIds: [],
      organizationIds: [],
      datasetIds: [],
      relatedProjectIds: [],
      externalLinks: [],
      featured: false,
      press: [],
      image: `/assets/images/projects/${id}.png`,
      ...overrides,
    },
  } as CollectionEntry<'projects'>;
}

function mockEvent(
  id: string,
  overrides: Partial<CollectionEntry<'events'>['data']> = {},
  body = ''
): CollectionEntry<'events'> {
  return {
    id,
    collection: 'events',
    body,
    data: {
      title: `Event ${id}`,
      teaser: `Teaser for event ${id}`,
      status: 'active',
      category: 'Workshop',
      tags: [],
      dates: ['2026-09-15'],
      isRegularMeeting: false,
      featured: false,
      pinned: false,
      registrationOpen: false,
      personIds: [],
      organizationIds: ['ok-lab-karlsruhe'],
      projectIds: [],
      datasetIds: [],
      externalLinks: [],
      galleryImages: [],
      facts: [],
      schedule: [],
      time: '19:00',
      image: `/assets/images/events/${id}.png`,
      ...overrides,
    },
  } as CollectionEntry<'events'>;
}

function mockPerson(id: string, name: string, isCoreTeam = false): CollectionEntry<'persons'> {
  return {
    id,
    collection: 'persons',
    data: {
      name,
      role: 'Member',
      isCoreTeam,
      image: '/assets/images/okl.svg',
    },
  } as CollectionEntry<'persons'>;
}

describe('generateProjectList', () => {
  it('generates a valid projectlist payload matching codefor.de requirements', () => {
    const projects = [
      mockProject('p-internal', { scope: 'internal', date: '2026-07-28', status: 'active' }),
      mockProject('p-external', { scope: 'external', date: '2026-08-01' }),
      mockProject('p-idea', { scope: 'idea', date: '2026-08-02' }),
    ];

    const events = [
      mockEvent('e-okl', {
        dates: ['2026-10-17'],
        organizationIds: ['ok-lab-karlsruhe'],
        status: 'active',
      }),
      mockEvent('e-other', {
        dates: ['2026-11-01'],
        organizationIds: ['other-org'],
      }),
    ];

    const persons = [
      mockPerson('andreas', 'Dr. Andreas Kugel', true),
      mockPerson('max', 'Max Mustermann', false),
    ];

    const payload = generateProjectList({
      projects,
      events,
      persons,
      baseUrl: 'https://ok-lab-karlsruhe.de',
    });

    expect(payload.name).toBe('Projectlist');
    expect(payload.version).toBe(0.1);
    expect(payload.lab.city).toBe('Karlsruhe');
    expect(payload.lab.url).toBe('https://ok-lab-karlsruhe.de');
    expect(payload.lab.members).toContain('Andreas Kugel');
    expect(payload.lab.members).not.toContain('Max Mustermann');
    expect(payload.lab.socials.github).toBe('https://github.com/CodeforKarlsruhe');

    // Only internal projects and okl events are included
    expect(payload.projects).toHaveLength(2);

    // Sorted descending by date
    expect(payload.projects[0].title).toBe('Event e-okl');
    expect(payload.projects[0].date).toBe('20261017');
    expect(payload.projects[0].year).toBe('2026');
    expect(payload.projects[0].status).toBe('Laufend');
    expect(payload.projects[0].link).toBe('https://ok-lab-karlsruhe.de/events/e-okl');
    expect(payload.projects[0].lang).toBe('de');

    expect(payload.projects[1].title).toBe('Project p-internal');
    expect(payload.projects[1].date).toBe('20260728');
    expect(payload.projects[1].year).toBe('2026');
    expect(payload.projects[1].link).toBe('https://ok-lab-karlsruhe.de/projekte/p-internal');
    expect(payload.projects[1].lang).toBe('de');
  });

  it('maps categories correctly to codefor taxonomy', () => {
    const projects = [
      mockProject('p-umwelt', { category: 'Umwelt & Klima' }),
      mockProject('p-politik', { category: 'Politik' }),
      mockProject('p-barrier', { category: 'Barrierefreiheit' }),
    ];

    const payload = generateProjectList({
      projects,
      events: [],
      persons: [],
    });

    const byId = (id: string) =>
      payload.projects.find((p) => p.link.endsWith(`/${id}`))?.categories;

    expect(byId('p-umwelt')).toEqual(['environment']);
    expect(byId('p-politik')).toEqual(['politics']);
    expect(byId('p-barrier')).toEqual(['society', 'mobility']);
  });

  it('formats image fallbacks and truncates long teasers', () => {
    const longText = 'A'.repeat(250);
    const projects = [mockProject('p-fallback', { image: null, teaser: longText })];

    const payload = generateProjectList({
      projects,
      events: [],
      persons: [],
      baseUrl: 'https://ok-lab-karlsruhe.de',
    });

    const item = payload.projects[0];
    expect(item.img).toBe('https://ok-lab-karlsruhe.de/assets/images/okl.svg');
    expect(item.teaser.length).toBeLessThanOrEqual(204);
    expect(item.teaser.endsWith('...')).toBe(true);
  });
});
