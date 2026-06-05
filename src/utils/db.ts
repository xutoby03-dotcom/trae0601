import { openDB, IDBPDatabase } from 'idb';
import { EmailTemplate } from '@/types/email';

const DB_NAME = 'email-designer-db';
const DB_VERSION = 1;
const STORE_NAME = 'templates';

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    },
  });
}

export async function saveTemplate(template: EmailTemplate): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, { ...template, updatedAt: Date.now() });
}

export async function loadAllTemplates(): Promise<EmailTemplate[]> {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a: EmailTemplate, b: EmailTemplate) => b.updatedAt - a.updatedAt);
}

export async function loadTemplate(id: string): Promise<EmailTemplate | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
