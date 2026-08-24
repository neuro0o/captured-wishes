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
- [ ] **Phase 8 — Polish pass.** Reduced-motion audit, responsive/tablet/desktop QA, touch target sizing, performance pass, sound toggle wiring.
- [ ] **PDF export.** Next up per `ToDo.md` — a keepsake export of the final scrapbook page.
- [ ] **SFX + background music.** Blocked on audio assets (recipient/user is sourcing clips); `settingsStore.soundEnabled` and the toggle plumbing already exist, nothing plays yet.

## Post-MVP ideas

Not scoped for the initial build — from the product doc's "Future Ideas" plus `ToDo.md`:

- True jigsaw-shaped pieces
- Scrapbook customization / difficulty presets beyond 3×3 vs 5×5
- Secret ending
- Collectible stickers
- Replay-from-scratch mode
- Memory timeline
- PWA installability
- Video (MP4) export — significantly harder client-side (would need `MediaRecorder` capturing canvas/DOM + audio); deprioritized behind PDF export
