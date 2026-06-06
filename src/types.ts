export type Difficulty = 'easy' | 'medium' | 'hard';

export type ThemeMode = 'light' | 'dark';
export type Skin = 'wood' | 'metal';

export interface Position {
  row: number;
  col: number;
}

export interface BlockShape {
  id: string;
  name: string;
  matrix: number[][];
}

export interface GameState {
  grid: number[][];
  currentBlocks: BlockShape[];
  selectedBlockIndex: number | null;
  score: number;
  combo: number;
  gameOver: boolean;
  difficulty: Difficulty;
}

export interface LeaderboardEntry {
  id?: number;
  name: string;
  score: number;
  difficulty: Difficulty;
  date: string;
}

export interface ThemeConfig {
  bgPrimary: string;
  bgSecondary: string;
  bgGrid: string;
  bgCell: string;
  bgCellFilled: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  blockColors: string[];
}

export const DIFFICULTY_CONFIG: Record<Difficulty, { gridSize: number; label: string }> = {
  easy: { gridSize: 9, label: '简单 9×9' },
  medium: { gridSize: 7, label: '中等 7×7' },
  hard: { gridSize: 5, label: '困难 5×5' },
};
