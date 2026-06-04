import React, { useState, useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import { TabBar } from './TabBar';
import { SplitPane } from './SplitPane';
import { Terminal } from './Terminal';
import { VimEditor } from './VimEditor';
import { SearchHistory } from './SearchHistory';
import { AutoCompletePopup, type AutoCompleteItem } from './AutoCompletePopup';
import { getTheme, applyTheme, themeNames } from '@/themes';
import type { ThemeName } from '@/types/theme';
import type {
  Tab,
  Pane,
  Split,
  TerminalLine,
  HistoryEntry,
  PersistedAppState,
  PersistedHistory,
  PersistedScrollback,
} from '@/types/terminal';
import { storage } from '@/utils/storage';
import { fs, type VirtualFS } from '@/fs/VirtualFS';
import { Path, HOME_DIR } from '@/fs/Path';
import {
  parse,
  parseSingleCommand,
  executePipeline,
  aliasManager,
  scriptInterpreter,
  expandHistory,
  type Command,
  type PipelineContext,
  type HistoryEntry as ShellHistoryEntry,
} from '@/shell';
import {
  executeCommand,
  getCommand,
  listCommands,
  type CommandContext,
} from '@/commands';
import { getCompletions } from '@/core/AutoComplete';

function loadFromStorage<T>(key: string): T | null {
  return storage.get<T | null>(key, null);
}

function saveToStorage<T>(key: string, value: T): void {
  storage.set(key, value);
}

interface VimEditorState {
  paneId: string;
  filePath: string;
  content: string;
}

interface TerminalStore {
  tabs: Tab[];
  activeTabId: string;
  theme: ThemeName;
  aliases: Record<string, string>;
  fs: VirtualFS;
  fsInitialized: boolean;
  setTabs: (tabs: Tab[]) => void;
  setActiveTabId: (id: string) => void;
  setTheme: (theme: ThemeName) => void;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  updatePane: (tabId: string, paneId: string, updates: Partial<Pane>) => void;
  updateSplitSizes: (tabId: string, splitId: string, sizes: number[]) => void;
  appendScrollback: (tabId: string, paneId: string, line: TerminalLine) => void;
  addHistoryEntry: (tabId: string, paneId: string, entry: HistoryEntry) => void;
  setAlias: (name: string, value: string) => void;
  removeAlias: (name: string) => void;
  setFsInitialized: (v: boolean) => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const getDefaultEnv = (): Record<string, string> => ({
  HOME: HOME_DIR,
  PATH: '/usr/bin:/bin',
  USER: 'user',
  SHELL: '/bin/zsh',
  PWD: HOME_DIR,
  OLDPWD: HOME_DIR,
  PS1: '%F{cyan}%n%f@%F{magenta}%m%f %F{blue}%~%f %# ',
  TERM: 'xterm-256color',
});

const createInitialPane = (id: string, cwd: string = HOME_DIR): Pane => ({
  id,
  cwd,
  history: [],
  historyIndex: -1,
  env: getDefaultEnv(),
  scrollBack: [],
  cursorX: 0,
  cursorY: 0,
  isRunning: false,
  currentCommand: '',
  inputBuffer: '',
});

const createInitialTab = (id: string, title: string): Tab => {
  const paneId = generateId();
  return {
    id,
    title,
    activePaneId: paneId,
    splitRoot: paneId,
    panes: {
      [paneId]: createInitialPane(paneId),
    },
  };
};

const createInitialState = (): Omit<
  TerminalStore,
  | 'setTabs'
  | 'setActiveTabId'
  | 'setTheme'
  | 'addTab'
  | 'removeTab'
  | 'updateTab'
  | 'updatePane'
  | 'updateSplitSizes'
  | 'appendScrollback'
  | 'addHistoryEntry'
  | 'setAlias'
  | 'removeAlias'
  | 'setFsInitialized'
  | 'reset'
> => {
  const firstTabId = generateId();
  return {
    tabs: [createInitialTab(firstTabId, 'Tab 1')],
    activeTabId: firstTabId,
    theme: 'dracula',
    aliases: {},
    fs,
    fsInitialized: false,
  };
};

const updateSplitInTree = (
  node: Split | string,
  splitId: string,
  sizes: number[]
): Split | string => {
  if (typeof node === 'string') {
    return node;
  }
  if (node.id === splitId) {
    return { ...node, sizes };
  }
  return {
    ...node,
    children: node.children.map((child) => updateSplitInTree(child, splitId, sizes)),
  };
};

const createTerminalActions = (
  set: (
    state: Partial<TerminalStore> | ((state: TerminalStore) => Partial<TerminalStore>)
  ) => void,
  get: () => TerminalStore
) => ({
  setTabs: (tabs: Tab[]) => set({ tabs }),
  setActiveTabId: (id: string) => set({ activeTabId: id }),
  setTheme: (theme: ThemeName) => {
    set({ theme });
    applyTheme(getTheme(theme));
  },
  addTab: (tab: Tab) =>
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    })),
  removeTab: (tabId: string) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      const newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : state.activeTabId;
      return {
        tabs: newTabs,
        activeTabId: newActiveId,
      };
    }),
  updateTab: (tabId: string, updates: Partial<Tab>) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
    })),
  updatePane: (tabId: string, paneId: string, updates: Partial<Pane>) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              panes: {
                ...t.panes,
                [paneId]: { ...t.panes[paneId], ...updates },
              },
            }
          : t
      ),
    })),
  updateSplitSizes: (tabId: string, splitId: string, sizes: number[]) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              splitRoot: updateSplitInTree(t.splitRoot, splitId, sizes),
            }
          : t
      ),
    })),
  appendScrollback: (tabId: string, paneId: string, line: TerminalLine) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              panes: {
                ...t.panes,
                [paneId]: {
                  ...t.panes[paneId],
                  scrollBack: [...t.panes[paneId].scrollBack, line],
                },
              },
            }
          : t
      ),
    })),
  addHistoryEntry: (tabId: string, paneId: string, entry: HistoryEntry) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              panes: {
                ...t.panes,
                [paneId]: {
                  ...t.panes[paneId],
                  history: [...t.panes[paneId].history, entry],
                  historyIndex: -1,
                },
              },
            }
          : t
      ),
    })),
  setAlias: (name: string, value: string) =>
    set((state) => {
      aliasManager.setAlias(name, value);
      return {
        aliases: { ...state.aliases, [name]: value },
      };
    }),
  removeAlias: (name: string) =>
    set((state) => {
      aliasManager.removeAlias(name);
      const newAliases = { ...state.aliases };
      delete newAliases[name];
      return { aliases: newAliases };
    }),
  setFsInitialized: (v: boolean) => set({ fsInitialized: v }),
  reset: () => {
    const initial = createInitialState();
    set(initial);
  },
});

const useTerminalStore = create<TerminalStore>((set, get) => ({
  ...createInitialState(),
  ...createTerminalActions(set, get),
}));

const STORAGE_KEY = 'terminal-app-state';
const HISTORY_KEY = 'terminal-history';
const SCROLLBACK_KEY = 'terminal-scrollback';
const ALIAS_KEY = 'terminal-aliases';

function formatTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

function renderPS1(ps1: string, env: Record<string, string>): string {
  let result = ps1;

  result = result.replace(/%n/g, env['USER'] || 'user');
  result = result.replace(/%m/g, 'localhost');
  result = result.replace(/%~|\%d/g, env['PWD'] || env['HOME'] || '~');
  result = result.replace(/%#/g, '$');
  result = result.replace(/%t/g, formatTime());

  result = result.replace(/%F\{(\w+)\}/g, (_, color) => {
    const colorMap: Record<string, string> = {
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
    };
    return colorMap[color] || '';
  });
  result = result.replace(/%f/g, '\x1b[0m');

  const home = env['HOME'] || '/home/user';
  if (env['PWD'] && env['PWD'].startsWith(home)) {
    result = result.replace(env['PWD'], '~' + env['PWD'].slice(home.length));
  }

  return result;
}

export const TerminalApp: React.FC = () => {
  const {
    tabs,
    activeTabId,
    theme,
    aliases,
    fs,
    fsInitialized,
    setTabs,
    setActiveTabId,
    setTheme,
    addTab,
    removeTab,
    updateTab,
    updatePane,
    updateSplitSizes,
    appendScrollback,
    addHistoryEntry,
    setAlias,
    removeAlias,
    setFsInitialized,
  } = useTerminalStore();

  const [vimEditor, setVimEditor] = useState<VimEditorState | null>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchPaneId, setSearchPaneId] = useState<string | null>(null);
  const [autoComplete, setAutoComplete] = useState<{
    visible: boolean;
    items: AutoCompleteItem[];
    selectedIndex: number;
    position: { x: number; y: number };
    paneId: string;
  } | null>(null);

  const initialized = useRef(false);
  const runningCommands = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      await fs.init();
      setFsInitialized(true);

      const savedState = loadFromStorage<PersistedAppState>(STORAGE_KEY);
      const savedHistory = loadFromStorage<PersistedHistory[]>(HISTORY_KEY);
      const savedScrollback = loadFromStorage<PersistedScrollback[]>(SCROLLBACK_KEY);
      const savedAliases = loadFromStorage<Record<string, string>>(ALIAS_KEY);

      if (savedAliases) {
        for (const [name, value] of Object.entries(savedAliases)) {
          aliasManager.setAlias(name, value);
        }
      }

      if (savedState && savedState.tabs.length > 0) {
        const newTabs: Tab[] = savedState.tabs.map((savedTab) => {
          const panes: Record<string, Pane> = {};
          savedTab.panes.forEach((savedPane) => {
            const history = savedHistory?.find((h) => h.paneId === savedPane.id)?.entries || [];
            const scrollBack = savedScrollback?.find((s) => s.paneId === savedPane.id)?.lines || [];
            panes[savedPane.id] = {
              ...createInitialPane(savedPane.id, savedPane.cwd),
              env: { ...getDefaultEnv(), ...savedPane.env },
              history,
              scrollBack,
            };
          });
          return {
            id: savedTab.id,
            title: savedTab.title,
            activePaneId: savedTab.activePaneId,
            splitRoot: savedTab.splitRoot,
            panes,
          };
        });

        setTabs(newTabs);
        setActiveTabId(savedState.activeTabId);
        if (savedState.theme && themeNames.includes(savedState.theme as ThemeName)) {
          setTheme(savedState.theme as ThemeName);
        }
      }

      applyTheme(getTheme(theme));

      const activeTab = useTerminalStore.getState().tabs.find(
        (t) => t.id === useTerminalStore.getState().activeTabId
      );
      if (activeTab) {
        const pane = activeTab.panes[activeTab.activePaneId];
        if (pane && pane.scrollBack.length === 0) {
          const promptLine: TerminalLine = {
            content: 'Welcome to WebTerminal! Type "help" for available commands.\n',
            type: 'output',
            timestamp: Date.now(),
          };
          appendScrollback(activeTab.id, activeTab.activePaneId, promptLine);
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!fsInitialized) return;

    const persistState = () => {
      const state: PersistedAppState = {
        version: '1.0.0',
        tabs: tabs.map((tab) => ({
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
        activeTabId,
        aliases,
        theme,
        savedAt: Date.now(),
      };
      saveToStorage<PersistedAppState>(STORAGE_KEY, state);

      const allHistory: PersistedHistory[] = [];
      const allScrollback: PersistedScrollback[] = [];
      tabs.forEach((tab) => {
        Object.values(tab.panes).forEach((pane) => {
          if (pane.history.length > 0) {
            allHistory.push({ paneId: pane.id, entries: pane.history.slice(-1000) });
          }
          if (pane.scrollBack.length > 0) {
            allScrollback.push({ paneId: pane.id, lines: pane.scrollBack.slice(-2000) });
          }
        });
      });
      saveToStorage<PersistedHistory[]>(HISTORY_KEY, allHistory);
      saveToStorage<PersistedScrollback[]>(SCROLLBACK_KEY, allScrollback);
      saveToStorage<Record<string, string>>(ALIAS_KEY, aliases);
    };

    const timeout = setTimeout(persistState, 1000);
    return () => clearTimeout(timeout);
  }, [tabs, activeTabId, theme, aliases, fsInitialized]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleTabAdd();
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        const currentTabs = useTerminalStore.getState().tabs;
        const currentActiveId = useTerminalStore.getState().activeTabId;
        if (currentTabs.length > 1) {
          handleTabClose(currentActiveId);
        }
      }

      if (e.ctrlKey && e.shiftKey && e.key === '%') {
        e.preventDefault();
        handleSplit('horizontal');
      }

      if (e.ctrlKey && e.shiftKey && e.key === '"') {
        e.preventDefault();
        handleSplit('vertical');
      }

      if (e.key >= '1' && e.key <= '9' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const currentTabs = useTerminalStore.getState().tabs;
        if (currentTabs[index]) {
          handleTabClick(currentTabs[index].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const executeCommandWithContext = useCallback(
    async (
      cmd: Command,
      context: PipelineContext
    ): Promise<number> => {
      const { vfs, cwd, env, stdin, stdout, stderr } = context;

      const commandNames = listCommands().map((c) => c.name);
      const allAliases = aliasManager.getAllAliases();

      const parseContext = { vfs, cwd, env };
      const expandedLine = aliasManager.expandAliases(cmd.name + ' ' + cmd.args.join(' '));
      const parsed = await parseSingleCommand(expandedLine, parseContext);

      const state = useTerminalStore.getState();
      const tab = state.tabs.find((t) => t.id === activeTabId);
      const currentPane = tab?.panes[context.paneId || ''];

      const commandCtx: CommandContext = {
        vfs: vfs as unknown as VirtualFS,
        cwd,
        env,
        stdin,
        args: parsed.args,
        stdout,
        stderr,
        setCwd: (newCwd: string) => {
          env['OLDPWD'] = env['PWD'];
          env['PWD'] = newCwd;
          const state = useTerminalStore.getState();
          const tab = state.tabs.find((t) => t.id === activeTabId);
          if (tab) {
            state.updatePane(activeTabId, context.paneId || '', { cwd: newCwd });
          }
        },
        setTheme,
        getThemes: () => themeNames,
        getAliases: () => allAliases,
        setAlias: (name: string, value: string) => {
          useTerminalStore.getState().setAlias(name, value);
        },
        removeAlias: (name: string) => {
          useTerminalStore.getState().removeAlias(name);
        },
        split: (direction: 'h' | 'v') => {
          handleSplit(direction === 'h' ? 'horizontal' : 'vertical');
        },
        getHistory: () => {
          const state = useTerminalStore.getState();
          const tab = state.tabs.find((t) => t.id === activeTabId);
          const pane = tab?.panes[context.paneId || ''];
          return pane?.history.map((h) => ({
            command: h.command,
            timestamp: h.timestamp,
            exitCode: h.exitCode,
          })) || [];
        },
      };

      if (parsed.name === 'vim') {
        const filePath = parsed.args[0] || 'untitled.txt';
        const normalizedPath = Path.normalize(filePath, cwd);
        let content = '';
        try {
          if (await vfs.exists(normalizedPath)) {
            content = await vfs.readFile(normalizedPath);
          }
        } catch {
          // ignore
        }
        const state = useTerminalStore.getState();
        const tab = state.tabs.find((t) => t.id === activeTabId);
        if (tab) {
          const paneId = tab.activePaneId;
          setVimEditor({ paneId, filePath: normalizedPath, content });
        }
        return 0;
      }

      if (parsed.name === 'clear') {
        const state = useTerminalStore.getState();
        const tab = state.tabs.find((t) => t.id === activeTabId);
        if (tab) {
          state.updatePane(activeTabId, tab.activePaneId, { scrollBack: [] });
        }
        return 0;
      }

      if (parsed.name === 'help') {
        const cmds = listCommands();
        stdout('Available commands:\n');
        for (const c of cmds) {
          stdout(`  ${c.name.padEnd(10)} ${c.description}\n`);
        }
        stdout('\nKeyboard shortcuts:\n');
        stdout('  Ctrl+T    New tab\n');
        stdout('  Ctrl+W    Close tab\n');
        stdout('  Ctrl+L    Clear screen\n');
        stdout('  Ctrl+R    Search history\n');
        stdout('  Ctrl+C    Interrupt command\n');
        stdout('  Tab       Auto complete\n');
        stdout('  ↑↓        Navigate history\n');
        return 0;
      }

      return await executeCommand(parsed.name, commandCtx);
    },
    [activeTabId]
  );

  const handleCommand = useCallback(
    async (paneId: string, command: string) => {
      const tab = activeTab;
      if (!tab) return;

      const pane = tab.panes[paneId];
      if (!pane) return;

      if (runningCommands.current.has(paneId)) {
        return;
      }

      const trimmed = command.trim();
      if (!trimmed) {
        const promptLine: TerminalLine = {
          content: renderPS1(pane.env['PS1'] || '%# ', pane.env),
          type: 'prompt',
          timestamp: Date.now(),
        };
        appendScrollback(activeTabId, paneId, promptLine);
        return;
      }

      runningCommands.current.add(paneId);

      const historyForExpand: ShellHistoryEntry[] = pane.history.map((h) => ({
        command: h.command,
        timestamp: h.timestamp,
        exitCode: h.exitCode,
      }));

      const expandResult = expandHistory(trimmed, historyForExpand);

      const promptLine: TerminalLine = {
        content: renderPS1(pane.env['PS1'] || '%# ', pane.env) + trimmed + '\n',
        type: 'input',
        timestamp: Date.now(),
      };
      appendScrollback(activeTabId, paneId, promptLine);

      if (expandResult.error) {
        const errorLine: TerminalLine = {
          content: expandResult.error + '\n',
          type: 'error',
          timestamp: Date.now(),
        };
        appendScrollback(activeTabId, paneId, errorLine);

        updatePane(activeTabId, paneId, {
          currentCommand: '',
          inputBuffer: '',
          isRunning: false,
          autoComplete: null,
        });
        runningCommands.current.delete(paneId);
        return;
      }

      const commandToExecute = expandResult.expanded;

      if (expandResult.expandedCommand !== null && expandResult.expanded !== trimmed) {
        const echoLine: TerminalLine = {
          content: commandToExecute + '\n',
          type: 'input',
          timestamp: Date.now(),
        };
        appendScrollback(activeTabId, paneId, echoLine);
      }

      const entry: HistoryEntry = {
        id: generateId(),
        command: commandToExecute,
        timestamp: Date.now(),
        exitCode: 0,
      };

      const lastHistory = pane.history[pane.history.length - 1];
      const shouldAddToHistory = !lastHistory || lastHistory.command !== commandToExecute;
      if (shouldAddToHistory) {
        addHistoryEntry(activeTabId, paneId, entry);
      }

      updatePane(activeTabId, paneId, {
        currentCommand: '',
        inputBuffer: '',
        isRunning: true,
        autoComplete: null,
      });

      try {
        if (commandToExecute.startsWith('source ') || commandToExecute.startsWith('. ')) {
          const parts = commandToExecute.split(/\s+/);
          const scriptPath = parts[1];
          if (scriptPath) {
            const normalizedPath = Path.normalize(scriptPath, pane.cwd);
            const scriptContent = await fs.readFile(normalizedPath);

            const scriptCtx = {
              vfs: fs as unknown as import('@/shell/types').VFS,
              cwd: pane.cwd,
              env: { ...pane.env },
              stdin: '',
              stdout: (data: string) => {
                const line: TerminalLine = {
                  content: data,
                  type: 'output',
                  timestamp: Date.now(),
                };
                appendScrollback(activeTabId, paneId, line);
              },
              stderr: (data: string) => {
                const line: TerminalLine = {
                  content: data,
                  type: 'error',
                  timestamp: Date.now(),
                };
                appendScrollback(activeTabId, paneId, line);
              },
              executeCommand: executeCommandWithContext,
              paneId,
            };

            const exitCode = await scriptInterpreter.executeScript(scriptContent, scriptCtx);
            if (shouldAddToHistory) {
              entry.exitCode = exitCode;
            }

            if (scriptCtx.env['PWD'] !== pane.env['PWD']) {
              updatePane(activeTabId, paneId, {
                cwd: scriptCtx.env['PWD'],
                env: scriptCtx.env,
              });
            }
          }
        } else if (
          commandToExecute.startsWith('if ') ||
          commandToExecute.startsWith('for ') ||
          commandToExecute.includes('\n')
        ) {
          const scriptCtx = {
            vfs: fs as unknown as import('@/shell/types').VFS,
            cwd: pane.cwd,
            env: { ...pane.env },
            stdin: '',
            stdout: (data: string) => {
              const line: TerminalLine = {
                content: data,
                type: 'output',
                timestamp: Date.now(),
              };
              appendScrollback(activeTabId, paneId, line);
            },
            stderr: (data: string) => {
              const line: TerminalLine = {
                content: data,
                type: 'error',
                timestamp: Date.now(),
              };
              appendScrollback(activeTabId, paneId, line);
            },
            executeCommand: executeCommandWithContext,
            paneId,
          };

          const exitCode = await scriptInterpreter.executeScript(commandToExecute, scriptCtx);
          if (shouldAddToHistory) {
            entry.exitCode = exitCode;
          }

          if (scriptCtx.env['PWD'] !== pane.env['PWD']) {
            updatePane(activeTabId, paneId, {
              cwd: scriptCtx.env['PWD'],
              env: scriptCtx.env,
            });
          }
        } else {
          const parseContext = {
            vfs: fs as unknown as import('@/shell/types').VFS,
            cwd: pane.cwd,
            env: pane.env,
          };

          const parsed = await parse(commandToExecute, parseContext);

          if (parsed.commands.length === 0) {
            updatePane(activeTabId, paneId, { isRunning: false });
            runningCommands.current.delete(paneId);
            return;
          }

          const allAliases = aliasManager.getAllAliases();
          for (const [name, value] of Object.entries(allAliases)) {
            aliasManager.setAlias(name, value);
          }

          const pipelineCtx: PipelineContext = {
            vfs: fs as unknown as import('@/shell/types').VFS,
            cwd: pane.cwd,
            env: pane.env,
            stdin: '',
            stdout: (data: string) => {
              const line: TerminalLine = {
                content: data,
                type: 'output',
                timestamp: Date.now(),
              };
              appendScrollback(activeTabId, paneId, line);
            },
            stderr: (data: string) => {
              const line: TerminalLine = {
                content: data,
                type: 'error',
                timestamp: Date.now(),
              };
              appendScrollback(activeTabId, paneId, line);
            },
            executeCommand: executeCommandWithContext,
            paneId,
          };

          const exitCode = await executePipeline(parsed.commands, pipelineCtx);
          if (shouldAddToHistory) {
            entry.exitCode = exitCode;
          }
        }
      } catch (error) {
        const errorLine: TerminalLine = {
          content: `${error instanceof Error ? error.message : String(error)}\n`,
          type: 'error',
          timestamp: Date.now(),
        };
        appendScrollback(activeTabId, paneId, errorLine);
        if (shouldAddToHistory) {
          entry.exitCode = 1;
        }
      } finally {
        updatePane(activeTabId, paneId, { isRunning: false });
        runningCommands.current.delete(paneId);
      }
    },
    [activeTab, activeTabId, fs, executeCommandWithContext, renderPS1, addHistoryEntry, appendScrollback, updatePane, scriptInterpreter, expandHistory]
  );

  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
    },
    [setActiveTabId]
  );

  const handleTabAdd = useCallback(() => {
    const state = useTerminalStore.getState();
    const newTabId = generateId();
    const newTab = createInitialTab(newTabId, `Tab ${state.tabs.length + 1}`);
    addTab(newTab);
  }, [addTab]);

  const handleTabClose = useCallback(
    (tabId: string) => {
      removeTab(tabId);
    },
    [removeTab]
  );

  const handleTabRename = useCallback(
    (tabId: string, newTitle: string) => {
      updateTab(tabId, { title: newTitle });
    },
    [updateTab]
  );

  const handleThemeChange = useCallback(
    (newTheme: ThemeName) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const handleSplit = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      if (!activeTab) return;

      const newPaneId = generateId();
      const activePane = activeTab.panes[activeTab.activePaneId];

      const newSplit: Split = {
        id: generateId(),
        direction,
        sizes: [50, 50],
        children: [activeTab.activePaneId, newPaneId],
      };

      const updateSplitRoot = (node: Split | string): Split | string => {
        if (node === activeTab.activePaneId) {
          return newSplit;
        }
        if (typeof node === 'string') {
          return node;
        }
        return {
          ...node,
          children: node.children.map(updateSplitRoot),
        };
      };

      updateTab(activeTabId, {
        splitRoot: updateSplitRoot(activeTab.splitRoot),
        panes: {
          ...activeTab.panes,
          [newPaneId]: createInitialPane(newPaneId, activePane?.cwd || HOME_DIR),
        },
      });
    },
    [activeTab, activeTabId, updateTab]
  );

  const handleSizesChange = useCallback(
    (splitId: string, sizes: number[]) => {
      updateSplitSizes(activeTabId, splitId, sizes);
    },
    [activeTabId, updateSplitSizes]
  );

  const handleInterrupt = useCallback(
    (paneId: string) => {
      const line: TerminalLine = {
        content: '^C\n',
        type: 'error',
        timestamp: Date.now(),
      };
      appendScrollback(activeTabId, paneId, line);
      updatePane(activeTabId, paneId, {
        currentCommand: '',
        inputBuffer: '',
        isRunning: false,
        historyIndex: -1,
        autoComplete: null,
      });
      runningCommands.current.delete(paneId);
    },
    [activeTabId, appendScrollback, updatePane]
  );

  const handleKeyShortcut = useCallback(
    async (paneId: string, shortcut: string, data?: unknown) => {
      if (shortcut === 'ctrl+r') {
        setSearchPaneId(paneId);
        setShowSearchHistory(true);
      } else if (shortcut === 'ctrl+l') {
        updatePane(activeTabId, paneId, { scrollBack: [] });
      } else if (shortcut === 'tab') {
        const tabData = data as { input: string; cursorPos: number };
        const pane = activeTab?.panes[paneId];
        if (!pane) return;

        if (pane.autoComplete && pane.autoComplete.candidates.length > 0) {
          if (pane.autoComplete.originalInput === tabData.input) {
            const nextIndex = (pane.autoComplete.currentIndex + 1) % pane.autoComplete.candidates.length;
            const candidate = pane.autoComplete.candidates[nextIndex];
            const { prefix, originalCursorPos } = pane.autoComplete;

            const newInput = tabData.input.slice(0, originalCursorPos - prefix.length) + candidate + tabData.input.slice(originalCursorPos);
            const newCursorPos = originalCursorPos - prefix.length + candidate.length;

            updatePane(activeTabId, paneId, {
              currentCommand: newInput,
              inputBuffer: newInput,
              autoComplete: {
                ...pane.autoComplete,
                currentIndex: nextIndex,
              },
            });

            if (autoComplete) {
              setAutoComplete({
                ...autoComplete,
                selectedIndex: nextIndex,
              });
            }

            return;
          } else {
            updatePane(activeTabId, paneId, { autoComplete: null });
          }
        }

        const commandNames = listCommands().map((c) => c.name);
        const allAliases = aliasManager.getAllAliases();

        const context = {
          vfs: fs,
          cwd: pane.cwd,
          env: pane.env,
          aliases: allAliases,
          commandNames,
        };

        const result = await getCompletions(tabData.input, tabData.cursorPos, context);

        if (result.completed && result.completed !== result.prefix) {
          const newInput = tabData.input.slice(0, tabData.cursorPos - result.prefix.length) + result.completed + tabData.input.slice(tabData.cursorPos);
          const newCursorPos = tabData.cursorPos - result.prefix.length + result.completed.length;
          updatePane(activeTabId, paneId, {
            currentCommand: newInput,
            inputBuffer: newInput,
          });
        }

        if (result.showList && result.candidates.length > 0) {
          const items: AutoCompleteItem[] = result.candidates.map((c) => ({
            label: c,
            type: c.endsWith('/') ? 'directory' : 'file',
            description: '',
          }));

          updatePane(activeTabId, paneId, {
            autoComplete: {
              candidates: result.candidates,
              currentIndex: 0,
              prefix: result.prefix,
              originalInput: tabData.input,
              originalCursorPos: tabData.cursorPos,
            },
          });

          setAutoComplete({
            visible: true,
            items,
            selectedIndex: 0,
            position: { x: 20, y: window.innerHeight - 200 },
            paneId,
          });
        }
      }
    },
    [activeTab, activeTabId, fs, updatePane, autoComplete]
  );

  const handleInputChange = useCallback(
    (paneId: string, value: string, cursorPos: number) => {
      updatePane(activeTabId, paneId, {
        currentCommand: value,
        inputBuffer: value,
        autoComplete: null,
      });
      if (autoComplete) {
        setAutoComplete(null);
      }
    },
    [activeTabId, updatePane, autoComplete]
  );

  const handleHistoryNavigate = useCallback(
    (paneId: string, index: number) => {
      updatePane(activeTabId, paneId, {
        historyIndex: index,
        autoComplete: null,
      });
    },
    [activeTabId, updatePane]
  );

  const handleVimSave = useCallback(
    async (content: string) => {
      if (vimEditor) {
        try {
          const normalizedPath = Path.normalize(vimEditor.filePath, HOME_DIR);
          await fs.writeFile(normalizedPath, content);
          const line: TerminalLine = {
            content: `"${vimEditor.filePath}" ${content.split('\n').length}L written\n`,
            type: 'output',
            timestamp: Date.now(),
          };
          appendScrollback(activeTabId, vimEditor.paneId, line);
        } catch (error) {
          const line: TerminalLine = {
            content: `Error: ${error instanceof Error ? error.message : String(error)}\n`,
            type: 'error',
            timestamp: Date.now(),
          };
          appendScrollback(activeTabId, vimEditor.paneId, line);
        }
      }
    },
    [vimEditor, activeTabId, fs, appendScrollback]
  );

  const handleVimClose = useCallback(() => {
    setVimEditor(null);
  }, []);

  const handleSearchSelect = useCallback(
    (command: string) => {
      if (searchPaneId) {
        updatePane(activeTabId, searchPaneId, {
          currentCommand: command,
          inputBuffer: command,
        });
      }
      setShowSearchHistory(false);
      setSearchPaneId(null);
    },
    [searchPaneId, activeTabId, updatePane]
  );

  const handleAutoCompleteSelect = useCallback(
    (index: number) => {
      if (autoComplete) {
        setAutoComplete({ ...autoComplete, selectedIndex: index });
      }
    },
    [autoComplete]
  );

  const handleAutoCompleteConfirm = useCallback(
    (item: AutoCompleteItem) => {
      if (autoComplete) {
        const pane = activeTab?.panes[autoComplete.paneId];
        if (pane) {
          const currentCmd = pane.currentCommand;
          const lastSpace = currentCmd.lastIndexOf(' ');
          const prefix = lastSpace >= 0 ? currentCmd.slice(0, lastSpace + 1) : '';
          const newValue = prefix + item.label;
          updatePane(activeTabId, autoComplete.paneId, {
            currentCommand: newValue,
            inputBuffer: newValue,
          });
        }
        setAutoComplete(null);
      }
    },
    [autoComplete, activeTab, activeTabId, updatePane]
  );

  useEffect(() => {
    if (!autoComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setAutoComplete(null);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleAutoCompleteSelect(Math.min(autoComplete.selectedIndex + 1, autoComplete.items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleAutoCompleteSelect(Math.max(autoComplete.selectedIndex - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAutoCompleteConfirm(autoComplete.items[autoComplete.selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [autoComplete, handleAutoCompleteSelect, handleAutoCompleteConfirm]);

  const renderPane = (paneId: string) => {
    const pane = activeTab?.panes[paneId];
    if (!pane) return null;

    if (vimEditor && vimEditor.paneId === paneId) {
      return (
        <VimEditor
          filePath={vimEditor.filePath}
          content={vimEditor.content}
          onSave={handleVimSave}
          onClose={handleVimClose}
        />
      );
    }

    const prompt = renderPS1(pane.env['PS1'] || '%# ', pane.env);

    return (
      <Terminal
        key={paneId}
        paneId={paneId}
        tabId={activeTabId}
        scrollBack={pane.scrollBack}
        currentCommand={pane.currentCommand}
        inputBuffer={pane.inputBuffer}
        history={pane.history}
        historyIndex={pane.historyIndex}
        isRunning={pane.isRunning}
        cwd={pane.cwd}
        prompt={prompt}
        onCommand={(cmd) => handleCommand(paneId, cmd)}
        onInterrupt={() => handleInterrupt(paneId)}
        onKeyShortcut={(shortcut, data) => handleKeyShortcut(paneId, shortcut, data)}
        onInputChange={(value, pos) => handleInputChange(paneId, value, pos)}
        onHistoryNavigate={(index) => handleHistoryNavigate(paneId, index)}
      />
    );
  };

  if (!fsInitialized) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="text-foreground">Initializing terminal...</div>
      </div>
    );
  }

  if (!activeTab) {
    return <div className="app-container">No tabs available</div>;
  }

  const paneComponents: Record<string, React.ReactNode> = {};
  Object.keys(activeTab.panes).forEach((paneId) => {
    paneComponents[paneId] = renderPane(paneId);
  });

  const currentPane = activeTab.panes[activeTab.activePaneId];

  return (
    <div className="app-container">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        currentTheme={theme}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onTabAdd={handleTabAdd}
        onTabRename={handleTabRename}
        onThemeChange={handleThemeChange}
      />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <SplitPane
          split={activeTab.splitRoot}
          panes={paneComponents}
          onSizesChange={handleSizesChange}
        />

        {autoComplete && (
          <AutoCompletePopup
            items={autoComplete.items}
            selectedIndex={autoComplete.selectedIndex}
            onSelect={handleAutoCompleteSelect}
            onConfirm={handleAutoCompleteConfirm}
            position={autoComplete.position}
            visible={autoComplete.visible}
          />
        )}
      </div>

      <SearchHistory
        visible={showSearchHistory}
        history={currentPane?.history || []}
        onClose={() => {
          setShowSearchHistory(false);
          setSearchPaneId(null);
        }}
        onSelect={handleSearchSelect}
      />
    </div>
  );
};

export default TerminalApp;
