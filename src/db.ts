import { openDB, IDBPDatabase } from 'idb'
import { Dream } from './types'

const DB_NAME = 'dream-museum'
const DB_VERSION = 1
const STORE_NAME = 'dreams'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt')
          store.createIndex('atmosphere', 'atmosphere')
        }
      },
    })
  }
  return dbPromise
}

export async function getAllDreams(): Promise<Dream[]> {
  const db = await getDB()
  const dreams = await db.getAll(STORE_NAME)
  return dreams.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getDreamById(id: string): Promise<Dream | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function addDream(dream: Dream): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, dream)
}

export async function deleteDream(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function updateDream(dream: Dream): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, dream)
}

export async function searchDreams(filters: {
  keyword?: string
  atmosphere?: string
  tagType?: string
  tagValue?: string
  startDate?: number
  endDate?: number
}): Promise<Dream[]> {
  const all = await getAllDreams()
  return all.filter((d) => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      const inTitle = d.title.toLowerCase().includes(kw)
      const inFragments = d.fragments.some((f) => f.toLowerCase().includes(kw))
      const inTags = d.tags.some((t) => t.value.toLowerCase().includes(kw))
      if (!inTitle && !inFragments && !inTags) return false
    }
    if (filters.atmosphere && d.atmosphere !== filters.atmosphere) return false
    if (filters.tagType || filters.tagValue) {
      const hasTag = d.tags.some((t) => {
        if (filters.tagType && t.type !== filters.tagType) return false
        if (filters.tagValue && t.value !== filters.tagValue) return false
        return true
      })
      if (!hasTag) return false
    }
    if (filters.startDate && d.createdAt < filters.startDate) return false
    if (filters.endDate && d.createdAt > filters.endDate) return false
    return true
  })
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
