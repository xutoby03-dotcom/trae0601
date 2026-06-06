import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DesktopIcon, WindowState, UserPreferences, VirtualFile, DesktopWidget } from '../types';

interface DesktopDB extends DBSchema {
  desktopIcons: {
    key: string;
    value: DesktopIcon;
  };
  windows: {
    key: string;
    value: WindowState;
  };
  preferences: {
    key: string;
    value: UserPreferences;
  };
  files: {
    key: string;
    value: VirtualFile;
    indexes: { 'by-parent': string };
  };
  widgets: {
    key: string;
    value: DesktopWidget;
  };
}

let db: IDBPDatabase<DesktopDB> | null = null;

export const initDB = async () => {
  if (db) return db;

  db = await openDB<DesktopDB>('virtual-desktop-db', 2, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('desktopIcons')) {
        db.createObjectStore('desktopIcons', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('windows')) {
        db.createObjectStore('windows', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('files')) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('by-parent', 'parentId');
      }
      if (!db.objectStoreNames.contains('widgets')) {
        db.createObjectStore('widgets', { keyPath: 'id' });
      }
    },
  });

  return db;
};

export const getDB = async () => {
  if (!db) {
    return initDB();
  }
  return db;
};

export const saveDesktopIcons = async (icons: DesktopIcon[]) => {
  const db = await getDB();
  const tx = db.transaction('desktopIcons', 'readwrite');
  await tx.store.clear();
  for (const icon of icons) {
    await tx.store.put(icon);
  }
  await tx.done;
};

export const getDesktopIcons = async (): Promise<DesktopIcon[]> => {
  const db = await getDB();
  return db.getAll('desktopIcons');
};

export const saveWindows = async (windows: WindowState[]) => {
  const db = await getDB();
  const tx = db.transaction('windows', 'readwrite');
  await tx.store.clear();
  for (const win of windows) {
    await tx.store.put(win);
  }
  await tx.done;
};

export const getWindows = async (): Promise<WindowState[]> => {
  const db = await getDB();
  return db.getAll('windows');
};

export const savePreferences = async (prefs: UserPreferences) => {
  const db = await getDB();
  await db.put('preferences', { ...prefs, id: 'main' });
};

export const getPreferences = async (): Promise<UserPreferences | null> => {
  const db = await getDB();
  const prefs = await db.get('preferences', 'main');
  if (prefs) {
    const { id, ...rest } = prefs;
    return rest;
  }
  return null;
};

export const saveFiles = async (files: VirtualFile[]) => {
  const db = await getDB();
  const tx = db.transaction('files', 'readwrite');
  await tx.store.clear();
  for (const file of files) {
    await tx.store.put(file);
  }
  await tx.done;
};

export const getFiles = async (): Promise<VirtualFile[]> => {
  const db = await getDB();
  return db.getAll('files');
};

export const saveWidgets = async (widgets: DesktopWidget[]) => {
  const db = await getDB();
  const tx = db.transaction('widgets', 'readwrite');
  await tx.store.clear();
  for (const widget of widgets) {
    await tx.store.put(widget);
  }
  await tx.done;
};

export const getWidgets = async (): Promise<DesktopWidget[]> => {
  const db = await getDB();
  return db.getAll('widgets');
};
