import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { formatEventTime } from './utils/events';

export const CANONICAL_CATEGORIES = [
  'Urban Data',
  'Barrierefreiheit',
  'Politik',
  'Umwelt & Klima',
  'Open Data',
  'Civic Tech',
] as const;

export function getFocusThemeForCategory(category: string): string {
  switch (category) {
    case 'Umwelt & Klima':
      return 'Klimaschutz & Umwelt';
    case 'Barrierefreiheit':
      return 'Mobilität & Barrierefreiheit';
    case 'Politik':
    case 'Urban Data':
    case 'Open Data':
    case 'Civic Tech':
    default:
      return 'Civic Data & Politik';
  }
}

export function getProjectStatusLabel(status?: string, scope?: string): string {
  if (scope === 'external') return 'Empfehlung';
  switch (status) {
    case 'completed':
      return 'Abgeschlossen';
    case 'idea':
      return 'Ideenschmiede';
    case 'archived':
      return 'Archiviert';
    case 'active':
    default:
      return 'Aktiv';
  }
}

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({
      title: z.string(),
      teaser: z.string(),
      scope: z.enum(['internal', 'external', 'idea']).default('internal'),
      status: z.string().default('active'),
      category: z.enum(CANONICAL_CATEGORIES),
      tags: z.array(z.string()).default([]),
      projectUrl: z.preprocess(
        (val) => (val === '' || val === '#' ? undefined : val),
        z.string().url().optional()
      ),
      repoUrl: z.preprocess(
        (val) => (val === '' || val === '#' ? undefined : val),
        z.string().url().optional()
      ),
      personIds: z.array(z.string()).default([]),
      organizationIds: z.array(z.string()).default([]),
      datasetIds: z.array(z.string()).default([]),
      relatedProjectIds: z.array(reference('projects')).default([]),
      date: z.string().or(z.date()).optional(),
      image: z.string().nullable().optional(),
      imageAlt: z.string().optional(),
      externalLinks: z
        .array(
          z.object({
            name: z.string().optional(),
            title: z.string().optional(),
            url: z.string(),
          })
        )
        .default([]),
      featured: z.boolean().default(false),
      press: z
        .array(
          z.object({
            title: z.string(),
            url: z.string().optional(),
            outlet: z.string().optional(),
            date: z.string().optional(),
            teaser: z.string().optional(),
          })
        )
        .default([]),
    }),
  }),

  protocols: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/protocols' }),
    schema: z.object({
      date: z.date().or(z.string()),
      title: z.string(),
      type: z.enum(['plenum', 'vorstand', 'arbeitsgruppe', 'mitgliederversammlung']),
      eventId: z.string().nullable().optional(),
      attendeeIds: z.array(z.string()).default([]),
      facilitatorId: z.string().nullable().optional(),
      scribeId: z.string().nullable().optional(),
      linkedProjectIds: z.array(reference('projects')).default([]),
      decisions: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            result: z.enum(['beschlossen', 'abgelehnt', 'vertagt']),
            signedPdfUrl: z.string().url().optional(),
          })
        )
        .default([]),
    }),
  }),

  datasets: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/datasets' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      publisherIds: z.array(z.string()).default([]),
      url: z.string().url(),
      portalId: z.string().nullable().optional(),
      tags: z.array(z.string()).default([]),
      formats: z.array(z.string()).default([]),
      size: z.string().optional(),
      teaser: z.string().optional(),
      personIds: z.array(z.string()).default([]),
      contact: z.string().optional(),
      useCases: z.string().optional(),
      image: z.string().nullable().optional(),
      imageAlt: z.string().optional(),
    }),
  }),

  persons: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/persons' }),
    schema: z.object({
      name: z.string(),
      role: z.string().optional().default(''),
      image: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || '/assets/images/okl.svg'),
      isCoreTeam: z.boolean().default(false),
    }),
  }),

  organizations: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/organizations' }),
    schema: z.object({
      name: z.string(),
      url: z.string().url().optional().or(z.literal('')),
      description: z.string().optional(),
      isOpenDataProvider: z.boolean().default(false),
      region: z.enum(['karlsruhe', 'badenWuerttemberg', 'deutschland']).default('karlsruhe'),
    }),
  }),

  footer: defineCollection({
    loader: glob({ pattern: 'footer.json', base: './src/content/settings' }),
    schema: z.object({
      brand: z.object({
        title: z.string().default('OK Lab Karlsruhe'),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        links: z
          .array(
            z.object({
              name: z.string(),
              url: z.string(),
              icon: z.string().optional(),
            })
          )
          .default([]),
      }),
      column1: z.object({
        title: z.string().default('Plattform & Tools'),
        links: z
          .array(
            z.object({
              name: z.string(),
              url: z.string(),
            })
          )
          .default([]),
      }),
      column2: z.object({
        title: z.string().default('Rechtliches & Information'),
        links: z
          .array(
            z.object({
              name: z.string(),
              url: z.string(),
            })
          )
          .default([]),
      }),
      bottom: z
        .object({
          leftText: z.string().optional(),
          sourceLabel: z.string().optional(),
          sourceUrl: z.string().optional(),
          rightText: z.string().optional(),
        })
        .default({}),
    }),
  }),

  events: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
    schema: z
      .object({
        title: z.string(),
        series: z.string().optional(),
        teaser: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).default([]),
        status: z.string().default('active'),
        isRegularMeeting: z.boolean().default(false),
        rhythm: z.string().optional(),
        dates: z.array(z.string().or(z.date())).default([]),
        startTime: z.string().nullable().optional(),
        endTime: z.string().nullable().optional(),
        location: z.string().optional(),
        locationUrl: z.string().optional(),
        image: z.string().nullable().optional(),
        imageAlt: z.string().optional(),
        featured: z.boolean().default(false),
        pinned: z.boolean().default(false),
        registrationOpen: z.boolean().default(false),
        registrationTitle: z.string().optional(),
        registrationText: z.string().optional(),
        registrationMail: z.string().optional(),
        registrationButton: z.string().optional(),
        registrationUrl: z.string().optional(),
        personIds: z.array(z.string()).default([]),
        organizationIds: z.array(z.string()).default(['ok-lab-karlsruhe']),
        projectIds: z.array(z.string()).default([]),
        datasetIds: z.array(z.string()).default([]),
        externalLinks: z
          .array(
            z.object({
              name: z.string(),
              url: z.string(),
            })
          )
          .default([]),
        galleryImages: z
          .array(
            z.string().or(
              z.object({
                image: z.string().optional(),
                imageAlt: z.string().optional(),
                url: z.string().optional(),
                copyright: z.string().optional(),
                alt: z.string().optional(),
              })
            )
          )
          .default([]),
        facts: z
          .array(
            z.object({
              key: z.string(),
              value: z.string(),
            })
          )
          .default([]),
        schedule: z
          .array(
            z.object({
              time: z.string(),
              title: z.string(),
              desc: z.string().optional(),
            })
          )
          .default([]),
      })
      .transform((data) => ({
        ...data,
        time: formatEventTime(data.startTime, data.endTime),
      })),
  }),

  portale: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/portale' }),
    schema: z.object({
      title: z.string(),
      url: z.string().optional(),
      description: z.string().optional(),
      region: z.enum(['karlsruhe', 'badenWuerttemberg', 'deutschland']),
      subItems: z
        .array(
          z.object({
            title: z.string(),
            url: z.string(),
          })
        )
        .default([]),
    }),
  }),

  pages: defineCollection({
    loader: glob({ pattern: '**/*.{md,json}', base: './src/content/pages' }),
    schema: z
      .object({
        title: z.string().default(''),
        description: z.string().optional(),
        lastUpdated: z.string().or(z.date()).optional(),
      })
      .catchall(z.any()),
  }),

  'event-series': defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/event-series' }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
  }),

  'data-formats': defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/data-formats' }),
    schema: z.object({
      title: z.string(),
    }),
  }),

  tools: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/tools' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      url: z.string(),
      icon: z.string().optional(),
    }),
  }),

  icons: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/icons' }),
    schema: z.object({
      title: z.string(),
      svg: z.string(),
    }),
  }),

  blog: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
      title: z.string().optional().default(''),
      date: z.string().or(z.date()),
      authorId: z.string().nullable().optional(),
      projectIds: z.array(z.string()).default([]),
      eventIds: z.array(z.string()).default([]),
      datasetIds: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      image: z.string().nullable().optional(),
      imageAlt: z.string().optional(),
      fediverseUrl: z.preprocess(
        (val) => (val === '' || val === '#' ? undefined : val),
        z.string().url().optional()
      ),
    }),
  }),
};
