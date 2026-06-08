import { create } from 'zustand'
import { api, type Activity, type CreateActivityPayload, type RegisterPayload, type HistoryStats, type ActivityTypeStat } from '@/utils/api'

interface ActivityState {
  activities: Activity[]
  currentActivity: Activity | null
  historyStats: HistoryStats | null
  activityTypeStats: ActivityTypeStat[]
  loading: boolean
  error: string | null

  fetchActivities: (status?: string) => Promise<void>
  fetchActivity: (id: string) => Promise<void>
  createActivity: (data: CreateActivityPayload) => Promise<Activity>
  updateActivity: (id: string, data: Partial<CreateActivityPayload>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  register: (activityId: string, data: RegisterPayload) => Promise<void>
  cancelRegistration: (registrationId: string) => Promise<void>
  checkinRegistration: (registrationId: string) => Promise<void>
  fetchHistoryStats: () => Promise<void>
  fetchActivityTypeStats: () => Promise<void>
  clearError: () => void
  clearCurrentActivity: () => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  currentActivity: null,
  historyStats: null,
  activityTypeStats: [],
  loading: false,
  error: null,

  fetchActivities: async (status?: string) => {
    set({ loading: true, error: null })
    try {
      const activities = await api.getActivities(status)
      set({ activities, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
    }
  },

  fetchActivity: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const activity = await api.getActivity(id)
      set({ currentActivity: activity, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
    }
  },

  createActivity: async (data: CreateActivityPayload) => {
    set({ loading: true, error: null })
    try {
      const activity = await api.createActivity(data)
      set((state) => ({
        activities: [...state.activities, activity],
        loading: false,
      }))
      return activity
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
      throw e
    }
  },

  updateActivity: async (id: string, data: Partial<CreateActivityPayload>) => {
    set({ loading: true, error: null })
    try {
      const updated = await api.updateActivity(id, data)
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? updated : a)),
        currentActivity: state.currentActivity?.id === id ? updated : state.currentActivity,
        loading: false,
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
    }
  },

  deleteActivity: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await api.deleteActivity(id)
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
        loading: false,
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
    }
  },

  register: async (activityId: string, data: RegisterPayload) => {
    set({ loading: true, error: null })
    try {
      await api.register(activityId, data)
      await api.getActivity(activityId).then((activity) => {
        set((state) => ({
          currentActivity: activity,
          loading: false,
        }))
      })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
    }
  },

  cancelRegistration: async (registrationId: string) => {
    set({ error: null })
    try {
      await api.cancelRegistration(registrationId)
      if (useActivityStore.getState().currentActivity) {
        const activity = await api.getActivity(useActivityStore.getState().currentActivity!.id)
        set({ currentActivity: activity })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    }
  },

  checkinRegistration: async (registrationId: string) => {
    set({ error: null })
    try {
      await api.checkinRegistration(registrationId)
      if (useActivityStore.getState().currentActivity) {
        const activity = await api.getActivity(useActivityStore.getState().currentActivity!.id)
        set({ currentActivity: activity })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    }
  },

  fetchHistoryStats: async () => {
    set({ loading: true, error: null })
    try {
      const historyStats = await api.getHistoryStats()
      set({ historyStats, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
    }
  },

  fetchActivityTypeStats: async () => {
    set({ error: null })
    try {
      const activityTypeStats = await api.getActivityTypeStats()
      set({ activityTypeStats })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentActivity: () => set({ currentActivity: null }),
}))
