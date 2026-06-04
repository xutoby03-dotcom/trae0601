import type { VirtualFS } from '../fs/VirtualFS';

export interface CommandContext {
  vfs: VirtualFS;
  cwd: string;
  env: Record<string, string>;
  stdin: string;
  args: string[];
  stdout: (data: string) => void;
  stderr: (data: string) => void;
  setCwd?: (cwd: string) => void;
  setTheme?: (themeName: string) => void;
  getThemes?: () => string[];
  getAliases?: () => Record<string, string>;
  setAlias?: (name: string, value: string) => void;
  removeAlias?: (name: string) => void;
  split?: (direction: 'h' | 'v') => void;
}

export type CommandExecutor = (context: CommandContext) => Promise<number> | number;

export interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  execute: CommandExecutor;
}
