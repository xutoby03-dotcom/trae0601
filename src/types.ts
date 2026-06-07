export type Atmosphere = 'absurd' | 'warm' | 'fear' | 'flying' | 'lost'

export interface DreamTag {
  type: 'person' | 'place' | 'object'
  value: string
}

export interface Dream {
  id: string
  title: string
  atmosphere: Atmosphere
  fragments: string[]
  tags: DreamTag[]
  createdAt: number
}

export const ATMOSPHERE_LABELS: Record<Atmosphere, string> = {
  absurd: '荒诞',
  warm: '温暖',
  fear: '害怕',
  flying: '飞行',
  lost: '迷路',
}

export const TAG_TYPE_LABELS: Record<DreamTag['type'], string> = {
  person: '人物',
  place: '地点',
  object: '物件',
}
