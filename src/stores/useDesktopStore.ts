import { create } from 'zustand';
import { DesktopIcon } from '../types';
import { saveDesktopIcons, getDesktopIcons } from '../utils/idb';

const defaultIcons: DesktopIcon[] = [
  { id: '1', appId: 'file-manager', name: '文件管理器', x: 20, y: 20 },
  { id: '2', appId: 'text-editor', name: '文本编辑器', x: 20, y: 120 },
  { id: '3', appId: 'calculator', name: '计算器', x: 20, y: 220 },
  { id: '4', appId: 'paint', name: '画图', x: 20, y: 320 },
  { id: '5', appId: 'browser', name: '浏览器', x: 20, y: 420 },
  { id: '6', appId: 'music-player', name: '音乐播放器', x: 20, y: 520 },
];

interface DesktopState {
  icons: DesktopIcon[];
  isLoaded: boolean;
  addIcon: (icon: Omit<DesktopIcon, 'id'>) => void;
  removeIcon: (id: string) => void;
  updateIconPosition: (id: string, x: number, y: number) => void;
  loadIcons: () => Promise<void>;
}

export const useDesktopStore = create<DesktopState>((set, get) => ({
  icons: [],
  isLoaded: false,

  addIcon: (icon) => {
    const newIcon: DesktopIcon = {
      ...icon,
      id: Date.now().toString(),
    };
    const newIcons = [...get().icons, newIcon];
    set({ icons: newIcons });
    saveDesktopIcons(newIcons);
  },

  removeIcon: (id) => {
    const newIcons = get().icons.filter(i => i.id !== id);
    set({ icons: newIcons });
    saveDesktopIcons(newIcons);
  },

  updateIconPosition: (id, x, y) => {
    const newIcons = get().icons.map(i => 
      i.id === id ? { ...i, x, y } : i
    );
    set({ icons: newIcons });
    saveDesktopIcons(newIcons);
  },

  loadIcons: async () => {
    const savedIcons = await getDesktopIcons();
    if (savedIcons && savedIcons.length > 0) {
      set({ icons: savedIcons, isLoaded: true });
    } else {
      set({ icons: defaultIcons, isLoaded: true });
      saveDesktopIcons(defaultIcons);
    }
  },
}));
