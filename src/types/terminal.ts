export interface AnsiState {
  foreground?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface HistoryEntry {
  id: string;
  command: string;
  timestamp: number;
  exitCode: number;
}

export interface TerminalLine {
  content: string;
  type: 'input' | 'output' | 'error' | 'prompt';
  timestamp: number;
  ansiStates?: AnsiState[];
}

export interface VimState {
  mode: 'normal' | 'insert' | 'command';
  filePath: string;
  content: string[];
  originalContent: string[];
  cursor: { row: number; col: number };
  scrollOffset: number;
  commandBuffer: string;
  visualSelection?: {
    start: { row: number; col: number };
    end: { row: number; col: number };
  };
}

export interface AutoCompleteState {
  candidates: string[];
  currentIndex: number;
  prefix: string;
  originalInput: string;
  originalCursorPos: number;
}

export interface Pane {
  id: string;
  cwd: string;
  history: HistoryEntry[];
  historyIndex: number;
  env: Record<string, string>;
  scrollBack: TerminalLine[];
  cursorX: number;
  cursorY: number;
  isRunning: boolean;
  currentCommand: string;
  inputBuffer: string;
  vimState?: VimState;
  autoComplete?: AutoCompleteState | null;
}

export interface Split {
  id: string;
  direction: 'horizontal' | 'vertical';
  sizes: number[];
  children: (Split | string)[];
}

export interface Tab {
  id: string;
  title: string;
  activePaneId: string;
  splitRoot: Split | string;
  panes: Record<string, Pane>;
}

export interface TerminalState {
  tabs: Tab[];
  activeTabId: string;
  aliases: Record<string, string>;
  theme: string;
}

export interface PersistedHistory {
  paneId: string;
  entries: HistoryEntry[];
}

export interface PersistedScrollback {
  paneId: string;
  lines: TerminalLine[];
}

export interface PersistedAppState {
  version: string;
  tabs: {
    id: string;
    title: string;
    activePaneId: string;
    splitRoot: Split | string;
    panes: {
      id: string;
      cwd: string;
      env: Record<string, string>;
    }[];
  }[];
  activeTabId: string;
  aliases: Record<string, string>;
  theme: string;
  savedAt: number;
}
