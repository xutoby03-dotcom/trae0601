import type { Command, VFS, ParseContext } from './types';
import { parseSingleCommand } from './Parser';
import { expandVariables } from './Expander';
import { Path } from '../fs/Path';

interface ScriptContext {
  vfs: VFS;
  cwd: string;
  env: Record<string, string>;
  stdin: string;
  stdout: (data: string) => void;
  stderr: (data: string) => void;
  executeCommand: (cmd: Command, ctx: ScriptContext) => Promise<number> | number;
  setCwd?: (cwd: string) => void;
  paneId?: string;
}

interface ConditionResult {
  result: boolean;
  error?: string;
}

export class ScriptInterpreter {
  private async evaluateCondition(
    condition: string,
    context: ScriptContext
  ): Promise<ConditionResult> {
    const trimmed = condition.trim();

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const testExpr = trimmed.slice(1, -1).trim();
      return this.evaluateTest(testExpr, context);
    }

    const cmdContext = {
      vfs: context.vfs,
      cwd: context.cwd,
      env: context.env,
    };
    const expanded = expandVariables(trimmed, context.env);
    const cmd = await parseSingleCommand(expanded, cmdContext);

    let output = '';
    const captureContext: ScriptContext = {
      ...context,
      stdout: (data) => { output += data; },
    };

    const exitCode = await context.executeCommand(cmd, captureContext);
    return { result: exitCode === 0 };
  }

  private async evaluateTest(
    testExpr: string,
    context: ScriptContext
  ): Promise<ConditionResult> {
    const parts = this.tokenizeTest(testExpr);

    if (parts.length === 0) {
      return { result: false };
    }

    if (parts.length === 1) {
      return { result: parts[0].length > 0 };
    }

    if (parts.length === 2) {
      const [flag, arg] = parts;
      const expandedArg = expandVariables(arg, context.env);
      const normalizedPath = Path.normalize(expandedArg, context.cwd);

      switch (flag) {
        case '-f': {
          const exists = await context.vfs.exists(normalizedPath);
          if (!exists) return { result: false };
          const isDir = await context.vfs.isDirectory(normalizedPath);
          return { result: !isDir };
        }
        case '-d': {
          const exists = await context.vfs.exists(normalizedPath);
          if (!exists) return { result: false };
          const isDir = await context.vfs.isDirectory(normalizedPath);
          return { result: isDir };
        }
        case '-n':
          return { result: expandedArg.length > 0 };
        case '-z':
          return { result: expandedArg.length === 0 };
        case '!':
          return { result: expandedArg.length === 0 };
        default:
          return { result: false, error: `test: unknown operator: ${flag}` };
      }
    }

    if (parts.length === 3) {
      const [left, op, right] = parts;
      const expandedLeft = expandVariables(left, context.env);
      const expandedRight = expandVariables(right, context.env);

      switch (op) {
        case '==':
        case '=':
          return { result: expandedLeft === expandedRight };
        case '!=':
          return { result: expandedLeft !== expandedRight };
        case '<':
          return { result: expandedLeft < expandedRight };
        case '>':
          return { result: expandedLeft > expandedRight };
        default:
          return { result: false, error: `test: unknown operator: ${op}` };
      }
    }

    return { result: false, error: 'test: too many arguments' };
  }

  private tokenizeTest(expr: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];

      if ((char === '"' || char === "'") && !inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuote) {
        inQuote = false;
        quoteChar = '';
      } else if (/\s/.test(char) && !inQuote) {
        if (current) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  private splitStatements(script: string): string[] {
    const statements: string[] = [];
    let current = '';
    let depth = 0;
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < script.length; i++) {
      const char = script[i];

      if ((char === '"' || char === "'") && !inQuote) {
        inQuote = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuote) {
        inQuote = false;
        quoteChar = '';
        current += char;
      } else if (char === ';' && !inQuote && depth === 0) {
        const trimmed = current.trim();
        if (trimmed) {
          statements.push(trimmed);
        }
        current = '';
      } else if (char === '\n' && !inQuote && depth === 0) {
        const trimmed = current.trim();
        if (trimmed && !trimmed.endsWith(';')) {
          statements.push(trimmed);
        }
        current = '';
      } else {
        if (char === '(' || char === '{' || char === '[') {
          if (!inQuote) depth++;
        } else if (char === ')' || char === '}' || char === ']') {
          if (!inQuote) depth--;
        }
        current += char;
      }
    }

    const trimmed = current.trim();
    if (trimmed) {
      statements.push(trimmed);
    }

    return statements;
  }

  private findBlockEnd(
    lines: string[],
    startIndex: number,
    startKeyword: string,
    endKeyword: string
  ): { endIndex: number; blockContent: string[] } {
    let depth = 1;
    const blockContent: string[] = [];
    let i = startIndex;

    for (; i < lines.length && depth > 0; i++) {
      const line = lines[i].trim();

      if (line.startsWith(startKeyword)) {
        depth++;
      }
      if (line === endKeyword || line.startsWith(endKeyword)) {
        depth--;
        if (depth === 0) {
          break;
        }
      }

      if (depth > 0) {
        blockContent.push(lines[i]);
      }
    }

    return { endIndex: i, blockContent };
  }

  async executeIfStatement(
    lines: string[],
    startIndex: number,
    context: ScriptContext
  ): Promise<{ endIndex: number; exitCode: number }> {
    const startLine = lines[startIndex];
    const conditionMatch = startLine.match(/^if\s+(.+?);?\s*then\s*$/);

    if (!conditionMatch) {
      context.stderr('syntax error: expected if condition\n');
      return { endIndex: startIndex, exitCode: 2 };
    }

    const condition = conditionMatch[1];
    const { endIndex: thenEnd, blockContent: thenBlock } = this.findBlockEnd(
      lines,
      startIndex + 1,
      'if',
      'fi'
    );

    const allBlockLines = [startLine, ...thenBlock];
    let elseBlock: string[] = [];
    let elifBlocks: Array<{ condition: string; block: string[] }> = [];

    let currentBlock: string[] = [];
    let inElse = false;
    let foundFi = false;

    for (let i = 1; i < allBlockLines.length; i++) {
      const line = allBlockLines[i].trim();

      if (line.startsWith('elif ') && !inElse) {
        if (currentBlock.length > 0) {
          elifBlocks.push({ condition: '', block: currentBlock });
          currentBlock = [];
        }
        const elifMatch = line.match(/^elif\s+(.+?);?\s*then\s*$/);
        if (elifMatch) {
          elifBlocks.push({ condition: elifMatch[1], block: [] });
        }
      } else if (line === 'else' && !inElse) {
        if (currentBlock.length > 0 && elifBlocks.length > 0) {
          elifBlocks[elifBlocks.length - 1].block = currentBlock;
        }
        inElse = true;
        currentBlock = [];
      } else if (line === 'fi') {
        if (inElse) {
          elseBlock = currentBlock;
        } else if (currentBlock.length > 0) {
          if (elifBlocks.length > 0) {
            elifBlocks[elifBlocks.length - 1].block = currentBlock;
          }
        }
        foundFi = true;
        break;
      } else {
        currentBlock.push(allBlockLines[i]);
      }
    }

    if (!foundFi) {
      context.stderr('syntax error: expected fi\n');
      return { endIndex: startIndex, exitCode: 2 };
    }

    const condResult = await this.evaluateCondition(condition, context);
    if (condResult.error) {
      context.stderr(`${condResult.error}\n`);
      return { endIndex: thenEnd, exitCode: 1 };
    }

    let exitCode = 0;

    if (condResult.result) {
      exitCode = await this.executeScript(thenBlock.join('\n'), context);
    } else {
      let executed = false;
      for (const elif of elifBlocks) {
        const elifResult = await this.evaluateCondition(elif.condition, context);
        if (elifResult.error) {
          context.stderr(`${elifResult.error}\n`);
          return { endIndex: thenEnd, exitCode: 1 };
        }
        if (elifResult.result) {
          exitCode = await this.executeScript(elif.block.join('\n'), context);
          executed = true;
          break;
        }
      }

      if (!executed && elseBlock.length > 0) {
        exitCode = await this.executeScript(elseBlock.join('\n'), context);
      }
    }

    return { endIndex: thenEnd, exitCode };
  }

  async executeForStatement(
    lines: string[],
    startIndex: number,
    context: ScriptContext
  ): Promise<{ endIndex: number; exitCode: number }> {
    const startLine = lines[startIndex];
    const forMatch = startLine.match(/^for\s+(\w+)\s+in\s+(.+?);?\s*do\s*$/);

    if (!forMatch) {
      context.stderr('syntax error: expected for variable in values; do\n');
      return { endIndex: startIndex, exitCode: 2 };
    }

    const varName = forMatch[1];
    const valuesStr = forMatch[2];
    const expandedValues = expandVariables(valuesStr, context.env);
    const values = this.tokenizeForValues(expandedValues);

    const { endIndex, blockContent } = this.findBlockEnd(
      lines,
      startIndex + 1,
      'for',
      'done'
    );

    let exitCode = 0;
    const originalValue = context.env[varName];

    for (const value of values) {
      context.env[varName] = value;
      exitCode = await this.executeScript(blockContent.join('\n'), context);
    }

    if (originalValue === undefined) {
      delete context.env[varName];
    } else {
      context.env[varName] = originalValue;
    }

    return { endIndex, exitCode };
  }

  private tokenizeForValues(str: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if ((char === '"' || char === "'") && !inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuote) {
        inQuote = false;
        quoteChar = '';
      } else if (/\s/.test(char) && !inQuote) {
        if (current) {
          values.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      values.push(current);
    }

    return values;
  }

  async executeScript(script: string, context: ScriptContext): Promise<number> {
    const lines = script.split('\n').filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('#');
    });

    let exitCode = 0;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.startsWith('if ')) {
        const result = await this.executeIfStatement(lines, i, context);
        exitCode = result.exitCode;
        i = result.endIndex + 1;
      } else if (line.startsWith('for ')) {
        const result = await this.executeForStatement(lines, i, context);
        exitCode = result.exitCode;
        i = result.endIndex + 1;
      } else {
        const statements = this.splitStatements(line);
        for (const stmt of statements) {
          if (stmt.startsWith('if ') || stmt.startsWith('for ')) {
            const subLines = [stmt];
            if (stmt.startsWith('if ')) {
              const result = await this.executeIfStatement(subLines, 0, context);
              exitCode = result.exitCode;
            } else {
              const result = await this.executeForStatement(subLines, 0, context);
              exitCode = result.exitCode;
            }
          } else {
            const parseContext: ParseContext = {
              vfs: context.vfs,
              cwd: context.cwd,
              env: context.env,
            };
            const cmd = await parseSingleCommand(stmt, parseContext);

            if (cmd.name) {
              exitCode = await context.executeCommand(cmd, context);
            }
          }
        }
        i++;
      }
    }

    return exitCode;
  }
}

export const scriptInterpreter = new ScriptInterpreter();
