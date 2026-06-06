import { openDB, IDBPDatabase } from 'idb';

export interface Artwork {
  id?: string;
  title: string;
  grid: string[][];
  thumbnail: string;
  author?: string;
  createdAt?: number;
  updatedAt?: number;
}

const DB_NAME = 'emoji-art-db';
const STORE_NAME = 'artworks';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
};

export const saveArtwork = async (artwork: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const db = await initDB();
  const now = Date.now();
  const id = crypto.randomUUID();
  
  await db.add(STORE_NAME, {
    author: '匿名艺术家',
    ...artwork,
    id,
    createdAt: now,
    updatedAt: now,
  });
  
  return id;
};

export const getArtworks = async (): Promise<Artwork[]> => {
  const db = await initDB();
  const artworks = await db.getAllFromIndex(STORE_NAME, 'createdAt');
  return artworks.reverse();
};

export const getArtwork = async (id: string): Promise<Artwork | undefined> => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const deleteArtwork = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const updateArtwork = async (id: string, artwork: Partial<Artwork>): Promise<void> => {
  const db = await initDB();
  const existing = await db.get(STORE_NAME, id);
  if (existing) {
    await db.put(STORE_NAME, {
      ...existing,
      ...artwork,
      updatedAt: Date.now(),
    });
  }
};
