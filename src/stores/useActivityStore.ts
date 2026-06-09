import { create } from 'zustand'
import type { Activity, Participation } from '@/types'
import { mockActivities, mockParticipations } from '@/data/mockData'

interface ActivityState {
  activities: Activity[]
  participations: Participation[]
  addActivity: (activity: Activity) => void
  joinActivity: (participation: Participation) => void
  recordResult: (participationId: string, data: Partial<Participation>) => void
  completeActivity: (activityId: string) => void
  getActivity: (id: string) => Activity | undefined
  getActivityParticipations: (activityId: string) => Participation[]
  getUpcomingActivities: () => Activity[]
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: mockActivities,
  participations: mockParticipations,
  addActivity: (activity) => set(s => ({ activities: [...s.activities, activity] })),
  joinActivity: (participation) => set(s => ({ participations: [...s.participations, participation] })),
  recordResult: (participationId, data) =>
    set(s => ({
      participations: s.participations.map(p =>
        p.id === participationId ? { ...p, ...data } : p
      ),
    })),
  completeActivity: (activityId) =>
    set(s => ({
      activities: s.activities.map(a =>
        a.id === activityId ? { ...a, status: 'completed' as const } : a
      ),
    })),
  getActivity: (id) => get().activities.find(a => a.id === id),
  getActivityParticipations: (activityId) =>
    get().participations.filter(p => p.activityId === activityId),
  getUpcomingActivities: () => {
    const now = new Date()
    return get()
      .activities.filter(a => a.status === 'upcoming' && new Date(a.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  },
}))
