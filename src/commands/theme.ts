import type { CommandDefinition } from './types';

export const theme: CommandDefinition = {
  name: 'theme',
  description: 'Change or list available themes',
  usage: 'theme [name]',
  execute: ({ args, stdout, stderr, setTheme, getThemes }) => {
    const themes = getThemes ? getThemes() : ['dracula', 'solarized', 'nord', 'onedark', 'monokai'];

    if (args.length === 0) {
      stdout('Available themes:\n');
      for (const t of themes) {
        stdout(`  ${t}\n`);
      }
      return 0;
    }

    const themeName = args[0];
    if (!themes.includes(themeName)) {
      stderr(`theme: '${themeName}' is not a valid theme\n`);
      return 1;
    }

    if (setTheme) {
      setTheme(themeName);
      stdout(`Theme changed to ${themeName}\n`);
    }

    return 0;
  },
};

export const themeCommands: CommandDefinition[] = [theme];
