import type { DBSchema } from 'idb'

import type { GridSize, MemoryId } from '@/types/memory'

export interface MemoryRecord {
  id: MemoryId
  photoBlob: Blob | null
  capturedAt: number | null
  puzzleSolved: boolean
  wishUnlocked: boolean
}

export interface SettingsRecord {
  key: 'app'
  gridSize: GridSize | null
  sfxEnabled: boolean
  musicEnabled: boolean
  /** @deprecated Pre-split single flag. No longer read — `loadSettings` just falls back to on. */
  soundEnabled?: boolean
}

export interface CapturedWishesSchema extends DBSchema {
  memories: {
    key: MemoryId
    value: MemoryRecord
  }
  settings: {
    key: SettingsRecord['key']
    value: SettingsRecord
  }
}
