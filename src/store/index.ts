import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Elder,
  ChronicDisease,
  Medication,
  CheckItem,
  FollowUpRecord,
  HealthIndicator,
  FamilyTask,
} from '@/types'

interface AppState {
  elders: Elder[]
  chronicDiseases: ChronicDisease[]
  medications: Medication[]
  checkItems: CheckItem[]
  followUpRecords: FollowUpRecord[]
  healthIndicators: HealthIndicator[]
  familyTasks: FamilyTask[]

  addElder: (elder: Elder) => void
  updateElder: (id: string, data: Partial<Elder>) => void
  deleteElder: (id: string) => void

  addChronicDisease: (disease: ChronicDisease) => void
  updateChronicDisease: (id: string, data: Partial<ChronicDisease>) => void
  deleteChronicDisease: (id: string) => void

  addMedication: (med: Medication) => void
  updateMedication: (id: string, data: Partial<Medication>) => void
  deleteMedication: (id: string) => void

  addCheckItem: (item: CheckItem) => void
  updateCheckItem: (id: string, data: Partial<CheckItem>) => void
  deleteCheckItem: (id: string) => void

  addFollowUpRecord: (record: FollowUpRecord) => void
  updateFollowUpRecord: (id: string, data: Partial<FollowUpRecord>) => void
  deleteFollowUpRecord: (id: string) => void

  addHealthIndicator: (indicator: HealthIndicator) => void
  updateHealthIndicator: (id: string, data: Partial<HealthIndicator>) => void
  deleteHealthIndicator: (id: string) => void

  addFamilyTask: (task: FamilyTask) => void
  updateFamilyTask: (id: string, data: Partial<FamilyTask>) => void
  deleteFamilyTask: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      elders: [],
      chronicDiseases: [],
      medications: [],
      checkItems: [],
      followUpRecords: [],
      healthIndicators: [],
      familyTasks: [],

      addElder: (elder) => set((s) => ({ elders: [...s.elders, elder] })),
      updateElder: (id, data) =>
        set((s) => ({
          elders: s.elders.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      deleteElder: (id) =>
        set((s) => ({
          elders: s.elders.filter((e) => e.id !== id),
          chronicDiseases: s.chronicDiseases.filter((d) => d.elderId !== id),
          familyTasks: s.familyTasks.filter((t) => t.elderId !== id),
        })),

      addChronicDisease: (disease) =>
        set((s) => ({ chronicDiseases: [...s.chronicDiseases, disease] })),
      updateChronicDisease: (id, data) =>
        set((s) => ({
          chronicDiseases: s.chronicDiseases.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        })),
      deleteChronicDisease: (id) =>
        set((s) => ({
          chronicDiseases: s.chronicDiseases.filter((d) => d.id !== id),
          medications: s.medications.filter((m) => m.diseaseId !== id),
          checkItems: s.checkItems.filter((c) => c.diseaseId !== id),
          followUpRecords: s.followUpRecords.filter((r) => r.diseaseId !== id),
          healthIndicators: s.healthIndicators.filter((h) => h.diseaseId !== id),
        })),

      addMedication: (med) =>
        set((s) => ({ medications: [...s.medications, med] })),
      updateMedication: (id, data) =>
        set((s) => ({
          medications: s.medications.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),
      deleteMedication: (id) =>
        set((s) => ({ medications: s.medications.filter((m) => m.id !== id) })),

      addCheckItem: (item) =>
        set((s) => ({ checkItems: [...s.checkItems, item] })),
      updateCheckItem: (id, data) =>
        set((s) => ({
          checkItems: s.checkItems.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteCheckItem: (id) =>
        set((s) => ({ checkItems: s.checkItems.filter((c) => c.id !== id) })),

      addFollowUpRecord: (record) =>
        set((s) => ({ followUpRecords: [...s.followUpRecords, record] })),
      updateFollowUpRecord: (id, data) =>
        set((s) => ({
          followUpRecords: s.followUpRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),
      deleteFollowUpRecord: (id) =>
        set((s) => ({
          followUpRecords: s.followUpRecords.filter((r) => r.id !== id),
        })),

      addHealthIndicator: (indicator) =>
        set((s) => ({
          healthIndicators: [...s.healthIndicators, indicator],
        })),
      updateHealthIndicator: (id, data) =>
        set((s) => ({
          healthIndicators: s.healthIndicators.map((h) =>
            h.id === id ? { ...h, ...data } : h
          ),
        })),
      deleteHealthIndicator: (id) =>
        set((s) => ({
          healthIndicators: s.healthIndicators.filter((h) => h.id !== id),
        })),

      addFamilyTask: (task) =>
        set((s) => ({ familyTasks: [...s.familyTasks, task] })),
      updateFamilyTask: (id, data) =>
        set((s) => ({
          familyTasks: s.familyTasks.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),
      deleteFamilyTask: (id) =>
        set((s) => ({ familyTasks: s.familyTasks.filter((t) => t.id !== id) })),
    }),
    { name: 'chronic-care-storage' }
  )
)

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
