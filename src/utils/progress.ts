import { MEMORY_PROMPTS } from '@/content/memories.config'
import type { MemoryRecord } from '@/db/schema'
import type { MemoryId } from '@/types/memory'

export type MemoryStep = 'capture' | 'puzzle' | 'wish' | 'done'

/** Which step a memory is currently at, based on what's been persisted for it. */
export function getMemoryStep(record: MemoryRecord | undefined): MemoryStep {
  if (!record?.photoBlob) return 'capture'
  if (!record.puzzleSolved) return 'puzzle'
  if (!record.wishUnlocked) return 'wish'
  return 'done'
}

export type ResumeRoute =
  | { name: 'capture' | 'puzzle' | 'wish'; params: { id: MemoryId } }
  | { name: 'scrapbook' }

/** The first not-yet-finished step across all 4 memories, in prompt order. */
export function getResumeRoute(records: Partial<Record<MemoryId, MemoryRecord>>): ResumeRoute {
  for (const prompt of MEMORY_PROMPTS) {
    const step = getMemoryStep(records[prompt.id])
    if (step !== 'done') return { name: step, params: { id: prompt.id } }
  }
  return { name: 'scrapbook' }
}
