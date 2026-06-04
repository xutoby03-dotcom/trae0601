import { create } from 'zustand';
import type { ThemeName } from '../types/theme';
import type {
  Tab,
  Pane,
  TerminalState,
  HistoryEntry,
  TerminalLine,
} from '../types/terminal';
import { HOME_DIR } from '../fs/Path';

function generateId(): string {
  return crypto.randomUUID();
}

function createDefaultPane(id: string): Pane {
  return {
    id,
    cwd: HOME_DIR,
    history: [],
    historyIndex: -1,
    env: {
      HOME: HOME_DIR,
      PATH: '/usr/local/bin:/usr/bin:/bin',
      USER: 'user',
    },
    scrollBack: [],
    cursorX: 0,
    cursorY: 0,
    isRunning: false,
    currentCommand: '',
    inputBuffer: '',
  };
}

function createDefaultTab(id: string): Tab {
  const paneId = generateId();
  return {
    id,
    title: 'Terminal',
    activePaneId: paneId,
    splitRoot: paneId,
    panes: {
      [paneId]: createDefaultPane(paneId),
    },
  };
}

function createInitialState(): TerminalState {
  const firstTabId = generateId();
  const firstTab = createDefaultTab(firstTabId);

  return {
    tabs: [firstTab],
    activeTabId: firstTabId,
    aliases: {
      ll: 'ls -la',
      la: 'ls -a',
      l: 'ls -l',
    },
    theme: 'dracula',
  };
}

export interface TerminalActions {
  createTab: () => string;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;

  createPane: (tabId: string, direction: 'horizontal' | 'vertical') => string;
  closePane: (tabId: string, paneId: string) => void;
  switchPane: (tabId: string, paneId: string) => void;

  updatePane: (
    tabId: string,
    paneId: string,
    updates: Partial<Pane>
  ) => void;

  addHistory: (
    tabId: string,
    paneId: string,
    command: string,
    exitCode: number
  ) => void;

  addScrollback: (tabId: string, paneId: string, line: TerminalLine) => void;

  setAlias: (name: string, value: string) => void;
  removeAlias: (name: string) => void;

  setTheme: (theme: ThemeName) => void;

  getActivePane: () => Pane | undefined;
  getActiveTab: () => Tab | undefined;
}

export type TerminalStore = TerminalState & TerminalActions;

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  ...createInitialState(),

  createTab: () => {
    const tabId = generateId();
    const newTab = createDefaultTab(tabId);

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: tabId,
    }));

    return tabId;
  },

  closeTab: (tabId: string) => {
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== tabId);
      let newActiveTabId = state.activeTabId;

      if (state.activeTabId === tabId && newTabs.length > 0) {
        const currentIndex = state.tabs.findIndex((tab) => tab.id === tabId);
        const newIndex = Math.min(currentIndex, newTabs.length - 1);
        newActiveTabId = newTabs[newIndex].id;
      }

      if (newTabs.length === 0) {
        const newTabId = generateId();
        const newTab = createDefaultTab(newTabId);
        return {
          tabs: [newTab],
          activeTabId: newTabId,
        };
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  switchTab: (tabId: string) => {
    set((state) => {
      const tabExists = state.tabs.some((tab) => tab.id === tabId);
      if (!tabExists) return state;
      return { activeTabId: tabId };
    });
  },

  createPane: (tabId: string, direction: 'horizontal' | 'vertical') => {
    const paneId = generateId();
    const newPane = createDefaultPane(paneId);

    set((state) => {
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      const newTabs = [...state.tabs];

      newTabs[tabIndex] = {
        ...tab,
        activePaneId: paneId,
        splitRoot: {
          id: generateId(),
          direction,
          sizes: [50, 50],
          children: [tab.splitRoot, paneId],
        },
        panes: {
          ...tab.panes,
          [paneId]: newPane,
        },
      };

      return { tabs: newTabs };
    });

    return paneId;
  },

  closePane: (tabId: string, paneId: string) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      const paneIds = Object.keys(tab.panes);

      if (paneIds.length <= 1) {
        return state;
      }

      const newPanes = { ...tab.panes };
      delete newPanes[paneId];

      const remainingPaneId = Object.keys(newPanes)[0];

      const newTabs = [...state.tabs];
      newTabs[tabIndex] = {
        ...tab,
        activePaneId: remainingPaneId,
        splitRoot: remainingPaneId,
        panes: newPanes,
      };

      return { tabs: newTabs };
    });
  },

  switchPane: (tabId: string, paneId: string) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      if (!tab.panes[paneId]) return state;

      const newTabs = [...state.tabs];
      newTabs[tabIndex] = {
        ...tab,
        activePaneId: paneId,
      };

      return { tabs: newTabs };
    });
  },

  updatePane: (
    tabId: string,
    paneId: string,
    updates: Partial<Pane>
  ) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      if (!tab.panes[paneId]) return state;

      const newTabs = [...state.tabs];
      newTabs[tabIndex] = {
        ...tab,
        panes: {
          ...tab.panes,
          [paneId]: {
            ...tab.panes[paneId],
            ...updates,
          },
        },
      };

      return { tabs: newTabs };
    });
  },

  addHistory: (
    tabId: string,
    paneId: string,
    command: string,
    exitCode: number
  ) => {
    const entry: HistoryEntry = {
      id: generateId(),
      command,
      timestamp: Date.now(),
      exitCode,
    };

    set((state) => {
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      if (!tab.panes[paneId]) return state;

      const pane = tab.panes[paneId];
      const newTabs = [...state.tabs];

      newTabs[tabIndex] = {
        ...tab,
        panes: {
          ...tab.panes,
          [paneId]: {
            ...pane,
            history: [...pane.history, entry],
            historyIndex: -1,
          },
        },
      };

      return { tabs: newTabs };
    });
  },

  addScrollback: (tabId: string, paneId: string, line: TerminalLine) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return state;

      const tab = state.tabs[tabIndex];
      if (!tab.panes[paneId]) return state;

      const pane = tab.panes[paneId];
      const newTabs = [...state.tabs];

      newTabs[tabIndex] = {
        ...tab,
        panes: {
          ...tab.panes,
          [paneId]: {
            ...pane,
            scrollBack: [...pane.scrollBack, line],
          },
        },
      };

      return { tabs: newTabs };
    });
  },

  setAlias: (name: string, value: string) => {
    set((state) => ({
      aliases: {
        ...state.aliases,
        [name]: value,
      },
    }));
  },

  removeAlias: (name: string) => {
    set((state) => {
      const newAliases = { ...state.aliases };
      delete newAliases[name];
      return { aliases: newAliases };
    });
  },

  setTheme: (theme: ThemeName) => {
    set({ theme });
  },

  getActivePane: () => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === state.activeTabId);
    if (!tab) return undefined;
    return tab.panes[tab.activePaneId];
  },

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId);
  },
}));
