import type { CommandDefinition } from './types';

export const historyCommands: CommandDefinition[] = [
  {
    name: 'history',
    description: 'Display command history',
    usage: 'history [N]',
    execute: async (context) => {
      const { args, stdout, stderr, getHistory } = context;

      if (!getHistory) {
        stderr('history: cannot access history\n');
        return 1;
      }

      const history = getHistory();

      if (args.length > 0) {
        const nStr = args[0];
        const n = parseInt(nStr, 10);

        if (isNaN(n) || !/^\d+$/.test(nStr)) {
          stderr(`history: ${nStr}: numeric argument required\n`);
          return 1;
        }

        if (n <= 0) {
          return 0;
        }

        const startIndex = Math.max(0, history.length - n);
        const displayHistory = history.slice(startIndex);

        displayHistory.forEach((entry, i) => {
          const lineNum = startIndex + i + 1;
          const paddedNum = lineNum.toString().padStart(4, ' ');
          stdout(`${paddedNum}  ${entry.command}\n`);
        });

        return 0;
      }

      history.forEach((entry, i) => {
        const lineNum = i + 1;
        const paddedNum = lineNum.toString().padStart(4, ' ');
        stdout(`${paddedNum}  ${entry.command}\n`);
      });

      return 0;
    },
  },
];
