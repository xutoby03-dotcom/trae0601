export type ScoringRule = "highest_wins" | "lowest_wins" | "bonus_per_round" | "elimination";

export const SCORING_RULES: { value: ScoringRule; label: string; desc: string }[] = [
  { value: "highest_wins", label: "分高赢", desc: "总分最高者获胜" },
  { value: "lowest_wins", label: "分低赢", desc: "总分最低者获胜" },
  { value: "bonus_per_round", label: "每回合奖励分", desc: "每回合第一名额外加分" },
  { value: "elimination", label: "淘汰制", desc: "达到阈值即淘汰，最后存活者胜" },
];

export const AVATARS = ["🦁", "🐺", "🦊", "🐻", "🐼", "🐸", "🦅", "🐲", "🐯", "🦄", "🐙", "🦈"] as const;
export type Avatar = (typeof AVATARS)[number];

export const PLAYER_COLORS = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#E67E22",
  "#34495E",
];

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: Avatar;
  teamId: string;
  isEliminated: boolean;
}

export interface ScoreEntry {
  playerId: string;
  score: number;
  bonusPoints: number;
}

export interface Round {
  roundNumber: number;
  scores: ScoreEntry[];
  isLocked: boolean;
}

export interface Game {
  id: string;
  name: string;
  scoringRule: ScoringRule;
  teamMode: boolean;
  totalRounds: number;
  currentRound: number;
  players: Player[];
  rounds: Round[];
  isFinished: boolean;
  createdAt: string;
  eliminationThreshold: number;
  bonusPointsAmount: number;
}

export interface GameHistory {
  id: string;
  name: string;
  scoringRule: ScoringRule;
  players: Player[];
  rounds: Round[];
  totalRounds: number;
  winner: string;
  createdAt: string;
  finishedAt: string;
}

export interface PlayerStats {
  playerName: string;
  wins: number;
  comebacks: number;
  totalGames: number;
}
