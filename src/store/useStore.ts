import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AirConditioner {
  id: string
  room: string
  brand: string
  lastCleanDate: string
  filterType: 'normal' | 'hepa' | 'carbon'
  highAltitudeWork: boolean
  warrantyPhone: string
  createdAt: string
}

export interface CleaningRecord {
  id: string
  acId: string
  cleanerName: string
  cost: number
  beforePhoto: string
  afterPhoto: string
  hasOdor: boolean
  hasLeakage: boolean
  notes: string
  cleanDate: string
}

export interface SeasonCheckItem {
  id: string
  acId: string
  checkType: 'remote_battery' | 'drain_pipe' | 'outdoor_obstacle' | 'filter_status'
  checked: boolean
  checkedDate: string
}

export interface FamilyTask {
  id: string
  acId: string
  memberName: string
  taskType: 'contact_technician' | 'wait_at_home' | 'inspect'
  completed: boolean
}

interface ACStore {
  acUnits: AirConditioner[]
  cleaningRecords: CleaningRecord[]
  seasonChecks: SeasonCheckItem[]
  familyTasks: FamilyTask[]

  addAC: (ac: Omit<AirConditioner, 'id' | 'createdAt'>) => string
  updateAC: (id: string, data: Partial<AirConditioner>) => void
  deleteAC: (id: string) => void

  addCleaningRecord: (record: Omit<CleaningRecord, 'id'>) => string
  deleteCleaningRecord: (id: string) => void

  addSeasonCheck: (item: Omit<SeasonCheckItem, 'id'>) => string
  toggleSeasonCheck: (id: string) => void

  addFamilyTask: (task: Omit<FamilyTask, 'id'>) => string
  toggleFamilyTask: (id: string) => void
  deleteFamilyTask: (id: string) => void
}

const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

export const useStore = create<ACStore>()(
  persist(
    (set) => ({
      acUnits: [],
      cleaningRecords: [],
      seasonChecks: [],
      familyTasks: [],

      addAC: (ac) => {
        const id = genId()
        set((s) => ({
          acUnits: [...s.acUnits, { ...ac, id, createdAt: new Date().toISOString() }],
        }))
        return id
      },
      updateAC: (id, data) =>
        set((s) => ({
          acUnits: s.acUnits.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),
      deleteAC: (id) =>
        set((s) => ({
          acUnits: s.acUnits.filter((a) => a.id !== id),
          cleaningRecords: s.cleaningRecords.filter((r) => r.acId !== id),
          seasonChecks: s.seasonChecks.filter((c) => c.acId !== id),
          familyTasks: s.familyTasks.filter((t) => t.acId !== id),
        })),

      addCleaningRecord: (record) => {
        const id = genId()
        set((s) => ({
          cleaningRecords: [...s.cleaningRecords, { ...record, id }],
          acUnits: s.acUnits.map((a) =>
            a.id === record.acId ? { ...a, lastCleanDate: record.cleanDate } : a
          ),
        }))
        return id
      },
      deleteCleaningRecord: (id) =>
        set((s) => ({
          cleaningRecords: s.cleaningRecords.filter((r) => r.id !== id),
        })),

      addSeasonCheck: (item) => {
        const id = genId()
        set((s) => ({
          seasonChecks: [...s.seasonChecks, { ...item, id }],
        }))
        return id
      },
      toggleSeasonCheck: (id) =>
        set((s) => ({
          seasonChecks: s.seasonChecks.map((c) =>
            c.id === id
              ? { ...c, checked: !c.checked, checkedDate: !c.checked ? new Date().toISOString() : '' }
              : c
          ),
        })),

      addFamilyTask: (task) => {
        const id = genId()
        set((s) => ({
          familyTasks: [...s.familyTasks, { ...task, id }],
        }))
        return id
      },
      toggleFamilyTask: (id) =>
        set((s) => ({
          familyTasks: s.familyTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      deleteFamilyTask: (id) =>
        set((s) => ({
          familyTasks: s.familyTasks.filter((t) => t.id !== id),
        })),
    }),
    { name: 'ac-clean-store' }
  )
)

export function getDaysSince(dateStr: string): number {
  if (!dateStr) return 999
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export type ACStatus = 'overdue' | 'due-soon' | 'clean'

export function getACStatus(ac: AirConditioner): ACStatus {
  const days = getDaysSince(ac.lastCleanDate)
  if (days > 90) return 'overdue'
  if (days >= 60) return 'due-soon'
  return 'clean'
}

export const FILTER_TYPE_LABELS: Record<AirConditioner['filterType'], string> = {
  normal: '普通过滤网',
  hepa: 'HEPA滤网',
  carbon: '活性炭滤网',
}

export const CHECK_TYPE_LABELS: Record<SeasonCheckItem['checkType'], string> = {
  remote_battery: '遥控器电池',
  drain_pipe: '排水管检查',
  outdoor_obstacle: '外机遮挡物',
  filter_status: '滤网状态',
}

export const TASK_TYPE_LABELS: Record<FamilyTask['taskType'], string> = {
  contact_technician: '联系师傅',
  wait_at_home: '在家等候',
  inspect: '负责检查',
}
