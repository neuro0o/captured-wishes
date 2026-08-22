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
- [ ] **Phase 8 — Polish pass.** Reduced-motion audit, responsive/tablet/desktop QA, touch target sizing, performance pass, sound toggle wiring.

## Post-MVP ideas

Not scoped for the initial build — from the product doc's "Future Ideas":

- True jigsaw-shaped pieces
- Background music
- Scrapbook customization / difficulty presets beyond 3×3 vs 5×5
- PDF/image export
- Secret ending
- Collectible stickers
- Replay-from-scratch mode
- Memory timeline
- PWA installability
