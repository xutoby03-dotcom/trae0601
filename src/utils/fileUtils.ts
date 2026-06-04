import type { MediaType } from '@/types/media';

export function getMediaType(filename: string): MediaType | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  if (videoExts.includes(ext || '')) return 'video';
  if (audioExts.includes(ext || '')) return 'audio';
  if (imageExts.includes(ext || '')) return 'image';
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

export async function getVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
      video.remove();
    };
    video.onerror = () => {
      resolve(0);
      video.remove();
    };
  });
}

export async function getVideoDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      video.remove();
    };
    video.onerror = () => {
      resolve({ width: 0, height: 0 });
      video.remove();
    };
  });
}

export async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      img.remove();
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      img.remove();
    };
    img.src = url;
  });
}

export async function generateThumbnail(url: string, type: MediaType): Promise<string | undefined> {
  if (type === 'video') {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(undefined);
        }
        video.remove();
      };
      
      video.onerror = () => {
        resolve(undefined);
        video.remove();
      };
    });
  } else if (type === 'image') {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(undefined);
        }
        img.remove();
      };
      img.onerror = () => {
        resolve(undefined);
        img.remove();
      };
      img.src = url;
    });
  }
  return undefined;
}
