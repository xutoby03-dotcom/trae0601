export type Position = 'G' | 'F' | 'C' | 'any'
export type Level = 'beginner' | 'casual' | 'competitive'
export type GameType = 'half' | 'full'
export type GameStatus = 'recruiting' | 'confirmed' | 'completed'

export interface Player {
  id: string
  name: string
  phone: string
  wechat: string
  avatar: string
}

export interface GamePlayer {
  playerId: string
  position: Position
  level: Level
  bringBall: boolean
  isLate: boolean
  isMVP: boolean
}

export interface Game {
  id: string
  creatorId: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  gameType: GameType
  maxPlayers: number
  level: Level
  needTeamSplit: boolean
  contact: string
  players: GamePlayer[]
  status: GameStatus
  score?: { teamA: number; teamB: number }
  mvpId?: string
  latePlayerIds?: string[]
  createdAt: string
}

export interface Court {
  id: string
  name: string
  location: string
}

export interface WeeklyStats {
  weekLabel: string
  gameCount: number
  totalPlayers: number
}

export interface PlayerRanking {
  playerId: string
  name: string
  avatar: string
  gameCount: number
}

export interface TimeSlotHeat {
  timeSlot: string
  gameCount: number
}

export const COURTS: Court[] = [
  { id: 'court-a', name: 'A场', location: '靠近东门' },
  { id: 'court-b', name: 'B场', location: '靠近西门' },
  { id: 'court-c', name: 'C场', location: '中心花园旁' },
]

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: '入门',
  casual: '休闲',
  competitive: '竞技',
}

export const POSITION_LABELS: Record<Position, string> = {
  G: '后卫',
  F: '前锋',
  C: '中锋',
  any: '不限',
}

export const STATUS_LABELS: Record<GameStatus, string> = {
  recruiting: '报名中',
  confirmed: '已成局',
  completed: '已完成',
}
