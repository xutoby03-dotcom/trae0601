import { openDB, IDBPDatabase, DBSchema } from 'idb';

export interface FileNode {
  path: string;
  type: 'file' | 'directory';
  name: string;
  parentPath: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  content?: string;
}

interface FSDBSchema extends DBSchema {
  files: {
    key: string;
    value: FileNode;
    indexes: {
      'by-parent': string;
    };
  };
  metadata: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = 'virtual-fs';
const DB_VERSION = 1;
const FILES_STORE = 'files';
const METADATA_STORE = 'metadata';

export class IndexedDBStore {
  private db: IDBPDatabase<FSDBSchema> | null = null;

  async init(): Promise<void> {
    if (this.db) {
      return;
    }

    this.db = await openDB<FSDBSchema>(DB_NAME, DB_VERSION, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(FILES_STORE)) {
          const filesStore = db.createObjectStore(FILES_STORE, {
            keyPath: 'path',
          });
          filesStore.createIndex('by-parent', 'parentPath');
        }
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, {
            keyPath: 'key',
          });
        }
      },
    });
  }

  private ensureDB(): IDBPDatabase<FSDBSchema> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  async getFile(path: string): Promise<FileNode | undefined> {
    return this.ensureDB().get(FILES_STORE, path);
  }

  async putFile(file: FileNode): Promise<string> {
    return this.ensureDB().put(FILES_STORE, file);
  }

  async deleteFile(path: string): Promise<void> {
    return this.ensureDB().delete(FILES_STORE, path);
  }

  async getFilesByParent(parentPath: string): Promise<FileNode[]> {
    return this.ensureDB().getAllFromIndex(FILES_STORE, 'by-parent', parentPath);
  }

  async getAllFiles(): Promise<FileNode[]> {
    return this.ensureDB().getAll(FILES_STORE);
  }

  async clearFiles(): Promise<void> {
    return this.ensureDB().clear(FILES_STORE);
  }

  async getMetadata<T>(key: string, defaultValue: T): Promise<T> {
    const result = await this.ensureDB().get(METADATA_STORE, key);
    return result ? (result.value as T) : defaultValue;
  }

  async setMetadata(key: string, value: unknown): Promise<string> {
    return this.ensureDB().put(METADATA_STORE, { key, value });
  }

  async deleteMetadata(key: string): Promise<void> {
    return this.ensureDB().delete(METADATA_STORE, key);
  }

  async transaction<T>(
    storeNames: Array<typeof FILES_STORE | typeof METADATA_STORE>,
    mode: 'readonly' | 'readwrite',
    callback: (tx: IDBPDatabase<FSDBSchema>) => Promise<T>
  ): Promise<T> {
    const db = this.ensureDB();
    const tx = db.transaction(storeNames, mode);
    try {
      const result = await callback(db);
      await tx.done;
      return result;
    } catch (error) {
      tx.abort();
      throw error;
    }
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  static async deleteDatabase(): Promise<void> {
    const { deleteDB } = await import('idb');
    await deleteDB(DB_NAME);
  }
}
