import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type { HistoryEntry } from '../types/terminal';

interface HistoryDBSchema extends DBSchema {
  history: {
    key: string;
    value: { paneId: string; entries: HistoryEntry[] };
  };
}

const DB_NAME = 'terminal-history';
const DB_VERSION = 1;
const STORE_NAME = 'history';

class HistoryManager {
  private db: IDBPDatabase<HistoryDBSchema> | null = null;
  private entries: HistoryEntry[] = [];

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<HistoryDBSchema>(DB_NAME, DB_VERSION, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'paneId' });
        }
      },
    });
  }

  private ensureDB(): IDBPDatabase<HistoryDBSchema> {
    if (!this.db) {
      throw new Error('History database not initialized. Call init() first.');
    }
    return this.db;
  }

  add(command: string, exitCode: number): HistoryEntry {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      command,
      timestamp: Date.now(),
      exitCode,
    };
    this.entries.push(entry);
    return entry;
  }

  get(): HistoryEntry[] {
    return [...this.entries];
  }

  search(query: string): HistoryEntry[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return this.entries.filter((entry) =>
      entry.command.toLowerCase().includes(lowerQuery)
    );
  }

  navigate(
    direction: 'up' | 'down',
    currentIndex: number,
    currentInput: string
  ): { command: string; newIndex: number } {
    const filteredEntries = currentInput
      ? this.entries.filter((e) => e.command.startsWith(currentInput))
      : this.entries;

    if (filteredEntries.length === 0) {
      return { command: currentInput, newIndex: -1 };
    }

    let newIndex: number;

    if (direction === 'up') {
      if (currentIndex === -1) {
        newIndex = filteredEntries.length - 1;
      } else {
        newIndex = Math.max(0, currentIndex - 1);
      }
    } else {
      if (currentIndex === -1 || currentIndex >= filteredEntries.length - 1) {
        return { command: '', newIndex: -1 };
      }
      newIndex = currentIndex + 1;
    }

    return {
      command: filteredEntries[newIndex]?.command || currentInput,
      newIndex,
    };
  }

  async save(paneId: string): Promise<void> {
    await this.ensureDB().put(STORE_NAME, {
      paneId,
      entries: this.entries,
    });
  }

  async load(paneId: string): Promise<HistoryEntry[]> {
    const result = await this.ensureDB().get(STORE_NAME, paneId);
    if (result) {
      this.entries = result.entries;
    } else {
      this.entries = [];
    }
    return [...this.entries];
  }

  async clear(paneId: string): Promise<void> {
    this.entries = [];
    await this.ensureDB().delete(STORE_NAME, paneId);
  }

  close(): void {
    this.db?.close();
    this.db = null;
    this.entries = [];
  }
}

export const createHistory = (): HistoryManager => {
  return new HistoryManager();
};

export { HistoryManager };
