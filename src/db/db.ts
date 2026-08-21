import { openDB, type IDBPDatabase } from 'idb'

import { MEMORY_PROMPTS } from '@/content/memories.config'
import type { MemoryId } from '@/types/memory'
import type { CapturedWishesSchema, MemoryRecord, SettingsRecord } from './schema'

const DB_NAME = 'captured-wishes'
const DB_VERSION = 1
const SETTINGS_KEY: SettingsRecord['key'] = 'app'

let dbPromise: Promise<IDBPDatabase<CapturedWishesSchema>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CapturedWishesSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('memories')) {
          db.createObjectStore('memories', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

function emptyMemoryRecord(id: MemoryId): MemoryRecord {
  return { id, photoBlob: null, capturedAt: null, puzzleSolved: false, wishUnlocked: false }
}

/** Loads all 4 memory records, seeding any that don't exist yet. */
export async function loadAllMemories(): Promise<MemoryRecord[]> {
  const db = await getDB()
  const tx = db.transaction('memories', 'readwrite')
  const existing = await tx.store.getAll()
  const existingIds = new Set(existing.map((record) => record.id))

  const missing = MEMORY_PROMPTS.filter((prompt) => !existingIds.has(prompt.id)).map((prompt) =>
    emptyMemoryRecord(prompt.id),
  )
  await Promise.all(missing.map((record) => tx.store.put(record)))
  await tx.done

  return [...existing, ...missing].sort((a, b) => a.id.localeCompare(b.id))
}

export async function saveMemory(record: MemoryRecord): Promise<void> {
  const db = await getDB()
  await db.put('memories', record)
}

export async function loadSettings(): Promise<SettingsRecord> {
  const db = await getDB()
  const record = await db.get('settings', SETTINGS_KEY)
  return record ?? { key: SETTINGS_KEY, gridSize: null, soundEnabled: false }
}

export async function saveSettings(record: SettingsRecord): Promise<void> {
  const db = await getDB()
  await db.put('settings', record)
}
