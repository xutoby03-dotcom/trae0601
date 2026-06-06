export type ThemeType = 'light' | 'dark' | 'win95';

export interface DesktopIcon {
  id: string;
  appId: string;
  name: string;
  x: number;
  y: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  prevState?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface UserPreferences {
  id?: string;
  theme: ThemeType;
  background: string;
  iconSize: 'small' | 'medium' | 'large';
}

export interface VirtualFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  content?: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type WidgetType = 'clock' | 'sticky-note' | 'system-info';

export interface DesktopWidget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
}
