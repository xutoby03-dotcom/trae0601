import type { CommandDefinition } from './types';

export const alias: CommandDefinition = {
  name: 'alias',
  description: 'Define or display aliases',
  usage: 'alias [name=value]',
  execute: ({ args, stdout, stderr, setAlias, getAliases }) => {
    const aliases = getAliases ? getAliases() : {};

    if (args.length === 0) {
      for (const [name, value] of Object.entries(aliases)) {
        stdout(`alias ${name}='${value}'\n`);
      }
      return 0;
    }

    const arg = args.join(' ');
    const equalsIndex = arg.indexOf('=');

    if (equalsIndex === -1) {
      const name = arg.trim();
      if (aliases[name]) {
        stdout(`alias ${name}='${aliases[name]}'\n`);
      } else {
        stderr(`alias: ${name}: not found\n`);
        return 1;
      }
      return 0;
    }

    const name = arg.slice(0, equalsIndex).trim();
    let value = arg.slice(equalsIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');

    if (setAlias) {
      setAlias(name, value);
    }

    return 0;
  },
};

export const unalias: CommandDefinition = {
  name: 'unalias',
  description: 'Remove aliases',
  usage: 'unalias name',
  execute: ({ args, stderr, removeAlias, getAliases }) => {
    const aliases = getAliases ? getAliases() : {};

    if (args.length === 0) {
      stderr('unalias: usage: unalias name\n');
      return 1;
    }

    const name = args[0];
    if (!aliases[name]) {
      stderr(`unalias: ${name}: not found\n`);
      return 1;
    }

    if (removeAlias) {
      removeAlias(name);
    }

    return 0;
  },
};

export const aliasCommands: CommandDefinition[] = [alias, unalias];
