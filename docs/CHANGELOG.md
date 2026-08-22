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

### Phase 3 — Camera capture flow
- Added `useCamera` (`src/composables/`): wraps `getUserMedia`, exposes `videoRef`/`isReady`/`error`/`facingMode`, and a `flip()` for front/rear switching and `capture()` that draws the current video frame to an off-screen canvas and returns a `Blob`.
- Added `useReducedMotion` (`src/composables/`), a thin wrapper over VueUse's `usePreferredReducedMotion`.
- Added `processPhotoBlob` (`src/utils/image.ts`): normalizes EXIF orientation via `createImageBitmap(..., { imageOrientation: 'from-image' })`, downsizes to a 1024px max edge, and re-encodes as WebP before it ever reaches IndexedDB.
- `PolaroidFrame` gained a `developing` prop driving the blur/desaturate → clear CSS transition.
- `CaptureView` now runs the real flow: live camera preview → shutter → review (retake/confirm) → save to `memoriesStore` → Polaroid developing animation → auto-advance to `/puzzle/:id`. Falls back to a plain gallery/file picker (no `capture` attribute, so the OS offers both camera and gallery) when `getUserMedia` is unsupported or permission is denied.
- Verified with Playwright/Chromium end-to-end, including with `--use-fake-device-for-media-stream` for the live-camera path and a real image file for the fallback path: both correctly write a processed WebP blob into the `memories` IndexedDB store and navigate to the puzzle route.

### Phase 4 — Puzzle engine
- Added `usePuzzle` (`src/composables/`): owns the piece state (`{ id, currentIndex, rotation }` per cell), a Fisher-Yates shuffle that randomizes position and rotation independently (with a guard against generating an already-solved shuffle), `swap()`, `rotate()`, and an `isSolved` computed.
- Added `PuzzleBoard` (`src/components/puzzle/`): renders the grid by slicing one image via `background-size`/`background-position` per piece (each piece always shows its *home* slice; only its position/rotation move) — no per-piece canvases or separate image assets needed. Pointer events (down/move/up, unified for mouse and touch via the Pointer Events API + `setPointerCapture`) implement **drag to move** (swaps with whatever occupies the drop cell, computed from pointer position against the board's bounding rect) and **tap to rotate** (a movement-threshold check distinguishes a tap from a drag). On solve, the per-piece borders/gaps drop out so the seams disappear and the board freezes against further input.
- `PuzzleView` wires a memory's photo into the board sized by `settingsStore.gridSize`, marks `puzzleSolved` in the store on completion, and auto-advances to `/wish/:id`. Added a guard (await `memoriesStore.load()` before checking for a photo) so a direct/refreshed load of `/puzzle/:id` doesn't race the store hydration and wrongly bounce back to capture.
- Verified by actually solving puzzles through real simulated pointer drags and taps in Playwright/Chromium (not just inspecting state) at both 3×3 and 5×5: pieces swap and rotate correctly, completion fires, `puzzleSolved` persists to IndexedDB, and the app navigates to the wish route. Confirmed the reassembled image is pixel-correct (original screenshot text reads correctly once solved), and that a 5×5 board produces exactly 25 pieces with no duplicate/missing cells.

### Phase 5 — Hidden wish reveal
- Added `WishNote` (`src/components/scrapbook/`): a folded-paper card that sits as a thin peeking strip when closed and unfolds (`max-height`/padding transition, text fading in with a slight delay so it doesn't render mid-clip) when opened.
- `WishView` shows the solved Polaroid; tapping it calls `markWishUnlocked` and opens the note with that memory's wish text from `WISH_NOTES`. A "Next memory" / "See the scrapbook" button (label depends on whether another memory follows in `MEMORY_PROMPTS` order) appears once revealed.
- Added a guard mirroring `PuzzleView`'s: `WishView` redirects to `/puzzle/:id` if that memory's puzzle isn't solved yet, after awaiting `memoriesStore.load()` to avoid the same hydration race. Verified the guards correctly cascade — visiting `/wish/:id` for a memory with no photo at all bounces through `/puzzle/:id` and on to `/capture/:id`.
- Verified end-to-end in Playwright: revealed the correct wish text for the memory, confirmed `wishUnlocked` persists to IndexedDB, and confirmed "Next memory" navigates to the next memory's capture route.

### Fix — endless piece rotation
- Found via manual phone testing: tapping a puzzle piece to rotate it appeared to "reset" every 4th tap instead of spinning continuously. Root cause: rotation was stored as a wrapped `0 | 90 | 180 | 270` value, so the CSS `transform: rotate()` transition from `270deg` back to `0deg` interpolated the shortest numeric path — backwards through 180/90 — instead of continuing forward to 360.
- Fixed in `usePuzzle.ts` by storing an unbounded, ever-incrementing `rotationSteps` count instead (the actual `rotate(steps * 90deg)` value passed to CSS never wraps, so every transition keeps spinning the same direction). Solved-state and display logic normalize it via a new `rotationDegrees()` helper (`((steps % 4) + 4) % 4 * 90`).
- Verified the raw transform value climbs monotonically across repeated taps (90, 180, 270, 360, 450, 540...) rather than wrapping, and re-ran the full solve-loop test to confirm completion detection still works correctly against the normalized value.
