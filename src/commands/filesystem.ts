import type { CommandDefinition } from './types';
import { Path, HOME_DIR } from '../fs/Path';

const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isRecent = now.getTime() - timestamp < 183 * 24 * 60 * 60 * 1000;
  const month = MONTHS[date.getMonth()];
  const day = date.getDate().toString().padStart(2, ' ');
  if (isRecent) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day} ${hours}:${minutes}`;
  } else {
    const year = date.getFullYear().toString();
    return `${month} ${day}  ${year}`;
  }
}

function formatPermissions(isDir: boolean): string {
  const dirBit = isDir ? 'd' : '-';
  return `${dirBit}rwxr-xr-x`;
}

function getColoredName(name: string, isDir: boolean, isExecutable: boolean): string {
  if (isDir) {
    return `${BLUE}${name}${RESET}`;
  }
  if (isExecutable) {
    return `${GREEN}${name}${RESET}`;
  }
  return name;
}

function isExecutableFile(name: string): boolean {
  return name.endsWith('.sh') || name.endsWith('.bin') || name.endsWith('.exe');
}

export const cd: CommandDefinition = {
  name: 'cd',
  description: 'Change the current directory',
  usage: 'cd [directory]',
  execute: async ({ vfs, cwd, args, stdout, stderr, setCwd, env }) => {
    let target = args[0] || HOME_DIR;

    if (target === '-') {
      target = env['OLDPWD'] || cwd;
    }

    if (target === '~') {
      target = HOME_DIR;
    }

    try {
      const normalizedPath = Path.normalize(target, cwd);
      const exists = await vfs.exists(normalizedPath);
      if (!exists) {
        stderr(`cd: ${target}: No such file or directory\n`);
        return 1;
      }

      const stat = await vfs.stat(normalizedPath);
      if (!stat.isDirectory()) {
        stderr(`cd: ${target}: Not a directory\n`);
        return 1;
      }

      if (setCwd) {
        env['OLDPWD'] = cwd;
        setCwd(normalizedPath);
      }
      return 0;
    } catch (error) {
      stderr(`cd: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const pwd: CommandDefinition = {
  name: 'pwd',
  description: 'Print the current working directory',
  usage: 'pwd',
  execute: ({ cwd, stdout }) => {
    stdout(`${cwd}\n`);
    return 0;
  },
};

export const ls: CommandDefinition = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [-a] [-l] [path]',
  execute: async ({ vfs, cwd, args, stdout, stderr }) => {
    let showHidden = false;
    let longFormat = false;
    let targetPath = cwd;

    for (const arg of args) {
      if (arg === '-a') {
        showHidden = true;
      } else if (arg === '-l') {
        longFormat = true;
      } else if (arg === '-al' || arg === '-la') {
        showHidden = true;
        longFormat = true;
      } else {
        targetPath = arg;
      }
    }

    try {
      const normalizedPath = Path.normalize(targetPath, cwd);
      const exists = await vfs.exists(normalizedPath);
      if (!exists) {
        stderr(`ls: cannot access '${targetPath}': No such file or directory\n`);
        return 1;
      }

      const stat = await vfs.stat(normalizedPath);
      if (stat.isFile()) {
        if (longFormat) {
          const perms = formatPermissions(false);
          const owner = stat.isDirectory ? 'user' : 'user';
          const size = stat.size.toString().padStart(5, ' ');
          const date = formatDate(stat.updatedAt);
          const coloredName = getColoredName(stat.name, false, isExecutableFile(stat.name));
          stdout(`${perms}  1 ${owner}  ${size} ${date} ${coloredName}\n`);
        } else {
          stdout(`${stat.name}\n`);
        }
        return 0;
      }

      const entries = await vfs.readdir(normalizedPath);
      let files = entries;

      if (!showHidden) {
        files = files.filter((f) => !f.startsWith('.'));
      } else {
        files = ['.', '..', ...files];
      }

      files.sort();

      if (longFormat) {
        const totalBlocks = files.length;
        stdout(`total ${totalBlocks}\n`);

        for (const fileName of files) {
          const filePath = Path.join(normalizedPath, fileName);
          const fileStat = await vfs.stat(filePath);
          const isDir = fileStat.isDirectory();
          const perms = formatPermissions(isDir);
          const owner = 'user';
          const size = fileStat.size.toString().padStart(5, ' ');
          const date = formatDate(fileStat.updatedAt);
          const coloredName = getColoredName(fileName, isDir, isExecutableFile(fileName));
          stdout(`${perms}  1 ${owner}  ${size} ${date} ${coloredName}\n`);
        }
      } else {
        const output: string[] = [];
        for (const fileName of files) {
          const filePath = Path.join(normalizedPath, fileName);
          const fileStat = await vfs.stat(filePath);
          const isDir = fileStat.isDirectory();
          const coloredName = getColoredName(fileName, isDir, isExecutableFile(fileName));
          output.push(coloredName);
        }
        stdout(`${output.join('  ')}\n`);
      }

      return 0;
    } catch (error) {
      stderr(`ls: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const mkdir: CommandDefinition = {
  name: 'mkdir',
  description: 'Create directories',
  usage: 'mkdir [-p] directory...',
  execute: async ({ vfs, cwd, args, stdout, stderr }) => {
    let recursive = false;
    const directories: string[] = [];

    for (const arg of args) {
      if (arg === '-p') {
        recursive = true;
      } else {
        directories.push(arg);
      }
    }

    if (directories.length === 0) {
      stderr('mkdir: missing operand\n');
      return 1;
    }

    try {
      for (const dir of directories) {
        const normalizedPath = Path.normalize(dir, cwd);
        await vfs.mkdir(normalizedPath, { recursive });
      }
      return 0;
    } catch (error) {
      stderr(`mkdir: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const touch: CommandDefinition = {
  name: 'touch',
  description: 'Change file timestamps or create empty files',
  usage: 'touch file...',
  execute: async ({ vfs, cwd, args, stderr }) => {
    if (args.length === 0) {
      stderr('touch: missing file operand\n');
      return 1;
    }

    try {
      for (const file of args) {
        const normalizedPath = Path.normalize(file, cwd);
        await vfs.touch(normalizedPath);
      }
      return 0;
    } catch (error) {
      stderr(`touch: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const rm: CommandDefinition = {
  name: 'rm',
  description: 'Remove files or directories',
  usage: 'rm [-r] [-f] file...',
  execute: async ({ vfs, cwd, args, stderr }) => {
    let recursive = false;
    let force = false;
    const files: string[] = [];

    for (const arg of args) {
      if (arg === '-r' || arg === '-R' || arg === '--recursive') {
        recursive = true;
      } else if (arg === '-f' || arg === '--force') {
        force = true;
      } else if (arg === '-rf' || arg === '-fr') {
        recursive = true;
        force = true;
      } else {
        files.push(arg);
      }
    }

    if (files.length === 0) {
      if (!force) {
        stderr('rm: missing operand\n');
        return 1;
      }
      return 0;
    }

    try {
      for (const file of files) {
        const normalizedPath = Path.normalize(file, cwd);
        try {
          await vfs.rm(normalizedPath, { recursive, force });
        } catch (error) {
          if (!force) {
            stderr(`rm: ${error instanceof Error ? error.message : String(error)}\n`);
            return 1;
          }
        }
      }
      return 0;
    } catch (error) {
      stderr(`rm: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const cat: CommandDefinition = {
  name: 'cat',
  description: 'Concatenate and print files',
  usage: 'cat [file...]',
  execute: async ({ vfs, cwd, args, stdin, stdout, stderr }) => {
    if (args.length === 0) {
      stdout(stdin);
      return 0;
    }

    try {
      for (const file of args) {
        const normalizedPath = Path.normalize(file, cwd);
        const exists = await vfs.exists(normalizedPath);
        if (!exists) {
          stderr(`cat: ${file}: No such file or directory\n`);
          return 1;
        }

        const stat = await vfs.stat(normalizedPath);
        if (stat.isDirectory()) {
          stderr(`cat: ${file}: Is a directory\n`);
          return 1;
        }

        const content = await vfs.readFile(normalizedPath);
        stdout(content);
      }
      return 0;
    } catch (error) {
      stderr(`cat: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const mv: CommandDefinition = {
  name: 'mv',
  description: 'Move or rename files',
  usage: 'mv source... destination',
  execute: async ({ vfs, cwd, args, stderr }) => {
    if (args.length < 2) {
      stderr('mv: missing operand\n');
      return 1;
    }

    try {
      const sources = args.slice(0, -1);
      const destination = args[args.length - 1];
      const normalizedDest = Path.normalize(destination, cwd);
      const destExists = await vfs.exists(normalizedDest);
      const destIsDir = destExists && (await vfs.stat(normalizedDest)).isDirectory();

      if (sources.length > 1 && !destIsDir) {
        stderr(`mv: target '${destination}' is not a directory\n`);
        return 1;
      }

      for (const source of sources) {
        const normalizedSource = Path.normalize(source, cwd);
        let targetPath = normalizedDest;

        if (destIsDir) {
          const baseName = Path.basename(normalizedSource);
          targetPath = Path.join(normalizedDest, baseName);
        }

        await vfs.rename(normalizedSource, targetPath);
      }

      return 0;
    } catch (error) {
      stderr(`mv: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const cp: CommandDefinition = {
  name: 'cp',
  description: 'Copy files and directories',
  usage: 'cp [-r] source... destination',
  execute: async ({ vfs, cwd, args, stderr }) => {
    let recursive = false;
    const files: string[] = [];

    for (const arg of args) {
      if (arg === '-r' || arg === '-R' || arg === '--recursive') {
        recursive = true;
      } else {
        files.push(arg);
      }
    }

    if (files.length < 2) {
      stderr('cp: missing operand\n');
      return 1;
    }

    try {
      const sources = files.slice(0, -1);
      const destination = files[files.length - 1];
      const normalizedDest = Path.normalize(destination, cwd);
      const destExists = await vfs.exists(normalizedDest);
      const destIsDir = destExists && (await vfs.stat(normalizedDest)).isDirectory();

      if (sources.length > 1 && !destIsDir) {
        stderr(`cp: target '${destination}' is not a directory\n`);
        return 1;
      }

      for (const source of sources) {
        const normalizedSource = Path.normalize(source, cwd);
        const sourceExists = await vfs.exists(normalizedSource);

        if (!sourceExists) {
          stderr(`cp: cannot stat '${source}': No such file or directory\n`);
          return 1;
        }

        const sourceStat = await vfs.stat(normalizedSource);

        if (sourceStat.isDirectory() && !recursive) {
          stderr(`cp: -r not specified; omitting directory '${source}'\n`);
          return 1;
        }

        let targetPath = normalizedDest;
        if (destIsDir) {
          const baseName = Path.basename(normalizedSource);
          targetPath = Path.join(normalizedDest, baseName);
        }

        if (sourceStat.isDirectory() && recursive) {
          const store = vfs.getStore();
          const allFiles = await store.getAllFiles();
          const toCopy = allFiles.filter(
            (f) => f.path === normalizedSource || f.path.startsWith(normalizedSource + '/')
          );

          for (const file of toCopy) {
            const relativePath = file.path.slice(normalizedSource.length);
            const newFilePath = targetPath + relativePath;

            if (file.type === 'directory') {
              await vfs.mkdir(newFilePath, { recursive: true });
            } else {
              const content = file.content || '';
              await vfs.writeFile(newFilePath, content);
            }
          }
        } else {
          await vfs.copyFile(normalizedSource, targetPath);
        }
      }

      return 0;
    } catch (error) {
      stderr(`cp: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const filesystemCommands: CommandDefinition[] = [cd, pwd, ls, mkdir, touch, rm, cat, mv, cp];
