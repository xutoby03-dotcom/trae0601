export interface Player {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female' | 'other';
  preferredGenres: string[];
  triggers: string[];
  emotionTolerance: number;
  horrorTolerance: number;
  willingToCrossdress: boolean;
  historicalOk: boolean;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'other';
  tags: string[];
  isEdge: boolean;
  isRomanceLead: boolean;
  isHorrorFocus: boolean;
  genre: string;
}

export interface Script {
  id: string;
  title: string;
  playerCount: number;
  duration: number;
  store: string;
  price: number;
  characters: Character[];
  genre: string;
  cover?: string;
}

export interface Assignment {
  playerId: string;
  characterId: string;
}

export interface GameSession {
  id: string;
  scriptId: string;
  playerIds: string[];
  assignments: Assignment[];
  status: 'planning' | 'playing' | 'finished';
  createdAt: number;
}

export interface Rating {
  id: string;
  sessionId: string;
  playerId: string;
  characterId: string;
  characterScore: number;
  scriptScore: number;
  comment: string;
}

export interface Conflict {
  type: 'romance' | 'horror' | 'edge' | 'trigger' | 'crossdress' | 'gender' | 'historical';
  severity: 'warning' | 'danger';
  playerId: string;
  characterId: string;
  message: string;
}

export const GENRES = [
  '推理', '情感', '恐怖', '欢乐', '机制',
  '阵营', '还原', '硬核', '古风', '现代',
  '科幻', '谍战', '校园', '都市', '历史'
];

export const TRIGGERS = [
  '虐心', '悲剧', '背叛', '死亡', '血腥',
  '灵异', 'jump scare', '单人任务', '封闭空间', '追逐',
  '失忆', '人格分裂', '伦理', '出轨', '霸凌',
  '抑郁', '自杀', '性侵', '家暴', '宗教'
];

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
