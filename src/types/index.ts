export interface TimeCapsule {
  id: string
  title: string
  content: string
  openDate: string
  createdAt: string
  moodColor: string
  images: string[]
  isLocked: boolean
  isOpened: boolean
  templateId?: string
}

export interface Template {
  id: string
  name: string
  icon: string
  prefix: string
  description: string
  defaultMoodColor: string
  defaultDaysAhead: number
}

export type CapsuleFilter = 'all' | 'on-the-way' | 'ready-to-open' | 'opened'
