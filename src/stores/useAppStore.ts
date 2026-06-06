import { create } from 'zustand';
import { AppConfig } from '../types';
import { lazy, ComponentType, Suspense } from 'react';

const FileManager = lazy(() => import('../apps/FileManager'));
const TextEditor = lazy(() => import('../apps/TextEditor'));
const Calculator = lazy(() => import('../apps/Calculator'));
const Paint = lazy(() => import('../apps/Paint'));
const Browser = lazy(() => import('../apps/Browser'));
const MusicPlayer = lazy(() => import('../apps/MusicPlayer'));

export const appConfigs: AppConfig[] = [
  { id: 'file-manager', name: '文件管理器', icon: 'folder', defaultWidth: 800, defaultHeight: 500 },
  { id: 'text-editor', name: '文本编辑器', icon: 'file-text', defaultWidth: 700, defaultHeight: 500 },
  { id: 'calculator', name: '计算器', icon: 'calculator', defaultWidth: 300, defaultHeight: 450 },
  { id: 'paint', name: '画图', icon: 'palette', defaultWidth: 800, defaultHeight: 600 },
  { id: 'browser', name: '浏览器', icon: 'globe', defaultWidth: 900, defaultHeight: 600 },
  { id: 'music-player', name: '音乐播放器', icon: 'music', defaultWidth: 400, defaultHeight: 500 },
];

const appComponents: Record<string, ComponentType> = {
  'file-manager': FileManager,
  'text-editor': TextEditor,
  'calculator': Calculator,
  'paint': Paint,
  'browser': Browser,
  'music-player': MusicPlayer,
};

interface AppStore {
  apps: AppConfig[];
  getAppComponent: (appId: string) => ComponentType | null;
  getAppConfig: (appId: string) => AppConfig | undefined;
}

export const useAppStore = create<AppStore>(() => ({
  apps: appConfigs,

  getAppComponent: (appId: string) => {
    return appComponents[appId] || null;
  },

  getAppConfig: (appId: string) => {
    return appConfigs.find(app => app.id === appId);
  },
}));
