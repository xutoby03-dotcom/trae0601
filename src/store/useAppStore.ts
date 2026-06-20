import { create } from 'zustand';
import type { Song, Tag, Section, Member, TagType, TagStatus, SectionType } from '@/types';
import { DEFAULT_MEMBERS, SECTION_TYPE_LABELS } from '@/types';
import { generateId, generateMockWaveform } from '@/utils';
import {
  loadSongs,
  saveSongs,
  loadTags,
  saveTags,
  loadSections,
  saveSections,
  loadMembers,
  saveMembers,
} from '@/utils/storage';

interface AppState {
  songs: Song[];
  tags: Tag[];
  sections: Section[];
  members: Member[];
  currentSongId: string | null;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  zoom: number;
  scrollLeft: number;
  selectedTagId: string | null;
  filterStatus: TagStatus | 'all';
  filterType: TagType | 'all';
  filterAssignee: string;

  initData: () => void;
  setCurrentSongId: (id: string | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setZoom: (zoom: number) => void;
  setScrollLeft: (scroll: number) => void;
  setSelectedTagId: (id: string | null) => void;
  setFilterStatus: (status: TagStatus | 'all') => void;
  setFilterType: (type: TagType | 'all') => void;
  setFilterAssignee: (assignee: string) => void;

  addSong: (name: string, audioUrl: string, duration: number, waveformData: number[]) => Song;
  deleteSong: (id: string) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;

  addTag: (songId: string, time: number, type: TagType, description?: string) => Tag;
  deleteTag: (id: string) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  setTagStatus: (id: string, status: TagStatus) => void;
  setTagAssignee: (id: string, assignee: string) => void;

  addSection: (songId: string, type: SectionType, startTime: number, endTime: number) => Section;
  deleteSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;

  getCurrentSong: () => Song | undefined;
  getCurrentTags: () => Tag[];
  getCurrentSections: () => Section[];
  getFilteredTags: () => Tag[];
  getUnresolvedCount: (songId: string) => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  songs: [],
  tags: [],
  sections: [],
  members: [],
  currentSongId: null,
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1,
  zoom: 1,
  scrollLeft: 0,
  selectedTagId: null,
  filterStatus: 'all',
  filterType: 'all',
  filterAssignee: 'all',

  initData: () => {
    const songs = loadSongs();
    const tags = loadTags();
    const sections = loadSections();
    let members = loadMembers();

    if (members.length === 0) {
      members = DEFAULT_MEMBERS;
      saveMembers(members);
    }

    if (songs.length === 0) {
      const mockWaveform = generateMockWaveform(1200, 123);
      const demoSong: Song = {
        id: generateId(),
        name: '示例歌曲 - 夏日回忆',
        duration: 240,
        waveformData: mockWaveform,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const demoSections: Section[] = [
        { id: generateId(), songId: demoSong.id, name: '前奏', type: 'intro', startTime: 0, endTime: 25, color: '#3b82f6' },
        { id: generateId(), songId: demoSong.id, name: '主歌1', type: 'verse', startTime: 25, endTime: 65, color: '#22c55e' },
        { id: generateId(), songId: demoSong.id, name: '预副歌', type: 'other', startTime: 65, endTime: 85, color: '#9ca3af' },
        { id: generateId(), songId: demoSong.id, name: '副歌1', type: 'chorus', startTime: 85, endTime: 125, color: '#f97316' },
        { id: generateId(), songId: demoSong.id, name: '主歌2', type: 'verse', startTime: 125, endTime: 165, color: '#22c55e' },
        { id: generateId(), songId: demoSong.id, name: '副歌2', type: 'chorus', startTime: 165, endTime: 205, color: '#f97316' },
        { id: generateId(), songId: demoSong.id, name: 'Bridge', type: 'bridge', startTime: 205, endTime: 225, color: '#8b5cf6' },
        { id: generateId(), songId: demoSong.id, name: '尾奏', type: 'outro', startTime: 225, endTime: 240, color: '#6b7280' },
      ];
      const demoTags: Tag[] = [
        { id: generateId(), songId: demoSong.id, time: 32.5, type: 'rhythm', description: '鼓进早了半拍', assignee: 'm4', status: 'pending', createdAt: new Date().toISOString() },
        { id: generateId(), songId: demoSong.id, time: 48.2, type: 'pitch', description: '贝斯slightly走音', assignee: 'm3', status: 'pending', createdAt: new Date().toISOString() },
        { id: generateId(), songId: demoSong.id, time: 95.8, type: 'harmony', description: '和声没进齐，差一点点', assignee: 'm1', status: 'reviewing', createdAt: new Date().toISOString() },
        { id: generateId(), songId: demoSong.id, time: 112.3, type: 'solo', description: '这段solo感觉不错，可以保留', assignee: 'm2', status: 'resolved', createdAt: new Date().toISOString() },
        { id: generateId(), songId: demoSong.id, time: 178.6, type: 'rhythm', description: '副歌抢拍了', assignee: 'm4', status: 'pending', createdAt: new Date().toISOString() },
        { id: generateId(), songId: demoSong.id, time: 215.0, type: 'pitch', description: 'Bridge部分主唱高音不稳', assignee: 'm1', status: 'pending', createdAt: new Date().toISOString() },
      ];

      saveSongs([demoSong]);
      saveSections(demoSections);
      saveTags(demoTags);

      set({ songs: [demoSong], tags: demoTags, sections: demoSections, members });
    } else {
      set({ songs, tags, sections, members });
    }
  },

  setCurrentSongId: (id) => set({ currentSongId: id, currentTime: 0, isPlaying: false, selectedTagId: null }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(5, zoom)) }),
  setScrollLeft: (scrollLeft) => set({ scrollLeft: Math.max(0, scrollLeft) }),
  setSelectedTagId: (id) => set({ selectedTagId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterType: (type) => set({ filterType: type }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),

  addSong: (name, audioUrl, duration, waveformData) => {
    const song: Song = {
      id: generateId(),
      name,
      duration,
      audioUrl,
      waveformData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const songs = [...get().songs, song];
    saveSongs(songs);

    const defaultSections: Array<{ type: SectionType; name: string; ratio: [number, number]; color: string }> = [
      { type: 'intro', name: '前奏', ratio: [0, 0.1], color: '#3b82f6' },
      { type: 'verse', name: '主歌1', ratio: [0.1, 0.3], color: '#22c55e' },
      { type: 'chorus', name: '副歌1', ratio: [0.3, 0.48], color: '#f97316' },
      { type: 'verse', name: '主歌2', ratio: [0.48, 0.65], color: '#22c55e' },
      { type: 'chorus', name: '副歌2', ratio: [0.65, 0.82], color: '#f97316' },
      { type: 'bridge', name: 'Bridge', ratio: [0.82, 0.92], color: '#8b5cf6' },
      { type: 'outro', name: '尾奏', ratio: [0.92, 1], color: '#6b7280' },
    ];

    const newSections: Section[] = defaultSections.map((s) => ({
      id: generateId(),
      songId: song.id,
      name: s.name,
      type: s.type,
      startTime: duration * s.ratio[0],
      endTime: duration * s.ratio[1],
      color: s.color,
    }));

    const sections = [...get().sections, ...newSections];
    saveSections(sections);

    set({ songs, sections });
    return song;
  },

  deleteSong: (id) => {
    const songs = get().songs.filter((s) => s.id !== id);
    const tags = get().tags.filter((t) => t.songId !== id);
    const sections = get().sections.filter((s) => s.songId !== id);
    saveSongs(songs);
    saveTags(tags);
    saveSections(sections);
    set({ songs, tags, sections });
  },

  updateSong: (id, updates) => {
    const songs = get().songs.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    saveSongs(songs);
    set({ songs });
  },

  addTag: (songId, time, type, description = '') => {
    const sections = get().sections.filter((s) => s.songId === songId);
    const section = sections.find((s) => time >= s.startTime && time <= s.endTime);

    const tag: Tag = {
      id: generateId(),
      songId,
      time,
      type,
      description,
      assignee: 'all',
      status: 'pending',
      sectionId: section?.id,
      createdAt: new Date().toISOString(),
    };
    const tags = [...get().tags, tag];
    saveTags(tags);
    set({ tags, selectedTagId: tag.id });
    return tag;
  },

  deleteTag: (id) => {
    const tags = get().tags.filter((t) => t.id !== id);
    saveTags(tags);
    set({ tags });
  },

  updateTag: (id, updates) => {
    const tags = get().tags.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveTags(tags);
    set({ tags });
  },

  setTagStatus: (id, status) => {
    const tags = get().tags.map((t) => (t.id === id ? { ...t, status } : t));
    saveTags(tags);
    set({ tags });
  },

  setTagAssignee: (id, assignee) => {
    const tags = get().tags.map((t) => (t.id === id ? { ...t, assignee } : t));
    saveTags(tags);
    set({ tags });
  },

  addSection: (songId, type, startTime, endTime) => {
    const section: Section = {
      id: generateId(),
      songId,
      name: '',
      type,
      startTime,
      endTime,
      color: '#6b7280',
    };
    const sections = [...get().sections, section];
    saveSections(sections);
    set({ sections });
    return section;
  },

  deleteSection: (id) => {
    const sections = get().sections.filter((s) => s.id !== id);
    saveSections(sections);
    set({ sections });
  },

  updateSection: (id, updates) => {
    const sections = get().sections.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveSections(sections);
    set({ sections });
  },

  getCurrentSong: () => {
    const { songs, currentSongId } = get();
    return songs.find((s) => s.id === currentSongId);
  },

  getCurrentTags: () => {
    const { tags, currentSongId } = get();
    return tags.filter((t) => t.songId === currentSongId).sort((a, b) => a.time - b.time);
  },

  getCurrentSections: () => {
    const { sections, currentSongId } = get();
    return sections.filter((s) => s.songId === currentSongId).sort((a, b) => a.startTime - b.startTime);
  },

  getFilteredTags: () => {
    const { getCurrentTags, filterStatus, filterType, filterAssignee } = get();
    let tags = getCurrentTags();
    if (filterStatus !== 'all') {
      tags = tags.filter((t) => t.status === filterStatus);
    }
    if (filterType !== 'all') {
      tags = tags.filter((t) => t.type === filterType);
    }
    if (filterAssignee !== 'all') {
      tags = tags.filter((t) => t.assignee === filterAssignee);
    }
    return tags;
  },

  getUnresolvedCount: (songId) => {
    const { tags } = get();
    return tags.filter((t) => t.songId === songId && t.status !== 'resolved').length;
  },
}));
