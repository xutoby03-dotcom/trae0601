export interface Theme {
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  cursorText: string;
  selectionBackground: string;
  selectionForeground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
  tabBackground: string;
  tabActiveBackground: string;
  tabBorder: string;
  splitBorder: string;
}

export type ThemeName = 'dracula' | 'solarized' | 'nord' | 'onedark' | 'monokai';
