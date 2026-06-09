import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Purifier, FilterConfig, ReplacementRecord, WaterQualityLog, FilterWithStatus, FilterStatus } from '@/types'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'

interface AppState {
  purifiers: Purifier[]
  filterConfigs: FilterConfig[]
  replacements: ReplacementRecord[]
  waterQualityLogs: WaterQualityLog[]

  addPurifier: (p: Omit<Purifier, 'id'>) => string
  updatePurifier: (id: string, p: Partial<Purifier>) => void
  deletePurifier: (id: string) => void

  addFilterConfig: (f: Omit<FilterConfig, 'id'>) => string
  updateFilterConfig: (id: string, f: Partial<FilterConfig>) => void
  deleteFilterConfig: (id: string) => void

  addReplacement: (r: Omit<ReplacementRecord, 'id'>) => void
  deleteReplacement: (id: string) => void

  addWaterQualityLog: (log: Omit<WaterQualityLog, 'id'>) => void
  deleteWaterQualityLog: (id: string) => void

  getFiltersWithStatus: () => FilterWithStatus[]
  getWaterQualityAlert: () => { hasAlert: boolean; message: string }
}

let counter = 0
function uid() {
  counter += 1
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 9)}`
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      purifiers: [],
      filterConfigs: [],
      replacements: [],
      waterQualityLogs: [],

      addPurifier: (p) => {
        const id = uid()
        set((s) => ({ purifiers: [...s.purifiers, { ...p, id }] }))
        return id
      },
      updatePurifier: (id, p) => {
        set((s) => ({
          purifiers: s.purifiers.map((x) => (x.id === id ? { ...x, ...p } : x)),
        }))
      },
      deletePurifier: (id) => {
        set((s) => ({
          purifiers: s.purifiers.filter((x) => x.id !== id),
          filterConfigs: s.filterConfigs.filter((f) => f.purifierId !== id),
          replacements: s.replacements.filter((r) => r.purifierId !== id),
          waterQualityLogs: s.waterQualityLogs.filter((l) => l.purifierId !== id),
        }))
      },

      addFilterConfig: (f) => {
        const id = uid()
        set((s) => ({ filterConfigs: [...s.filterConfigs, { ...f, id }] }))
        return id
      },
      updateFilterConfig: (id, f) => {
        set((s) => ({
          filterConfigs: s.filterConfigs.map((x) => (x.id === id ? { ...x, ...f } : x)),
        }))
      },
      deleteFilterConfig: (id) => {
        set((s) => ({
          filterConfigs: s.filterConfigs.filter((x) => x.id !== id),
          replacements: s.replacements.filter((r) => r.filterConfigId !== id),
        }))
      },

      addReplacement: (r) => {
        set((s) => ({
          replacements: [...s.replacements, { ...r, id: uid() }],
        }))
      },
      deleteReplacement: (id) => {
        set((s) => ({
          replacements: s.replacements.filter((x) => x.id !== id),
        }))
      },

      addWaterQualityLog: (log) => {
        set((s) => ({
          waterQualityLogs: [...s.waterQualityLogs, { ...log, id: uid() }],
        }))
      },
      deleteWaterQualityLog: (id) => {
        set((s) => ({
          waterQualityLogs: s.waterQualityLogs.filter((x) => x.id !== id),
        }))
      },

      getFiltersWithStatus: () => {
        const { purifiers, filterConfigs, replacements } = get()
        const today = startOfDay(new Date())

        return filterConfigs.map((fc) => {
          const purifier = purifiers.find((p) => p.id === fc.purifierId)!
          const relatedReplacements = replacements
            .filter((r) => r.filterConfigId === fc.id)
            .sort((a, b) => b.replaceDate.localeCompare(a.replaceDate))

          const lastReplaceDate = relatedReplacements.length > 0 ? relatedReplacements[0].replaceDate : null
          const startDate = lastReplaceDate || purifier.installDate
          const daysUsed = differenceInDays(today, parseISO(startDate))
          const remainingDays = fc.suggestedLifespanDays - daysUsed
          const remainingPercent = Math.max(0, Math.min(100, Math.round((remainingDays / fc.suggestedLifespanDays) * 100)))

          let status: FilterStatus = 'normal'
          if (remainingDays <= 0) status = 'expired'
          else if (remainingDays <= 15) status = 'warning'

          return {
            ...fc,
            purifier,
            remainingDays,
            remainingPercent,
            status,
            lastReplaceDate,
          }
        })
      },

      getWaterQualityAlert: () => {
        const { waterQualityLogs, purifiers } = get()
        if (purifiers.length === 0) return { hasAlert: false, message: '' }

        const recentLogs = [...waterQualityLogs]
          .sort((a, b) => b.logDate.localeCompare(a.logDate))
          .slice(0, 3)

        if (recentLogs.length < 3) return { hasAlert: false, message: '' }

        const flowDecreasing =
          recentLogs[0].flowRate < recentLogs[1].flowRate &&
          recentLogs[1].flowRate < recentLogs[2].flowRate

        const tdsIncreasing =
          recentLogs[0].tdsValue > recentLogs[1].tdsValue &&
          recentLogs[1].tdsValue > recentLogs[2].tdsValue

        const odorWorsening =
          recentLogs[0].odorLevel === 'obvious' &&
          (recentLogs[1].odorLevel === 'mild' || recentLogs[1].odorLevel === 'obvious')

        if (flowDecreasing || tdsIncreasing || odorWorsening) {
          const reasons: string[] = []
          if (flowDecreasing) reasons.push('出水速度连续下降')
          if (tdsIncreasing) reasons.push('TDS 数值连续上升')
          if (odorWorsening) reasons.push('异味反馈持续恶化')

          return {
            hasAlert: true,
            message: `检测到${reasons.join('、')}，可能不仅仅是滤芯到期，建议检查净水器整体状况`,
          }
        }

        return { hasAlert: false, message: '' }
      },
    }),
    {
      name: 'filter-manager-storage',
    }
  )
)
