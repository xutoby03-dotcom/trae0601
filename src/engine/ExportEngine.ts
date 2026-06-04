import type { Track, Clip, SubtitleClip } from '@/types/timeline';
import type { MediaItem } from '@/types/media';
import { PreviewEngine } from './PreviewEngine';

export interface ExportSettings {
  width: number;
  height: number;
  fps: number;
  quality: 'low' | 'medium' | 'high';
}

export class ExportEngine {
  private canvas: HTMLCanvasElement;
  private previewEngine: PreviewEngine;
  private settings: ExportSettings;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  
  constructor(settings: ExportSettings) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = settings.width;
    this.canvas.height = settings.height;
    
    this.previewEngine = new PreviewEngine(this.canvas, {
      width: settings.width,
      height: settings.height,
      fps: settings.fps,
    });
    
    this.settings = settings;
  }
  
  async export(
    duration: number,
    tracks: Track[],
    clips: (Clip | SubtitleClip)[],
    mediaItems: MediaItem[],
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    const stream = this.canvas.captureStream(this.settings.fps);
    
    const mimeType = this.getSupportedMimeType();
    const bitrate = this.getBitrate();
    
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: bitrate,
    });
    
    this.recordedChunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    
    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(blob);
      };
      
      this.mediaRecorder!.onerror = (error) => {
        reject(error);
      };
      
      this.mediaRecorder!.start();
      this.renderFrames(duration, tracks, clips, mediaItems, onProgress)
        .then(() => {
          this.mediaRecorder!.stop();
        })
        .catch(reject);
    });
  }
  
  private async renderFrames(
    duration: number,
    tracks: Track[],
    clips: (Clip | SubtitleClip)[],
    mediaItems: MediaItem[],
    onProgress: (progress: number) => void
  ): Promise<void> {
    const frameInterval = 1 / this.settings.fps;
    const totalFrames = Math.ceil(duration * this.settings.fps);
    
    for (let i = 0; i < totalFrames; i++) {
      const time = i * frameInterval;
      await this.previewEngine.composeFrame(time, tracks, clips, mediaItems);
      onProgress((i + 1) / totalFrames);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'video/webm';
  }
  
  private getBitrate(): number {
    const { width, height, fps, quality } = this.settings;
    const baseBitrate = width * height * fps * 0.07;
    
    switch (quality) {
      case 'low':
        return baseBitrate * 0.5;
      case 'medium':
        return baseBitrate;
      case 'high':
        return baseBitrate * 2;
      default:
        return baseBitrate;
    }
  }
  
  dispose(): void {
    this.previewEngine.dispose();
    this.recordedChunks = [];
    this.mediaRecorder = null;
  }
}
