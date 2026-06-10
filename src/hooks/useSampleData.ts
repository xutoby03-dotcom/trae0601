import { useEffect } from 'react'
import { useFamilyStore } from '@/stores/familyStore'
import type { DrinkType, Scenario } from '@/types'

export function useSampleData() {
  const members = useFamilyStore((s) => s.members)
  const addMember = useFamilyStore((s) => s.addMember)
  const addRecord = useFamilyStore((s) => s.addRecord)

  useEffect(() => {
    if (members.length > 0) return

    const grandpaId = 'sample-grandpa'
    const kidId = 'sample-kid'
    const momId = 'sample-mom'

    const sampleMembers = [
      {
        id: grandpaId,
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
        id: kidId,
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
        id: momId,
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

    sampleMembers.forEach((m) => {
      const { id, ...rest } = m
      addMember(rest)
    })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const generateRecords = (memberId: string, count: number, drinkTypes: DrinkType[], scenarios: Scenario[], baseHour: number) => {
      const records: { memberId: string; amount: number; drinkType: DrinkType; scenarios: Scenario[]; timestamp: number }[] = []
      for (let i = 0; i < count; i++) {
        const hour = baseHour + i * 2 + Math.floor(Math.random() * 2)
        if (hour > 21) break
        const date = new Date(today)
        date.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
        records.push({
          memberId,
          amount: [150, 200, 250, 300][Math.floor(Math.random() * 4)],
          drinkType: drinkTypes[Math.floor(Math.random() * drinkTypes.length)],
          scenarios: [scenarios[Math.floor(Math.random() * scenarios.length)]],
          timestamp: date.getTime(),
        })
      }
      return records
    }

    const grandpaRecords = generateRecords(grandpaId, 4, ['water', 'tea'], ['normal', 'cold'], 8)
    const kidRecords = generateRecords(kidId, 3, ['water', 'juice', 'milk'], ['normal', 'exercise'], 9)
    const momRecords = generateRecords(momId, 5, ['water', 'coffee', 'tea'], ['normal', 'exercise'], 7)

    ;[...grandpaRecords, ...kidRecords, ...momRecords].forEach((r) => {
      addRecord(r)
    })

    for (let day = 1; day <= 6; day++) {
      const dayDate = new Date(today)
      dayDate.setDate(dayDate.getDate() - day)

      ;[
        { memberId: grandpaId, count: 5 + Math.floor(Math.random() * 3), types: ['water', 'tea'] as DrinkType[] },
        { memberId: kidId, count: 4 + Math.floor(Math.random() * 3), types: ['water', 'juice', 'milk'] as DrinkType[] },
        { memberId: momId, count: 6 + Math.floor(Math.random() * 3), types: ['water', 'coffee', 'tea'] as DrinkType[] },
      ].forEach(({ memberId, count, types }) => {
        for (let i = 0; i < count; i++) {
          const hour = 7 + i * 2 + Math.floor(Math.random() * 2)
          if (hour > 22) break
          const recordDate = new Date(dayDate)
          recordDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
          addRecord({
            memberId,
            amount: [150, 200, 250, 300][Math.floor(Math.random() * 4)],
            drinkType: types[Math.floor(Math.random() * types.length)],
            scenarios: ['normal'],
            timestamp: recordDate.getTime(),
          })
        }
      })
    }
  }, [members.length, addMember, addRecord])
}
