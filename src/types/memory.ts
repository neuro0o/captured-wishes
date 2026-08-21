export type MemoryId = '1' | '2' | '3' | '4'

export type GridSize = 3 | 5

export interface MemoryPrompt {
  id: MemoryId
  emoji: string
  prompt: string
}

export interface WishNote {
  id: MemoryId
  lines: string[]
}
