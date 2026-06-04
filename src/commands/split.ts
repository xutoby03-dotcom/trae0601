import type { CommandDefinition } from './types';

export const split: CommandDefinition = {
  name: 'split',
  description: 'Split the terminal window',
  usage: 'split [h|v]',
  execute: ({ args, stdout, stderr, split }) => {
    let direction: 'h' | 'v' = 'h';

    if (args.length > 0) {
      const arg = args[0].toLowerCase();
      if (arg === 'h' || arg === 'horizontal') {
        direction = 'h';
      } else if (arg === 'v' || arg === 'vertical') {
        direction = 'v';
      } else {
        stderr(`split: invalid direction '${args[0]}'. Use 'h' or 'v'\n`);
        return 1;
      }
    }

    if (split) {
      split(direction);
      stdout(`Split ${direction === 'h' ? 'horizontally' : 'vertically'}\n`);
    }

    return 0;
  },
};

export const splitCommands: CommandDefinition[] = [split];
