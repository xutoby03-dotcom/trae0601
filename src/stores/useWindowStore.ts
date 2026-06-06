import { create } from 'zustand';
import { WindowState } from '../types';
import { saveWindows, getWindows } from '../utils/idb';

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  maxZIndex: number;
  isLoaded: boolean;
  openWindow: (appId: string, title: string, defaultWidth: number, defaultHeight: number) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  loadWindows: () => Promise<void>;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  maxZIndex: 100,
  isLoaded: false,

  openWindow: (appId, title, defaultWidth, defaultHeight) => {
    const existing = get().windows.find(w => w.appId === appId && !w.isMinimized);
    if (existing) {
      get().focusWindow(existing.id);
      return;
    }

    const id = `window-${Date.now()}`;
    const newZIndex = get().maxZIndex + 1;
    
    const offset = get().windows.length * 30;
    const newWindow: WindowState = {
      id,
      appId,
      title,
      x: 100 + offset,
      y: 50 + offset,
      width: defaultWidth,
      height: defaultHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZIndex,
    };

    set({
      windows: [...get().windows, newWindow],
      activeWindowId: id,
      maxZIndex: newZIndex,
    });
    
    saveWindows(get().windows);
  },

  closeWindow: (id) => {
    const newWindows = get().windows.filter(w => w.id !== id);
    const newActive = newWindows.length > 0 ? newWindows[newWindows.length - 1].id : null;
    set({
      windows: newWindows,
      activeWindowId: newActive,
    });
    saveWindows(newWindows);
  },

  minimizeWindow: (id) => {
    const newWindows = get().windows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    );
    const visible = newWindows.filter(w => !w.isMinimized);
    set({
      windows: newWindows,
      activeWindowId: visible.length > 0 ? visible[visible.length - 1].id : null,
    });
    saveWindows(newWindows);
  },

  maximizeWindow: (id) => {
    const newWindows = get().windows.map(w => {
      if (w.id === id && !w.isMaximized) {
        return {
          ...w,
          isMaximized: true,
          prevState: {
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
          },
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight - 48,
        };
      }
      return w;
    });
    set({ windows: newWindows });
    get().focusWindow(id);
    saveWindows(newWindows);
  },

  restoreWindow: (id) => {
    const newWindows = get().windows.map(w => {
      if (w.id === id && w.isMaximized && w.prevState) {
        return {
          ...w,
          isMaximized: false,
          x: w.prevState.x,
          y: w.prevState.y,
          width: w.prevState.width,
          height: w.prevState.height,
        };
      }
      if (w.id === id && w.isMinimized) {
        return { ...w, isMinimized: false };
      }
      return w;
    });
    set({ windows: newWindows });
    get().focusWindow(id);
    saveWindows(newWindows);
  },

  focusWindow: (id) => {
    const newZIndex = get().maxZIndex + 1;
    const newWindows = get().windows.map(w => 
      w.id === id ? { ...w, zIndex: newZIndex, isMinimized: false } : w
    );
    set({
      windows: newWindows,
      activeWindowId: id,
      maxZIndex: newZIndex,
    });
  },

  moveWindow: (id, x, y) => {
    const newWindows = get().windows.map(w => 
      w.id === id ? { ...w, x, y } : w
    );
    set({ windows: newWindows });
    saveWindows(newWindows);
  },

  resizeWindow: (id, width, height) => {
    const newWindows = get().windows.map(w => 
      w.id === id ? { ...w, width: Math.max(320, width), height: Math.max(240, height) } : w
    );
    set({ windows: newWindows });
    saveWindows(newWindows);
  },

  loadWindows: async () => {
    const savedWindows = await getWindows();
    if (savedWindows && savedWindows.length > 0) {
      const maxZ = Math.max(...savedWindows.map(w => w.zIndex), 100);
      set({
        windows: savedWindows,
        maxZIndex: maxZ,
        isLoaded: true,
      });
    } else {
      set({ isLoaded: true });
    }
  },
}));
