import { getCollection } from 'astro:content';
import { getEventPrimaryDate, parseDateSafe } from './events';
import type { SearchDoc } from './search';

const normalizeImage = (img?: string | null): string | undefined => {
  if (!img) return undefined;
  return img.startsWith('/') ? img : '/' + img;
};

export async function buildSearchDocs(): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];

  // Persons & Organizations lookup maps
  const persons = await getCollection('persons');
  const personMap = new Map(persons.map((p) => [p.id, p.data.name]));
  const resolvePersons = (ids: (string | undefined | null)[]) => {
    const validIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
    const names = validIds.map((id) => personMap.get(id) || id);
    return { personIds: validIds, personNames: names };
  };

  const orgs = await getCollection('organizations');
  const orgMap = new Map(orgs.map((o) => [o.id, o.data.name]));
  const resolveOrgs = (ids: (string | undefined | null)[]) => {
    const validIds = [...new Set(ids.filter((id): id is string => Boolean(id)))].filter((id) =>
      orgMap.has(id)
    );
    const names = validIds.map((id) => orgMap.get(id)!);
    return { organizationIds: validIds, organizationNames: names };
  };

  // 1. Projects (Internal, External, Ideas)
  const projects = await getCollection('projects');
  projects.forEach((p) => {
    const isIdea = p.data.scope === 'idea';
    const isExt = p.data.scope === 'external';
    const { personIds, personNames } = resolvePersons(p.data.personIds || []);
    const { organizationIds, organizationNames } = resolveOrgs(p.data.organizationIds || []);
    docs.push({
      id: `project-${p.id}`,
      title: p.data.title,
      description: p.data.teaser || '',
      type: isIdea ? 'idea' : 'project',
      typeLabel: isIdea ? 'Ideenschmiede' : isExt ? 'Empfohlenes Projekt' : 'Lab-Projekt',
      url: `/projekte/${p.id}`,
      category: p.data.category,
      tags: p.data.tags || [],
      image: normalizeImage(p.data.image),
      imageAlt: p.data.imageAlt || p.data.title,
      personIds,
      personNames,
      organizationIds,
      organizationNames,
    });
  });

  // 2. Persons
  persons.forEach((person) => {
    docs.push({
      id: `person-${person.id}`,
      title: person.data.name,
      description: person.data.role,
      type: 'person',
      typeLabel: 'Person',
      url: `/suche?person=${person.id}`,
      category: '',
      tags: ['Person', 'Personen', 'Mitwirkende', 'Mitwirkende:r', person.data.name],
      image: normalizeImage(person.data.image),
      imageAlt: person.data.name,
      personIds: [person.id],
      personNames: [person.data.name],
    });
  });

  // 3. Events
  const events = await getCollection('events');
  events.forEach((e) => {
    const rawDate = getEventPrimaryDate(e);
    const cleanDesc = e.data.teaser || (e.body || '').replace(/[\r\n#*_`]+/g, ' ').slice(0, 200);
    const { personIds, personNames } = resolvePersons(e.data.personIds || []);
    const { organizationIds, organizationNames } = resolveOrgs(e.data.organizationIds || []);
    docs.push({
      id: `event-${e.id}`,
      title: e.data.title,
      description: cleanDesc,
      type: 'event',
      typeLabel: 'Event',
      url: `/events/${e.id}`,
      date: rawDate || undefined,
      category: e.data.category || 'Event',
      tags: e.data.tags || [],
      image: normalizeImage(e.data.image),
      imageAlt: e.data.imageAlt || e.data.title,
      personIds,
      personNames,
      organizationIds,
      organizationNames,
    });
  });

  // 4. Datasets
  const datasets = await getCollection('datasets');
  datasets.forEach((d) => {
    const pubNames = (d.data.publisherIds || []).map((id) => orgMap.get(id) || id).join(', ');
    const { personIds, personNames } = resolvePersons(d.data.personIds || []);
    const { organizationIds, organizationNames } = resolveOrgs(d.data.publisherIds || []);
    docs.push({
      id: `dataset-${d.id}`,
      title: d.data.title,
      description: (d.data.description || d.data.teaser || '')
        .replace(/[\r\n#*_`]+/g, ' ')
        .slice(0, 200),
      type: 'dataset',
      typeLabel: 'Datensatz',
      url: `/daten/${d.id}`,
      category: pubNames ? pubNames.toUpperCase() : 'OPEN DATA',
      tags: d.data.tags || [],
      image: normalizeImage(d.data.image),
      imageAlt: d.data.imageAlt || d.data.title,
      personIds,
      personNames,
      organizationIds,
      organizationNames,
    });
  });

  // 5. Protocols
  const protocols = await getCollection('protocols');
  protocols.forEach((pr) => {
    const formattedDate = parseDateSafe(pr.data.date).toLocaleDateString('de-DE');
    const { personIds, personNames } = resolvePersons([
      pr.data.facilitatorId,
      pr.data.scribeId,
      ...(pr.data.attendeeIds || []),
    ]);
    const decCount = pr.data.decisions?.length || 0;
    const attCount = pr.data.attendeeIds?.length || 0;
    const stats: string[] = [];
    if (attCount > 0) stats.push(`${attCount} Teilnehmende`);
    if (decCount > 0) stats.push(`${decCount} ${decCount === 1 ? 'Beschluss' : 'Beschlüsse'}`);

    docs.push({
      id: `protocol-${pr.id}`,
      title: pr.data.title,
      description: stats.length > 0 ? stats.join(' · ') : `Treffen am ${formattedDate}`,
      type: 'protocol',
      typeLabel: 'Protokoll',
      url: `/protokolle/${pr.id}`,
      date: pr.data.date instanceof Date ? pr.data.date.toISOString() : String(pr.data.date),
      category: pr.data.type,
      tags: [],
      personIds,
      personNames,
    });
  });

  // 6. Blog posts
  const stripMarkdown = (md: string) =>
    md
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[\r\n#*_`>]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const blogPosts = (await getCollection('blog')).sort(
    (a, b) => parseDateSafe(b.data.date).getTime() - parseDateSafe(a.data.date).getTime()
  );
  blogPosts.forEach((post) => {
    const formattedDate = parseDateSafe(post.data.date).toLocaleDateString('de-DE');
    const plainBody = stripMarkdown(post.body || '');
    const explicitTitle = post.data.title?.trim();
    const fallbackTitle =
      plainBody.length > 70
        ? `${plainBody.slice(0, 67).trimEnd()}…`
        : plainBody || `Blog-Beitrag vom ${formattedDate}`;
    const { personIds, personNames } = resolvePersons([post.data.authorId]);
    docs.push({
      id: `blog-${post.id}`,
      title: explicitTitle || fallbackTitle,
      description: plainBody.slice(0, 200),
      type: 'blog',
      typeLabel: 'Blog',
      url: `/blog/${post.id}`,
      date: post.data.date instanceof Date ? post.data.date.toISOString() : String(post.data.date),
      category: personNames.join(', ') || 'Blog',
      tags: post.data.tags || [],
      image: normalizeImage(post.data.image),
      imageAlt: post.data.imageAlt || explicitTitle || fallbackTitle,
      personIds,
      personNames,
    });
  });

  // 7. Portals
  const regionNames: Record<string, string> = {
    karlsruhe: 'Karlsruhe & Umgebung',
    badenWuerttemberg: 'Land Baden-Württemberg',
    deutschland: 'Deutschland',
  };
  const portale = await getCollection('portale');
  portale.forEach((item) => {
    docs.push({
      id: `portal-${item.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: item.data.title,
      description: item.data.description || '',
      type: 'portal',
      typeLabel: 'Portal',
      url: `/daten/portale/${item.id}`,
      category: regionNames[item.data.region] || item.data.region,
      tags: [],
    });
  });

  // 8. Distinct Tags across projects, events, datasets, blog
  const tagCounts = new Map<string, { label: string; count: number }>();
  [...projects, ...events, ...datasets, ...blogPosts].forEach((entry) => {
    const seen = new Set<string>();
    (entry.data.tags || []).forEach((rawTag) => {
      const trimmed = rawTag.trim();
      const key = trimmed.toLowerCase();
      if (!trimmed || seen.has(key)) return;
      seen.add(key);
      const existing = tagCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tagCounts.set(key, { label: trimmed, count: 1 });
      }
    });
  });

  Array.from(tagCounts.values())
    .sort((a, b) => a.label.localeCompare(b.label, 'de'))
    .forEach(({ label, count }) => {
      docs.push({
        id: `tag-${label.toLowerCase()}`,
        title: label,
        description: `${count} ${count === 1 ? 'Eintrag' : 'Einträge'} mit diesem Tag`,
        type: 'tag',
        typeLabel: 'Tag',
        url: `/suche?tag=${encodeURIComponent(label)}`,
        category: '',
        tags: ['Tag', 'Tags', label],
      });
    });

  // 8. Organizations
  orgs.forEach((org) => {
    const regionLabel = regionNames[org.data.region] || org.data.region || '';
    const descParts = [org.data.description, regionLabel].filter(Boolean);
    docs.push({
      id: `org-${org.id}`,
      title: org.data.name,
      description: descParts.join(' · ') || 'Organisation / Partner',
      type: 'organization',
      typeLabel: 'Organisation',
      url: `/suche?org=${encodeURIComponent(org.id)}`,
      category: org.data.isOpenDataProvider ? 'Open-Data-Anbieter' : regionLabel,
      tags: ['Organisation', 'Partner', org.data.name],
      organizationIds: [org.id],
      organizationNames: [org.data.name],
    });
  });

  return docs;
}
