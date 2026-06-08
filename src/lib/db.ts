import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Movie, Quote, ImageData } from '@/types'

interface CineQuoteDBSchema extends DBSchema {
  movies: {
    key: string
    value: Movie
    indexes: { 'by-name': string }
  }
  quotes: {
    key: string
    value: Quote
    indexes: { 'by-movieId': string; 'by-createdAt': number }
  }
  images: {
    key: string
    value: ImageData
  }
}

const DB_NAME = 'CineQuoteDB'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<CineQuoteDBSchema> | null = null

export async function getDB(): Promise<IDBPDatabase<CineQuoteDBSchema>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<CineQuoteDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('movies')) {
        const movieStore = db.createObjectStore('movies', { keyPath: 'id' })
        movieStore.createIndex('by-name', 'name')
      }
      if (!db.objectStoreNames.contains('quotes')) {
        const quoteStore = db.createObjectStore('quotes', { keyPath: 'id' })
        quoteStore.createIndex('by-movieId', 'movieId')
        quoteStore.createIndex('by-createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}
