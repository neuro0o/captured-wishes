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

### Phase 2 — Welcome & scrapbook shell UI
- Added `PolaroidFrame` (`src/components/polaroid/`), `WashiTape` and `GridSizeToggle` (`src/components/ui/`) as the first reusable presentational pieces of the visual identity.
- Welcome screen now asks the recipient to choose a puzzle grid size (3×3 or 5×5) once, persisted via `settingsStore.setGridSize`; "Open the scrapbook" stays disabled until a size is chosen.
- Added decorative washi tape and corner Polaroid flourishes to the Welcome screen.
- Verified in a real headless-browser render (Playwright/Chromium): fixed a stacking-context bug where `-z-10` on the decorative Polaroids pushed them behind the page's own background (negative z-index escapes a `position: relative` ancestor that never set its own `z-index`, landing in the root stacking context instead) — removed the z-index and rely on DOM order instead.
- Reworked the Welcome layout after spotting page-level horizontal/vertical scrollbars on a wide viewport: the full-bleed corner Polaroids were expanding the document's scrollable area. Content now lives inside a bounded, `overflow-hidden` "page" panel (`max-w-xl`, rounded, shadowed) centered on the cream background, so the bleed decorations clip against the panel instead of the viewport — also fixes the sparse/empty-looking layout on wide desktop windows.
