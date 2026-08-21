import { defineStore } from 'pinia'

import { loadAllMemories, saveMemory } from '@/db/db'
import type { MemoryRecord } from '@/db/schema'
import type { MemoryId } from '@/types/memory'

export const useMemoriesStore = defineStore('memories', {
  state: () => ({
    records: {} as Record<MemoryId, MemoryRecord>,
    loaded: false,
  }),
  actions: {
    async load() {
      const records = await loadAllMemories()
      this.records = Object.fromEntries(records.map((record) => [record.id, record])) as Record<
        MemoryId,
        MemoryRecord
      >
      this.loaded = true
    },
    async capturePhoto(id: MemoryId, photoBlob: Blob) {
      const record: MemoryRecord = { ...this.records[id], photoBlob, capturedAt: Date.now() }
      this.records[id] = record
      await saveMemory(record)
    },
    async markPuzzleSolved(id: MemoryId) {
      const record: MemoryRecord = { ...this.records[id], puzzleSolved: true }
      this.records[id] = record
      await saveMemory(record)
    },
    async markWishUnlocked(id: MemoryId) {
      const record: MemoryRecord = { ...this.records[id], wishUnlocked: true }
      this.records[id] = record
      await saveMemory(record)
    },
  },
})
