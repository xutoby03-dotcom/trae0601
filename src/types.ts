export type DogSize = '小型' | '中型' | '大型'

export type DogPersonality = '温顺' | '活泼' | '胆小' | '好斗' | '独立'

export interface DogProfile {
  id: string
  name: string
  size: DogSize
  personality: DogPersonality[]
  afraidOfBigDogs: boolean
  goodWithKids: boolean
  frequentAreas: string[]
  ownerId: string
  ownerName: string
  incompatibleDogIds: string[]
  createdAt: string
}

export type TimeSlot = '傍晚' | '夜间' | '周末上午' | '周末下午'

export interface WalkPlan {
  id: string
  dogId: string
  dogName: string
  ownerId: string
  ownerName: string
  date: string
  timeSlot: TimeSlot
  specificTime: string
  route: string
  duration: number
  willingToJoin: boolean
  notes: string
  createdAt: string
}

export type RecordType = '打架' | '捡到东西' | '遇到流浪狗' | '友好互动' | '其他'

export interface WalkRecord {
  id: string
  planId: string
  dogId: string
  dogName: string
  ownerId: string
  ownerName: string
  recordType: RecordType
  description: string
  route: string
  date: string
  createdAt: string
}

export interface ConflictAlert {
  id: string
  plan1Id: string
  plan2Id: string
  dog1Id: string
  dog1Name: string
  dog2Id: string
  dog2Name: string
  owner1Name: string
  owner2Name: string
  reason: string
  route: string
  date: string
  timeSlot: TimeSlot
  specificTime: string
  resolved: boolean
  createdAt: string
}

export interface MergedRoute {
  route: string
  date: string
  timeSlot: TimeSlot
  specificTime: string
  plans: WalkPlan[]
  hasConflict: boolean
  conflicts: ConflictAlert[]
}
