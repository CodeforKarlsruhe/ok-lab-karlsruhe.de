# OK Lab Karlsruhe — Website

Die Website des **OK Lab Karlsruhe**, Teil von _Code for Germany_ (Open Knowledge Foundation Deutschland). Sie präsentiert lokale Civic-Tech-Projekte, offene Daten, Termine, Blogbeiträge und Protokolle.

> **Status: Public Beta** — Die Seite befindet sich im Aufbau (`PreviewBanner` aktiv, `public/robots.txt` steht auf `Disallow: /`). Die aktuelle produktive Homepage liegt weiterhin unter [ok-lab-karlsruhe.de](https://ok-lab-karlsruhe.de).

## 🚀 Lokale Entwicklung

Voraussetzungen: **Node.js 22+** und **pnpm 11+**.

```bash
pnpm install   # Installiert Abhängigkeiten und aktiviert Husky Git-Hooks
pnpm run dev   # Startet Dev-Server (http://localhost:4321/) & Keystatic CMS (/keystatic)
```

### Wichtige Skripte

```bash
pnpm run check                 # Astro- & TypeScript-Typprüfung (inkl. Keystatic)
pnpm run test                  # Unit-Tests (Vitest)
pnpm run lint                  # ESLint-Prüfung (lint:fix für Auto-Fix)
pnpm run format:check          # Prettier-Prüfung (format für Auto-Format)
pnpm run build                 # Produktions-Build nach dist/
node scripts/check-images.mjs  # Prüft Rasterbilder (WebP, max. 1920×1080 px)
```

## 📁 Aufbau

- `src/content/` — Redaktionelle Inhalte & Wissensgraph (Markdown/JSON: Projekte, Datensätze, Events, Blog, Personen, Organisationen, Protokolle, Einstellungen)
- `src/pages/` & `src/components/` — Astro-Seiten, Layouts und UI-Komponenten
- `public/` — Statische Assets (`assets/images/`, `assets/videos/`, selbstgehostete Fonts `Inter` & `Arimo`, `robots.txt`)
- `keystatic.config.ts` — Schema & Navigation für das Git-basierte Keystatic CMS

## 🛡️ Qualitätssicherung & Deployment

- **Git Hooks (`.husky/`):** `pre-commit` führt `eslint --fix` + `prettier --write` auf gestagten Dateien aus; `pre-push` prüft `test`, `sync`, `check` und `build`.
- **CI & SFTP-Deploy (`.github/workflows/ci.yml`):** Prüft Formatierung, Linting, Tests, Bilder, Typen und Build bei jedem Push/PR und deployt `main` statisch per SFTP (`lftp`).
- **Netlify & Keystatic (`netlify.toml`, `astro.config.mjs`):** Adapter und Config für Branch-Previews und Keystatic GitHub-OAuth sind vorbereitet (im lokalen Dev-Modus läuft Keystatic ohne OAuth direkt auf dem Dateisystem).

## 🤝 Mitmachen & Kontakt

- Website: [ok-lab-karlsruhe.de](https://ok-lab-karlsruhe.de) · E-Mail: [info@ok-lab-karlsruhe.de](mailto:info@ok-lab-karlsruhe.de)
- Richtlinien: [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

## 📄 Lizenz

- **Quellcode** (`src/`, `scripts/`, Konfiguration): [Apache License 2.0](LICENSE-APACHE)
- **Redaktionelle Inhalte** (`src/content/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Medien** (`public/assets/`): Urheberrechtlich geschützt, sofern am Medium nichts anderes angegeben ist (Details in [LICENSE](LICENSE)).
