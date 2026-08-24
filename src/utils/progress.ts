import { MEMORY_PROMPTS } from '@/content/memories.config'
import type { MemoryRecord } from '@/db/schema'
import type { MemoryId } from '@/types/memory'

export type MemoryStep = 'capture' | 'puzzle' | 'wish' | 'done'

/** Which step a single memory is at, based on what's been persisted for it. */
export function getMemoryStep(record: MemoryRecord | undefined): MemoryStep {
  if (!record?.photoBlob) return 'capture'
  if (!record.puzzleSolved) return 'puzzle'
  if (!record.wishUnlocked) return 'wish'
  return 'done'
}

export type ResumeRoute =
  | { name: 'capture' | 'puzzle' | 'wish'; params: { id: MemoryId } }
  | { name: 'scrapbook' }

/**
 * The app runs in two phases: capture every memory's photo first, then solve
 * puzzles and reveal wishes one memory at a time, in prompt order. This walks
 * both phases to find where the recipient should be right now.
 */
export function getResumeRoute(records: Partial<Record<MemoryId, MemoryRecord>>): ResumeRoute {
  const uncaptured = MEMORY_PROMPTS.find((prompt) => !records[prompt.id]?.photoBlob)
  if (uncaptured) return { name: 'capture', params: { id: uncaptured.id } }

  for (const prompt of MEMORY_PROMPTS) {
    const step = getMemoryStep(records[prompt.id])
    if (step !== 'done') return { name: step as 'puzzle' | 'wish', params: { id: prompt.id } }
  }
  return { name: 'scrapbook' }
}
