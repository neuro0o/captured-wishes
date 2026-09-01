export type MemoryId = '1' | '2' | '3'

export type GridSize = 3 | 5

export interface MemoryPrompt {
  id: MemoryId
  emoji: string
  prompt: string
}

export interface WishNote {
  id: MemoryId
  /** Section title from the handwritten letter (e.g. "The Little Things"). */
  title: string
  /** Body paragraphs, rendered one <p> per entry. */
  lines: string[]
}
