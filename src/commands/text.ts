import type { CommandDefinition } from './types';
import { Path } from '../fs/Path';

async function getInputContent(
  vfs: any,
  cwd: string,
  args: string[],
  stdin: string
): Promise<{ content: string; hasFile: boolean }> {
  if (args.length === 0) {
    return { content: stdin, hasFile: false };
  }

  const file = args[0];
  const normalizedPath = Path.normalize(file, cwd);
  const exists = await vfs.exists(normalizedPath);
  if (!exists) {
    return { content: '', hasFile: false };
  }

  const stat = await vfs.stat(normalizedPath);
  if (stat.isDirectory()) {
    return { content: '', hasFile: false };
  }

  const content = await vfs.readFile(normalizedPath);
  return { content, hasFile: true };
}

function parseLineCount(args: string[]): { count: number; fileArgs: string[] } {
  let count = 10;
  const fileArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-n' && i + 1 < args.length) {
      count = parseInt(args[i + 1], 10) || 10;
      i++;
    } else if (arg.startsWith('-n')) {
      const numStr = arg.slice(2);
      count = parseInt(numStr, 10) || 10;
    } else if (/^-\d+$/.test(arg)) {
      count = parseInt(arg.slice(1), 10) || 10;
    } else {
      fileArgs.push(arg);
    }
  }

  return { count: Math.max(1, count), fileArgs };
}

export const head: CommandDefinition = {
  name: 'head',
  description: 'Output the first part of files',
  usage: 'head [-n lines] [file...]',
  execute: async ({ vfs, cwd, args, stdin, stdout, stderr }) => {
    const { count, fileArgs } = parseLineCount(args);

    try {
      if (fileArgs.length === 0) {
        const lines = stdin.split('\n');
        const headLines = lines.slice(0, count);
        stdout(headLines.join('\n') + (headLines.length > 0 && !stdin.endsWith('\n') ? '' : ''));
        return 0;
      }

      for (let i = 0; i < fileArgs.length; i++) {
        const file = fileArgs[i];
        const normalizedPath = Path.normalize(file, cwd);
        const exists = await vfs.exists(normalizedPath);

        if (!exists) {
          stderr(`head: cannot open '${file}' for reading: No such file or directory\n`);
          return 1;
        }

        const stat = await vfs.stat(normalizedPath);
        if (stat.isDirectory()) {
          stderr(`head: error reading '${file}': Is a directory\n`);
          return 1;
        }

        if (fileArgs.length > 1) {
          stdout(`==> ${file} <==\n`);
        }

        const content = await vfs.readFile(normalizedPath);
        const lines = content.split('\n');
        const headLines = lines.slice(0, count);
        stdout(headLines.join('\n') + '\n');
      }

      return 0;
    } catch (error) {
      stderr(`head: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const tail: CommandDefinition = {
  name: 'tail',
  description: 'Output the last part of files',
  usage: 'tail [-n lines] [file...]',
  execute: async ({ vfs, cwd, args, stdin, stdout, stderr }) => {
    const { count, fileArgs } = parseLineCount(args);

    try {
      if (fileArgs.length === 0) {
        const lines = stdin.split('\n');
        const tailLines = lines.slice(-count);
        stdout(tailLines.join('\n') + (tailLines.length > 0 && !stdin.endsWith('\n') ? '' : ''));
        return 0;
      }

      for (let i = 0; i < fileArgs.length; i++) {
        const file = fileArgs[i];
        const normalizedPath = Path.normalize(file, cwd);
        const exists = await vfs.exists(normalizedPath);

        if (!exists) {
          stderr(`tail: cannot open '${file}' for reading: No such file or directory\n`);
          return 1;
        }

        const stat = await vfs.stat(normalizedPath);
        if (stat.isDirectory()) {
          stderr(`tail: error reading '${file}': Is a directory\n`);
          return 1;
        }

        if (fileArgs.length > 1) {
          stdout(`==> ${file} <==\n`);
        }

        const content = await vfs.readFile(normalizedPath);
        const lines = content.split('\n');
        const tailLines = lines.slice(-count);
        stdout(tailLines.join('\n') + '\n');
      }

      return 0;
    } catch (error) {
      stderr(`tail: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const grep: CommandDefinition = {
  name: 'grep',
  description: 'Search for patterns in files',
  usage: 'grep [-i] [-v] [-n] pattern [file...]',
  execute: async ({ vfs, cwd, args, stdin, stdout, stderr }) => {
    let ignoreCase = false;
    let invertMatch = false;
    let lineNumbers = false;
    let pattern = '';
    const files: string[] = [];

    let patternFound = false;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (!patternFound && arg.startsWith('-') && arg.length > 1) {
        for (let j = 1; j < arg.length; j++) {
          const flag = arg[j];
          if (flag === 'i') ignoreCase = true;
          else if (flag === 'v') invertMatch = true;
          else if (flag === 'n') lineNumbers = true;
        }
      } else if (!patternFound) {
        pattern = arg;
        patternFound = true;
      } else {
        files.push(arg);
      }
    }

    if (!pattern) {
      stderr('grep: usage: grep [-ivn] pattern [file...]\n');
      return 1;
    }

    try {
      const regexFlags = ignoreCase ? 'gi' : 'g';
      const regex = new RegExp(pattern, regexFlags);

      const processContent = (content: string, fileName?: string) => {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const matches = regex.test(line);
          regex.lastIndex = 0;

          const shouldOutput = invertMatch ? !matches : matches;
          if (shouldOutput) {
            let output = '';
            if (fileName && files.length > 1) {
              output += `${fileName}:`;
            }
            if (lineNumbers) {
              output += `${i + 1}:`;
            }
            output += line + '\n';
            stdout(output);
          }
        }
      };

      if (files.length === 0) {
        processContent(stdin);
        return 0;
      }

      for (const file of files) {
        const normalizedPath = Path.normalize(file, cwd);
        const exists = await vfs.exists(normalizedPath);

        if (!exists) {
          stderr(`grep: ${file}: No such file or directory\n`);
          return 1;
        }

        const stat = await vfs.stat(normalizedPath);
        if (stat.isDirectory()) {
          stderr(`grep: ${file}: Is a directory\n`);
          return 1;
        }

        const content = await vfs.readFile(normalizedPath);
        processContent(content, file);
      }

      return 0;
    } catch (error) {
      stderr(`grep: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const wc: CommandDefinition = {
  name: 'wc',
  description: 'Count lines, words, and characters',
  usage: 'wc [-l] [-w] [-c] [file...]',
  execute: async ({ vfs, cwd, args, stdin, stdout, stderr }) => {
    let countLines = false;
    let countWords = false;
    let countChars = false;
    const files: string[] = [];

    for (const arg of args) {
      if (arg === '-l') countLines = true;
      else if (arg === '-w') countWords = true;
      else if (arg === '-c') countChars = true;
      else if (arg === '-lw' || arg === '-wl') { countLines = true; countWords = true; }
      else if (arg === '-lc' || arg === '-cl') { countLines = true; countChars = true; }
      else if (arg === '-wc' || arg === '-cw') { countWords = true; countChars = true; }
      else if (arg === '-lwc' || arg === '-lcw' || arg === '-wlc' || arg === '-wcl' || arg === '-clw' || arg === '-cwl') {
        countLines = true; countWords = true; countChars = true;
      } else {
        files.push(arg);
      }
    }

    if (!countLines && !countWords && !countChars) {
      countLines = true;
      countWords = true;
      countChars = true;
    }

    function countContent(content: string) {
      const lines = content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      const chars = content.length;
      return { lines, words, chars };
    }

    try {
      if (files.length === 0) {
        const { lines, words, chars } = countContent(stdin);
        let output = '';
        if (countLines) output += `${lines.toString().padStart(7, ' ')}`;
        if (countWords) output += `${words.toString().padStart(7, ' ')}`;
        if (countChars) output += `${chars.toString().padStart(7, ' ')}`;
        stdout(output + '\n');
        return 0;
      }

      let totalLines = 0;
      let totalWords = 0;
      let totalChars = 0;

      for (const file of files) {
        const normalizedPath = Path.normalize(file, cwd);
        const exists = await vfs.exists(normalizedPath);

        if (!exists) {
          stderr(`wc: ${file}: No such file or directory\n`);
          return 1;
        }

        const stat = await vfs.stat(normalizedPath);
        if (stat.isDirectory()) {
          stderr(`wc: ${file}: Is a directory\n`);
          return 1;
        }

        const content = await vfs.readFile(normalizedPath);
        const { lines, words, chars } = countContent(content);
        totalLines += lines;
        totalWords += words;
        totalChars += chars;

        let output = '';
        if (countLines) output += `${lines.toString().padStart(7, ' ')}`;
        if (countWords) output += `${words.toString().padStart(7, ' ')}`;
        if (countChars) output += `${chars.toString().padStart(7, ' ')}`;
        stdout(output + ` ${file}\n`);
      }

      if (files.length > 1) {
        let output = '';
        if (countLines) output += `${totalLines.toString().padStart(7, ' ')}`;
        if (countWords) output += `${totalWords.toString().padStart(7, ' ')}`;
        if (countChars) output += `${totalChars.toString().padStart(7, ' ')}`;
        stdout(output + ' total\n');
      }

      return 0;
    } catch (error) {
      stderr(`wc: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const sort: CommandDefinition = {
  name: 'sort',
  description: 'Sort lines of text',
  usage: 'sort [file...]',
  execute: async ({ vfs, cwd, args, stdin, stdout, stderr }) => {
    try {
      let content = stdin;

      if (args.length > 0) {
        const contents: string[] = [];
        for (const file of args) {
          const normalizedPath = Path.normalize(file, cwd);
          const exists = await vfs.exists(normalizedPath);

          if (!exists) {
            stderr(`sort: cannot read: ${file}: No such file or directory\n`);
            return 1;
          }

          const stat = await vfs.stat(normalizedPath);
          if (stat.isDirectory()) {
            stderr(`sort: read failed: ${file}: Is a directory\n`);
            return 1;
          }

          contents.push(await vfs.readFile(normalizedPath));
        }
        content = contents.join('');
      }

      const lines = content.split('\n');
      const sortedLines = lines.sort((a, b) => a.localeCompare(b));
      stdout(sortedLines.join('\n'));

      return 0;
    } catch (error) {
      stderr(`sort: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const uniq: CommandDefinition = {
  name: 'uniq',
  description: 'Remove duplicate lines',
  usage: 'uniq [-c] [input] [output]',
  execute: async ({ vfs, cwd, args, stdin, stdout, stderr }) => {
    let count = false;
    const files: string[] = [];

    for (const arg of args) {
      if (arg === '-c') {
        count = true;
      } else {
        files.push(arg);
      }
    }

    try {
      let content = stdin;
      let outputFile: string | null = null;

      if (files.length > 0) {
        const inputFile = files[0];
        const normalizedInputPath = Path.normalize(inputFile, cwd);
        const exists = await vfs.exists(normalizedInputPath);

        if (!exists) {
          stderr(`uniq: ${inputFile}: No such file or directory\n`);
          return 1;
        }

        const stat = await vfs.stat(normalizedInputPath);
        if (stat.isDirectory()) {
          stderr(`uniq: ${inputFile}: Is a directory\n`);
          return 1;
        }

        content = await vfs.readFile(normalizedInputPath);

        if (files.length > 1) {
          outputFile = files[1];
        }
      }

      const lines = content.split('\n');
      const result: string[] = [];
      let counts: number[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (i === 0 || lines[i] !== lines[i - 1]) {
          result.push(lines[i]);
          counts.push(1);
        } else {
          counts[counts.length - 1]++;
        }
      }

      let output = '';
      for (let i = 0; i < result.length; i++) {
        if (count) {
          output += `${counts[i].toString().padStart(4, ' ')} ${result[i]}\n`;
        } else {
          output += result[i] + '\n';
        }
      }

      if (outputFile) {
        const normalizedOutputPath = Path.normalize(outputFile, cwd);
        await vfs.writeFile(normalizedOutputPath, output);
      } else {
        stdout(output);
      }

      return 0;
    } catch (error) {
      stderr(`uniq: ${error instanceof Error ? error.message : String(error)}\n`);
      return 1;
    }
  },
};

export const textCommands: CommandDefinition[] = [head, tail, grep, wc, sort, uniq];
