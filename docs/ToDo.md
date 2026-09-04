- [x] 3 instead of 4 puzzles
- [x] add sfx — 8 cues wired via `useAudio` (shutter, puzzle start/rotate/snap/finished, note unfold, + two looping music beds), gated on the sound toggle. Animations were done in the redesign.
- [x] customize the wishes to make it more personal — real content in `memories.config.ts`, transcribed from `Captured Wishes — Birthday Wishes.md`
- [x] start with snap 3 pic first, then user will then need to solve each one by one + get the wish

- [x] since indexedDB is local, add option for user to clear it on their own and start fresh — "Start fresh" link on the Welcome screen
- [x] import to pdf — "Save as keepsake" on the scrapbook screen; 4-page PDF (cover + a page per wish)

- [x] having the final screen have songs would be good too — scrapbook screen plays `all-complete.mp3` (looping) instead of the main theme
- [ ] import as vid (mp4) — deprioritized, significantly harder client-side; see `docs/ROADMAP.md`

- [x] PDF export looks low quality — bumped the page raster from `pixelRatio` 1.5 (~144 DPI) to 3 (~288 DPI), JPEG quality 0.92 → 0.96. File ~565 KB → ~1.4 MB. Still a full-page raster (no vector text); genuinely crisp text would need `jsPDF.addFont` + `doc.text`, a bigger rewrite.