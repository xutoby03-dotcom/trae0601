import { ThemeType } from '../types';

export interface ThemeConfig {
  name: string;
  colors: {
    background: string;
    desktopBackground: string;
    taskbarBackground: string;
    taskbarBorder: string;
    windowBackground: string;
    windowBorder: string;
    windowTitlebar: string;
    windowTitlebarActive: string;
    windowTitlebarText: string;
    windowTitlebarTextActive: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    buttonBackground: string;
    buttonHover: string;
    buttonActive: string;
    startMenuBackground: string;
    startMenuBorder: string;
    iconText: string;
    iconTextHover: string;
    trayBackground: string;
    inputBackground: string;
    inputBorder: string;
  };
  borders: {
    window: string;
    button: string;
    taskbar: string;
    startMenu: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  shadows: {
    window: string;
    windowActive: string;
    startMenu: string;
  };
  taskbarHeight: number;
  windowBorderWidth: number;
  windowTitlebarHeight: number;
}

export const themes: Record<ThemeType, ThemeConfig> = {
  light: {
    name: '浅色主题',
    colors: {
      background: '#f3f3f3',
      desktopBackground: 'linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)',
      taskbarBackground: 'rgba(255, 255, 255, 0.85)',
      taskbarBorder: 'rgba(0, 0, 0, 0.1)',
      windowBackground: '#ffffff',
      windowBorder: 'rgba(0, 0, 0, 0.1)',
      windowTitlebar: '#f3f3f3',
      windowTitlebarActive: '#ffffff',
      windowTitlebarText: '#666666',
      windowTitlebarTextActive: '#000000',
      textPrimary: '#000000',
      textSecondary: '#666666',
      accent: '#0078d4',
      accentHover: '#106ebe',
      buttonBackground: '#f3f3f3',
      buttonHover: '#e5e5e5',
      buttonActive: '#d9d9d9',
      startMenuBackground: 'rgba(255, 255, 255, 0.95)',
      startMenuBorder: 'rgba(0, 0, 0, 0.1)',
      iconText: '#ffffff',
      iconTextHover: '#ffffff',
      trayBackground: 'rgba(0, 0, 0, 0.05)',
      inputBackground: '#ffffff',
      inputBorder: '#d1d5db',
    },
    borders: {
      window: '1px solid rgba(0, 0, 0, 0.1)',
      button: '1px solid rgba(0, 0, 0, 0.1)',
      taskbar: '1px solid rgba(0, 0, 0, 0.1)',
      startMenu: '1px solid rgba(0, 0, 0, 0.1)',
    },
    fonts: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "Cascadia Code", monospace',
    },
    shadows: {
      window: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      windowActive: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      startMenu: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    taskbarHeight: 48,
    windowBorderWidth: 1,
    windowTitlebarHeight: 32,
  },
  dark: {
    name: '深色主题',
    colors: {
      background: '#1a1a1a',
      desktopBackground: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      taskbarBackground: 'rgba(32, 32, 32, 0.85)',
      taskbarBorder: 'rgba(255, 255, 255, 0.1)',
      windowBackground: '#202020',
      windowBorder: 'rgba(255, 255, 255, 0.1)',
      windowTitlebar: '#2a2a2a',
      windowTitlebarActive: '#303030',
      windowTitlebarText: '#888888',
      windowTitlebarTextActive: '#ffffff',
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
      accent: '#4cc2ff',
      accentHover: '#3aa8e0',
      buttonBackground: '#3a3a3a',
      buttonHover: '#4a4a4a',
      buttonActive: '#5a5a5a',
      startMenuBackground: 'rgba(32, 32, 32, 0.95)',
      startMenuBorder: 'rgba(255, 255, 255, 0.1)',
      iconText: '#ffffff',
      iconTextHover: '#ffffff',
      trayBackground: 'rgba(255, 255, 255, 0.05)',
      inputBackground: '#2a2a2a',
      inputBorder: '#404040',
    },
    borders: {
      window: '1px solid rgba(255, 255, 255, 0.1)',
      button: '1px solid rgba(255, 255, 255, 0.1)',
      taskbar: '1px solid rgba(255, 255, 255, 0.1)',
      startMenu: '1px solid rgba(255, 255, 255, 0.1)',
    },
    fonts: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "Cascadia Code", monospace',
    },
    shadows: {
      window: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      windowActive: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      startMenu: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    },
    taskbarHeight: 48,
    windowBorderWidth: 1,
    windowTitlebarHeight: 32,
  },
  win95: {
    name: 'Windows 95 复古',
    colors: {
      background: '#c0c0c0',
      desktopBackground: '#008080',
      taskbarBackground: '#c0c0c0',
      taskbarBorder: '#dfdfdf',
      windowBackground: '#c0c0c0',
      windowBorder: '#c0c0c0',
      windowTitlebar: '#000080',
      windowTitlebarActive: '#000080',
      windowTitlebarText: '#ffffff',
      windowTitlebarTextActive: '#ffffff',
      textPrimary: '#000000',
      textSecondary: '#808080',
      accent: '#000080',
      accentHover: '#0000a0',
      buttonBackground: '#c0c0c0',
      buttonHover: '#d0d0d0',
      buttonActive: '#b0b0b0',
      startMenuBackground: '#c0c0c0',
      startMenuBorder: '#c0c0c0',
      iconText: '#ffffff',
      iconTextHover: '#ffffff',
      trayBackground: '#a0a0a0',
      inputBackground: '#ffffff',
      inputBorder: '#808080',
    },
    borders: {
      window: '2px outset #dfdfdf',
      button: '2px outset #dfdfdf',
      taskbar: '2px outset #dfdfdf',
      startMenu: '2px outset #dfdfdf',
    },
    fonts: {
      sans: '"MS Sans Serif", "Tahoma", "Microsoft Sans Serif", sans-serif',
      mono: '"Courier New", "Lucida Console", monospace',
    },
    shadows: {
      window: 'none',
      windowActive: 'none',
      startMenu: 'none',
    },
    taskbarHeight: 28,
    windowBorderWidth: 2,
    windowTitlebarHeight: 20,
  },
};

export const applyTheme = (theme: ThemeType) => {
  const config = themes[theme];
  const root = document.documentElement;

  Object.entries(config.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
  });

  root.style.setProperty('--taskbar-height', `${config.taskbarHeight}px`);
  root.style.setProperty('--window-border-width', `${config.windowBorderWidth}px`);
  root.style.setProperty('--window-titlebar-height', `${config.windowTitlebarHeight}px`);
  root.style.setProperty('--font-sans', config.fonts.sans);
  root.style.setProperty('--font-mono', config.fonts.mono);

  document.body.setAttribute('data-theme', theme);
};
