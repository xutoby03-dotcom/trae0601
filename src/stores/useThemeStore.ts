import { create } from 'zustand';
import { ThemeType, UserPreferences } from '../types';
import { applyTheme } from '../utils/themes';
import { savePreferences, getPreferences } from '../utils/idb';

interface ThemeState {
  theme: ThemeType;
  background: string;
  iconSize: 'small' | 'medium' | 'large';
  isLoaded: boolean;
  setTheme: (theme: ThemeType) => void;
  setBackground: (bg: string) => void;
  setIconSize: (size: 'small' | 'medium' | 'large') => void;
  loadPreferences: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  background: '',
  iconSize: 'medium',
  isLoaded: false,

  setTheme: (theme: ThemeType) => {
    set({ theme });
    applyTheme(theme);
    const { background, iconSize } = get();
    savePreferences({ theme, background, iconSize });
  },

  setBackground: (bg: string) => {
    set({ background: bg });
    const { theme, iconSize } = get();
    savePreferences({ theme, background: bg, iconSize });
  },

  setIconSize: (size: 'small' | 'medium' | 'large') => {
    set({ iconSize: size });
    const { theme, background } = get();
    savePreferences({ theme, background, iconSize: size });
  },

  loadPreferences: async () => {
    const prefs = await getPreferences();
    if (prefs) {
      set({
        theme: prefs.theme,
        background: prefs.background,
        iconSize: prefs.iconSize,
        isLoaded: true,
      });
      applyTheme(prefs.theme);
    } else {
      set({ isLoaded: true });
      applyTheme('light');
    }
  },
}));
