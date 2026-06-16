export type GameStatus = 'complete' | 'missing' | 'lent'
export type ComponentCategory = 'deck' | 'piece' | 'dice' | 'manual' | 'scoreboard' | 'other'
export type CheckType = 'open' | 'close'
export type CheckSessionStatus = 'in_progress' | 'completed'
export type LendingStatus = 'active' | 'returned' | 'overdue'

export interface Game {
  id: number
  name: string
  min_players: number
  max_players: number
  play_time_minutes: number
  status: GameStatus
  created_at: string
  updated_at: string
  expansions?: Expansion[]
  components?: Component[]
}

export interface Expansion {
  id: number
  game_id: number
  name: string
}

export interface Component {
  id: number
  game_id: number
  name: string
  category: ComponentCategory
  expected_count: number
}

export interface CheckSession {
  id: number
  game_id: number
  type: CheckType
  status: CheckSessionStatus
  table_location: string | null
  created_at: string
  completed_at: string | null
  items?: CheckItem[]
}

export interface CheckItem {
  id: number
  session_id: number
  component_id: number
  actual_count: number
  is_missing: boolean
  missing_count: number
  possible_holder: string | null
  component?: Component
}

export interface Lending {
  id: number
  game_id: number
  borrower_name: string
  return_date: string
  deposit: number
  status: LendingStatus
  lent_at: string
  returned_at: string | null
  game_name?: string
}

export interface DashboardData {
  missingGames: Array<{ id: number; name: string; missing_count: number }>
  overdueLendings: Array<Lending & { game_name: string }>
  topPlayedGames: Array<{ id: number; name: string; play_count: number }>
}

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  deck: '牌堆',
  piece: '棋子',
  dice: '骰子',
  manual: '说明书',
  scoreboard: '计分板',
  other: '其他',
}

export const STATUS_LABELS: Record<GameStatus, string> = {
  complete: '齐全',
  missing: '缺件',
  lent: '外借中',
}

export const STATUS_COLORS: Record<GameStatus, string> = {
  complete: 'bg-emerald-500',
  missing: 'bg-orange-500',
  lent: 'bg-indigo-500',
}
