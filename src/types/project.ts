export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface ExportSettings {
  width: number;
  height: number;
  fps: number;
  quality: 'low' | 'medium' | 'high';
}
