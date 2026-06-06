import { create } from 'zustand';
import { DesktopWidget, WidgetType } from '../types';
import { saveWidgets, getWidgets } from '../utils/idb';

const defaultWidgets: DesktopWidget[] = [
  { id: 'widget-1', type: 'clock', x: 200, y: 20, width: 200, height: 200 },
  { id: 'widget-2', type: 'sticky-note', x: 430, y: 20, width: 220, height: 180, content: '欢迎使用虚拟桌面！\n双击编辑便签内容~' },
];

interface WidgetState {
  widgets: DesktopWidget[];
  isLoaded: boolean;
  addWidget: (widget: Omit<DesktopWidget, 'id'>) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  updateWidgetContent: (id: string, content: string) => void;
  loadWidgets: () => Promise<void>;
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  widgets: [],
  isLoaded: false,

  addWidget: (widget) => {
    const newWidget: DesktopWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
    };
    const newWidgets = [...get().widgets, newWidget];
    set({ widgets: newWidgets });
    saveWidgets(newWidgets);
  },

  removeWidget: (id) => {
    const newWidgets = get().widgets.filter(w => w.id !== id);
    set({ widgets: newWidgets });
    saveWidgets(newWidgets);
  },

  updateWidgetPosition: (id, x, y) => {
    const newWidgets = get().widgets.map(w => 
      w.id === id ? { ...w, x, y } : w
    );
    set({ widgets: newWidgets });
    saveWidgets(newWidgets);
  },

  updateWidgetContent: (id, content) => {
    const newWidgets = get().widgets.map(w => 
      w.id === id ? { ...w, content } : w
    );
    set({ widgets: newWidgets });
    saveWidgets(newWidgets);
  },

  loadWidgets: async () => {
    const savedWidgets = await getWidgets();
    if (savedWidgets && savedWidgets.length > 0) {
      set({ widgets: savedWidgets, isLoaded: true });
    } else {
      set({ widgets: defaultWidgets, isLoaded: true });
      saveWidgets(defaultWidgets);
    }
  },
}));
