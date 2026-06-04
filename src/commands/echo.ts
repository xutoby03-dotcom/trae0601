import type { CommandDefinition } from './types';

function expandVariables(str: string, env: Record<string, string>): string {
  return str.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, braceName, dollarName) => {
    const name = braceName || dollarName;
    return env[name] || '';
  });
}

export const echo: CommandDefinition = {
  name: 'echo',
  description: 'Write arguments to the standard output',
  usage: 'echo [-n] [text...]',
  execute: ({ args, stdin, env, stdout }) => {
    let noNewline = false;
    let textArgs = args;

    if (args.length > 0 && args[0] === '-n') {
      noNewline = true;
      textArgs = args.slice(1);
    }

    let text: string;
    if (textArgs.length === 0) {
      text = stdin;
    } else {
      text = textArgs.join(' ');
    }

    const expanded = expandVariables(text, env);
    stdout(expanded + (noNewline ? '' : '\n'));

    return 0;
  },
};

export const echoCommands: CommandDefinition[] = [echo];
