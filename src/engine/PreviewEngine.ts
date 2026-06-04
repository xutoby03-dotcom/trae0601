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
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private activeAudioSources: Map<string, { source: AudioBufferSourceNode; gain: GainNode }> = new Map();
  private lastMixTime: number = 0;
  
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
        .filter((c) => c.trackId === track.id && !('text' in c))
        .sort((a, b) => a.start - b.start) as Clip[];
      
      for (let i = 0; i < trackClips.length; i++) {
        const clip = trackClips[i];
        
        if (time >= clip.start && time < clip.end) {
          const transition = clip.transition;
          const prevClip = i > 0 ? trackClips[i - 1] : null;
          
          let transitionProgress = -1;
          let isOutTransition = false;
          
          if (transition && prevClip) {
            const inEnd = clip.start + transition.duration;
            if (time < inEnd && time >= clip.start) {
              transitionProgress = (time - clip.start) / transition.duration;
              isOutTransition = false;
            }
          }
          
          if (transition && i < trackClips.length - 1) {
            const nextClip = trackClips[i + 1];
            if (nextClip.transition) {
              const outStart = clip.end - transition.duration;
              if (time >= outStart && time < clip.end) {
                transitionProgress = (time - outStart) / transition.duration;
                isOutTransition = true;
              }
            }
          }
          
          if (transitionProgress >= 0 && transitionProgress <= 1) {
            const fromClip = isOutTransition ? clip : prevClip!;
            const toClip = isOutTransition ? trackClips[i + 1] : clip;
            
            const fromCanvas = document.createElement('canvas');
            fromCanvas.width = this.options.width;
            fromCanvas.height = this.options.height;
            const fromCtx = fromCanvas.getContext('2d')!;
            
            const toCanvas = document.createElement('canvas');
            toCanvas.width = this.options.width;
            toCanvas.height = this.options.height;
            const toCtx = toCanvas.getContext('2d')!;
            
            const originalCtx = this.ctx;
            this.ctx = fromCtx;
            await this.renderClip(fromClip, isOutTransition ? time : fromClip.end - 0.01, mediaItems);
            
            this.ctx = toCtx;
            await this.renderClip(toClip, isOutTransition ? toClip.start + 0.01 : time, mediaItems);
            
            this.ctx = originalCtx;
            
            applyTransition(
              this.ctx,
              transition.type,
              fromCanvas,
              toCanvas,
              transitionProgress,
              this.options.width,
              this.options.height
            );
          } else {
            await this.renderClip(clip, time, mediaItems);
          }
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
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const audioTracks = tracks.filter((t) => t.type === 'audio' && !t.muted);
    const activeClipIds = new Set<string>();
    
    for (const track of audioTracks) {
      const trackClips = clips.filter((c) => c.trackId === track.id);
      
      for (const clip of trackClips) {
        if (time >= clip.start && time < clip.end && 'mediaItemId' in clip) {
          const mediaItem = mediaItems.find((m) => m.id === clip.mediaItemId);
          if (mediaItem?.type === 'audio') {
            activeClipIds.add(clip.id);
            this.playAudioClip(mediaItem.url, clip, time);
          }
        }
      }
    }
    
    for (const [clipId, { source }] of this.activeAudioSources) {
      if (!activeClipIds.has(clipId)) {
        try {
          source.stop();
        } catch (e) {}
        this.activeAudioSources.delete(clipId);
      }
    }
    
    this.lastMixTime = time;
  }
  
  private async getAudioBuffer(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const cached = this.audioBufferCache.get(url);
    if (cached) return cached;
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.audioBufferCache.set(url, audioBuffer);
    return audioBuffer;
  }
  
  private async playAudioClip(url: string, clip: Clip, currentTime: number): Promise<void> {
    if (!this.audioContext) return;
    
    const existing = this.activeAudioSources.get(clip.id);
    if (existing) {
      const currentGain = clip.volume ?? 1;
      existing.gain.gain.setValueAtTime(currentGain, this.audioContext.currentTime);
      
      if (clip.volumeKeyframes && clip.volumeKeyframes.length > 0) {
        const keyframes = [...clip.volumeKeyframes].sort((a, b) => a.time - b.time);
        const clipDuration = clip.end - clip.start;
        
        for (const kf of keyframes) {
          if (kf.time > 0 && kf.time < clipDuration) {
            const scheduleTime = this.audioContext.currentTime + (kf.time - (currentTime - clip.start));
            if (scheduleTime > this.audioContext.currentTime) {
              existing.gain.gain.linearRampToValueAtTime(kf.value, scheduleTime);
            }
          }
        }
      }
      return;
    }
    
    try {
      const audioBuffer = await this.getAudioBuffer(url);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = clip.speed;
      
      const gainNode = this.audioContext.createGain();
      
      const clipDuration = clip.end - clip.start;
      const timeInClip = currentTime - clip.start;
      const mediaStartTime = clip.reverse 
        ? clip.offset + clipDuration - timeInClip * clip.speed
        : clip.offset + timeInClip * clip.speed;
      
      const initialGain = clip.volume ?? 1;
      gainNode.gain.setValueAtTime(initialGain, this.audioContext.currentTime);
      
      if (clip.volumeKeyframes && clip.volumeKeyframes.length > 0) {
        const keyframes = [...clip.volumeKeyframes].sort((a, b) => a.time - b.time);
        
        for (const kf of keyframes) {
          if (kf.time > timeInClip && kf.time < clipDuration) {
            const scheduleTime = this.audioContext.currentTime + (kf.time - timeInClip);
            gainNode.gain.linearRampToValueAtTime(kf.value, scheduleTime);
          }
        }
      }
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      if (clip.reverse) {
        const reverseStartTime = clip.offset + clipDuration - mediaStartTime;
        source.start(0, reverseStartTime, clipDuration - timeInClip);
      } else {
        source.start(0, mediaStartTime, clipDuration - timeInClip);
      }
      
      source.onended = () => {
        this.activeAudioSources.delete(clip.id);
      };
      
      this.activeAudioSources.set(clip.id, { source, gain: gainNode });
    } catch (error) {
      console.error('Audio playback error:', error);
    }
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
    
    for (const { source } of this.activeAudioSources.values()) {
      try {
        source.stop();
      } catch (e) {}
    }
    this.activeAudioSources.clear();
    this.audioBufferCache.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
