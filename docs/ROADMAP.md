# Roadmap

Development phases for the MVP, in order. See `Captured_Wishes_Product_Vision.md` for the product spec and `CLAUDE.md` for architecture notes.

- [x] **Phase 0 — Project scaffold.** Vite/Vue3/TS/Tailwind/router/Pinia, folder structure. No feature logic.
- [x] **Phase 1 — Content & data layer.** IndexedDB schema + `db.ts`, Pinia stores backed by it.
- [x] **Phase 2 — Welcome & scrapbook shell UI.** Static Polaroid component, washi tape, grid-size (3×3 / 5×5) choice screen. *(Cover entrance animation still pending — deferred to Phase 8 polish pass.)*
- [x] **Phase 3 — Camera capture flow.** `useCamera` composable, live preview, shutter + retake/confirm review, gallery fallback, EXIF-safe resize/compress, save to IndexedDB, Polaroid "developing" animation.
- [x] **Phase 4 — Puzzle engine.** Grid slicing (CSS background-position), shuffle (position + rotation), drag-to-move / tap-to-rotate interaction, completion detection.
- [x] **Phase 5 — Hidden wish reveal.** Folded-note unfold animation, wish content wiring, unlocked-state persistence, next-memory navigation.
- [x] **Phase 6 — Progression & resume logic.** Shared `getMemoryStep`/`getResumeRoute` utility, per-view guards against out-of-order visits, Welcome screen resumes instead of restarting.
- [x] **Phase 7 — Final scrapbook & celebration.** All Polaroids arranged, confetti (once per session), tap-to-revisit any memory's wish.
- [x] **Phase 7.5 — Recipient-requested revisions** (from `ToDo.md`). 4 memories → 3; flow restructured from interleaved (capture→puzzle→wish per memory) to two-phase (capture all 3, then solve puzzles/reveal wishes one at a time in order); in-app "Start fresh" reset (no DevTools needed). Along the way, fixed a real Vue Router bug where `/capture/1` → `/capture/2` reused the same component instance and left camera/photo state stuck from the previous memory (see `ARCHITECTURE.md` §5).
- [x] **UI redesign — "Craft Table" direction.** All five screens/states rebuilt into the maximalist scrapbook aesthetic (tinted paper per screen, washi-tape edges, hand-drawn doodles, sticker buttons, hard-offset shadows, marker-swipe headings) via a shared `CraftScreen` wrapper + `components/ui/` primitive set; drawn SVG sticker-icons replace the emoji prompts; the persistent sound toggle (`SoundToggle`) is wired to `settingsStore`; real wish content transcribed from `Captured Wishes — Birthday Wishes.md`. Followed by a desktop/tablet pass — on `sm`+ each screen renders as a bounded page on a "desk" surface. See `ARCHITECTURE.md` §10.
- [x] **PDF export.** "Save as keepsake" on the scrapbook screen produces a 4-page A4 PDF (cover + one page per memory with photo and full wish letter). `jspdf`/`html-to-image` lazy-loaded; fonts inlined as data URIs so the handwriting renders. See `ARCHITECTURE.md` §12.
- [ ] **Phase 8 — Polish pass.** Reduced-motion audit across the redesigned views, tablet/landscape/short-viewport QA, touch-target sizing on the smaller secondary controls, performance pass. (Sound-toggle wiring: done, in the redesign above.)
- [ ] **SFX + background music.** Blocked on audio assets (recipient/user is sourcing clips); `settingsStore.soundEnabled` and the toggle are wired, nothing plays yet.

## Post-MVP ideas

Not scoped for the initial build — from the product doc's "Future Ideas" plus `ToDo.md`:

- True jigsaw-shaped pieces
- Scrapbook customization / difficulty presets beyond 3×3 vs 5×5
- Secret ending
- Collectible stickers
- Replay-from-scratch mode
- Memory timeline
- PWA installability
- Video (MP4) export — significantly harder client-side (would need `MediaRecorder` capturing canvas/DOM + audio); still deprioritized
