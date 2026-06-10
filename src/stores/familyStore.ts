import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Member, DrinkRecord, DrinkType, Scenario } from '@/types'
import { getEffectiveWater } from '@/types'

interface FamilyState {
  members: Member[]
  records: DrinkRecord[]
  addMember: (member: Omit<Member, 'id'>) => void
  updateMember: (id: string, data: Partial<Member>) => void
  removeMember: (id: string) => void
  addRecord: (record: Omit<DrinkRecord, 'id'>) => void
  removeRecord: (id: string) => void
  getMemberRecords: (memberId: string, date?: Date) => DrinkRecord[]
  getMemberDailyTotal: (memberId: string, date?: Date) => number
  getMemberDailyWaterTotal: (memberId: string, date?: Date) => number
  quickRecord: (memberId: string) => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function isSameDay(timestamp: number, date: Date): boolean {
  const d = new Date(timestamp)
  return d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
}

const SAMPLE_MEMBERS: Member[] = [
  {
    id: 'sample-grandpa',
    name: '爷爷',
    age: 68,
    dailyGoal: 1600,
    cupCapacity: 200,
    limitWater: true,
    reminderPeriods: ['上午 8-10点', '下午 14-16点', '傍晚 18-20点'],
    avatar: '👴',
    color: '#4FC3F7',
  },
  {
    id: 'sample-kid',
    name: '乐乐',
    age: 8,
    dailyGoal: 1200,
    cupCapacity: 150,
    limitWater: false,
    reminderPeriods: ['早起 6-8点', '上午 10-12点', '下午 14-16点'],
    avatar: '👦',
    color: '#FF8A65',
  },
  {
    id: 'sample-mom',
    name: '妈妈',
    age: 38,
    dailyGoal: 2000,
    cupCapacity: 250,
    limitWater: false,
    reminderPeriods: ['上午 8-10点', '下午 14-16点', '傍晚 18-20点'],
    avatar: '👩',
    color: '#CE93D8',
  },
]

function generateSampleRecords(): DrinkRecord[] {
  const records: DrinkRecord[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const addDayRecords = (dayOffset: number, memberId: string, count: number, drinkTypes: DrinkType[]) => {
    const dayDate = new Date(today)
    dayDate.setDate(dayDate.getDate() - dayOffset)

    for (let i = 0; i < count; i++) {
      const hour = 7 + i * 2 + (dayOffset === 0 ? 0 : Math.floor(Math.random() * 2))
      if (hour > 22) break
      const recordDate = new Date(dayDate)
      recordDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
      records.push({
        id: `sample-${memberId}-${dayOffset}-${i}`,
        memberId,
        amount: [150, 200, 250, 300][Math.floor(Math.random() * 4)],
        drinkType: drinkTypes[Math.floor(Math.random() * drinkTypes.length)],
        scenarios: ['normal'],
        timestamp: recordDate.getTime(),
      })
    }
  }

  for (let day = 0; day <= 6; day++) {
    addDayRecords(day, 'sample-grandpa', 4 + Math.floor(Math.random() * 2), ['water', 'tea'])
    addDayRecords(day, 'sample-kid', 3 + Math.floor(Math.random() * 2), ['water', 'juice', 'milk'])
    addDayRecords(day, 'sample-mom', 5 + Math.floor(Math.random() * 2), ['water', 'coffee', 'tea'])
  }

  return records
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: SAMPLE_MEMBERS,
      records: generateSampleRecords(),

      addMember: (member) => {
        const newMember: Member = { ...member, id: generateId() }
        set((state) => ({ members: [...state.members, newMember] }))
      },

      updateMember: (id, data) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
        }))
      },

      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          records: state.records.filter((r) => r.memberId !== id),
        }))
      },

      addRecord: (record) => {
        const newRecord: DrinkRecord = { ...record, id: generateId() }
        set((state) => ({ records: [...state.records, newRecord] }))
      },

      removeRecord: (id) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }))
      },

      getMemberRecords: (memberId, date) => {
        const { records } = get()
        const targetDate = date ?? new Date()
        return records.filter(
          (r) => r.memberId === memberId && isSameDay(r.timestamp, targetDate)
        )
      },

      getMemberDailyTotal: (memberId, date) => {
        const records = get().getMemberRecords(memberId, date)
        return records.reduce((sum, r) => sum + r.amount, 0)
      },

      getMemberDailyWaterTotal: (memberId, date) => {
        const records = get().getMemberRecords(memberId, date)
        return records.reduce((sum, r) => sum + getEffectiveWater(r.amount, r.drinkType), 0)
      },

      quickRecord: (memberId) => {
        const member = get().members.find((m) => m.id === memberId)
        if (!member) return
        get().addRecord({
          memberId,
          amount: member.cupCapacity,
          drinkType: 'water' as DrinkType,
          scenarios: ['normal'] as Scenario[],
          timestamp: Date.now(),
        })
      },
    }),
    {
      name: 'family-water-tracker-v2',
    }
  )
)
