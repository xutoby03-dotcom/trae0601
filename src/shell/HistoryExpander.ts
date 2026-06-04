export interface HistoryEntry {
  command: string;
  timestamp: number;
  exitCode?: number;
}

export interface ExpandHistoryResult {
  expanded: string;
  expandedCommand: string | null;
  error: string | null;
  shouldExecute: boolean;
}

export function expandHistory(
  commandLine: string,
  history: HistoryEntry[]
): ExpandHistoryResult {
  const trimmed = commandLine.trim();

  if (!trimmed) {
    return {
      expanded: commandLine,
      expandedCommand: null,
      error: null,
      shouldExecute: true,
    };
  }

  let result = commandLine;
  let expandedCommand: string | null = null;
  let hasExpansion = false;

  const bangPattern = /!(!|\d+)/g;
  let match;
  let lastIndex = 0;
  let output = '';

  while ((match = bangPattern.exec(commandLine)) !== null) {
    const fullMatch = match[0];
    const specifier = match[1];

    output += commandLine.slice(lastIndex, match.index);

    let historyEntry: HistoryEntry | undefined;

    if (specifier === '!') {
      if (history.length > 0) {
        historyEntry = history[history.length - 1];
      }
    } else {
      const n = parseInt(specifier, 10);
      if (!isNaN(n) && n >= 1 && n <= history.length) {
        historyEntry = history[n - 1];
      }
    }

    if (historyEntry) {
      output += historyEntry.command;
      hasExpansion = true;
      expandedCommand = historyEntry.command;
    } else {
      const eventSpec = specifier === '!' ? '!!' : `!${specifier}`;
      return {
        expanded: commandLine,
        expandedCommand: null,
        error: `${eventSpec}: event not found`,
        shouldExecute: false,
      };
    }

    lastIndex = match.index + fullMatch.length;
  }

  output += commandLine.slice(lastIndex);

  return {
    expanded: hasExpansion ? output : commandLine,
    expandedCommand: hasExpansion ? expandedCommand : null,
    error: null,
    shouldExecute: true,
  };
}
