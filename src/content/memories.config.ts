import type { MemoryPrompt, WishNote } from '@/types/memory'

/**
 * Hardcoded, hand-edited content for this specific gift.
 * Edit the prompts and wishes below before deploying — there is no
 * authoring UI by design (this ships as a static site on GitHub Pages).
 */

export const MEMORY_PROMPTS: MemoryPrompt[] = [
  { id: '1', emoji: '📷', prompt: "Let's start with a smile." },
  { id: '2', emoji: '🎂', prompt: "Capture today's cake." },
  { id: '3', emoji: '🎁', prompt: 'Photograph something special.' },
]

// TODO: replace with your own handwritten wishes before deploying.
export const WISH_NOTES: WishNote[] = [
  { id: '1', lines: ['I still remember...'] },
  { id: '2', lines: ['One thing I admire about you...'] },
  { id: '3', lines: ['My wish for your future...'] },
]

// TODO: replace with your own closing message before deploying.
export const SCRAPBOOK_CLOSING = {
  heading: 'Happy Birthday ❤️',
  signature: 'Love, Neuro',
}
