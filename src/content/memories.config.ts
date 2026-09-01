import type { MemoryPrompt, WishNote } from '@/types/memory'

/**
 * Hardcoded, hand-edited content for this specific gift.
 * Edit the prompts and wishes below before deploying — there is no
 * authoring UI by design (this ships as a static site on GitHub Pages).
 *
 * Wish text is transcribed from `Captured Wishes — Birthday Wishes.md`
 * at the repo root; keep the two in sync.
 */

export const MEMORY_PROMPTS: MemoryPrompt[] = [
  { id: '1', emoji: '📷', prompt: 'Start with something that makes you smile.' },
  { id: '2', emoji: '💌', prompt: "Capture something you're grateful for." },
  { id: '3', emoji: '🌱', prompt: "Photograph something you're looking forward to." },
]

export const WISH_NOTES: WishNote[] = [
  {
    id: '1',
    title: 'The Little Things',
    lines: [
      "There are so many things about our friendship that I don't think I've ever properly put into words.",
      'Not just the big moments, but the little ones too.',
      'The random conversations that went on far longer than they needed to. The stupid jokes that somehow stayed funny. The days that didn’t really have anything special about them, yet somehow became memories anyway.',
      "I think that's what I treasure most.",
      'Some people become part of your life through grand moments. Others simply stay, little by little, until you look back and realize they’ve become part of so many chapters.',
      "I'm glad you're one of those people for me.",
    ],
  },
  {
    id: '2',
    title: 'What I Hope You Know',
    lines: [
      "I hope you know that you don't always have to have everything figured out.",
      "You don't have to know where you're going every step of the way. You don't have to be at your best all the time. And you certainly don't have to become someone else just because you think you're falling behind.",
      "You've grown so much, even in ways you might not notice yourself.",
      'So please give yourself some credit for that.',
      'For every quiet step forward. For every time you chose to keep trying. For all the things you’ve carried without making a big deal out of them.',
      "I'm proud of the person you're becoming.",
      'And wherever life takes you next, I hope you remember that you don’t have to earn your worth by being perfect.',
    ],
  },
  {
    id: '3',
    title: 'For Everything Ahead',
    lines: [
      "For the year ahead, I don't wish for everything to suddenly become easy.",
      'Instead, I hope life becomes a little kinder to you.',
      'I hope you find days that feel lighter. People who make you feel at home. Places where you can laugh without thinking about tomorrow. And little moments that make you stop and think, maybe things really are going to be okay.',
      "I hope you get to chase the things you've quietly wished for.",
      'I hope some of them come true exactly the way you imagined, and others surprise you by becoming something even better.',
      'And when life inevitably gets messy again, I hope you remember how far you’ve already come.',
      'There is still so much ahead of you.',
      "So many places you haven't seen. So many memories you haven't made. So many versions of yourself you haven't met yet.",
      'Whatever comes next, I hope you stay.',
      'Stay curious. Stay hopeful. Keep finding reasons to laugh.',
      'And most importantly, keep being you.',
      'Happy Birthday.',
      "Here's to another year of becoming, discovering, and simply being here. ❤️",
    ],
  },
]

// TODO: replace with your own closing message before deploying.
export const SCRAPBOOK_CLOSING = {
  heading: 'Happy Birthday ❤️',
  signature: 'Love, Neuro',
}
