export type TagType = 'pitch' | 'rhythm' | 'harmony' | 'solo';

export type TagStatus = 'pending' | 'resolved' | 'reviewing';

export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'other';

export type MemberRole = 'vocal' | 'guitar' | 'bass' | 'drums' | 'keys' | 'other';

export interface Song {
  id: string;
  name: string;
  duration: number;
  audioUrl?: string;
  waveformData: number[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  songId: string;
  name: string;
  type: SectionType;
  startTime: number;
  endTime: number;
  color: string;
}

export interface Tag {
  id: string;
  songId: string;
  time: number;
  type: TagType;
  description: string;
  assignee: string;
  status: TagStatus;
  sectionId?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  color: string;
}

export const TAG_TYPE_LABELS: Record<TagType, string> = {
  pitch: '走音',
  rhythm: '节奏抢拍',
  harmony: '和声没进',
  solo: 'solo可保留',
};

export const TAG_TYPE_COLORS: Record<TagType, string> = {
  pitch: '#ef4444',
  rhythm: '#f97316',
  harmony: '#8b5cf6',
  solo: '#22c55e',
};

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  intro: '前奏',
  verse: '主歌',
  chorus: '副歌',
  bridge: 'Bridge',
  outro: '尾奏',
  other: '其他',
};

export const SECTION_TYPE_COLORS: Record<SectionType, string> = {
  intro: 'rgba(59, 130, 246, 0.25)',
  verse: 'rgba(34, 197, 94, 0.25)',
  chorus: 'rgba(249, 115, 22, 0.25)',
  bridge: 'rgba(139, 92, 246, 0.25)',
  outro: 'rgba(107, 114, 128, 0.25)',
  other: 'rgba(156, 163, 175, 0.2)',
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  vocal: '主唱',
  guitar: '吉他',
  bass: '贝斯',
  drums: '鼓',
  keys: '键盘',
  other: '其他',
};

export const TAG_STATUS_LABELS: Record<TagStatus, string> = {
  pending: '未解决',
  reviewing: '待验证',
  resolved: '已解决',
};

export const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: '主唱', role: 'vocal', color: '#f472b6' },
  { id: 'm2', name: '吉他手', role: 'guitar', color: '#f97316' },
  { id: 'm3', name: '贝斯手', role: 'bass', color: '#22c55e' },
  { id: 'm4', name: '鼓手', role: 'drums', color: '#3b82f6' },
  { id: 'm5', name: '键盘手', role: 'keys', color: '#8b5cf6' },
];
