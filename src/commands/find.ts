import type { CommandDefinition } from './types';
import { Path } from '../fs/Path';
import type { FileNode } from '../fs/IndexedDBStore';

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${regexStr}$`);
}

export const find: CommandDefinition = {
  name: 'find',
  description: 'Search for files in a directory hierarchy',
  usage: 'find [path] -name "pattern"',
  execute: async ({ vfs, cwd, args, stdout, stderr }) => {
    let searchPath = cwd;
    let namePattern: string | null = null;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-name' && i + 1 < args.length) {
        namePattern = args[i + 1].replace(/^["']|["']$/g, '');
        i++;
      } else if (i === 0 && !arg.startsWith('-')) {
        searchPath = arg;
      }
    }

    try {
      const normalizedPath = Path.normalize(searchPath, cwd);
      const exists = await vfs.exists(normalizedPath);

      if (!exists) {
        stderr(`find: '${searchPath}': No such file or directory\n`);
        return 1;
      }

      const store = vfs.getStore();
      const allFiles = await store.getAllFiles();

      const matches: FileNode[] = [];

      for (const file of allFiles) {
        if (file.path === normalizedPath || file.path.startsWith(normalizedPath + '/')) {
          if (namePattern) {
            const regex = wildcardToRegex(namePattern);
            if (regex.test(file.name)) {
              matches.push(file);
            }
          } else {
            matches.push(file);
          }
        }
      }

      matches.sort((a, b) => a.path.localeCompare(b.path));

      for (const file of matches) {
        if (file.path !== normalizedPath) {
          stdout(`${file.path}\n`);
        }
      }

      return 0;
    } catch (error) {
      stderr(`find: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const findCommands: CommandDefinition[] = [find];
