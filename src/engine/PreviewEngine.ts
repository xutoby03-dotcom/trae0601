import type { Clip, SubtitleClip, Track } from '@/types/timeline';
import type { MediaItem } from '@/types/media';
import { applyFilter, applyColorCorrection } from './FilterRenderer';
import { applyTransition } from './TransitionRenderer';

interface PreviewEngineOptions {
  width: number;
  height: number;
  fps: number;
}

interface VideoElementCache {
  element: HTMLVideoElement;
  lastSeekTime: number;
}

export class PreviewEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: PreviewEngineOptions;
  private videoCache: Map<string, VideoElementCache> = new Map();
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private audioContext: AudioContext | null = null;
  private gainNodes: Map<string, GainNode> = new Map();
  
  constructor(canvas: HTMLCanvasElement, options: PreviewEngineOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = options;
    
    canvas.width = options.width;
    canvas.height = options.height;
  }
  
  async composeFrame(
    time: number,
    tracks: Track[],
    clips: (Clip | SubtitleClip)[],
    mediaItems: MediaItem[]
  ): Promise<void> {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);
    
    const videoTracks = tracks.filter((t) => t.type === 'video' && !t.muted);
    const sortedVideoTracks = videoTracks.sort((a, b) => a.index - b.index);
    
    for (const track of sortedVideoTracks) {
      const trackClips = clips
        .filter((c) => c.trackId === track.id)
        .sort((a, b) => a.start - b.start);
      
      for (const clip of trackClips) {
        if (time >= clip.start && time < clip.end) {
          await this.renderClip(clip, time, mediaItems);
        }
      }
    }
    
    const subtitleTracks = tracks.filter((t) => t.type === 'subtitle' && !t.muted);
    for (const track of subtitleTracks) {
      const subtitleClips = clips.filter(
        (c) => c.trackId === track.id && 'text' in c
      ) as SubtitleClip[];
      
      for (const clip of subtitleClips) {
        if (time >= clip.start && time < clip.end) {
          this.renderSubtitle(clip);
        }
      }
    }
  }
  
  private async renderClip(
    clip: Clip | SubtitleClip,
    time: number,
    mediaItems: MediaItem[]
  ): Promise<void> {
    if ('text' in clip) return;
    
    const mediaItem = mediaItems.find((m) => m.id === clip.mediaItemId);
    if (!mediaItem) return;
    
    const clipDuration = clip.end - clip.start;
    const timeInClip = time - clip.start;
    const mediaTime = clip.reverse
      ? clip.offset + clipDuration - timeInClip * clip.speed
      : clip.offset + timeInClip * clip.speed;
    
    if (mediaItem.type === 'video') {
      const videoElement = await this.getVideoElement(mediaItem.url);
      await this.seekVideo(videoElement, mediaTime);
      
      this.ctx.save();
      this.applyTransform(clip);
      this.ctx.globalAlpha = clip.opacity;
      
      const drawWidth = this.options.width * clip.transform.scale;
      const drawHeight = this.options.height * clip.transform.scale;
      const x = (this.options.width - drawWidth) / 2 + clip.transform.positionX;
      const y = (this.options.height - drawHeight) / 2 + clip.transform.positionY;
      
      this.ctx.drawImage(videoElement, x, y, drawWidth, drawHeight);
      
      applyColorCorrection(this.ctx, clip.color, this.options.width, this.options.height);
      applyFilter(this.ctx, clip.filter, this.options.width, this.options.height);
      
      this.ctx.restore();
    } else if (mediaItem.type === 'image') {
      const imageElement = await this.getImageElement(mediaItem.url);
      
      this.ctx.save();
      this.applyTransform(clip);
      this.ctx.globalAlpha = clip.opacity;
      
      const drawWidth = this.options.width * clip.transform.scale;
      const drawHeight = this.options.height * clip.transform.scale;
      const x = (this.options.width - drawWidth) / 2 + clip.transform.positionX;
      const y = (this.options.height - drawHeight) / 2 + clip.transform.positionY;
      
      this.ctx.drawImage(imageElement, x, y, drawWidth, drawHeight);
      
      applyColorCorrection(this.ctx, clip.color, this.options.width, this.options.height);
      applyFilter(this.ctx, clip.filter, this.options.width, this.options.height);
      
      this.ctx.restore();
    }
  }
  
  private applyTransform(clip: Clip): void {
    const centerX = this.options.width / 2;
    const centerY = this.options.height / 2;
    
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate((clip.transform.rotation * Math.PI) / 180);
    this.ctx.translate(-centerX, -centerY);
  }
  
  private renderSubtitle(clip: SubtitleClip): void {
    this.ctx.save();
    
    const style = clip.style;
    this.ctx.font = `${style.fontSize}px ${style.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    
    const x = this.options.width / 2 + clip.transform.positionX;
    const y = this.options.height - 60 + clip.transform.positionY;
    
    if (style.shadow) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    }
    
    if (style.strokeColor && style.strokeWidth) {
      this.ctx.strokeStyle = style.strokeColor;
      this.ctx.lineWidth = style.strokeWidth;
      this.ctx.lineJoin = 'round';
      this.ctx.strokeText(clip.text, x, y);
    }
    
    this.ctx.fillStyle = style.color;
    this.ctx.globalAlpha = clip.opacity;
    this.ctx.fillText(clip.text, x, y);
    
    this.ctx.restore();
  }
  
  private async getVideoElement(url: string): Promise<HTMLVideoElement> {
    const cached = this.videoCache.get(url);
    if (cached) return cached.element;
    
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.muted = true;
    
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });
    
    this.videoCache.set(url, { element: video, lastSeekTime: 0 });
    return video;
  }
  
  private async seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
    const cached = this.videoCache.get(video.src);
    if (cached && Math.abs(cached.lastSeekTime - time) < 0.03) {
      return;
    }
    
    return new Promise((resolve) => {
      video.currentTime = time;
      video.onseeked = () => {
        if (cached) {
          cached.lastSeekTime = time;
        }
        resolve();
      };
    });
  }
  
  private async getImageElement(url: string): Promise<HTMLImageElement> {
    const cached = this.imageCache.get(url);
    if (cached) return cached;
    
    const image = new Image();
    image.src = url;
    image.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    
    this.imageCache.set(url, image);
    return image;
  }
  
  mixAudio(
    time: number,
    tracks: Track[],
    clips: Clip[],
    mediaItems: MediaItem[]
  ): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    const audioTracks = tracks.filter((t) => t.type === 'audio' && !t.muted);
    
    for (const track of audioTracks) {
      const trackClips = clips.filter((c) => c.trackId === track.id);
      
      for (const clip of trackClips) {
        if (time >= clip.start && time < clip.end && 'mediaItemId' in clip) {
          const mediaItem = mediaItems.find((m) => m.id === clip.mediaItemId);
          if (mediaItem?.type === 'audio') {
            this.playAudioClip(mediaItem.url, clip);
          }
        }
      }
    }
  }
  
  private async playAudioClip(url: string, clip: Clip): Promise<void> {
    if (!this.audioContext) return;
    
    const gainNode = this.gainNodes.get(url) || this.audioContext.createGain();
    gainNode.gain.value = (clip.volume || 1);
    gainNode.connect(this.audioContext.destination);
    this.gainNodes.set(url, gainNode);
  }
  
  getCanvasStream(fps: number = 30): MediaStream {
    return this.canvas.captureStream(fps);
  }
  
  dispose(): void {
    for (const cached of this.videoCache.values()) {
      cached.element.pause();
      cached.element.src = '';
    }
    this.videoCache.clear();
    this.imageCache.clear();
    
    for (const gainNode of this.gainNodes.values()) {
      gainNode.disconnect();
    }
    this.gainNodes.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
