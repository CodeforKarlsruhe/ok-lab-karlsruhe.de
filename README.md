# OK Lab Karlsruhe — Website

Die Website des **OK Lab Karlsruhe**, Teil des bundesweiten Netzwerks _Code for Germany_ (Open Knowledge Foundation Deutschland). Hier präsentieren wir lokale Civic-Tech-Projekte, offene Daten (Open Data), Hackathons und regelmäßige Community-Treffen.

Das Projekt basiert auf **Astro 5** als modernem Static Site Generator (SSG) und **Keystatic CMS** als Git-basierter WYSIWYG-Redaktionsoberfläche für den lokalen Wissensgraphen (Projekte, Datensätze, Ideen, Protokolle, Mitglieder und Portale).

---

## 🚀 Lokale Entwicklung & Build

### Voraussetzungen

- **Node.js**: Version 20+ (Node 22 LTS empfohlen)
- **pnpm**: Version 11+

### Schnellstart

```bash
# 1. Abhängigkeiten installieren (aktiviert automatisch Husky Git-Hooks):
pnpm install

# 2. Lokalen Entwicklungsserver starten:
pnpm run dev
```

Öffne anschließend im Browser:

- **Website Übersicht:** [http://localhost:4321/](http://localhost:4321/)
- **Keystatic WYSIWYG Admin:** [http://localhost:4321/keystatic](http://localhost:4321/keystatic)

### Verfügbare Skripte

```bash
pnpm run dev           # Startet lokalen Astro-Dev-Server mit Hot-Reload
pnpm run check         # Prüft Typsicherheit, Astro-Templates & Keystatic-Konfiguration
pnpm run build         # Erstellt den produktionsfertigen statischen Build in dist/
pnpm run preview       # Startet lokalen Vorschau-Server für den erstellten Build

pnpm run lint          # Prüft den Code mit ESLint
pnpm run lint:fix      # Behebt gefundene ESLint-Probleme automatisch
pnpm run format:check  # Prüft mit Prettier auf Code-Formatierung
pnpm run format        # Formatiert alle Dateien mit Prettier
pnpm run test          # Führt die Unit-Tests (Vitest) aus
pnpm run sync          # Synchronisiert Astro Content Collections & generiert Typen
node scripts/check-images.mjs # Prüft Bildformat (WebP) und Größe (max. 1920×1080 px)
```

---

## 📁 Projektstruktur

```text
oklab-home/
├── .github/
│   └── workflows/ci.yml       # GitHub Actions CI & Deploy (Check, Build, SFTP-Deploy)
├── .husky/
│   ├── pre-commit             # Git Hook: Automatisches Linting & Formatting via lint-staged
│   └── pre-push               # Git Hook: Validierung (sync, check, build) vor jedem Push
├── public/                    # Statische Assets (Bilder, Icons, Favicons)
│   └── assets/images/         # Projekt-, Event- und Teamfotos, Logo
├── src/
│   ├── components/            # Wiederverwendbare UI- & Card-Komponenten
│   │   ├── cards/             # DatasetCard, EventCard, ProjectCard, ProtocolCard etc.
│   │   ├── layout/            # Header, Footer, Navigation, Breadcrumbs
│   │   ├── search/            # SearchSpotlight (Spotlight-Suche via Fuse.js)
│   │   └── ui/                # Buttons, Badges, FilterBar, FilterableGrid, ViewSwitcher
│   ├── content/               # Content Collections (Wissensgraph Markdown & JSON)
│   │   ├── datasets/          # Open-Data-Datensätze
│   │   ├── events/            # Events, Meetups & Hackathons
│   │   ├── ideas/             # Projektideen
│   │   ├── members/           # Lab-Mitglieder & Rollen
│   │   ├── portale/           # Open-Data-Portale
│   │   ├── projects/          # Eigene & externe Civic-Tech-Projekte
│   │   ├── protocols/         # Treffen- & Plenums-Protokolle
│   │   └── settings/          # Globale Lab-Einstellungen & Kontaktinfos
│   ├── layouts/
│   │   └── Layout.astro       # Basis-Seitenlayout (HTML-Shell, Meta, CSS)
│   ├── pages/                 # Datei-basiertes Routing
│   │   ├── about/             # Über uns & Team
│   │   ├── daten/             # Datensatz-Verzeichnis & Detailseiten
│   │   ├── events/            # Event-Kalender & Detailseiten
│   │   ├── portale/           # Open-Data-Portale
│   │   ├── projekte/          # Projektübersicht & Detailseiten
│   │   ├── protokolle/        # Protokollarchiv & Detailseiten
│   │   ├── index.astro        # Startseite
│   │   ├── search-index.json.ts # Statischer Suchindex für clientseitige Suche
│   │   ├── suche.astro        # Volltextsuche
│   │   └── tooling/           # Internes Tooling & Community-Ressourcen
│   ├── styles/                # CSS Stylesheets & Design Tokens
│   └── utils/                 # Hilfsfunktionen
├── astro.config.mjs           # Astro-Konfiguration & Integrationen
├── keystatic.config.ts        # Keystatic CMS Schema- & Collection-Definitionen
└── tsconfig.json              # TypeScript-Konfiguration
```

---

## 🛡️ Code-Qualität, Git Hooks & CI/CD

Das Repository setzt auf mehrstufige automatisierte Qualitätssicherung:

1. **Pre-Commit Hook (Husky & lint-staged):**
   - Formatiert und korrigiert gestagete Dateien vor jedem Commit automatisch via `eslint --fix` und `prettier --write`.
2. **Pre-Push Hook (Husky):**
   - Prüft vor jedem `git push` lokal Typen und Content-Collections (`pnpm run sync`, `pnpm run check`) sowie den Produktions-Build (`pnpm run build`).
3. **GitHub Actions CI/CD (`.github/workflows/ci.yml`):**
   - Führt bei jedem Pull Request und Push auf allen Branches Checks & Build aus:
     - `pnpm run format:check` (Prettier Check)
     - `pnpm run lint` (ESLint Check)
     - `pnpm run test` (Vitest Unit-Tests)
     - `pnpm run check` (Astro- & TypeScript-Typen inkl. `keystatic.config.ts`)
     - `pnpm run build` (Astro Produktions-Build & Schemavalidierung)
   - Bei Push auf `main` wird im Anschluss im selben Runner direkt per `lftp` (SFTP) auf den Webhoster deployt (inkl. inkrementellem Diff-Cache).

---

## 🛠 Technologien

- **Astro 5**: Moderne Insel-Architektur, statischer SSG-Build, performantes Pre-Rendering
- **Keystatic CMS**: Git-basiertes WYSIWYG-Redaktionssystem für den Wissensgraphen
- **TypeScript**: Strikte Typisierung von Schemas, Relationen und Komponenten
- **pnpm**: Schneller, speichereffizienter Paketmanager mit deterministischem Lockfile
- **ESLint & Prettier**: Automatisierte Code-Qualitätsprüfung und Formatierung (inkl. Astro-Plugins)
- **HTML5 & CSS3**: Semantische Strukturierung, Responsive Design (Flexbox & Grid), CSS-Variablen
- **React**: Komponenten für Keystatic Admin und interaktive UI-Inseln
- **Fuse.js**: Clientseitige Volltextsuche über den statisch generierten Suchindex
- **Typografie**: Google Font [Inter](https://fonts.google.com/specimen/Inter)

---

## 🤝 Mitmachen & Kontakt

Lust auf Civic Tech und offene Daten in Karlsruhe?

- Website: [ok-lab-karlsruhe.de](https://ok-lab-karlsruhe.de)
- E-Mail: [info@ok-lab-karlsruhe.de](mailto:info@ok-lab-karlsruhe.de)
- Treffen: [Internes Tooling](https://ok-lab-karlsruhe.de/tooling)
- Beiträge & Richtlinien: [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

---

## 📄 Lizenz

- **Quellcode** (`src/`, `scripts/`, Konfiguration): [Apache License 2.0](LICENSE-APACHE)
- **Redaktionelle Inhalte** (`src/content/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Medien** (`public/assets/`): Urheberrechtlich geschützt, sofern am jeweiligen Medium keine andere Lizenz angegeben ist (siehe [LICENSE](LICENSE)).
