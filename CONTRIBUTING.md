# Contributing to OK Lab Karlsruhe

Vielen Dank für dein Interesse an der Website und Wissensgraph-Plattform des **OK Lab Karlsruhe**! Beiträge zu Code, Inhalten, Projekten, Datensätzen und Fehlerbehebungen sind herzlich willkommen.

## Verhaltenskodex

Bitte beachte unseren [Code of Conduct](CODE_OF_CONDUCT.md) in allen Issues, Pull Requests und Diskussionen.

## Arten von Beiträgen

- **Inhalte (Projekte, Termine, Datensätze, Blog):** Als Markdown/JSON unter `src/content/` per Pull Request oder über das Keystatic CMS (`/keystatic`) für Lab-Mitglieder.
- **Code & UI:** Astro-Komponenten, Styles, Utilities und Tests unter `src/`.
- **Fehlermeldungen & Ideen:** Über die [GitHub Issue Templates](.github/ISSUE_TEMPLATE).

## Lokale Entwicklung

Voraussetzungen: **Node.js 22+** und **pnpm 11+**.

```bash
pnpm install
pnpm run dev
```

- Website: `http://localhost:4321/`
- Keystatic Admin (lokaler Modus): `http://localhost:4321/keystatic`

## Qualitätssicherung vor dem Pull Request

Bitte stelle sicher, dass folgende Checks lokal ohne Fehler durchlaufen:

```bash
pnpm run format:check
pnpm run lint
pnpm run test
pnpm run sync
pnpm run check
pnpm run build
```

## Bilder & Medien

Alle Rasterbilder unter `public/assets/images/` (außer `.svg` und Favicons) sollen im **WebP**-Format vorliegen und maximal **1920×1080 px** groß sein. Du kannst dies lokal mit `node scripts/check-images.mjs` prüfen.

## Lizenzierung von Beiträgen

Mit dem Einreichen eines Pull Requests erklärst du dich einverstanden, dass:

- **Code-Beiträge** unter der **Apache License 2.0** lizenziert werden,
- **redaktionelle Inhalte** unter **CC-BY-4.0** lizenziert werden,
- und du für beigesteuerte **Medien (Bilder/Videos)** die erforderlichen Nutzungsrechte besitzt (siehe [LICENSE](LICENSE)).
