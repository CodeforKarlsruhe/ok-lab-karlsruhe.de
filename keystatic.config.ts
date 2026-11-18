import { config, fields, collection, singleton } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

function createVideoComponent(folder: string) {
  return block({
    label: 'Video (MP4 / WebM)',
    schema: {
      src: fields.file({
        label: 'Videodatei (kurzer Clip, .mp4 oder .webm)',
        directory: `public/assets/videos/${folder}`,
        publicPath: `/assets/videos/${folder}/`,
        validation: { isRequired: true },
      }),
      caption: fields.text({
        label: 'Beschreibung & Copyright (optional)',
      }),
      autoplay: fields.checkbox({
        label: 'Endlosschleife ohne Steuerung (wie GIF: autoplay, loop, muted)',
        defaultValue: false,
      }),
    },
  });
}

const isGitHubMode =
  process.env.KEYSTATIC_MODE === 'github' ||
  import.meta.env?.KEYSTATIC_MODE === 'github' ||
  Boolean(import.meta.env?.PROD);

export default config({
  storage: isGitHubMode
    ? { kind: 'github', repo: 'CodeforKarlsruhe/oklab-karlsruhe.de' }
    : { kind: 'local' },
  ui: {
    brand: {
      name: 'OK Lab Karlsruhe CMS',
    },
    navigation: {
      Projekte: ['projects'],
      Events: ['events', 'eventSeries'],
      Daten: ['datasets', 'portale', 'dataFormats'],
      Blog: ['blog'],
      Orga: ['persons', 'organizations', 'protocols', 'tools'],
      'Über Uns': ['home', 'about', 'impressum', 'satzung'],
      Konfiguration: ['footer', 'icons'],
    },
  },
  singletons: {
    footer: singleton({
      label: '🦶 Footer',
      path: 'src/content/settings/footer',
      format: 'json',
      schema: {
        brand: fields.object(
          {
            title: fields.text({ label: 'Titel' }),
            subtitle: fields.text({ label: 'Untertitel' }),
            description: fields.text({
              label: 'Beschreibung',
              multiline: true,
            }),
            links: fields.array(
              fields.object({
                name: fields.text({
                  label: 'Name',
                  validation: { isRequired: true },
                }),
                url: fields.text({
                  label: 'URL',
                  validation: { isRequired: true },
                }),
                icon: fields.relationship({
                  label: 'Icon',
                  collection: 'icons',
                }),
              }),
              {
                label: 'Icon-Links',
                itemLabel: (props) => props.fields.name.value,
              }
            ),
          },
          { label: 'Linke Spalte' }
        ),

        column1: fields.object(
          {
            title: fields.text({ label: 'Titel' }),
            links: fields.array(
              fields.object({
                name: fields.text({
                  label: 'Titel',
                  validation: { isRequired: true },
                }),
                url: fields.text({
                  label: 'URL',
                  validation: { isRequired: true },
                }),
              }),
              {
                label: 'Links',
                itemLabel: (props) => props.fields.name.value,
              }
            ),
          },
          { label: 'Mittlere Spalte (Spalte 1)' }
        ),

        column2: fields.object(
          {
            title: fields.text({ label: 'Titel' }),
            links: fields.array(
              fields.object({
                name: fields.text({
                  label: 'Titel',
                  validation: { isRequired: true },
                }),
                url: fields.text({
                  label: 'URL',
                  validation: { isRequired: true },
                }),
              }),
              {
                label: 'Links',
                itemLabel: (props) => props.fields.name.value,
              }
            ),
          },
          { label: 'Rechte Spalte (Spalte 2)' }
        ),

        bottom: fields.object(
          {
            leftText: fields.text({ label: 'Text Unten Links' }),
            sourceLabel: fields.text({ label: 'Quelltext-Link Titel' }),
            sourceUrl: fields.text({ label: 'Quelltext-Link URL' }),
            rightText: fields.text({ label: 'Text Unten Rechts' }),
          },
          { label: 'Fußzeile' }
        ),
      },
    }),

    home: singleton({
      label: '🏠 Startseite',
      path: 'src/content/pages/home',
      format: 'json',
      schema: {
        hero: fields.object(
          {
            titleLine1: fields.text({
              label: 'Hero Titel Zeile 1',
              validation: { isRequired: true },
              defaultValue: 'Offene Daten für ein',
            }),
            titleHighlight: fields.text({
              label: 'Titel Highlight',
              validation: { isRequired: true },
              defaultValue: 'besseres Karlsruhe',
            }),
            lead: fields.text({
              label: 'Hero Lead-Text',
              multiline: true,
              validation: { isRequired: true },
            }),
            primaryButtonText: fields.text({
              label: 'Primärer Button Text',
              validation: { isRequired: true },
            }),
            secondaryButtonText: fields.text({
              label: 'Sekundärer Button Text',
              validation: { isRequired: true },
            }),
            image: fields.image({
              label: 'Vorschaubild',
              directory: 'public/assets/images/home',
              publicPath: '/assets/images/home',
              validation: { isRequired: true },
            }),
            imageAlt: fields.text({
              label: 'Bildbeschreibung & -Copyright',
              validation: { isRequired: true },
            }),
          },
          { label: 'Hero-Bereich' }
        ),
        meetupBanner: fields.object(
          {
            showBanner: fields.checkbox({
              label: 'Bereich anzeigen',
              defaultValue: true,
            }),
            highlightEvent: fields.relationship({
              label: 'Großevent oder Schwerpunkt-Termin',
              collection: 'events',
            }),
            highlightBadge: fields.text({
              label: 'Badge-Text für das Highlight',
              defaultValue: 'Schwerpunkt',
            }),
          },
          { label: 'Termine' }
        ),
        featuredProjects: fields.array(
          fields.relationship({
            label: 'Projekt',
            collection: 'projects',
          }),
          {
            label: 'Ausgewählte Projekte (Startseite)',
            validation: { length: { min: 1, max: 4 } },
            itemLabel: (props) => props.value || 'Projekt auswählen',
          }
        ),
        focusThemes: fields.array(
          fields.object({
            title: fields.text({
              label: 'Titel des Bereichs',
              validation: { isRequired: true },
            }),
            category: fields.select({
              label: 'Zugeordnete Projekt-Kategorie',
              options: [
                { label: 'Umwelt & Klima', value: 'Umwelt & Klima' },
                { label: 'Barrierefreiheit', value: 'Barrierefreiheit' },
                { label: 'Politik', value: 'Politik' },
                { label: 'Urban Data', value: 'Urban Data' },
                { label: 'Open Data', value: 'Open Data' },
                { label: 'Civic Tech', value: 'Civic Tech' },
              ],
              defaultValue: 'Politik',
            }),
            description: fields.text({
              label: 'Beschreibung',
              multiline: true,
              validation: { isRequired: true },
            }),
            icon: fields.relationship({
              label: 'Icon',
              collection: 'icons',
            }),
            projects: fields.array(
              fields.relationship({
                label: 'Projekt',
                collection: 'projects',
              }),
              {
                label: 'Beispielprojekte kuratieren (optional, max 2)',
                validation: { length: { max: 2 } },
                itemLabel: (props) => props.value || 'Projekt auswählen',
              }
            ),
          }),
          {
            label: '3 Schwerpunktbereiche',
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        sectionTexts: fields.object(
          {
            eventsTitle: fields.text({
              label: 'Termine Titel',
              validation: { isRequired: true },
            }),
            projectsTitle: fields.text({
              label: 'Projekte Titel',
              validation: { isRequired: true },
            }),
            themesTitle: fields.text({
              label: 'Themenschwerpunkte Titel',
              validation: { isRequired: true },
            }),
            ctaTitle: fields.text({
              label: 'CTA Titel',
              validation: { isRequired: true },
            }),
            ctaDesc: fields.text({
              label: 'CTA Beschreibung',
              multiline: true,
              validation: { isRequired: true },
            }),
            ctaButtonPlenum: fields.text({
              label: 'CTA Button Treffen',
              validation: { isRequired: true },
            }),
            ctaButtonAbout: fields.text({
              label: 'CTA Button Über uns',
              validation: { isRequired: true },
            }),
          },
          { label: 'Abschnitts-Texte' }
        ),
      },
    }),

    about: singleton({
      label: 'ℹ️ Über uns',
      path: 'src/content/pages/about',
      format: 'json',
      schema: {
        contactMail: fields.text({
          label: 'Zentrale Kontakt-E-Mail',
          defaultValue: 'info@ok-lab-karlsruhe.de',
        }),
        hero: fields.object(
          {
            titleLine1: fields.text({ label: 'Titel Zeile 1', defaultValue: 'Civic Tech in' }),
            titleHighlight: fields.text({ label: 'Titel Highlight', defaultValue: 'Karlsruhe' }),
            lead: fields.text({ label: 'Einleitungstext', multiline: true }),
            ctaText: fields.text({
              label: 'Button-Beschriftung (optional, leer lassen zum Ausblenden)',
              defaultValue: 'Nächstes Treffen besuchen',
            }),
            ctaUrl: fields.text({
              label: 'Button-Ziel (z.B. #treffen)',
              defaultValue: '#treffen',
            }),
            image: fields.image({
              label: 'Bild',
              directory: 'public/assets/images/about',
              publicPath: '/assets/images/about',
            }),
            imageAlt: fields.text({
              label: 'Bildbeschreibung & Copyright (in einem Satz, z.B. Arbeitsraum • © OK Lab)',
            }),
          },
          { label: 'Hero Bereich' }
        ),
        vision: fields.object(
          {
            title: fields.text({ label: 'Überschrift', defaultValue: 'Wofür wir stehen' }),
            text: fields.text({ label: 'Leitbild-Text', multiline: true }),
            goals: fields.array(
              fields.text({
                label: 'Ziel',
              }),
              {
                label: 'Ziele & Schwerpunkte',
                itemLabel: (props) => props.value,
              }
            ),
          },
          { label: 'Leitbild & Vision' }
        ),
        whoWeAre: fields.object(
          {
            title: fields.text({ label: 'Überschrift', defaultValue: 'Wer wir sind' }),
            text: fields.text({ label: 'Beschreibung des Netzwerks', multiline: true }),
          },
          { label: 'Wer wir sind' }
        ),
        principles: fields.array(
          fields.object({
            title: fields.text({
              label: 'Titel des Prinzips',
            }),
            description: fields.text({
              label: 'Beschreibung',
              multiline: true,
            }),
            icon: fields.relationship({
              label: 'Icon',
              collection: 'icons',
            }),
          }),
          {
            label: 'Prinzipien der Offenheit',
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        participation: fields.object(
          {
            title: fields.text({ label: 'Titel', defaultValue: 'Mitmachen & Vernetzen' }),
            lead: fields.text({ label: 'Einleitung', multiline: true }),
            ways: fields.array(
              fields.object({
                title: fields.text({
                  label: 'Titel des Wegs',
                }),
                desc: fields.text({
                  label: 'Beschreibung',
                  multiline: true,
                }),
              }),
              {
                label: 'Möglichkeiten zum Mitwirken',
                itemLabel: (props) => props.fields.title.value,
              }
            ),
          },
          { label: 'Mitmachen-Sektion' }
        ),
        coc: fields.object(
          {
            title: fields.text({ label: 'Titel', defaultValue: 'Code of Conduct' }),
            text: fields.text({ label: 'Zusammenfassung', multiline: true }),
            linkUrl: fields.url({ label: 'Vollständiger Link' }),
            linkText: fields.text({ label: 'Link-Text' }),
          },
          { label: 'Verhaltenskodex' }
        ),
      },
    }),

    impressum: singleton({
      label: '⚖️ Impressum',
      path: 'src/content/pages/impressum',
      format: { contentField: 'content' },
      previewUrl: '/impressum',
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Titel', defaultValue: 'Impressum' }),
        description: fields.text({ label: 'Kurzbeschreibung / Meta-Description' }),
        lastUpdated: fields.text({ label: 'Zuletzt aktualisiert' }),
        content: fields.markdoc({
          label: 'Inhalt (Markdown / WYSIWYG)',
          extension: 'md',
        }),
      },
    }),

    satzung: singleton({
      label: '📜 Satzung',
      path: 'src/content/pages/satzung',
      format: { contentField: 'content' },
      previewUrl: '/satzung',
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Titel', defaultValue: 'Satzung' }),
        description: fields.text({ label: 'Kurzbeschreibung / Meta-Description' }),
        lastUpdated: fields.text({ label: 'Zuletzt aktualisiert' }),
        content: fields.markdoc({
          label: 'Inhalt (Markdown / WYSIWYG)',
          extension: 'md',
        }),
      },
    }),
  },
  collections: {
    projects: collection({
      label: '🖥️ Projekte',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/projekte/{slug}',
      columns: ['title', 'status', 'category', 'scope'],
      schema: {
        title: fields.slug({
          name: { label: 'Projekttitel' },
          slug: { label: 'Slug' },
        }),
        date: fields.date({ label: 'Datum' }),
        teaser: fields.text({ label: 'Kurzbeschreibung', multiline: true }),
        image: fields.image({
          label: 'Bild',
          directory: 'public/assets/images/projects',
          publicPath: '/assets/images/projects',
        }),
        imageAlt: fields.text({ label: 'Bildbeschreibung & -Copyright' }),
        scope: fields.select({
          label: 'Typ',
          options: [
            { label: 'OK-Lab-Projekt', value: 'internal' },
            { label: 'Externes Projekt', value: 'external' },
            { label: 'Idee', value: 'idea' },
          ],
          defaultValue: 'internal',
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Aktiv', value: 'active' },
            { label: 'Fertig / Abgeschlossen', value: 'completed' },
            { label: 'Idee / Konzept', value: 'idea' },
            { label: 'Archiviert', value: 'archived' },
          ],
          defaultValue: 'active',
        }),
        category: fields.select({
          label: 'Kategorie',
          options: [
            { label: 'Urban Data', value: 'Urban Data' },
            { label: 'Barrierefreiheit', value: 'Barrierefreiheit' },
            { label: 'Politik', value: 'Politik' },
            { label: 'Umwelt & Klima', value: 'Umwelt & Klima' },
            { label: 'Open Data', value: 'Open Data' },
            { label: 'Civic Tech', value: 'Civic Tech' },
          ],
          defaultValue: 'Urban Data',
        }),
        tags: fields.array(
          fields.text({
            label: 'Tag',
            validation: { isRequired: true },
          }),
          {
            label: 'Schlagwörter',
            itemLabel: (props) => props.value,
          }
        ),
        projectUrl: fields.url({ label: 'Projekt-Website URL' }),
        repoUrl: fields.url({ label: 'Source-Code Repository URL' }),
        personIds: fields.array(
          fields.relationship({
            label: 'Person',
            collection: 'persons',
            validation: { isRequired: true },
          }),
          {
            label: 'Beteiligte Personen',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        organizationIds: fields.array(
          fields.relationship({
            label: 'Organisation',
            collection: 'organizations',
            validation: { isRequired: true },
          }),
          {
            label: 'Beteiligte Organisationen',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        datasetIds: fields.array(
          fields.relationship({
            label: 'Datensatz',
            collection: 'datasets',
            validation: { isRequired: true },
          }),
          {
            label: 'Verknüpfte Datensätze',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        relatedProjectIds: fields.array(
          fields.relationship({
            label: 'Projekt',
            collection: 'projects',
            validation: { isRequired: true },
          }),
          {
            label: 'Verknüpfte Projekte',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        externalLinks: fields.array(
          fields.object({
            name: fields.text({
              label: 'Link-Titel',
              validation: { isRequired: true },
            }),
            url: fields.url({
              label: 'URL',
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Externe Links & Ressourcen',
            itemLabel: (props) => props.fields.name.value,
          }
        ),
        press: fields.array(
          fields.object({
            title: fields.text({
              label: 'Titel',
              validation: { isRequired: true },
            }),
            url: fields.url({
              label: 'URL',
              validation: { isRequired: true },
            }),
            outlet: fields.text({ label: 'Medium / Quelle (z.B. ZKM, BNN)' }),
            date: fields.text({ label: 'Datum' }),
            teaser: fields.text({ label: 'Teaser / Zitat', multiline: true }),
          }),
          {
            label: 'Presseberichte',
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        featured: fields.checkbox({ label: 'Hervorgehoben auf Startseite (Featured)' }),
        content: fields.markdoc({
          label: 'Ausführliche Projektbeschreibung (WYSIWYG)',
          extension: 'md',
          options: {
            heading: [2, 3, 4, 5, 6],
            bold: true,
            italic: true,
            strikethrough: true,
            code: true,
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            table: true,
            link: true,
            divider: true,
            image: {
              directory: 'public/assets/images/projects',
              publicPath: '/assets/images/projects/',
            },
          },
          components: {
            video: createVideoComponent('projects'),
          },
        }),
      },
    }),

    protocols: collection({
      label: '📃 Protokolle',
      slugField: 'title',
      path: 'src/content/protocols/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/protokolle/{slug}',
      columns: ['title', 'date', 'type'],
      schema: {
        title: fields.slug({ name: { label: 'Titel des Treffens' } }),
        date: fields.date({ label: 'Datum des Treffens' }),
        type: fields.select({
          label: 'Art des Treffens',
          options: [
            { label: 'Plenum (Allgemeines Treffen)', value: 'plenum' },
            { label: 'Vorstandssitzung', value: 'vorstand' },
            { label: 'Arbeitsgruppe', value: 'arbeitsgruppe' },
            { label: 'Mitgliederversammlung', value: 'mitgliederversammlung' },
          ],
          defaultValue: 'plenum',
        }),
        eventId: fields.relationship({
          label: 'Zugehöriger Termin',
          collection: 'events',
        }),
        attendeeIds: fields.array(
          fields.relationship({
            label: 'Person',
            collection: 'persons',
            validation: { isRequired: true },
          }),
          {
            label: 'Teilnehmende Personen',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        facilitatorId: fields.relationship({
          label: 'Moderation / Facilitator',
          collection: 'persons',
        }),
        scribeId: fields.relationship({
          label: 'Protokollführung / Scribe',
          collection: 'persons',
        }),
        linkedProjectIds: fields.array(
          fields.relationship({
            label: 'Projekt',
            collection: 'projects',
            validation: { isRequired: true },
          }),
          {
            label: 'Verknüpfte Projekte',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        decisions: fields.array(
          fields.object({
            id: fields.text({
              label: 'Beschluss-ID (z. B. 2026-10-1)',
              validation: { isRequired: true },
            }),
            title: fields.text({
              label: 'Beschlussantrag',
              validation: { isRequired: true },
            }),
            result: fields.select({
              label: 'Abstimmungsergebnis',
              options: [
                { label: 'Beschlossen', value: 'beschlossen' },
                { label: 'Abgelehnt', value: 'abgelehnt' },
                { label: 'Vertagt', value: 'vertagt' },
              ],
              defaultValue: 'beschlossen',
            }),
            signedPdfUrl: fields.url({ label: 'Signiertes PDF (URL oder Nextcloud Share)' }),
          }),
          {
            label: 'Formale Beschlüsse',
            itemLabel: (props) =>
              props.fields.id.value
                ? `${props.fields.id.value}: ${props.fields.title.value}`
                : props.fields.title.value,
          }
        ),
        content: fields.markdoc({
          label: 'Protokollinhalt (WYSIWYG)',
          extension: 'md',
          options: {
            heading: [2, 3, 4],
            bold: true,
            italic: true,
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            table: true,
            link: true,
            divider: true,
          },
          components: {
            video: createVideoComponent('protocols'),
          },
        }),
      },
    }),

    datasets: collection({
      label: '📊 Datensätze',
      slugField: 'title',
      path: 'src/content/datasets/*',
      format: 'json',
      previewUrl: '/daten/{slug}',
      columns: ['title', 'portalId', 'size'],
      schema: {
        title: fields.slug({
          name: { label: 'Titel des Datensatzes' },
          slug: {
            label: 'Slug (URL-Pfad)',
            description:
              'Muss seitenweit eindeutig sein (wird für globale Weiterleitungen genutzt)',
          },
        }),
        teaser: fields.text({ label: 'Kurzbeschreibung / Teaser', multiline: true }),
        description: fields.text({ label: 'Ausführliche Beschreibung', multiline: true }),
        publisherIds: fields.array(
          fields.relationship({
            label: 'Organisation',
            collection: 'organizations',
            validation: { isRequired: true },
          }),
          {
            label: 'Herausgeber / Bereitstellende Organisationen',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        url: fields.url({ label: 'Download- oder Quell-URL' }),
        tags: fields.array(
          fields.text({
            label: 'Thema / Schlagwort',
            validation: { isRequired: true },
          }),
          {
            label: 'Themen',
            itemLabel: (props) => props.value,
          }
        ),
        formats: fields.multiRelationship({
          label: 'Dateiformate (Autocompletion)',
          collection: 'dataFormats',
        }),
        portalId: fields.relationship({
          label: 'Herkunfts-Portal',
          collection: 'portale',
        }),
        size: fields.text({ label: 'Datengröße (z.B. 3GB, 500 Zeilen)' }),
        personIds: fields.array(
          fields.relationship({
            label: 'Person',
            collection: 'persons',
            validation: { isRequired: true },
          }),
          {
            label: 'Ansprechpersonen / Mitwirkende',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        useCases: fields.text({ label: 'Mögliche Anwendungsfälle' }),
        image: fields.image({
          label: 'Vorschaubild',
          directory: 'public/assets/images/datasets',
          publicPath: '/assets/images/datasets',
        }),
        imageAlt: fields.text({
          label:
            'Bildbeschreibung & Copyright (in einem Satz, z.B. Screenshot des Datenportals • © Quelle)',
        }),
      },
    }),

    persons: collection({
      label: '👥 Personen',
      slugField: 'name',
      path: 'src/content/persons/*',
      format: 'json',
      columns: ['name', 'role', 'isCoreTeam', 'image'],
      previewUrl: '/about',
      schema: {
        name: fields.slug({ name: { label: 'Vollständiger Name' } }),
        isCoreTeam: fields.checkbox({
          label: 'Im Kernteam auf "Über uns" anzeigen',
          defaultValue: false,
        }),
        role: fields.text({ label: 'Rolle' }),
        image: fields.image({
          label: 'Avatar',
          directory: 'public/assets/images/persons',
          publicPath: '/assets/images/persons',
        }),
      },
    }),

    organizations: collection({
      label: '🏛️ Organisationen',
      slugField: 'name',
      path: 'src/content/organizations/*',
      format: 'json',
      columns: ['name', 'region', 'isOpenDataProvider'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        url: fields.url({ label: 'URL' }),
        description: fields.text({ label: 'Kurzbeschreibung', multiline: true }),
        region: fields.select({
          label: 'Region',
          options: [
            { label: 'Karlsruhe', value: 'karlsruhe' },
            { label: 'Baden-Württemberg', value: 'badenWuerttemberg' },
            { label: 'Deutschland', value: 'deutschland' },
          ],
          defaultValue: 'karlsruhe',
        }),
        isOpenDataProvider: fields.checkbox({
          label: 'Unter "Daten > Organisationen" anzeigen',
          defaultValue: false,
        }),
      },
    }),

    events: collection({
      label: '📅 Termine',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/events/{slug}',
      columns: ['title', 'status', 'category', 'location'],
      schema: {
        title: fields.slug({
          name: { label: 'Titel' },
          slug: { label: 'Slug' },
        }),
        series: fields.relationship({
          label: 'Termin-Reihe',
          collection: 'eventSeries',
        }),
        teaser: fields.text({ label: 'Kurzbeschreibung', multiline: true }),
        category: fields.select({
          label: 'Kategorie',
          options: [
            { label: 'Workshop', value: 'Workshop' },
            { label: 'Vortrag', value: 'Vortrag' },
            { label: 'Festival', value: 'Festival' },
            { label: 'Hackathon', value: 'Hackathon' },
            { label: 'Treffen', value: 'Treffen' },
          ],
          defaultValue: 'Workshop',
        }),
        tags: fields.array(
          fields.text({
            label: 'Tag',
            validation: { isRequired: true },
          }),
          {
            label: 'Schlagwörter',
            itemLabel: (props) => props.value,
          }
        ),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Aktiv / Geplant', value: 'active' },
            { label: 'Regelmäßig (Wiederkehrend)', value: 'recurring' },
            { label: 'Vergangen', value: 'past' },
            { label: 'Abgeschlossen', value: 'completed' },
            { label: 'Abgesagt', value: 'cancelled' },
          ],
          defaultValue: 'active',
        }),
        isRegularMeeting: fields.checkbox({
          label: 'Regelmäßiges Haupt-Lab-Treffen (für Banner, Über-uns & Tooling)',
          defaultValue: false,
        }),
        rhythm: fields.text({
          label: 'Rhythmus / Turnus (Freitext, z.B. Jeden 2. Dienstag im Monat ab 19:00 Uhr)',
        }),
        dates: fields.array(
          fields.date({
            label: 'Datum (YYYY-MM-DD)',
            validation: { isRequired: true },
          }),
          {
            label: 'Termine (Einzeltermin, Tage eines mehrtägigen Termins oder Terminserie)',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        startTime: fields.text({ label: 'Startzeit (z.B. 14:00 – leer lassen für TBA)' }),
        endTime: fields.text({ label: 'Endzeit (z.B. 18:00 – optional)' }),
        location: fields.text({ label: 'Ort' }),
        locationUrl: fields.url({ label: 'Ort URL / Karte' }),
        image: fields.image({
          label: 'Vorschaubild',
          directory: 'public/assets/images/events',
          publicPath: '/assets/images/events',
        }),
        imageAlt: fields.text({
          label:
            'Bildbeschreibung & Copyright (in einem Satz, z.B. Workshop im Hackspace • © Autor)',
        }),
        featured: fields.checkbox({ label: 'Hervorgehoben auf Startseite (Featured)' }),
        pinned: fields.checkbox({ label: 'Oben anpinnen (Pinned)' }),
        registrationOpen: fields.checkbox({ label: 'Anmeldung geöffnet' }),
        registrationTitle: fields.text({ label: 'Anmeldung Titel' }),
        registrationText: fields.text({ label: 'Anmeldung Text', multiline: true }),
        registrationMail: fields.text({ label: 'Anmeldung E-Mail' }),
        registrationButton: fields.text({ label: 'Anmeldung Button-Text' }),
        registrationUrl: fields.url({ label: 'Anmeldung URL' }),
        personIds: fields.array(
          fields.relationship({
            label: 'Person',
            collection: 'persons',
            validation: { isRequired: true },
          }),
          {
            label: 'Beteiligte Personen (Wissensgraph)',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        organizationIds: fields.array(
          fields.relationship({
            label: 'Veranstalter (Organisation)',
            collection: 'organizations',
            validation: { isRequired: true },
          }),
          {
            label: 'Veranstalter / Organizers (Wissensgraph)',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        projectIds: fields.array(
          fields.relationship({
            label: 'Projekt',
            collection: 'projects',
            validation: { isRequired: true },
          }),
          {
            label: 'Zugehörige Projekte',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        datasetIds: fields.array(
          fields.relationship({
            label: 'Datensatz',
            collection: 'datasets',
            validation: { isRequired: true },
          }),
          {
            label: 'Verknüpfte Datensätze',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        externalLinks: fields.array(
          fields.object({
            name: fields.text({
              label: 'Link-Text',
              validation: { isRequired: true },
            }),
            url: fields.url({
              label: 'URL',
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Weiterführende Links',
            itemLabel: (props) => props.fields.name.value,
          }
        ),
        galleryImages: fields.array(
          fields.object({
            image: fields.image({
              label: 'Galeriebild',
              directory: 'public/assets/images/events',
              publicPath: '/assets/images/events',
              validation: { isRequired: true },
            }),
            imageAlt: fields.text({
              label:
                'Bildbeschreibung & Copyright (in einem Satz, z.B. Workshop im Hackspace • © Autor)',
            }),
          }),
          {
            label: 'Galeriebilder',
            itemLabel: (props) =>
              props.fields.imageAlt.value || props.fields.image.value?.filename || 'Galeriebild',
          }
        ),
        facts: fields.array(
          fields.object({
            key: fields.text({
              label: 'Attribut (z. B. Thema, Teilnehmer, Verpflegung, Tickets)',
              validation: { isRequired: true },
            }),
            value: fields.text({
              label: 'Wert',
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Termin-Fakten (Infobox)',
            itemLabel: (props) => `${props.fields.key.value}: ${props.fields.value.value}`,
          }
        ),
        schedule: fields.array(
          fields.object({
            time: fields.text({
              label: 'Uhrzeit (z.B. 19:00 Uhr)',
              validation: { isRequired: true },
            }),
            title: fields.text({
              label: 'Programmpunkt',
              validation: { isRequired: true },
            }),
            desc: fields.text({ label: 'Beschreibung / Details', multiline: true }),
          }),
          {
            label: 'Zeitplan / Ablauf',
            itemLabel: (props) =>
              props.fields.time.value
                ? `${props.fields.time.value} - ${props.fields.title.value}`
                : props.fields.title.value,
          }
        ),

        content: fields.markdoc({
          label: 'Ausführliche Event-Beschreibung (WYSIWYG)',
          extension: 'md',
          options: {
            heading: [2, 3, 4, 5, 6],
            bold: true,
            italic: true,
            strikethrough: true,
            code: true,
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            table: true,
            link: true,
            divider: true,
            image: {
              directory: 'public/assets/images/events',
              publicPath: '/assets/images/events/',
            },
          },
          components: {
            video: createVideoComponent('events'),
          },
        }),
      },
    }),

    portale: collection({
      label: '🏛️ Portale',
      slugField: 'title',
      path: 'src/content/portale/*',
      format: 'json',
      previewUrl: '/daten#portale',
      columns: ['title', 'region'],
      schema: {
        title: fields.slug({ name: { label: 'Name' } }),
        url: fields.url({ label: 'URL' }),
        description: fields.text({ label: 'Beschreibung', multiline: true }),
        region: fields.select({
          label: 'Region',
          options: [
            { label: 'Karlsruhe', value: 'karlsruhe' },
            { label: 'Baden-Württemberg', value: 'badenWuerttemberg' },
            { label: 'Deutschland', value: 'deutschland' },
          ],
          defaultValue: 'karlsruhe',
        }),
        subItems: fields.array(
          fields.object({
            title: fields.text({
              label: 'Titel',
              validation: { isRequired: true },
            }),
            url: fields.url({
              label: 'URL',
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Unterlinks',
            itemLabel: (props) => props.fields.title.value,
          }
        ),
      },
    }),

    eventSeries: collection({
      label: '🔁 Termin-Reihen',
      slugField: 'title',
      path: 'src/content/event-series/*',
      format: 'json',
      columns: ['title', 'description'],
      schema: {
        title: fields.slug({ name: { label: 'Name' } }),
        description: fields.text({ label: 'Kurzbeschreibung', multiline: true }),
      },
    }),

    dataFormats: collection({
      label: '💾 Dateiformate',
      slugField: 'title',
      path: 'src/content/data-formats/*',
      format: 'json',
      columns: ['title'],
      schema: {
        title: fields.slug({
          name: { label: 'Name (z.B. Markdown)' },
          slug: { label: 'Dateiendung (ohne Punkt, z.B. md)' },
        }),
      },
    }),

    tools: collection({
      label: '🛠️ Tools',
      slugField: 'title',
      path: 'src/content/tools/*',
      format: 'json',
      columns: ['title', 'url'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Name',
            validation: { isRequired: true },
          },
        }),
        description: fields.text({
          label: 'Beschreibung',
          multiline: true,
          validation: { isRequired: true },
        }),
        url: fields.text({
          label: 'Link / URL',
          validation: { isRequired: true },
        }),
        icon: fields.relationship({
          label: 'Icon',
          collection: 'icons',
        }),
      },
    }),

    icons: collection({
      label: '🎨 Icons',
      slugField: 'title',
      path: 'src/content/icons/*',
      format: 'json',
      columns: ['title'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Name',
            validation: { isRequired: true },
          },
          slug: { label: 'Slug' },
        }),
        svg: fields.text({
          label: 'SVG Quellcode',
          multiline: true,
          validation: { isRequired: true },
        }),
      },
    }),

    blog: collection({
      label: '📰 Blog & Impulse',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/blog/{slug}',
      columns: ['date', 'title', 'authorId'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Titel (optional – bei kurzen Impulsen leer lassen)',
          },
          slug: {
            label: 'Slug (URL-Pfad, z.B. 2026-05-effekte-rueckblick)',
          },
        }),
        date: fields.date({
          label: 'Datum',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        authorId: fields.relationship({
          label: 'Autor:in',
          collection: 'persons',
        }),
        image: fields.image({
          label: 'Bild (optional)',
          directory: 'public/assets/images/blog',
          publicPath: '/assets/images/blog',
        }),
        imageAlt: fields.text({
          label: 'Bildbeschreibung & Copyright',
        }),
        projectIds: fields.array(
          fields.relationship({
            label: 'Projekt',
            collection: 'projects',
            validation: { isRequired: true },
          }),
          {
            label: 'Verknüpfte Projekte',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        eventIds: fields.array(
          fields.relationship({
            label: 'Termin',
            collection: 'events',
            validation: { isRequired: true },
          }),
          {
            label: 'Verknüpfte Termine',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        datasetIds: fields.array(
          fields.relationship({
            label: 'Datensatz',
            collection: 'datasets',
            validation: { isRequired: true },
          }),
          {
            label: 'Verknüpfte Datensätze',
            description: 'Datensätze, auf die sich dieser Beitrag bezieht.',
            itemLabel: (props) => props.value ?? 'Datensatz auswählen',
          }
        ),
        tags: fields.array(
          fields.text({
            label: 'Tag',
            validation: { isRequired: true },
          }),
          {
            label: 'Schlagwörter',
            itemLabel: (props) => props.value,
          }
        ),
        fediverseUrl: fields.url({
          label: 'Fediverse / Mastodon / Feddit Diskussions-URL (optional)',
        }),
        content: fields.markdoc({
          label: 'Inhalt (Markdown)',
          extension: 'md',
          options: {
            heading: [2, 3, 4],
            bold: true,
            italic: true,
            strikethrough: true,
            code: true,
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            link: true,
            divider: true,
            image: {
              directory: 'public/assets/images/blog',
              publicPath: '/assets/images/blog/',
            },
          },
          components: {
            video: createVideoComponent('blog'),
          },
        }),
      },
    }),
  },
});
