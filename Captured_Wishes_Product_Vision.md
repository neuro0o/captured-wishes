# Captured Wishes

> **Capture the moment. Piece together the memories./Every picture holds a wish.**

## Vision

**Captured Wishes** is a mobile-first interactive digital birthday
scrapbook.

Instead of opening a traditional birthday card, the recipient creates
memories by taking photos, reconstructs those memories through puzzles,
and gradually uncovers heartfelt birthday wishes hidden throughout a
handcrafted scrapbook.

The experience is designed to feel warm, magical, nostalgic, and deeply
personal.

------------------------------------------------------------------------

# Core Experience

1.  Capture a memory 📷
2.  Watch the Polaroid develop
3.  Solve the puzzle 🧩
4.  Restore the memory
5.  Uncover a hidden handwritten note 💌
6.  Repeat until the scrapbook is complete
7.  Celebrate with a finished memory album

------------------------------------------------------------------------

# Design Direction

Captured Wishes should **not feel like a web application**.

It should feel like interacting with a handcrafted scrapbook filled
with: - Polaroids - Film strips - Washi tape - Paper textures -
Handwritten notes - Stickers - Puzzle pieces - Cozy birthday decorations

The experience should evoke nostalgia, warmth, and delight.

------------------------------------------------------------------------

# Theme

## Visual Identity

Inspired by: - Instant cameras - Scrapbooks - Memory journals - Cozy
stationery - Soft birthday aesthetics

## Color Palette

-   Cream
-   Warm White
-   Dusty Pink
-   Sage Green
-   Lavender
-   Sky Blue
-   Soft Yellow

## Typography

Headings: - Patrick Hand - Caveat - Kalam

Body: - Inter - Nunito

------------------------------------------------------------------------

# User Journey

## Welcome

The scrapbook cover welcomes the recipient.

> Captured Wishes\
> A birthday scrapbook made just for you.

## Capture Memories

Guide the recipient with meaningful prompts:

1.  📷 Let's start with a smile.
2.  🎂 Capture today's cake.
3.  🎁 Photograph something special.
4.  ❤️ Capture one last memory.

Each photo instantly becomes a Polaroid.

The image slowly develops for a nostalgic effect.

------------------------------------------------------------------------

## Puzzle

Each captured memory becomes one puzzle.

-   3×3 or 5×5 grid
-   Drag-and-drop pieces
-   Snap animation
-   Original Polaroid revealed after completion

------------------------------------------------------------------------

## Hidden Wishes

Each completed Polaroid has a folded note tucked behind it.

-   Tap the Polaroid.
-   The note slides out.
-   Read the wish.
-   Like finding hidden notes inside an old photo album.
-   Read one birthday message.

Suggested structure:

1.  I still remember...
2.  One thing I admire about you...
3.  Thank you for always...
4.  My wish for your future...

Final page:

Captured Wishes

Memory #1 📷

Memory #2 📷

Memory #3 📷

Memory #4 📷

—————————

Happy Birthday ❤️

Love,
Neuro

Everything is together on one beautifully arranged page.
------------------------------------------------------------------------

## Final Scrapbook

After all puzzles are solved:

-   All Polaroids arranged beautifully
-   Every note unlocked
-   Confetti celebration
-   Replay experience
-   Export memory (future enhancement)

------------------------------------------------------------------------

# Technical Direction

## Platform

-   Mobile-first
-   Responsive
-   Installable as a PWA (future)

## Tech Stack

-   Vue 3
-   TypeScript
-   Vite
-   Pinia
-   Vue Router
-   Tailwind CSS
-   IndexedDB
-   Motion (Vue) or GSAP
-   vite-plugin-pwa

## Storage

100% client-side.

Store locally using IndexedDB: - Photos - Puzzle progress - Wishes
unlocked - Settings

No backend.

No accounts.

No server.

------------------------------------------------------------------------

# Color Palette

-   Soft pastel.
-   Cream
-   Warm white
-   Dusty pink
-   Sage green
-   Sky blue
-   Lavender
-   Muted yellow
-   Nothing saturated.

Everything should feel warm.

------------------------------------------------------------------------

# Typography

## Heading

-   Patrick Hand
-   Caveat
-   Kalam

## Body

-   Inter
-   Nunito

This creates the feeling of handwritten notes mixed with clean readability.

------------------------------------------------------------------------

# Animation Principles

Animations should feel tactile and handcrafted.

Examples:

-   Camera shutter
-   Polaroid developing
-   Puzzle snapping
-   Paper unfolding
-   Sticker placement
-   Page turning
-   Floating sparkles
-   Gentle confetti

Examples:

    📷 Camera shutter

    🖼️ Polaroid developing

    📌 Pinning onto scrapbook

    🧩 Puzzle snapping

    💌 Folded note opening

    ✨ Stickers appearing

    📖 Scrapbook page turning

Avoid harsh or flashy transitions.

------------------------------------------------------------------------

# Sound (Optional)

Very subtle.

-   Camera click
-   Paper flip
-   Sticker peel
-   Puzzle snap
-   Page turn
-   Tiny sparkle
-   No loud effects.

------------------------------------------------------------------------

# Engineering Principles

-   Clean component architecture
-   Reusable composables
-   Strong TypeScript typing
-   Smooth performance (\~60 FPS)
-   Optimized image storage
-   Accessible touch targets
-   Respect reduced-motion preferences

------------------------------------------------------------------------

# Future Ideas

-   True jigsaw-shaped pieces
-   Background music
-   Scrapbook customization
-   Difficulty selection
-   PDF/image export
-   Secret ending
-   Collectible stickers
-   Replay mode
-   Memory timeline

------------------------------------------------------------------------

# Guiding Principle

Captured Wishes should feel like receiving a handmade scrapbook from
someone who cares---not like using an app.
