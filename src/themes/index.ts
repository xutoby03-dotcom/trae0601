import { dracula } from './dracula';
import { solarized } from './solarized';
import { nord } from './nord';
import { onedark } from './onedark';
import { monokai } from './monokai';
import type { Theme, ThemeName } from '../types/theme';

export const themes: Record<ThemeName, Theme> = {
  dracula,
  solarized,
  nord,
  onedark,
  monokai,
};

export const themeNames: ThemeName[] = ['dracula', 'solarized', 'nord', 'onedark', 'monokai'];

export { dracula, solarized, nord, onedark, monokai };
export type { Theme, ThemeName } from '../types/theme';

export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes.dracula;
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.style.setProperty('--color-bg', theme.background);
  root.style.setProperty('--color-fg', theme.foreground);
  root.style.setProperty('--color-cursor', theme.cursor);
  root.style.setProperty('--color-cursor-text', theme.cursorText);
  root.style.setProperty('--color-selection-bg', theme.selectionBackground);
  root.style.setProperty('--color-selection-fg', theme.selectionForeground);
  root.style.setProperty('--color-black', theme.black);
  root.style.setProperty('--color-red', theme.red);
  root.style.setProperty('--color-green', theme.green);
  root.style.setProperty('--color-yellow', theme.yellow);
  root.style.setProperty('--color-blue', theme.blue);
  root.style.setProperty('--color-magenta', theme.magenta);
  root.style.setProperty('--color-cyan', theme.cyan);
  root.style.setProperty('--color-white', theme.white);
  root.style.setProperty('--color-bright-black', theme.brightBlack);
  root.style.setProperty('--color-bright-red', theme.brightRed);
  root.style.setProperty('--color-bright-green', theme.brightGreen);
  root.style.setProperty('--color-bright-yellow', theme.brightYellow);
  root.style.setProperty('--color-bright-blue', theme.brightBlue);
  root.style.setProperty('--color-bright-magenta', theme.brightMagenta);
  root.style.setProperty('--color-bright-cyan', theme.brightCyan);
  root.style.setProperty('--color-bright-white', theme.brightWhite);
  root.style.setProperty('--color-tab-bg', theme.tabBackground);
  root.style.setProperty('--color-tab-active-bg', theme.tabActiveBackground);
  root.style.setProperty('--color-tab-border', theme.tabBorder);
  root.style.setProperty('--color-split-border', theme.splitBorder);
}
