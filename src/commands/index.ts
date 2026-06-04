import type { CommandDefinition, CommandContext } from './types';
import { filesystemCommands } from './filesystem';
import { textCommands } from './text';
import { findCommands } from './find';
import { echoCommands } from './echo';
import { themeCommands } from './theme';
import { aliasCommands } from './alias';
import { splitCommands } from './split';
import { historyCommands } from './history';

export const allCommands: CommandDefinition[] = [
  ...filesystemCommands,
  ...textCommands,
  ...findCommands,
  ...echoCommands,
  ...themeCommands,
  ...aliasCommands,
  ...splitCommands,
  ...historyCommands,
];

const commandMap: Map<string, CommandDefinition> = new Map();

for (const cmd of allCommands) {
  commandMap.set(cmd.name, cmd);
}

export function getCommand(name: string): CommandDefinition | undefined {
  return commandMap.get(name);
}

export function hasCommand(name: string): boolean {
  return commandMap.has(name);
}

export function listCommands(): CommandDefinition[] {
  return allCommands;
}

export async function executeCommand(
  name: string,
  context: CommandContext
): Promise<number> {
  const command = getCommand(name);
  if (!command) {
    context.stderr(`${name}: command not found\n`);
    return 127;
  }

  try {
    const exitCode = await command.execute(context);
    return exitCode;
  } catch (error) {
    context.stderr(`${name}: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

export type { CommandContext, CommandExecutor, CommandDefinition } from './types';
