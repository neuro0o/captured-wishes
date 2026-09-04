# Captured Wishes

> Capture the moment. Piece together the memories. Every picture holds a wish.

A mobile-first, interactive digital birthday scrapbook. The recipient captures photos with their device camera, each photo becomes a Polaroid and then a puzzle, and solving the puzzle reveals a hidden handwritten wish. 100% client-side — no backend, no accounts, no server. Photos and progress are stored locally in the browser via IndexedDB.

See [`Captured_Wishes_Product_Vision.md`](./Captured_Wishes_Product_Vision.md) for the full product/design spec, [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for how the app actually works (data flow, puzzle engine, resume logic, design decisions), [`docs/ROADMAP.md`](./docs/ROADMAP.md) for development phases, and [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) for what's shipped so far.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build     # type-check and build for production
npm run preview    # preview the production build
```

Built with Vue 3, TypeScript, Vite, Pinia, Vue Router, and Tailwind CSS.
