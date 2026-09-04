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

/** Loads all memory records, seeding any that don't exist yet. */
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
  // Sound defaults on; a field is only absent on a fresh install or a pre-split
  // record (which carried a single `soundEnabled`) — either way, fall back to on.
  return {
    key: SETTINGS_KEY,
    gridSize: record?.gridSize ?? null,
    sfxEnabled: record?.sfxEnabled ?? true,
    musicEnabled: record?.musicEnabled ?? true,
  }
}

export async function saveSettings(record: SettingsRecord): Promise<void> {
  const db = await getDB()
  await db.put('settings', record)
}

export async function clearAllMemories(): Promise<void> {
  const db = await getDB()
  await db.clear('memories')
}
