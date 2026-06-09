import { create } from 'zustand'
import type { MonthlyStats } from '@/types'
import { useActivityStore } from './useActivityStore'
import { useRouteStore } from './useRouteStore'
import { useRunnerStore } from './useRunnerStore'

interface StatsState {
  getMonthlyStats: () => MonthlyStats
}

export const useStatsStore = create<StatsState>(() => ({
  getMonthlyStats: () => {
    const { activities, participations } = useActivityStore.getState()
    const { routes } = useRouteStore.getState()
    const { runners } = useRunnerStore.getState()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const completedActivities = activities.filter(
      a => a.status === 'completed' && new Date(a.startTime) >= monthStart
    )

    const completedParticipations = participations.filter(
      p => completedActivities.some(a => a.id === p.activityId) && p.completed
    )

    const totalDistance = completedParticipations.reduce((sum, p) => sum + p.actualDistance, 0)
    const totalDuration = completedParticipations.reduce((sum, p) => sum + p.actualDuration, 0)
    const averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0

    const routeCount: Record<string, number> = {}
    completedActivities.forEach(a => {
      routeCount[a.routeId] = (routeCount[a.routeId] || 0) + 1
    })
    const routeRanking = Object.entries(routeCount)
      .map(([routeId, count]) => {
        const route = routes.find(r => r.id === routeId)
        return { routeId, name: route?.name || '未知路线', count }
      })
      .sort((a, b) => b.count - a.count)

    const runnerCount: Record<string, number> = {}
    completedParticipations.forEach(p => {
      runnerCount[p.runnerId] = (runnerCount[p.runnerId] || 0) + 1
    })
    const partnerRanking = Object.entries(runnerCount)
      .map(([runnerId, attendCount]) => {
        const runner = runners.find(r => r.id === runnerId)
        return {
          runnerId,
          nickname: runner?.nickname || '未知跑者',
          avatar: runner?.avatar || '🏃',
          attendCount,
        }
      })
      .sort((a, b) => b.attendCount - a.attendCount)

    const weeksInMonth = 4
    const weeklyDistances = Array(weeksInMonth).fill(0)
    completedParticipations.forEach(p => {
      const act = completedActivities.find(a => a.id === p.activityId)
      if (act) {
        const weekIndex = Math.min(
          Math.floor((new Date(act.startTime).getDate() - 1) / 7),
          weeksInMonth - 1
        )
        weeklyDistances[weekIndex] += p.actualDistance
      }
    })

    return {
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalRuns: completedActivities.length,
      averagePace: Math.round(averagePace),
      routeRanking,
      partnerRanking,
      weeklyDistances,
    }
  },
}))
