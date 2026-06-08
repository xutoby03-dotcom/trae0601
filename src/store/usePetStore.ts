import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'
import type {
  Pet, FamilyMember, TaskTemplate, TaskInstance, TaskAssignment,
  DailyRecord, FosterSession, TaskType, TimeSlot,
} from '@/types'
import { generateId } from '@/types'

interface PetStore {
  pets: Pet[]
  members: FamilyMember[]
  taskTemplates: TaskTemplate[]
  taskInstances: TaskInstance[]
  taskAssignments: TaskAssignment[]
  dailyRecords: DailyRecord[]
  fosterSessions: FosterSession[]
  fosterModeActive: boolean
  activeFosterToken: string | null

  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void
  updatePet: (id: string, pet: Partial<Pet>) => void
  deletePet: (id: string) => void

  addMember: (member: Omit<FamilyMember, 'id'>) => void
  updateMember: (id: string, member: Partial<FamilyMember>) => void
  deleteMember: (id: string) => void

  generateTasksForDate: (date: string) => void
  assignTask: (taskInstanceId: string, memberId: string) => void
  unassignTask: (taskInstanceId: string) => void
  completeTask: (taskInstanceId: string) => void
  uncompleteTask: (taskInstanceId: string) => void

  addDailyRecord: (record: Omit<DailyRecord, 'id'>) => void
  updateDailyRecord: (id: string, record: Partial<DailyRecord>) => void
  getDailyRecord: (petId: string, date: string) => DailyRecord | undefined

  createFosterSession: (session: Omit<FosterSession, 'id' | 'token'>) => FosterSession
  deactivateFoster: (token: string) => void
  setFosterMode: (active: boolean, token: string | null) => void
  getActiveFoster: () => FosterSession | undefined

  getTasksForDate: (date: string) => TaskInstance[]
  getOverdueTasks: (date: string) => TaskInstance[]
  getWeekStats: (endDate: string) => {
    missedFeedings: number
    abnormalDays: number
    medicineOnTimeRate: number
    completionByDay: { date: string; completed: number; total: number }[]
  }
}

const DEFAULT_TASK_RULES: { taskType: TaskType; timeSlot: TimeSlot; petType?: Pet['type']; deadlineMinutes: number }[] = [
  { taskType: 'breakfast', timeSlot: 'morning', deadlineMinutes: 120 },
  { taskType: 'dinner', timeSlot: 'evening', deadlineMinutes: 120 },
  { taskType: 'litter', timeSlot: 'evening', petType: 'cat', deadlineMinutes: 180 },
  { taskType: 'walk', timeSlot: 'morning', petType: 'dog', deadlineMinutes: 120 },
  { taskType: 'walk', timeSlot: 'evening', petType: 'dog', deadlineMinutes: 120 },
  { taskType: 'medicine', timeSlot: 'morning', deadlineMinutes: 90 },
]

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: [],
      members: [],
      taskTemplates: [],
      taskInstances: [],
      taskAssignments: [],
      dailyRecords: [],
      fosterSessions: [],
      fosterModeActive: false,
      activeFosterToken: null,

      addPet: (petData) => {
        const pet: Pet = {
          ...petData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => {
          const newTemplates: TaskTemplate[] = []
          for (const rule of DEFAULT_TASK_RULES) {
            if (rule.petType && rule.petType !== pet.type) continue
            if (rule.taskType === 'breakfast' && pet.medications) {
              // medicine template created separately if pet has medications
            }
            if (rule.taskType === 'dinner' && pet.feedPerDay <= 1) continue
            if (rule.taskType === 'medicine' && !pet.medications) continue

            newTemplates.push({
              id: generateId(),
              petId: pet.id,
              taskType: rule.taskType,
              timeSlot: rule.timeSlot,
              deadlineMinutes: rule.deadlineMinutes,
            })
          }

          return {
            pets: [...state.pets, pet],
            taskTemplates: [...state.taskTemplates, ...newTemplates],
          }
        })
      },

      updatePet: (id, petData) => {
        set((state) => ({
          pets: state.pets.map((p) => (p.id === id ? { ...p, ...petData } : p)),
        }))
      },

      deletePet: (id) => {
        set((state) => ({
          pets: state.pets.filter((p) => p.id !== id),
          taskTemplates: state.taskTemplates.filter((t) => t.petId !== id),
          taskInstances: state.taskInstances.filter((t) => t.petId !== id),
          taskAssignments: state.taskAssignments.filter(
            (a) => !state.taskInstances.find((ti) => ti.id === a.taskInstanceId && ti.petId === id)
          ),
          dailyRecords: state.dailyRecords.filter((r) => r.petId !== id),
        }))
      },

      addMember: (memberData) => {
        const member: FamilyMember = { ...memberData, id: generateId() }
        set((state) => ({ members: [...state.members, member] }))
      },

      updateMember: (id, memberData) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...memberData } : m)),
        }))
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          taskAssignments: state.taskAssignments.filter((a) => a.memberId !== id),
        }))
      },

      generateTasksForDate: (date) => {
        const state = get()
        const existing = state.taskInstances.filter((t) => t.date === date)
        if (existing.length > 0) return

        const newInstances: TaskInstance[] = state.taskTemplates.map((template) => ({
          id: generateId(),
          templateId: template.id,
          petId: template.petId,
          date,
          taskType: template.taskType,
          timeSlot: template.timeSlot,
          completed: false,
          completedAt: null,
        }))

        set({ taskInstances: [...state.taskInstances, ...newInstances] })
      },

      assignTask: (taskInstanceId, memberId) => {
        set((state) => {
          const existing = state.taskAssignments.find((a) => a.taskInstanceId === taskInstanceId)
          if (existing) {
            return {
              taskAssignments: state.taskAssignments.map((a) =>
                a.taskInstanceId === taskInstanceId ? { ...a, memberId } : a
              ),
            }
          }
          return {
            taskAssignments: [
              ...state.taskAssignments,
              { id: generateId(), taskInstanceId, memberId, assignedAt: new Date().toISOString() },
            ],
          }
        })
      },

      unassignTask: (taskInstanceId) => {
        set((state) => ({
          taskAssignments: state.taskAssignments.filter((a) => a.taskInstanceId !== taskInstanceId),
        }))
      },

      completeTask: (taskInstanceId) => {
        set((state) => ({
          taskInstances: state.taskInstances.map((t) =>
            t.id === taskInstanceId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
          ),
        }))
      },

      uncompleteTask: (taskInstanceId) => {
        set((state) => ({
          taskInstances: state.taskInstances.map((t) =>
            t.id === taskInstanceId ? { ...t, completed: false, completedAt: null } : t
          ),
        }))
      },

      addDailyRecord: (recordData) => {
        const existing = get().dailyRecords.find((r) => r.petId === recordData.petId && r.date === recordData.date)
        if (existing) {
          get().updateDailyRecord(existing.id, recordData)
          return
        }
        const record: DailyRecord = { ...recordData, id: generateId() }
        set((state) => ({ dailyRecords: [...state.dailyRecords, record] }))
      },

      updateDailyRecord: (id, recordData) => {
        set((state) => ({
          dailyRecords: state.dailyRecords.map((r) => (r.id === id ? { ...r, ...recordData } : r)),
        }))
      },

      getDailyRecord: (petId, date) => {
        return get().dailyRecords.find((r) => r.petId === petId && r.date === date)
      },

      createFosterSession: (sessionData) => {
        const session: FosterSession = {
          ...sessionData,
          id: generateId(),
          token: generateId(),
        }
        set((state) => ({ fosterSessions: [...state.fosterSessions, session] }))
        return session
      },

      deactivateFoster: (token) => {
        set((state) => ({
          fosterSessions: state.fosterSessions.map((s) =>
            s.token === token ? { ...s, active: false } : s
          ),
          fosterModeActive: state.activeFosterToken === token ? false : state.fosterModeActive,
          activeFosterToken: state.activeFosterToken === token ? null : state.activeFosterToken,
        }))
      },

      setFosterMode: (active, token) => {
        set({ fosterModeActive: active, activeFosterToken: token })
      },

      getActiveFoster: () => {
        const state = get()
        if (!state.activeFosterToken) return undefined
        return state.fosterSessions.find((s) => s.token === state.activeFosterToken && s.active)
      },

      getTasksForDate: (date) => {
        return get().taskInstances.filter((t) => t.date === date)
      },

      getOverdueTasks: (date) => {
        const state = get()
        const now = new Date()
        return state.taskInstances.filter((t) => {
          if (t.date !== date || t.completed) return false
          const template = state.taskTemplates.find((tp) => tp.id === t.templateId)
          if (!template) return false
          const taskTime = new Date(`${date}T${getTimeSlotHour(t.timeSlot)}`)
          const deadline = new Date(taskTime.getTime() + template.deadlineMinutes * 60000)
          return now > deadline
        })
      },

      getWeekStats: (endDate) => {
        const state = get()
        const end = new Date(endDate)
        const days: { date: string; completed: number; total: number }[] = []
        let missedFeedings = 0
        let abnormalDays = 0
        let totalMedicineTasks = 0
        let completedMedicineTasks = 0

        for (let i = 6; i >= 0; i--) {
          const d = new Date(end)
          d.setDate(d.getDate() - i)
          const dateStr = format(d, 'yyyy-MM-dd')
          const dayTasks = state.taskInstances.filter((t) => t.date === dateStr)
          const completed = dayTasks.filter((t) => t.completed).length
          const total = dayTasks.length
          days.push({ date: dateStr, completed, total })

          const feedingTasks = dayTasks.filter((t) => t.taskType === 'breakfast' || t.taskType === 'dinner')
          const missedFeed = feedingTasks.filter((t) => !t.completed).length
          missedFeedings += missedFeed

          const medTasks = dayTasks.filter((t) => t.taskType === 'medicine')
          totalMedicineTasks += medTasks.length
          completedMedicineTasks += medTasks.filter((t) => t.completed).length

          const dayRecords = state.dailyRecords.filter((r) => r.date === dateStr)
          const hasAbnormal = dayRecords.some(
            (r) => r.poopStatus !== 'normal' || r.abnormalNote.trim() !== ''
          )
          if (hasAbnormal) abnormalDays++
        }

        return {
          missedFeedings,
          abnormalDays,
          medicineOnTimeRate: totalMedicineTasks > 0 ? completedMedicineTasks / totalMedicineTasks : 1,
          completionByDay: days,
        }
      },
    }),
    { name: 'pet-feeding-store' }
  )
)

function getTimeSlotHour(slot: TimeSlot): string {
  switch (slot) {
    case 'morning': return '07:00:00'
    case 'noon': return '12:00:00'
    case 'evening': return '18:00:00'
    case 'night': return '21:00:00'
  }
}
