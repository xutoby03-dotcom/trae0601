import type { VirtualFS } from '../fs/VirtualFS';
import { Path, HOME_DIR } from '../fs/Path';

export interface AutoCompleteContext {
  vfs: VirtualFS;
  cwd: string;
  env: Record<string, string>;
  aliases: Record<string, string>;
  commandNames: string[];
}

export interface CompletionResult {
  candidates: string[];
  prefix: string;
  completed: string;
  showList: boolean;
}

type TabState = {
  lastInput: string;
  lastCursorPos: number;
  candidates: string[];
  currentIndex: number;
  showList: boolean;
};

class AutoComplete {
  private tabState: TabState | null = null;

  async getCompletions(
    input: string,
    cursorPos: number,
    context: AutoCompleteContext
  ): Promise<CompletionResult> {
    const trimmedInput = input.slice(0, cursorPos);
    const parts = trimmedInput.split(/\s+/);
    const lastPart = parts[parts.length - 1] || '';
    const isCommandPosition = parts.length === 1 || /\s$/.test(input.slice(0, cursorPos - lastPart.length));

    const isNewInput = this.tabState?.lastInput !== input || this.tabState?.lastCursorPos !== cursorPos;

    if (isNewInput) {
      let candidates: string[] = [];
      let prefix = lastPart;

      if (isCommandPosition) {
        candidates = this.getCommandCompletions(lastPart, context);
      } else {
        candidates = await this.getPathCompletions(lastPart, context);
      }

      const commonPrefix = this.findCommonPrefix(candidates);
      const completed = commonPrefix || lastPart;

      this.tabState = {
        lastInput: input,
        lastCursorPos: cursorPos,
        candidates,
        currentIndex: -1,
        showList: false,
      };

      return {
        candidates,
        prefix,
        completed,
        showList: candidates.length > 1,
      };
    }

    if (this.tabState.candidates.length > 1) {
      if (!this.tabState.showList) {
        this.tabState.showList = true;
        return {
          candidates: this.tabState.candidates,
          prefix: lastPart,
          completed: lastPart,
          showList: true,
        };
      } else {
        this.tabState.currentIndex = (this.tabState.currentIndex + 1) % this.tabState.candidates.length;
        const completed = this.tabState.candidates[this.tabState.currentIndex];
        return {
          candidates: this.tabState.candidates,
          prefix: lastPart,
          completed,
          showList: false,
        };
      }
    }

    return {
      candidates: this.tabState.candidates,
      prefix: lastPart,
      completed: this.tabState.candidates[0] || lastPart,
      showList: false,
    };
  }

  private getCommandCompletions(
    prefix: string,
    context: AutoCompleteContext
  ): string[] {
    const allCommands = [...context.commandNames, ...Object.keys(context.aliases)];
    const lowerPrefix = prefix.toLowerCase();

    return allCommands
      .filter((cmd) => cmd.toLowerCase().startsWith(lowerPrefix))
      .sort();
  }

  private async getPathCompletions(
    prefix: string,
    context: AutoCompleteContext
  ): Promise<string[]> {
    try {
      const expandedPath = prefix.startsWith('~')
        ? Path.expandHome(prefix)
        : prefix;

      let searchDir: string;
      let searchPrefix: string;

      if (expandedPath.endsWith('/')) {
        searchDir = expandedPath;
        searchPrefix = '';
      } else {
        searchDir = Path.dirname(expandedPath) || '/';
        searchPrefix = Path.basename(expandedPath);
      }

      if (!Path.isAbsolute(searchDir)) {
        searchDir = Path.normalize(searchDir, context.cwd);
      }

      const entries = await context.vfs.readdir(searchDir);
      const lowerSearchPrefix = searchPrefix.toLowerCase();

      const matches = entries
        .filter((entry) => entry.toLowerCase().startsWith(lowerSearchPrefix))
        .map((entry) => {
          const fullPath = Path.join(searchDir, entry);
          let suffix = '';
          try {
            const stat = context.vfs.stat(fullPath);
            if (stat && 'isDirectory' in stat && typeof stat.isDirectory === 'function' && stat.isDirectory()) {
              suffix = '/';
            }
          } catch {
            // ignore
          }
          return entry + suffix;
        });

      if (prefix.startsWith('~')) {
        const homePrefix = Path.join('~', Path.relative(HOME_DIR, searchDir));
        return matches.map((m) => {
          if (homePrefix === '~') {
            return '~/' + m;
          }
          return homePrefix + '/' + m;
        });
      }

      if (!Path.isAbsolute(prefix)) {
        const relativeDir = Path.relative(context.cwd, searchDir);
        if (relativeDir === '.') {
          return matches;
        }
        return matches.map((m) => relativeDir + '/' + m);
      }

      return matches.map((m) => Path.join(searchDir, m));
    } catch {
      return [];
    }
  }

  private findCommonPrefix(candidates: string[]): string {
    if (candidates.length === 0) return '';
    if (candidates.length === 1) return candidates[0];

    let prefix = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      while (candidates[i].indexOf(prefix) !== 0) {
        prefix = prefix.slice(0, -1);
        if (prefix === '') return '';
      }
    }
    return prefix;
  }

  reset(): void {
    this.tabState = null;
  }
}

const autoCompleteInstance = new AutoComplete();

export const getCompletions = (
  input: string,
  cursorPos: number,
  context: AutoCompleteContext
): Promise<CompletionResult> => {
  return autoCompleteInstance.getCompletions(input, cursorPos, context);
};

export const createAutoComplete = (): AutoComplete => {
  return new AutoComplete();
};

export { AutoComplete };
