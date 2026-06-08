export type PetType = 'lost' | 'found'
export type PetStatus = 'searching' | 'clue' | 'reunited'
export type PetGender = 'male' | 'female' | 'unknown'

export interface PetPost {
  id: string
  type: PetType
  status: PetStatus
  name: string
  breed: string
  furColor: string
  gender: PetGender
  size: string
  description: string
  photos: string[]
  lostTime: string
  locationDesc: string
  lat: number
  lng: number
  contactName: string
  contactPhone: string
  contactWechat: string
  reward: string
  createdAt: string
  updatedAt: string
}

export interface Clue {
  id: string
  postId: string
  content: string
  photos: string[]
  seenTime: string
  seenLocation: string
  createdAt: string
}

export interface StatusLog {
  id: string
  postId: string
  fromStatus: PetStatus
  toStatus: PetStatus
  changedAt: string
}

export interface AppData {
  posts: PetPost[]
  clues: Clue[]
  statusLogs: StatusLog[]
}

export const STATUS_LABELS: Record<PetStatus, string> = {
  searching: '寻找中',
  clue: '疑似线索',
  reunited: '已团圆',
}

export const TYPE_LABELS: Record<PetType, string> = {
  lost: '走失',
  found: '捡到',
}

export const GENDER_LABELS: Record<PetGender, string> = {
  male: '公',
  female: '母',
  unknown: '未知',
}

export const STATUS_COLORS: Record<PetStatus, string> = {
  searching: '#EF4444',
  clue: '#F59E0B',
  reunited: '#22C55E',
}

export const TYPE_COLORS: Record<PetType, string> = {
  lost: '#EF4444',
  found: '#3B82F6',
}
