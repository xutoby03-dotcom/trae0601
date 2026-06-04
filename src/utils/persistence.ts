import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type {
  PersistedAppState,
  PersistedHistory,
  PersistedScrollback,
  HistoryEntry,
  TerminalLine,
  Tab,
  Pane,
  TerminalState,
} from '../types/terminal';
import type { VirtualFS } from '../fs/VirtualFS';
import type { TerminalStore } from '../store/useTerminalStore';
import { debouncedStorage, storage } from './storage';
import { HOME_DIR } from '../fs/Path';

const APP_STATE_KEY = 'terminal-app-state';
const CURRENT_VERSION = '1.0.0';

interface TerminalDBSchema extends DBSchema {
  history: {
    key: string;
    value: PersistedHistory;
  };
  scrollback: {
    key: string;
    value: PersistedScrollback;
  };
}

const DB_NAME = 'terminal-data';
const DB_VERSION = 1;
const HISTORY_STORE = 'history';
const SCROLLBACK_STORE = 'scrollback';

let db: IDBPDatabase<TerminalDBSchema> | null = null;

async function ensureDB(): Promise<IDBPDatabase<TerminalDBSchema>> {
  if (db) return db;

  db = await openDB<TerminalDBSchema>(DB_NAME, DB_VERSION, {
    upgrade: (db) => {
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        db.createObjectStore(HISTORY_STORE, { keyPath: 'paneId' });
      }
      if (!db.objectStoreNames.contains(SCROLLBACK_STORE)) {
        db.createObjectStore(SCROLLBACK_STORE, { keyPath: 'paneId' });
      }
    },
  });

  return db;
}

export function saveAppState(state: {
  tabs: Tab[];
  activeTabId: string;
  aliases: Record<string, string>;
  theme: string;
}): void {
  const persistedState: PersistedAppState = {
    version: CURRENT_VERSION,
    tabs: state.tabs.map((tab) => ({
      id: tab.id,
      title: tab.title,
      activePaneId: tab.activePaneId,
      splitRoot: tab.splitRoot,
      panes: Object.values(tab.panes).map((pane) => ({
        id: pane.id,
        cwd: pane.cwd,
        env: pane.env,
      })),
    })),
    activeTabId: state.activeTabId,
    aliases: state.aliases,
    theme: state.theme,
    savedAt: Date.now(),
  };

  debouncedStorage.set(APP_STATE_KEY, persistedState);
}

export function loadAppState(): PersistedAppState | null {
  return storage.get<PersistedAppState | null>(APP_STATE_KEY, null);
}

export function saveFilesystem(vfs: VirtualFS): Promise<void> {
  const store = vfs.getStore();
  return store.getAllFiles().then(() => Promise.resolve());
}

export async function saveHistory(
  paneId: string,
  entries: HistoryEntry[]
): Promise<void> {
  const database = await ensureDB();
  await database.put(HISTORY_STORE, { paneId, entries });
}

export async function loadHistory(
  paneId: string
): Promise<HistoryEntry[]> {
  try {
    const database = await ensureDB();
    const result = await database.get(HISTORY_STORE, paneId);
    return result?.entries || [];
  } catch {
    return [];
  }
}

export async function saveScrollback(
  paneId: string,
  lines: TerminalLine[]
): Promise<void> {
  const database = await ensureDB();
  await database.put(SCROLLBACK_STORE, { paneId, lines });
}

export async function loadScrollback(
  paneId: string
): Promise<TerminalLine[]> {
  try {
    const database = await ensureDB();
    const result = await database.get(SCROLLBACK_STORE, paneId);
    return result?.lines || [];
  } catch {
    return [];
  }
}

type StoreSetter = (
  partial:
    | Partial<TerminalStore>
    | ((state: TerminalStore) => Partial<TerminalStore>)
) => void;

export async function restoreFromStorage(
  store: { setState: StoreSetter }
): Promise<void> {
  const savedState = loadAppState();
  if (!savedState) return;

  if (savedState.version !== CURRENT_VERSION) {
    console.warn('Version mismatch, skipping state restoration');
    return;
  }

  const paneHistories: Map<string, HistoryEntry[]> = new Map();
  const paneScrollbacks: Map<string, TerminalLine[]> = new Map();

  for (const tab of savedState.tabs) {
    for (const pane of tab.panes) {
      const history = await loadHistory(pane.id);
      const scrollback = await loadScrollback(pane.id);
      paneHistories.set(pane.id, history);
      paneScrollbacks.set(pane.id, scrollback);
    }
  }

  store.setState((state) => {
    const newTabs = savedState.tabs.map((savedTab) => {
      const panes: Record<string, Pane> = {};

      for (const savedPane of savedTab.panes) {
        const history = paneHistories.get(savedPane.id) || [];
        const scrollBack = paneScrollbacks.get(savedPane.id) || [];

        panes[savedPane.id] = {
          id: savedPane.id,
          cwd: savedPane.cwd || HOME_DIR,
          history,
          historyIndex: -1,
          env: savedPane.env || {
            HOME: HOME_DIR,
            PATH: '/usr/local/bin:/usr/bin:/bin',
            USER: 'user',
          },
          scrollBack,
          cursorX: 0,
          cursorY: 0,
          isRunning: false,
          currentCommand: '',
          inputBuffer: '',
        };
      }

      return {
        id: savedTab.id,
        title: savedTab.title,
        activePaneId: savedTab.activePaneId,
        splitRoot: savedTab.splitRoot,
        panes,
      };
    });

    return {
      ...state,
      tabs: newTabs,
      activeTabId: savedState.activeTabId,
      aliases: savedState.aliases,
      theme: savedState.theme,
    };
  });
}

export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export const persistence = {
  saveAppState,
  loadAppState,
  saveFilesystem,
  saveHistory,
  loadHistory,
  saveScrollback,
  loadScrollback,
  restoreFromStorage,
  closeDB,
};

export default persistence;
