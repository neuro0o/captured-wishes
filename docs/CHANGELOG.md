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
