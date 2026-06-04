import { create } from 'zustand';
import type { Track, Clip, SubtitleClip, TransitionType, FilterType, VolumeKeyframe } from '@/types/timeline';
import type { MediaItem } from '@/types/media';
import { generateId, snapToFrame } from '@/utils/timecode';
import * as db from '@/utils/indexedDB';
import { parseSRT } from '@/utils/srtParser';
import { useProjectStore } from './useProjectStore';

interface TimelineState {
  tracks: Track[];
  clips: (Clip | SubtitleClip)[];
  mediaItems: MediaItem[];
  selectedClipId: string | null;
  zoom: number;
  scrollLeft: number;
  
  setTracks: (tracks: Track[]) => void;
  setClips: (clips: (Clip | SubtitleClip)[]) => void;
  setMediaItems: (mediaItems: MediaItem[]) => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  removeMediaItem: (mediaItemId: string) => void;
  createDefaultTracks: (projectId: string) => void;
  addClip: (clip: Clip | SubtitleClip) => void;
  createClipFromMedia: (mediaItemId: string, trackId: string, startTime: number) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip | SubtitleClip>) => void;
  moveClip: (clipId: string, newStart: number, newTrackId?: string) => void;
  trimClip: (clipId: string, startDelta: number, endDelta: number) => void;
  duplicateClip: (clipId: string) => void;
  selectClip: (clipId: string | null) => void;
  setZoom: (zoom: number) => void;
  setScrollLeft: (scrollLeft: number) => void;
  loadProjectData: (projectId: string) => Promise<void>;
  saveProjectData: (projectId: string) => Promise<void>;
  
  setClipTransform: (clipId: string, transform: Partial<Clip['transform']>) => void;
  setClipOpacity: (clipId: string, opacity: number) => void;
  setClipSpeed: (clipId: string, speed: number) => void;
  setClipReverse: (clipId: string, reverse: boolean) => void;
  setClipColor: (clipId: string, color: Partial<Clip['color']>) => void;
  setClipFilter: (clipId: string, filter: FilterType) => void;
  setClipTransition: (clipId: string, transition: { type: TransitionType; duration: number } | undefined) => void;
  setClipVolume: (clipId: string, volume: number) => void;
  setVolumeKeyframes: (clipId: string, keyframes: VolumeKeyframe[]) => void;
  addVolumeKeyframe: (clipId: string, time: number, value: number) => void;
  removeVolumeKeyframe: (clipId: string, index: number) => void;
  
  addSubtitleClip: (trackId: string, startTime: number, endTime: number, text: string) => void;
  updateSubtitleStyle: (clipId: string, style: Partial<SubtitleClip['style']>) => void;
  updateSubtitleText: (clipId: string, text: string) => void;
  importSRT: (trackId: string, content: string) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  tracks: [],
  clips: [],
  mediaItems: [],
  selectedClipId: null,
  zoom: 50,
  scrollLeft: 0,
  
  setTracks: (tracks) => set({ tracks }),
  setClips: (clips) => set({ clips }),
  setMediaItems: (mediaItems) => set({ mediaItems }),
  
  addMediaItem: (mediaItem) => {
    set((state) => ({ mediaItems: [...state.mediaItems, mediaItem] }));
  },
  
  removeMediaItem: (mediaItemId) => {
    set((state) => ({
      mediaItems: state.mediaItems.filter((m) => m.id !== mediaItemId),
    }));
  },
  
  createDefaultTracks: (projectId) => {
    const defaultTracks: Track[] = [
      { id: generateId(), projectId, type: 'video', index: 0, name: 'Video 1', muted: false, locked: false },
      { id: generateId(), projectId, type: 'video', index: 1, name: 'Video 2', muted: false, locked: false },
      { id: generateId(), projectId, type: 'video', index: 2, name: 'Video 3', muted: false, locked: false },
      { id: generateId(), projectId, type: 'audio', index: 0, name: 'Audio 1', muted: false, locked: false },
      { id: generateId(), projectId, type: 'audio', index: 1, name: 'Audio 2', muted: false, locked: false },
      { id: generateId(), projectId, type: 'audio', index: 2, name: 'Audio 3', muted: false, locked: false },
      { id: generateId(), projectId, type: 'subtitle', index: 0, name: 'Subtitles', muted: false, locked: false },
    ];
    set({ tracks: defaultTracks });
  },
  
  addClip: (clip) => {
    set((state) => ({ clips: [...state.clips, clip] }));
  },
  
  createClipFromMedia: (mediaItemId, trackId, startTime) => {
    const mediaItem = get().mediaItems.find((m) => m.id === mediaItemId);
    if (!mediaItem) return;
    
    const clip: Clip = {
      id: generateId(),
      trackId,
      mediaItemId,
      start: snapToFrame(startTime),
      end: snapToFrame(startTime + mediaItem.duration),
      offset: 0,
      transform: { scale: 1, rotation: 0, positionX: 0, positionY: 0 },
      opacity: 1,
      speed: 1,
      reverse: false,
      color: { brightness: 0, contrast: 0, saturation: 0 },
      filter: 'none',
      volume: 1,
      volumeKeyframes: [],
    };
    
    set((state) => ({ clips: [...state.clips, clip] }));
  },
  
  removeClip: (clipId) => {
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== clipId),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    }));
  },
  
  updateClip: (clipId, updates) => {
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId ? { ...c, ...updates } : c
      ),
    }));
  },
  
  moveClip: (clipId, newStart, newTrackId) => {
    set((state) => ({
      clips: state.clips.map((c) => {
        if (c.id !== clipId) return c;
        const duration = c.end - c.start;
        return {
          ...c,
          start: snapToFrame(newStart),
          end: snapToFrame(newStart + duration),
          trackId: newTrackId || c.trackId,
        };
      }),
    }));
  },
  
  trimClip: (clipId, startDelta, endDelta) => {
    set((state) => ({
      clips: state.clips.map((c) => {
        if (c.id !== clipId) return c;
        const newStart = Math.max(0, c.start + startDelta);
        const newEnd = Math.max(newStart + 0.1, c.end + endDelta);
        return { ...c, start: snapToFrame(newStart), end: snapToFrame(newEnd) };
      }),
    }));
  },
  
  duplicateClip: (clipId) => {
    const clip = get().clips.find((c) => c.id === clipId);
    if (!clip) return;
    
    const duration = clip.end - clip.start;
    const newClip: Clip | SubtitleClip = {
      ...clip,
      id: generateId(),
      start: snapToFrame(clip.end + 0.5),
      end: snapToFrame(clip.end + 0.5 + duration),
    };
    
    set((state) => ({ clips: [...state.clips, newClip] }));
  },
  
  selectClip: (clipId) => set({ selectedClipId: clipId }),
  
  setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(200, zoom)) }),
  
  setScrollLeft: (scrollLeft) => set({ scrollLeft: Math.max(0, scrollLeft) }),
  
  loadProjectData: async (projectId) => {
    const data = await db.loadProjectData(projectId);
    if (data) {
      set({
        tracks: data.tracks,
        clips: data.clips,
        mediaItems: data.mediaItems,
      });
    }
  },
  
  saveProjectData: async (projectId) => {
    const state = get();
    const project = await db.getProject(projectId);
    const currentProject = useProjectStore.getState().currentProject;
    
    if (project) {
      const projectToSave = {
        ...project,
        thumbnail: currentProject?.thumbnail ?? project.thumbnail,
      };
      
      await db.saveAllProjectData({
        project: projectToSave,
        mediaItems: state.mediaItems,
        tracks: state.tracks,
        clips: state.clips,
      });
      
      if (currentProject) {
        useProjectStore.getState().updateProject({ thumbnail: projectToSave.thumbnail });
      }
    }
  },
  
  setClipTransform: (clipId, transform) => {
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId
          ? { ...c, transform: { ...c.transform, ...transform } }
          : c
      ),
    }));
  },
  
  setClipOpacity: (clipId, opacity) => {
    get().updateClip(clipId, { opacity: Math.max(0, Math.min(1, opacity)) });
  },
  
  setClipSpeed: (clipId, speed) => {
    get().updateClip(clipId, { speed: Math.max(0.25, Math.min(4, speed)) });
  },
  
  setClipReverse: (clipId, reverse) => {
    get().updateClip(clipId, { reverse });
  },
  
  setClipColor: (clipId, color) => {
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId ? { ...c, color: { ...c.color, ...color } } : c
      ),
    }));
  },
  
  setClipFilter: (clipId, filter) => {
    get().updateClip(clipId, { filter });
  },
  
  setClipTransition: (clipId, transition) => {
    get().updateClip(clipId, { transition });
  },
  
  setClipVolume: (clipId, volume) => {
    get().updateClip(clipId, { volume: Math.max(0, Math.min(2, volume)) });
  },
  
  setVolumeKeyframes: (clipId, keyframes) => {
    get().updateClip(clipId, { volumeKeyframes: keyframes });
  },
  
  addVolumeKeyframe: (clipId, time, value) => {
    set((state) => ({
      clips: state.clips.map((c) => {
        if (c.id !== clipId) return c;
        const existing = (c.volumeKeyframes || []).filter((kf) => Math.abs(kf.time - time) > 0.01);
        const keyframes = [...existing, { time, value }].sort((a, b) => a.time - b.time);
        return { ...c, volumeKeyframes: keyframes };
      }),
    }));
  },
  
  removeVolumeKeyframe: (clipId, index) => {
    set((state) => ({
      clips: state.clips.map((c) => {
        if (c.id !== clipId) return c;
        const keyframes = (c.volumeKeyframes || []).filter((_, i) => i !== index);
        return { ...c, volumeKeyframes: keyframes };
      }),
    }));
  },
  
  addSubtitleClip: (trackId, startTime, endTime, text) => {
    const clip: SubtitleClip = {
      id: generateId(),
      trackId,
      start: snapToFrame(startTime),
      end: snapToFrame(endTime),
      offset: 0,
      transform: { scale: 1, rotation: 0, positionX: 0, positionY: 0 },
      opacity: 1,
      speed: 1,
      reverse: false,
      color: { brightness: 0, contrast: 0, saturation: 0 },
      filter: 'none',
      text,
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        shadow: true,
      },
    };
    
    set((state) => ({ clips: [...state.clips, clip] }));
  },
  
  updateSubtitleStyle: (clipId, style) => {
    set((state) => ({
      clips: state.clips.map((c) => {
        if (c.id !== clipId || !('style' in c)) return c;
        return { ...c, style: { ...c.style, ...style } } as SubtitleClip;
      }),
    }));
  },
  
  updateSubtitleText: (clipId, text) => {
    set((state) => ({
      clips: state.clips.map((c) => {
        if (c.id !== clipId || !('text' in c)) return c;
        return { ...c, text } as SubtitleClip;
      }),
    }));
  },
  
  importSRT: (trackId, content) => {
    const subtitles = parseSRT(content);
    const newClips: SubtitleClip[] = subtitles.map((sub) => ({
      id: generateId(),
      trackId,
      start: snapToFrame(sub.startTime),
      end: snapToFrame(sub.endTime),
      offset: 0,
      transform: { scale: 1, rotation: 0, positionX: 0, positionY: 0 },
      opacity: 1,
      speed: 1,
      reverse: false,
      color: { brightness: 0, contrast: 0, saturation: 0 },
      filter: 'none',
      text: sub.text,
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        shadow: true,
      },
    }));
    
    set((state) => ({ clips: [...state.clips, ...newClips] }));
  },
}));
