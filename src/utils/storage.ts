import { openDB, IDBPDatabase } from 'idb';
import type { DJProject } from '../types';

const DB_NAME = 'dj-mixer-db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('name', 'name');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveProject(project: DJProject): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, project);
}

export async function loadProject(id: string): Promise<DJProject | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function loadAllProjects(): Promise<DJProject[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function generateId(): Promise<string> {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
