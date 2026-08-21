# Changelog

All notable development milestones for Captured Wishes. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## Unreleased

### Phase 0 — Project scaffold
- Initialized Vite + Vue 3 + TypeScript project.
- Added Tailwind CSS v4 (`@tailwindcss/vite`) with the project's pastel palette and heading/body fonts declared as theme tokens in `src/style.css`.
- Added Pinia, Vue Router (hash history, for GitHub Pages compatibility), `idb`, `@vueuse/core`, `@vueuse/motion`, `canvas-confetti`.
- Set up base folder structure (`components/`, `composables/`, `content/`, `db/`, `stores/`, `views/`, `router/`, `types/`, `utils/`).
- Added hardcoded content file (`src/content/memories.config.ts`) with the 4 memory prompts and placeholder wish text.
- Added stub views for all 5 routes; Welcome view has initial brand styling.
- Verified production build and dev server both run cleanly.

### Phase 1 — Content & data layer
- Added IndexedDB schema (`src/db/schema.ts`) and `idb`-backed wrapper (`src/db/db.ts`): a `memories` store (one record per memory id, holding the photo blob, capture time, and puzzle/wish unlock flags) and a `settings` store (grid size, sound preference).
- Added Pinia stores (`src/stores/memories.ts`, `src/stores/settings.ts`) that hydrate from IndexedDB on load and persist changes back through it.
- `App.vue` now loads both stores on mount, seeding the 4 memory records on first run.
- Verified type-check and production build stay clean.
