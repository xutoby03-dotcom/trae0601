export type RelationshipGroup = '亲戚' | '同学' | '同事' | '朋友' | '其他'

export interface Guest {
  id: string
  name: string
  relationship: RelationshipGroup
  partySize: number
  isChild: boolean
  isElderly: boolean
  dietaryRestrictions: string
  cannotSitWith: string[]
  preferSitWith: string[]
  tableId: string | null
}

export interface Table {
  id: string
  name: string
  x: number
  y: number
  maxSeats: number
  isNearSpeaker: boolean
  zone: RelationshipGroup | null
}

export interface Conflict {
  type: 'cannot_sit_together' | 'elderly_near_speaker' | 'no_child_seat' | 'over_capacity'
  guestIds: string[]
  tableId: string
  message: string
  severity: 'error' | 'warning'
}

export const RELATIONSHIP_COLORS: Record<RelationshipGroup, string> = {
  '亲戚': '#E8B4B8',
  '同学': '#A8D8EA',
  '同事': '#B8E6C8',
  '朋友': '#F5D7B2',
  '其他': '#D4D4D4',
}

export const RELATIONSHIP_ZONES: Record<RelationshipGroup, { x: number; y: number }> = {
  '亲戚': { x: 80, y: 60 },
  '同学': { x: 520, y: 60 },
  '同事': { x: 80, y: 380 },
  '朋友': { x: 520, y: 380 },
  '其他': { x: 300, y: 380 },
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function createDefaultTables(): Table[] {
  const tables: Table[] = []
  const positions = [
    { x: 80, y: 60 }, { x: 280, y: 60 }, { x: 480, y: 60 },
    { x: 80, y: 260 }, { x: 280, y: 260 }, { x: 480, y: 260 },
    { x: 80, y: 460 }, { x: 280, y: 460 }, { x: 480, y: 460 },
  ]
  positions.forEach((pos, i) => {
    tables.push({
      id: generateId(),
      name: `${i + 1}号桌`,
      x: pos.x,
      y: pos.y,
      maxSeats: 10,
      isNearSpeaker: i < 3,
      zone: null,
    })
  })
  return tables
}
