# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Captured Wishes is a mobile-first, **100% client-side** interactive birthday gift for one specific recipient: capture all photos first → each becomes a Polaroid → then solve each one's puzzle in turn → solving reveals a hidden handwritten wish → after all memories are done, a final scrapbook/celebration screen. Full product/design spec lives in `Captured_Wishes_Product_Vision.md` at the repo root — read it for tone, visual identity, and UX details before making product decisions.

There is no backend, no auth, no server, and no cloud storage, by design — it ships as a static site (GitHub Pages). Photos and progress persist in the browser via IndexedDB.

## Commands

```bash
npm install      # install deps
npm run dev       # start Vite dev server
npm run build      # type-check (vue-tsc -b) then production build to dist/
npm run preview     # serve the production build locally
```

There is no test suite yet.

## Architecture

**Stack:** Vue 3 (Composition API, `<script setup>`) + TypeScript + Vite, Pinia, Vue Router, Tailwind CSS v4, `idb` (IndexedDB wrapper), `@vueuse/core`, `@vueuse/motion`, `canvas-confetti`.

**Content is hardcoded, not authored via UI.** `src/content/memories.config.ts` holds the 3 memory prompts, the wish text shown after each puzzle is solved, and the scrapbook's closing message. This is edited by hand before each deploy — there is intentionally no CMS or admin UI, since the site is static.

**Routing uses hash history** (`createWebHashHistory` in `src/router/index.ts`) deliberately, so deep links like `#/puzzle/2` survive a page refresh on GitHub Pages without needing server-side rewrites. Routes: `/` (welcome) → `/capture/:id` → `/puzzle/:id` → `/wish/:id` → `/scrapbook`, where `id` is a memory id (`'1'`–`'3'`). `App.vue` keys `<router-view>` by `route.fullPath` — routes like `/capture/:id` otherwise reuse the same component instance across a param-only navigation (e.g. `capture/1` → `capture/2`), leaving local view state (camera phase, captured blobs) stuck from the previous memory.

**Vite config** (`vite.config.ts`) sets `base: './'` for relative asset paths (subpath-safe on GitHub Pages), and defines the `@` → `src/` alias. The same alias is duplicated in `tsconfig.app.json` under `compilerOptions.paths` (no `baseUrl` — it's deprecated in the TypeScript version pinned here; don't reintroduce it).

**Tailwind v4** is wired via the `@tailwindcss/vite` plugin — there is no `tailwind.config.js`/PostCSS config. Theme tokens (color palette, font stacks) are declared in an `@theme` block at the top of `src/style.css`. The palette is deliberately soft/pastel only (cream, warm-white, dusty-pink, sage, lavender, sky, soft-yellow, ink) — nothing saturated. Headings use `font-heading` (Patrick Hand/Caveat/Kalam), body text uses `font-body` (Inter/Nunito); both loaded via Google Fonts `<link>` tags in `index.html`.

`src/style.css` also carries a global `prefers-reduced-motion` CSS kill-switch. Any JS-driven animation added later (confetti, `@vueuse/motion` springs) must independently respect reduced-motion — the CSS rule doesn't cover those.

**Folder structure** (`src/`): `components/{polaroid,puzzle,scrapbook,ui}` for presentation, `composables/` for reusable browser logic (camera, puzzle mechanics, reduced-motion), `content/` for the hardcoded config above, `db/` for the IndexedDB wrapper/schema, `stores/` for Pinia (app-level state like current step, grid size, sound preference), `views/` for routed pages, `types/` for shared TS types.

## Domain-specific design decisions worth preserving

- **Flow is two-phase:** capture all memories' photos first (`/capture/1` → `/capture/2` → `/capture/3`), *then* solve puzzles and reveal wishes one memory at a time in the same order (`/puzzle/1` → `/wish/1` → `/puzzle/2` → …). `src/utils/progress.ts`'s `getResumeRoute()` is the single source of truth for "where should the recipient be right now" and drives both phases — every view's mount guard and all forward navigation goes through it rather than each view computing its own next-step logic.
- **Puzzle mechanic:** free-swap grid, not a sliding 15-puzzle with a blank tile. **Drag** moves/swaps a piece's position; **tap rotates** a piece 90° ("spin"). A piece is solved when it's in its home cell *and* at 0° rotation — so shuffle logic must randomize position and rotation independently. Rotation is stored as an unbounded, ever-incrementing step count rather than a wrapped `0/90/180/270` value — wrapping it makes the CSS `rotate()` transition animate backwards on every 4th tap, since the browser interpolates the shortest numeric path between two values.
- **Grid size** (3×3 or 5×5) is chosen once by the recipient at the very start of the experience and applies to all memories — it is not re-asked per puzzle.
- **Sound** defaults off, with a persistent on/off toggle always visible; the toggle press itself serves as the user gesture required to unlock audio playback under mobile autoplay policies.
- **IndexedDB shape** (`src/db/schema.ts`, `src/db/db.ts`): a single `memories` object store keyed by memory id (`'1'`–`'3'`) holding `{ photoBlob, capturedAt, puzzleSolved, wishUnlocked }`, plus a `settings` store (single `'app'` record) for `gridSize` / `soundEnabled`. `src/stores/memories.ts` and `src/stores/settings.ts` are the reactive Pinia wrappers around it — components should go through those stores, not `src/db/db.ts` directly. `App.vue` calls `load()` on both stores on mount, which also seeds the memory records on first run. Both stores expose a `reset`/`resetGridSize` action (wired to a "Start fresh" link on the Welcome screen, behind a confirm dialog) that wipes captured progress without needing DevTools.
- **Captured photos** are always run through `processPhotoBlob` (`src/utils/image.ts`) before being persisted — decoded via `createImageBitmap(..., { imageOrientation: 'from-image' })` (so gallery-fallback uploads with EXIF rotation come out upright without manual EXIF parsing), downsized to a 1024px max edge, and re-encoded as WebP. This applies uniformly to both the live-camera path and the file-input fallback in `CaptureView`.
- **Camera fallback** (`CaptureView`): the "choose from gallery" `<input type="file">` deliberately has **no** `capture` attribute — adding one biases the OS picker toward opening the camera directly instead of offering the gallery, which defeats the point of it being the fallback/alternate path.
