import { openDB, IDBPDatabase } from 'idb';
import type { SceneData } from '../types';

const DB_NAME = 'physics-sandbox-db';
const DB_VERSION = 1;
const STORE_NAME = 'scenes';

let db: IDBPDatabase | null = null;

export const initDB = async () => {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  return db;
};

export const getDB = async () => {
  if (!db) {
    return await initDB();
  }
  return db;
};

export const saveScene = async (scene: SceneData): Promise<void> => {
  const database = await getDB();
  await database.put(STORE_NAME, {
    ...scene,
    updatedAt: Date.now(),
  });
};

export const getScene = async (id: string): Promise<SceneData | undefined> => {
  const database = await getDB();
  return await database.get(STORE_NAME, id);
};

export const getAllScenes = async (): Promise<SceneData[]> => {
  const database = await getDB();
  return await database.getAll(STORE_NAME);
};

export const deleteScene = async (id: string): Promise<void> => {
  const database = await getDB();
  await database.delete(STORE_NAME, id);
};

export const clearScenes = async (): Promise<void> => {
  const database = await getDB();
  await database.clear(STORE_NAME);
};

export const exportSceneToJSON = (scene: SceneData): string => {
  return JSON.stringify(scene, null, 2);
};

export const importSceneFromJSON = (json: string): SceneData => {
  const scene = JSON.parse(json) as SceneData;
  if (!scene.id || !scene.name) {
    throw new Error('Invalid scene format');
  }
  return {
    ...scene,
    createdAt: scene.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
};

export const downloadScene = (scene: SceneData) => {
  const json = exportSceneToJSON(scene);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${scene.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const uploadScene = (file: File): Promise<SceneData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const scene = importSceneFromJSON(json);
        resolve(scene);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const generateThumbnail = (
  canvas: HTMLCanvasElement,
  width: number = 200,
  height: number = 150
): string => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, width, height);
  }
  return tempCanvas.toDataURL('image/png');
};
