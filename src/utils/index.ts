import type { DimensionScore, ScoreDimension } from '../types';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const calculateOverallScore = (scores: DimensionScore): number => {
  const weights: Record<ScoreDimension, number> = {
    handShape: 0.35,
    orientation: 0.25,
    trajectory: 0.25,
    expression: 0.15,
  };

  const total =
    scores.handShape * weights.handShape +
    scores.orientation * weights.orientation +
    scores.trajectory * weights.trajectory +
    scores.expression * weights.expression;

  return Math.round(total * 10) / 10;
};

export const getScoreLevel = (
  score: number
): { label: string; color: string; bgColor: string } => {
  if (score >= 85) {
    return { label: '优秀', color: 'text-accent-mint', bgColor: 'bg-accent-mint/10' };
  }
  if (score >= 70) {
    return { label: '良好', color: 'text-primary-500', bgColor: 'bg-primary-100' };
  }
  if (score >= 60) {
    return { label: '一般', color: 'text-accent-amber', bgColor: 'bg-accent-amber/10' };
  }
  return { label: '需改进', color: 'text-accent-red', bgColor: 'bg-accent-red/10' };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimestamp = (timestamp: number): string => {
  const minutes = Math.floor(timestamp / 60);
  const seconds = (timestamp % 60).toFixed(2);
  return `${minutes.toString().padStart(2, '0')}:${seconds.padStart(5, '0')}`;
};

export const determineNeedsReview = (
  overallScore: number,
  scores: DimensionScore
): boolean => {
  if (overallScore < 70) return true;
  const minScore = Math.min(scores.handShape, scores.orientation, scores.trajectory, scores.expression);
  return minScore < 60;
};

export const getLowestDimensions = (scores: DimensionScore): ScoreDimension[] => {
  const dims: ScoreDimension[] = ['handShape', 'orientation', 'trajectory', 'expression'];
  const sorted = dims.sort((a, b) => scores[a] - scores[b]);
  return sorted.filter((d) => scores[d] < 70);
};

export const downloadTextFile = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
