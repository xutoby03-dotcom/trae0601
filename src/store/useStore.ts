import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plan, DailySchedule, Observation } from '@/types'
import { speciesTemplates } from '@/data/templates'

interface AppState {
  plans: Plan[]
  schedules: DailySchedule[]
  observations: Observation[]
  activePlanId: string | null

  setActivePlan: (id: string) => void
  createPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => string
  deletePlan: (id: string) => void
  updateSchedule: (planId: string, dayIndex: number, updates: Partial<DailySchedule>) => void
  applyTemplate: (planId: string, templateId: string) => void
  addObservation: (obs: Omit<Observation, 'id' | 'recordedAt'>) => void
  updateObservation: (id: string, updates: Partial<Observation>) => void
  deleteObservation: (id: string) => void
  applySuggestion: (planId: string, dayIndex: number, updates: Partial<DailySchedule>) => void
}

const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

function generateSchedules(planId: string, totalDays: number, start: { blue: number; white: number; purple: number; brightness: number }, end: { blue: number; white: number; purple: number; brightness: number }): DailySchedule[] {
  const schedules: DailySchedule[] = []
  for (let i = 0; i < totalDays; i++) {
    const t = totalDays <= 1 ? 0 : i / (totalDays - 1)
    schedules.push({
      id: genId(),
      planId,
      dayIndex: i,
      blueRatio: Math.round(start.blue + (end.blue - start.blue) * t),
      whiteRatio: Math.round(start.white + (end.white - start.white) * t),
      purpleRatio: Math.round(start.purple + (end.purple - start.purple) * t),
      brightness: Math.round(start.brightness + (end.brightness - start.brightness) * t),
    })
  }
  return schedules
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      plans: [],
      schedules: [],
      observations: [],
      activePlanId: null,

      setActivePlan: (id) => set({ activePlanId: id }),

      createPlan: (planData) => {
        const id = genId()
        const plan: Plan = { ...planData, id, createdAt: new Date().toISOString() }
        const template = speciesTemplates.find(t => t.id === planData.speciesTemplate)
        const start = template
          ? { blue: template.startBlue, white: template.startWhite, purple: template.startPurple, brightness: template.startBrightness }
          : { blue: 80, white: 10, purple: 10, brightness: 20 }
        const end = template
          ? { blue: template.endBlue, white: template.endWhite, purple: template.endPurple, brightness: template.endBrightness }
          : { blue: 50, white: 30, purple: 20, brightness: 70 }
        const newSchedules = generateSchedules(id, planData.totalDays, start, end)
        set(state => ({
          plans: [...state.plans, plan],
          schedules: [...state.schedules, ...newSchedules],
          activePlanId: id,
        }))
        return id
      },

      deletePlan: (id) => set(state => ({
        plans: state.plans.filter(p => p.id !== id),
        schedules: state.schedules.filter(s => s.planId !== id),
        observations: state.observations.filter(o => o.planId !== id),
        activePlanId: state.activePlanId === id ? null : state.activePlanId,
      })),

      updateSchedule: (planId, dayIndex, updates) => set(state => ({
        schedules: state.schedules.map(s =>
          s.planId === planId && s.dayIndex === dayIndex
            ? { ...s, ...updates }
            : s
        ),
      })),

      applyTemplate: (planId, templateId) => {
        const template = speciesTemplates.find(t => t.id === templateId)
        if (!template) return
        const plan = get().plans.find(p => p.id === planId)
        if (!plan) return
        const newSchedules = generateSchedules(
          planId,
          plan.totalDays,
          { blue: template.startBlue, white: template.startWhite, purple: template.startPurple, brightness: template.startBrightness },
          { blue: template.endBlue, white: template.endWhite, purple: template.endPurple, brightness: template.endBrightness }
        )
        set(state => ({
          schedules: [...state.schedules.filter(s => s.planId !== planId), ...newSchedules],
        }))
      },

      addObservation: (obs) => {
        const existing = get().observations.find(
          o => o.planId === obs.planId && o.dayIndex === obs.dayIndex
        )
        if (existing) {
          set(state => ({
            observations: state.observations.map(o =>
              o.id === existing.id
                ? { ...o, ...obs, recordedAt: new Date().toISOString() }
                : o
            ),
          }))
        } else {
          const newObs: Observation = { ...obs, id: genId(), recordedAt: new Date().toISOString() }
          set(state => ({ observations: [...state.observations, newObs] }))
        }
      },

      updateObservation: (id, updates) => set(state => ({
        observations: state.observations.map(o =>
          o.id === id ? { ...o, ...updates } : o
        ),
      })),

      deleteObservation: (id) => set(state => ({
        observations: state.observations.filter(o => o.id !== id),
      })),

      applySuggestion: (planId, dayIndex, updates) => set(state => ({
        schedules: state.schedules.map(s =>
          s.planId === planId && s.dayIndex === dayIndex
            ? { ...s, ...updates }
            : s
        ),
      })),
    }),
    { name: 'jellyfish-light-acclimation' }
  )
)
