import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pet, HealthRecord, ReminderItem, CostStats, HealthRecordType } from '@/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

interface PetStore {
  pets: Pet[]
  records: HealthRecord[]
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => string
  updatePet: (id: string, data: Partial<Pet>) => void
  deletePet: (id: string) => void
  addRecord: (record: Omit<HealthRecord, 'id' | 'createdAt'>) => string
  updateRecord: (id: string, data: Partial<HealthRecord>) => void
  deleteRecord: (id: string) => void
  getPetRecords: (petId: string) => HealthRecord[]
  getUpcomingReminders: () => ReminderItem[]
  getCostStats: (year: number) => CostStats
  getAllHospitals: () => string[]
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: [],
      records: [],

      addPet: (petData) => {
        const id = generateId()
        const pet: Pet = { ...petData, id, createdAt: new Date().toISOString() }
        set((state) => ({ pets: [...state.pets, pet] }))
        return id
      },

      updatePet: (id, data) => {
        set((state) => ({
          pets: state.pets.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }))
      },

      deletePet: (id) => {
        set((state) => ({
          pets: state.pets.filter((p) => p.id !== id),
          records: state.records.filter((r) => r.petId !== id),
        }))
      },

      addRecord: (recordData) => {
        const id = generateId()
        const record: HealthRecord = { ...recordData, id, createdAt: new Date().toISOString() }
        set((state) => ({ records: [...state.records, record] }))
        return id
      },

      updateRecord: (id, data) => {
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }))
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }))
      },

      getPetRecords: (petId) => {
        return get()
          .records.filter((r) => r.petId === petId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },

      getUpcomingReminders: () => {
        const { records, pets } = get()
        const now = new Date()
        const reminders: ReminderItem[] = []

        for (const record of records) {
          if (!record.nextDate) continue
          const nextDate = new Date(record.nextDate)
          const daysLeft = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= 30) {
            const pet = pets.find((p) => p.id === record.petId)
            if (!pet) continue
            const urgency: ReminderItem['urgency'] = daysLeft <= 0 ? 'urgent' : daysLeft <= 7 ? 'urgent' : 'warning'
            reminders.push({ record, pet, daysLeft, urgency })
          }
        }

        return reminders.sort((a, b) => a.daysLeft - b.daysLeft)
      },

      getCostStats: (year) => {
        const { records, pets } = get()
        const yearRecords = records.filter((r) => new Date(r.date).getFullYear() === year)

        const total = yearRecords.reduce((sum, r) => sum + r.cost, 0)

        const byType: Record<HealthRecordType, number> = {
          vaccine: 0,
          deworming: 0,
          checkup: 0,
          allergy: 0,
          surgery: 0,
        }
        yearRecords.forEach((r) => {
          byType[r.type] += r.cost
        })

        const monthMap: Record<string, number> = {}
        yearRecords.forEach((r) => {
          const month = new Date(r.date).getMonth() + 1
          const key = `${month}月`
          monthMap[key] = (monthMap[key] || 0) + r.cost
        })
        const byMonth = Array.from({ length: 12 }, (_, i) => ({
          month: `${i + 1}月`,
          cost: monthMap[`${i + 1}月`] || 0,
        }))

        const petCostMap: Record<string, number> = {}
        yearRecords.forEach((r) => {
          petCostMap[r.petId] = (petCostMap[r.petId] || 0) + r.cost
        })
        const byPet = Object.entries(petCostMap).map(([petId, cost]) => {
          const pet = pets.find((p) => p.id === petId)
          return { petId, petName: pet?.name || '未知', cost }
        })

        return { total, byType, byMonth, byPet }
      },

      getAllHospitals: () => {
        const { records, pets } = get()
        const hospitals = new Set<string>()
        pets.forEach((p) => { if (p.hospital) hospitals.add(p.hospital) })
        records.forEach((r) => { if (r.hospital) hospitals.add(r.hospital) })
        return Array.from(hospitals)
      },
    }),
    {
      name: 'pet-health-store',
    }
  )
)
