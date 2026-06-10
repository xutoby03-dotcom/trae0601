export type ThemeType = 'horror' | 'mystery' | 'mechanism';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type HorrorLevel = 'none' | 'mild' | 'medium' | 'high' | 'extreme';
export type Skill = 'puzzle' | 'search' | 'both';
export type TeamStatus = 'recruiting' | 'locked' | 'completed';

export interface Member {
  id: string;
  name: string;
  acceptHorror: boolean;
  motionSickness: boolean;
  skill: Skill;
  budgetLimit: number;
  joinedAt: string;
}

export interface Review {
  id: string;
  teamId: string;
  rating: number;
  bestPuzzleSolver: string;
  hiddenCost: boolean;
  hiddenCostAmount?: number;
  notes: string;
  createdAt: string;
}

export interface Team {
  id: string;
  shopName: string;
  themeName: string;
  themeType: ThemeType;
  totalPeople: number;
  price: number;
  duration: number;
  difficulty: Difficulty;
  horrorLevel: HorrorLevel;
  availableTimes: string[];
  status: TeamStatus;
  members: Member[];
  review?: Review;
  createdAt: string;
}

export interface CreateTeamForm {
  shopName: string;
  themeName: string;
  themeType: ThemeType;
  totalPeople: number;
  price: number;
  duration: number;
  difficulty: Difficulty;
  horrorLevel: HorrorLevel;
  availableTimes: string[];
}

export interface JoinTeamForm {
  name: string;
  acceptHorror: boolean;
  motionSickness: boolean;
  skill: Skill;
  budgetLimit: number;
}

export const THEME_TYPE_LABELS: Record<ThemeType, string> = {
  horror: '👻 恐怖本',
  mystery: '🔍 推理本',
  mechanism: '⚙️ 机关本',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '⭐ 简单',
  medium: '⭐⭐ 中等',
  hard: '⭐⭐⭐ 困难',
  expert: '⭐⭐⭐⭐ 地狱',
};

export const HORROR_LEVEL_LABELS: Record<HorrorLevel, string> = {
  none: '🛡️ 无恐',
  mild: '😨 微恐',
  medium: '😱 中恐',
  high: '👹 重恐',
  extreme: '💀 极恐',
};

export const SKILL_LABELS: Record<Skill, string> = {
  puzzle: '🧩 擅长解谜',
  search: '🔎 擅长搜证',
  both: '🧩🔎 全能选手',
};

export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  recruiting: '招募中',
  locked: '已锁团',
  completed: '已完成',
};
