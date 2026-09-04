# Architecture

A reading guide to how Captured Wishes actually works — the concept, the stack, how data moves through the app, and the reasoning behind the non-obvious decisions. For the product/design brief (tone, visual identity, UX intent), see [`Captured_Wishes_Product_Vision.md`](../Captured_Wishes_Product_Vision.md) at the repo root. For what's shipped so far phase by phase, see [`CHANGELOG.md`](./CHANGELOG.md) and [`ROADMAP.md`](./ROADMAP.md).

---

## 1. What this is

Captured Wishes is a **personalized, one-off birthday gift**, not a general product. On the recipient's birthday, they open a link on their phone and capture 3 photos back to back, guided by prompts ("something that makes you smile," "something you're grateful for," "something you're looking forward to"). Once all 3 are captured, each becomes a Polaroid puzzle to solve, one at a time; solving each reveals a hand-written note. After all 3 are done, everything comes together on a final scrapbook page with confetti, and the recipient can export the whole thing as a keepsake PDF.

The whole thing is **100% client-side** — no backend, no accounts, no server, no cloud storage. It's built to ship as a static site on GitHub Pages. Photos and progress live only in the recipient's own browser, via IndexedDB.

Because it's a gift for one specific person, the content (the 3 prompts, the wish text, the closing signature) is **hardcoded and hand-edited** in a single file before each deploy — there's intentionally no admin UI or CMS, since there's no server to host one.

---

## 2. Tech stack, and why

| Piece | Choice | Why |
|---|---|---|
| Framework | Vue 3, `<script setup>`, Composition API | Matches the brief; good fit for small reusable composables (camera, puzzle, reduced-motion) |
| Language | TypeScript | Strong typing for the IndexedDB schema and puzzle state, which are the trickiest parts to get right |
| Build | Vite | Fast dev server, simple config, first-class Vue plugin |
| Routing | Vue Router, **hash history** | See §5 — required for static hosting on GitHub Pages without server rewrites |
| State | Pinia | Thin reactive wrappers around IndexedDB (`memoriesStore`, `settingsStore`) — see §4 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) | No separate config file; theme tokens (palette, fonts) live in a `@theme` block in `src/style.css` |
| Storage | `idb` (tiny Promise wrapper around IndexedDB) | The schema is simple enough not to need a heavier library like Dexie |
| Utilities | `@vueuse/core` | `useObjectUrl` (blob→URL lifecycle), `usePreferredReducedMotion`, etc. — avoids hand-rolling browser-quirk-prone code |
| Animation | Hand-rolled CSS transitions + named keyframes, no library | Most of the "tactile" feel (developing photo, puzzle snap, note unfold, solve flourishes, camera flash) is plain CSS; JS only sets `setTimeout` delays and toggles trigger classes. See §9 |
| Celebration | `canvas-confetti` | Small, battle-tested, used once on the final scrapbook screen |
| Sound | Web Audio API (no lib) | `useAudio.ts` singleton — per-cue gain + gapless music loops; see §11 |

---

## 3. Project structure

```
src/
  assets/            fonts, textures (currently unused placeholders)
  components/
    polaroid/          PolaroidFrame.vue — the reusable Polaroid frame + "developing" transition
    puzzle/             PuzzleBoard.vue — the interactive puzzle grid
    scrapbook/          WishNote.vue — the unfolding note; ScrapbookExport.vue — hidden print sheet for the PDF
    ui/                 the Craft Table design-system primitives — CraftScreen (per-screen wrapper),
                        StickerButton, MarkerText, Doodle, PhotoCorners, ProgressFilmstrip,
                        ConfettiBits, PromptIcon, WashiTape, GridSizeToggle, SoundToggle
  composables/         useCamera.ts, usePuzzle.ts, useReducedMotion.ts, useScrapbookPdf.ts
  content/             memories.config.ts — ALL hand-edited personal content lives here
  db/                  schema.ts (types), db.ts (the idb wrapper + CRUD functions)
  router/              index.ts — the 5 routes, hash history
  stores/              memories.ts, settings.ts — Pinia stores backed by db.ts
  types/               memory.ts — shared TS types (MemoryId, GridSize, WishNote, ExportMemory)
  utils/               image.ts (photo processing), progress.ts (resume logic)
  views/               WelcomeView, CaptureView, PuzzleView, WishView, ScrapbookView — one per route
  App.vue              root shell; loads both stores on mount; keys router-view by full path
  main.ts              app entry — Pinia, Router, MotionPlugin
```

The rule of thumb: **components** are presentation-only, **composables** hold reusable stateful browser logic, **stores** hold cross-view reactive app state and are the only thing that talks to `db.ts` directly, **utils** hold pure functions (image processing, resume-step logic) with no Vue/DOM dependency.

---

## 4. Data layer: IndexedDB → Pinia → components

### Schema (`src/db/schema.ts`)

One IndexedDB database (`captured-wishes`), two object stores:

```ts
interface MemoryRecord {
  id: MemoryId              // '1' | '2' | '3'
  photoBlob: Blob | null
  capturedAt: number | null
  puzzleSolved: boolean
  wishUnlocked: boolean
}

interface SettingsRecord {
  key: 'app'                // single row
  gridSize: GridSize | null // 3 | 5
  sfxEnabled: boolean        // interaction cues
  musicEnabled: boolean      // background music bed
  soundEnabled?: boolean     // legacy single flag — read into both above, never written
}
```

- **`memories`** store, keyed by `id` — one row per memory.
- **`settings`** store, a single `'app'` row — the grid-size choice and the two sound preferences (`sfxEnabled` / `musicEnabled`, both default **on**; a missing field — fresh install or a pre-split record — falls back to on).

Photos are stored as raw `Blob`s, not base64 strings — base64 would bloat storage by ~33% and cost extra encode/decode time for no benefit, since IndexedDB natively supports storing binary blobs via structured clone.

### The wrapper (`src/db/db.ts`)

A handful of plain async functions built on `idb`'s `openDB`: `loadAllMemories()` (also seeds any missing memory rows on first run — see `MEMORY_PROMPTS`), `saveMemory()`, `loadSettings()`, `saveSettings()`. Nothing here is Vue-aware; it's a plain data-access module.

### The Pinia stores (`src/stores/`)

`memoriesStore` and `settingsStore` are thin reactive wrappers: their `load()` action reads from IndexedDB into reactive state, and their mutation actions (`capturePhoto`, `markPuzzleSolved`, `markWishUnlocked`, `setGridSize`, `toggleSfx`, `toggleMusic`) update both the in-memory reactive state *and* persist back to IndexedDB in the same call (via a private `persist()` helper). Both also expose a reset action — `memoriesStore.reset()` clears all captured progress and reseeds empty records, `settingsStore.resetGridSize()` clears just the grid-size choice (leaving the sound preferences alone) — wired to a "Start fresh" link on the Welcome screen so a recipient (or you, while testing) can wipe progress without opening DevTools.

**Components and views never touch `db.ts` directly** — they go through the stores. This keeps "what's the current state" (reactive, synchronous) and "how is it persisted" (async, IndexedDB) in one place instead of scattered across views.

### Boot sequence

`App.vue`'s `onMounted` calls `settingsStore.load()` and `memoriesStore.load()`. Because IndexedDB reads are async and component mounting is synchronous, there's a brief window on first paint where store state is still empty — components that need to gate on it (see §7) explicitly `await` a `load()` call themselves too, rather than assuming `App.vue` has already finished.

---

## 5. Routing

```
/                    WelcomeView    — cover screen, grid-size choice
/capture/:id         CaptureView   — camera capture for memory `id`
/puzzle/:id          PuzzleView    — solve that memory's puzzle
/wish/:id            WishView      — reveal that memory's hidden note
/scrapbook           ScrapbookView — final celebration page
```

Routing uses **`createWebHashHistory`** (URLs like `#/puzzle/2`) instead of the more modern-looking path-based history. This is deliberate: the app ships as static files on GitHub Pages with no server-side rewrite rules. With path-based history, refreshing the browser on `/puzzle/2` would 404 (GitHub Pages has no server to redirect that request back to `index.html`). Hash history sidesteps the problem entirely — everything after the `#` is client-side only, so the server only ever needs to know how to serve `index.html`.

`vite.config.ts` also sets `base: './'` (relative asset paths), so the build works regardless of what sub-path the repo ends up served from.

**A Vue Router gotcha this app hit for real**: `<router-view>` reuses the same component instance across a navigation that only changes route *params* on the same route record — e.g. `/capture/1` → `/capture/2` doesn't unmount/remount `CaptureView`, it just re-renders it with a new `id` prop. `onMounted` never fires again, so any local `ref` state (camera phase, captured blob) stays stuck from the previous memory. This was latent from the start but never triggered, because the original interleaved flow always routed through a different view (`PuzzleView`/`WishView`) between two visits to `CaptureView`. It surfaced once the flow became capture-all-first (§6) — three consecutive same-component navigations in a row. Fixed by keying `<router-view :key="route.fullPath">` in `App.vue`, forcing a fresh instance on every navigation rather than relying on each view to reset its own state via a route-param watcher.

---

## 6. The core flow, step by step

The experience runs in **two phases**: capture every memory's photo first, then solve puzzles and reveal wishes one memory at a time. See §8 for the resume logic this depends on.

### Welcome (`WelcomeView.vue`)
On mount, awaits both stores' `load()`. If no grid size has ever been chosen, shows the 3×3/5×5 picker; once chosen (this session or a previous one), it's never asked again — the picker is replaced by a "Let's pick up where you left off" line. The button's label and destination both depend on **actual progress**, not just whether a grid size is set (see the bug note in §8) — it reads "Open the scrapbook" for a genuinely fresh visitor and "Continue" for a returning one, and always navigates to `getResumeRoute(...)` (§8). A "Start fresh" link (shown only once there's progress to lose) clears all captured photos and the grid-size choice, behind a native confirm dialog.

### Capture (`CaptureView.vue`)
A small state machine: `camera → review → developing`.
- **camera**: `useCamera` (§9) wraps `getUserMedia`; a shutter button captures the current video frame to a canvas → `Blob`. If the camera is unavailable/denied, this section is replaced by a plain gallery/file picker.
- **review**: shows the just-captured (unprocessed) frame with Retake/Use-this-photo buttons.
- **developing**: on confirm, the raw blob is run through `processPhotoBlob` (§9), saved via `memoriesStore.capturePhoto()`, and shown inside `PolaroidFrame` with its `developing` transition (blur/desaturate → clear) before auto-advancing to `getResumeRoute(...)` — the next uncaptured memory's `/capture/:id` while phase one is still in progress, or the first puzzle once all photos are captured.

### Puzzle (`PuzzleView.vue` + `PuzzleBoard.vue`)
`usePuzzle` (§10) owns the shuffled piece state for a `gridSize × gridSize` grid. `PuzzleBoard` renders it by slicing **one** image via CSS `background-position` per piece (no per-piece image assets or canvases) and handles drag-to-move / tap-to-rotate via the Pointer Events API. On solve, `PuzzleView` calls `markPuzzleSolved` and auto-advances to that same memory's `/wish/:id`.

### Wish (`WishView.vue`)
Shows the solved Polaroid; tapping it calls `markWishUnlocked` and unfolds a `WishNote` with that memory's text from `WISH_NOTES`. A "Next puzzle" / "See the scrapbook" button appears once revealed, navigating via `getResumeRoute(...)` — to the next memory's puzzle, or to the scrapbook once all three are done.

`WishNote` is a card *frame* (the unfold `max-height`/opacity transition, washi tape, photo corner, fold creases) wrapping a separately-scrolling *body* — the body is capped and `overflow-y-auto` on mobile, `sm:max-h-none` above. Keeping the decorations on the frame rather than inside the scroll body is deliberate: as children of the scroll container they'd drift up through the text as you scroll (the photo corner in particular looked like a stray triangle mid-note). While the body has more below the fold, a mobile-only bottom fade + a bobbing "keep reading" chevron show; both are gated on a small `@scroll` check (`scrollHeight - scrollTop - clientHeight`), re-run on `open` and after the unfold settles.

### Scrapbook (`ScrapbookView.vue`)
Guarded to only render once all memories are `done` (see §8). Shows all captured photos as a centered, wrapping row of Polaroids (each independently backed by its own `useObjectUrl`), fires a `canvas-confetti` burst once per app session, and shows the closing message from `SCRAPBOOK_CLOSING`. Tapping any photo jumps back to that memory's (already-unlocked) `/wish/:id` to reread it. A "Save Scrapbook" button exports the whole thing as a PDF (see §13). A small house button top-left (mirroring `CraftScreen`'s sound toggles top-right) routes back to `/` — the only screen with an explicit "leave" affordance, since it's the end of the flow; Welcome then shows "Continue" (→ back here via `getResumeRoute`) and "start fresh".

---

## 7. Camera & image processing

**`useCamera` composable** (`src/composables/useCamera.ts`): wraps `getUserMedia`/`getTracks().stop()` lifecycle, exposes `videoRef`/`isReady`/`error`/`facingMode`, a `flip()` for front/rear switching, and `capture()` which draws the live video frame to an off-screen canvas and resolves a `Blob`.

**Gallery fallback**: the "choose from gallery" `<input type="file">` deliberately has **no `capture` attribute**. Adding one biases the OS picker toward opening the camera directly, which would defeat the point of it being the *fallback* path when the camera itself isn't available.

**`processPhotoBlob`** (`src/utils/image.ts`) runs on *every* captured photo, from either path:
1. Decodes via `createImageBitmap(blob, { imageOrientation: 'from-image' })` — this reads EXIF orientation automatically, so a gallery photo with rotation metadata comes out upright without any manual EXIF parsing.
2. Downsizes to a 1024px max edge (keeps IndexedDB storage and puzzle-rendering performance reasonable).
3. Re-encodes as WebP at quality 0.85.

---

## 8. Progression & resume logic

This is the part that makes the app resilient to reloads, deep links, and back-navigation — all built on one small utility, `src/utils/progress.ts`:

```ts
type MemoryStep = 'capture' | 'puzzle' | 'wish' | 'done'

// Which step a single memory is at.
function getMemoryStep(record): MemoryStep {
  if (!record?.photoBlob) return 'capture'
  if (!record.puzzleSolved) return 'puzzle'
  if (!record.wishUnlocked) return 'wish'
  return 'done'
}

// Where the recipient should be right now, across the whole app.
function getResumeRoute(records): RouteTarget {
  // Phase 1: any memory still missing a photo? -> its /capture/:id, in MEMORY_PROMPTS order.
  // Phase 2 (only once every memory has a photo): first memory not yet `done` -> its
  // /puzzle/:id or /wish/:id, in MEMORY_PROMPTS order. 'scrapbook' once all are `done`.
}
```

`getResumeRoute` encodes the app's two phases directly: it only ever points at a `puzzle`/`wish` route once *every* memory has a photo, and within each phase it walks `MEMORY_PROMPTS` in order, so it can't skip ahead — the recipient can't jump to capturing memory 3 before memory 2, or solving puzzle 2 before puzzle 1.

Every view's `onMounted` guards itself against being visited "out of order" — a direct URL, a page refresh mid-flow, or the browser back button — using this same helper, though `CaptureView`/`PuzzleView` and `WishView` use it slightly differently:

- **`CaptureView`** and **`PuzzleView`** may *only* render when they are exactly the current resume target — `getResumeRoute(records)` must resolve to this same route name and `id`, or they redirect there instead. This is stricter than "some progress exists" because both capturing and solving are meant to happen once, in order — revisiting an already-captured photo's `/capture/:id`, or an already-solved puzzle's `/puzzle/:id`, sends you to wherever you actually should be rather than letting you redo it.
- **`WishView`** is looser: it renders for a memory at the `wish` *or* `done` step (redirecting away only if that memory hasn't reached puzzle-solved yet), so a completed wish stays revisitable — both for its own "reread the note" tap-to-reveal state and for the scrapbook's tap-a-photo-to-reread-it navigation (§6).
- **`ScrapbookView`** redirects to `getResumeRoute(...)` unless every memory is `done`.
- **`WelcomeView`**'s "Continue" button navigates to `getResumeRoute(...)` instead of a hardcoded first route, and `CaptureView`/`WishView` push `getResumeRoute(...)` after finishing their own step rather than computing "what's next" themselves — one utility is both the guard and the navigation target everywhere.

**A real bug this caught**: the Welcome screen's button label was originally keyed off `settingsStore.gridSize` being set. But that flips true the instant *any* visitor — including a brand-new one — picks a grid size, before they've captured anything, so the button incorrectly read "Continue" on a first-ever run. Fixed by keying the label off actual progress (`memoriesStore.records` having any captured photo) instead. Caught via an actual end-to-end Playwright run, not by inspection — worth knowing if you're touching this logic again.

---

## 9. The puzzle engine, in detail

**Design**: a free-swap grid, not a sliding 15-puzzle with a blank tile — **drag** a piece onto another to swap their positions; **tap** a piece to rotate it 90°. A piece counts as solved when it's in its home cell *and* at 0° rotation, so the shuffle randomizes position and rotation independently.

**Image slicing**: rather than creating a separate image/canvas per piece, every piece is a `div` showing the *same* background image, sized via `background-size: N*100% N*100%` and offset via `background-position` computed from that piece's **home** id (not its current position) — so a piece always displays the correct slice of the photo no matter where it's currently sitting on the board.

**Interaction**: unified for mouse and touch via the Pointer Events API (`pointerdown`/`pointermove`/`pointerup` + `setPointerCapture`). A movement-distance threshold distinguishes a tap (rotate) from a drag (move): if the pointer moves more than ~6px before release, it's a drag; otherwise it's a tap. On drop, the target cell is computed from the pointer's final position against the board's bounding rect.

**The rotation-wrap bug** (worth understanding if you touch this code): rotation is stored as an **unbounded, ever-incrementing** step count (`rotationSteps`), not a wrapped `0/90/180/270` value. The reason: `transform: rotate()` transitions interpolate the *shortest numeric path* between two values. If you wrap the stored value back to `0deg` after `270deg`, the browser animates *backwards* through 180°/90° instead of continuing forward — it looks like the piece "resets." Storing an ever-growing step count and computing the actual CSS value as `steps * 90deg` means the transform passed to CSS always increases, so every rotation keeps spinning the same direction forever. The *logical* solved-check still normalizes via `rotationDegrees(steps) = ((steps % 4) + 4) % 4 * 90`.

**Solve feedback**: after every drop/rotate, `onSettleChanged()` diffs a `Set` of pieces that are home + upright against the previous state. Newly-settled pieces (but never the final one — the whole-board celebration covers that) fire the `puzzle-solved-snap` cue and, unless reduced motion is set, get the `.piece-snap` class for ~0.6s: a springy scale "boing" (1 → 1.14 → 0.96 → 1) on the cell wrapper, plus a bright *inset* soft-yellow ring + brightness flash on the image (`.piece-snap > div`). The ring is `inset` deliberately — an outward glow is clipped by the board's `overflow-hidden`; the child keyframe also avoids `transform` so the piece's inline rotate survives. When that drop *solves* the board, `PuzzleBoard` adds `.board-solve-pulse` (a one-shot ring that rings outward to the resting halo) and emits `solved`; `PuzzleView` then plays `puzzle-finished`, fires a small pastel `canvas-confetti` burst, and springs the "You found it!" badge in with `.badge-pop`. All classes are neutralised by the reduced-motion kill-switch, and the JS paths that add them also check `useReducedMotion()`.

---

## 10. Visual design system — "Craft Table"

The look is a maximalist handmade scrapbook: tinted craft paper, washi tape, hand-drawn doodles, sticker buttons, hard-offset shadows. Palette, fonts and shadows are Tailwind v4 theme tokens in an `@theme` block at the top of `src/style.css` (there's no `tailwind.config.js` — v4's Vite plugin reads this block directly):

- **Colours** (deliberately soft/pastel, nothing saturated): base `cream`, `warm-white`, `dusty-pink`, `sage`, `lavender`, `sky`, `soft-yellow`, `ink`; plus near-white per-screen paper tints `paper-cream|yellow|sky|pink|lavender|sage` and a `desk` colour for the surface behind the page on wide screens.
- **Shadows**: `shadow-craft` / `-sm` / `-lg` are hard-offset ink shadows (e.g. `6px 6px 0 #4a3f35`) — the "cut paper" look on buttons, badges and framed photos; `shadow-craft-soft` is a softer variant for small chrome.
- **Fonts**: `font-heading` (Patrick Hand / Caveat / Kalam) for headings, `font-hand` (Caveat) for handwritten accents and the wish letters, `font-body` (Inter / Nunito) for everything else — all loaded via Google Fonts `<link>` tags in `index.html`.
- **Textures / effects** (utility classes, also in `style.css`): `paper-dots` (dot grid), `paper-ruled` (faint notebook rules), `torn-bottom` (jagged clip-path for banners), `marker-swipe` (the highlighter block behind a heading, drawn by `MarkerText`).

**`CraftScreen` is the layout primitive.** Every view wraps its content in `<CraftScreen tint="…">`, which renders: on mobile, a full-bleed tinted-paper screen with the dot/rule textures, four washi-tape strips along the edges, and the persistent `SoundToggle` (two buttons — SFX and music) top-right. On `sm`+ the same thing becomes a **bounded "page" panel** (`max-w-md`, rounded, drop-shadowed) centred on a `desk-surface` background — reading as an actual scrapbook page lying on a desk instead of a phone-width column stranded in empty space. The panel is `overflow-hidden`, which also keeps decorative bleed (washi ends, banner corners, confetti) from expanding the document's scrollable area. Views add `sm:justify-center` so short screens centre vertically on the page.

The `components/ui/` primitives compose on top: `StickerButton` (chunky ink-bordered button), `MarkerText` (highlighter-swipe heading), `Doodle` (the SVG doodle set by `name`), `PhotoCorners` / `WashiTape` / `PromptIcon` (Polaroid decoration + the drawn smile/letter/sprout icons that replace the emoji prompts), `ProgressFilmstrip` ("memory N of 3"), `ConfettiBits` (static paper scatter — the animated burst is still `canvas-confetti`), `GridSizeToggle`.

**Reduced motion**: `style.css` carries a global `prefers-reduced-motion` CSS kill-switch that zeroes out all CSS transition/animation durations site-wide. JS-driven effects that aren't pure CSS (the confetti bursts, the `setTimeout` delays gating auto-navigation, the puzzle solve flourishes) additionally check `useReducedMotion()` explicitly, since the CSS rule alone doesn't reach them. Audited call sites: `CaptureView`, `PuzzleView`, `PuzzleBoard`, `ScrapbookView` — all branch on `useReducedMotion()` (and `canvas-confetti` also gets `disableForReducedMotion: true`).

---

## 11. Sound

`src/composables/useAudio.ts` is a **module-level singleton**, not a `useX()` composable — the background music has to persist across route changes, so its state can't live inside a view. It exports plain functions (`unlockAudio`, `setSfxEnabled`, `setMusicEnabled`, `playSfx`, `startMusic`, `stopMusic`).

**SFX and music switch independently.** Two internal flags (`sfxEnabled`, `musicEnabled`); `playSfx` gates on the first, `startMusic` on the second. The recipient can silence the music but keep the interaction cues, or the reverse. **Both default on** — but nothing is audible until the first gesture unlocks the `AudioContext` (see *Autoplay policy* below), so this isn't an autoplay violation. `App.vue`'s pref watchers are `{ immediate: true }` because `store.load()` usually leaves an already-on value unchanged and a plain watcher would never fire on startup.

**Web Audio, not `<audio>` elements.** One `AudioContext` with a master `GainNode`; each played sound gets its own `GainNode` so per-cue levels are set in code (`SFX_GAIN` / `MUSIC_GAIN` — all deliberately low, per the product spec's "very subtle") instead of by re-exporting files. Music beds are `AudioBufferSourceNode` with `loop = true`, which is sample-accurate gapless — `<audio loop>` clicks at the seam in several browsers. Files are `fetch` + `decodeAudioData`, cached in a `Map`, preloaded when SFX are switched on; a missing or undecodable file resolves to `null` and is skipped, never throws.

**Files** live in `public/sfx/` (copied verbatim, no content hashing), referenced as `` `${import.meta.env.BASE_URL}sfx/${name}.mp3` `` → a relative `./sfx/...` that resolves against `index.html` on both root and subpath (GitHub Pages) deploys, unaffected by the hash route.

**Cues** (SFX gated on `settingsStore.sfxEnabled`, music on `settingsStore.musicEnabled`; neither gated on reduced-motion — that's about vestibular motion, not audio):

| Sound | Trigger |
|---|---|
| `camera-shutter` | `CaptureView` shutter tap **and** the "choose from gallery" file pick. Pairs with `snapFlash()` — a ~0.34s white `.camera-flash` overlay across the panel (skipped under reduced motion). |
| `puzzle-start` | `PuzzleView` mount (once it's the real resume target) |
| `puzzle-rotate` | tap-to-spin a piece (`PuzzleBoard.onPointerUp`, tap branch) |
| `puzzle-solved-snap` | a piece reaches home + 0° — `PuzzleBoard` tracks settled ids in a `Set` and plays only on the transition in; suppressed on the final piece so it doesn't stack with `puzzle-finished`. Pairs with the `.piece-snap` scale-pop/glow. |
| `puzzle-finished` | `PuzzleView.handleSolved` (whole puzzle solved). Pairs with the `.board-solve-pulse` ring, a pastel `canvas-confetti` burst, and the `.badge-pop` "You found it!" spring. |
| `note-unfold` | `WishView.reveal` |
| `main-theme` (loop) | every screen **except** the scrapbook |
| `all-complete` (loop) | the scrapbook screen (replaces `main-theme`, crossfaded over `MUSIC_FADE`) |

**Orchestration** is in `App.vue`: watchers on `settingsStore.sfxEnabled`, `settingsStore.musicEnabled` and `route.name` call `setSfxEnabled()` / `setMusicEnabled()` / `startMusic(musicForRoute(route.name))`. `startMusic` is idempotent per bed and uses a monotonic `musicToken` so a slow buffer load that resolves after a newer request bails out.

**Autoplay policy**: since music defaults on, the common first-load case is `musicEnabled === true` with no gesture yet, so the `AudioContext` is created `suspended` and can't play. `startMusic` handles this by arming a one-shot `pointerdown`/`keydown`/`touchstart` window listener that resumes the context and starts the pending bed on the first interaction anywhere on the page. Each `SoundToggle` button also calls `unlockAudio()` synchronously inside its click, so toggling sound off-then-on always works immediately.

---

## 12. What's not built yet

See [`ROADMAP.md`](./ROADMAP.md) for the full list. All MVP phases (0–8) plus the Craft Table redesign, PDF export, and SFX + music are **done**. The one code follow-up worth doing eventually: real embedded-font text in the PDF instead of a full-page raster (§13). Asset follow-up (not code): re-encode `main-theme.mp3` (~3.6 MB) at a lower bitrate and confirm the two music loops have no trailing silence at the seam. Everything from "PWA install" through "true jigsaw shapes" is explicitly out of scope for the MVP (see the Product Vision doc's "Future Ideas") — the notable one is **MP4 export** (would need `MediaRecorder` over a canvas/DOM capture + audio; a real project on its own).

---

## 13. PDF keepsake export

`ScrapbookView`'s "Save Scrapbook" button (`useScrapbookPdf` composable) produces a 4-page A4 PDF: a cover (title, the three photos with washi tape + captions, closing message) and one page per memory with its photo as a Polaroid and the full handwritten wish letter (font size auto-scaled down for longer letters so each fits one page).

- **`ScrapbookExport.vue`** is a hidden, print-styled sheet — one `.export-page` div (794×1123, A4 at 96dpi) per PDF page — rendered off-screen (`position: fixed; left: -10000px`) inside `ScrapbookView`.
- **`useScrapbookPdf.ts`** rasterises each `.export-page` with `html-to-image` (`toJpeg` at `pixelRatio: 3` → the 794×1123 sheet becomes a 2382×3369 image, ~288 DPI on A4) and assembles the images into a PDF with `jspdf`. `pixelRatio` is capped at 3 deliberately — 4 would make the canvas 4492px tall and hit iOS Safari's 4096px-per-dimension limit. Both libraries — and jspdf's transitive `html2canvas` / `dompurify` — are `import()`-ed inside the export call, so they stay out of the initial bundle entirely. The whole page (handwriting included) is a raster, not vector text, so quality is a function of `pixelRatio`; a truly crisp export would need real embedded-font text via `jsPDF.addFont`/`doc.text`, a much larger rewrite.
- **Fonts**: `html-to-image` renders into an SVG `<foreignObject>` drawn onto a canvas, where external font URLs never load and the browser's own font cache can't be read cross-origin. So the composable fetches the Google Fonts CSS itself, re-fetches each `woff2`, and rewrites the CSS with `base64` `data:` URIs before handing it to `toJpeg` as `fontEmbedCSS`. Without this the handwriting renders as a system fallback (and the wider fallback metrics cause text overlap).
- **Photos** are converted to `data:` URLs (via `FileReader`) before the sheet renders — blob URLs failed to load inside html-to-image's cloned render.
- Output is JPEG-per-page at `quality: 0.96`, ~1.4 MB for a typical 4-page set. `jspdf`'s `save()` triggers a normal browser download — fine on the real static site (this isn't sandboxed like a preview).
