export type MediaType = 'video' | 'audio' | 'image';

export interface MediaItem {
  id: string;
  projectId: string;
  name: string;
  type: MediaType;
  url: string;
  duration: number;
  width?: number;
  height?: number;
  size: number;
  thumbnail?: string;
}
