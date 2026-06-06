import { Difficulty, LeaderboardEntry } from './types';

const DB_NAME = 'woodoku-db';
const DB_VERSION = 1;
const STORE_NAME = 'leaderboard';

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('difficulty', 'difficulty', { unique: false });
        store.createIndex('score', 'score', { unique: false });
      }
    };
  });
}

export async function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<number> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(entry);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getLeaderboard(difficulty: Difficulty): Promise<LeaderboardEntry[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('difficulty');
    const request = index.getAll(difficulty);

    request.onsuccess = () => {
      const results = request.result as LeaderboardEntry[];
      results.sort((a, b) => b.score - a.score);
      resolve(results.slice(0, 10));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearLeaderboard(): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
