import { openDB, IDBPDatabase } from 'idb';
import type { Progress, SavedQuery, QueryHistoryItem } from '@/types';

const DB_NAME = 'sql-practice-db';
const DB_VERSION = 1;
const STORE_PROGRESS = 'progress';

let db: IDBPDatabase | null = null;

const initDB = async (): Promise<IDBPDatabase> => {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
        db.createObjectStore(STORE_PROGRESS, { keyPath: 'id' });
      }
    },
  });

  return db;
};

export const getProgress = async (): Promise<Progress> => {
  const database = await initDB();
  const progress = await database.get(STORE_PROGRESS, 'main');

  if (progress) {
    return progress.data as Progress;
  }

  return {
    completedProblems: [],
    savedQueries: [],
    queryHistory: [],
  };
};

export const saveProgress = async (progress: Progress): Promise<void> => {
  const database = await initDB();
  await database.put(STORE_PROGRESS, { id: 'main', data: progress, updatedAt: Date.now() });
};

export const addCompletedProblem = async (problemId: number): Promise<void> => {
  const progress = await getProgress();
  if (!progress.completedProblems.includes(problemId)) {
    progress.completedProblems.push(problemId);
    await saveProgress(progress);
  }
};

export const addToHistory = async (item: QueryHistoryItem): Promise<void> => {
  const progress = await getProgress();
  progress.queryHistory.unshift(item);
  if (progress.queryHistory.length > 100) {
    progress.queryHistory = progress.queryHistory.slice(0, 100);
  }
  await saveProgress(progress);
};

export const saveQuery = async (query: SavedQuery): Promise<void> => {
  const progress = await getProgress();
  const existingIndex = progress.savedQueries.findIndex((q) => q.id === query.id);
  if (existingIndex >= 0) {
    progress.savedQueries[existingIndex] = query;
  } else {
    progress.savedQueries.push(query);
  }
  await saveProgress(progress);
};

export const deleteSavedQuery = async (queryId: string): Promise<void> => {
  const progress = await getProgress();
  progress.savedQueries = progress.savedQueries.filter((q) => q.id !== queryId);
  await saveProgress(progress);
};

export const exportData = async (): Promise<string> => {
  const progress = await getProgress();
  return JSON.stringify(progress, null, 2);
};

export const importData = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString) as Progress;
    if (!data.completedProblems || !data.savedQueries || !data.queryHistory) {
      return false;
    }
    await saveProgress(data);
    return true;
  } catch {
    return false;
  }
};

export const clearAllData = async (): Promise<void> => {
  const database = await initDB();
  await database.clear(STORE_PROGRESS);
};
