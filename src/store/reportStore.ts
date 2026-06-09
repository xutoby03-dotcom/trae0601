import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ClutterReport, ReportStatus } from '../types'
import { calculateFireRisk, generateGroupKey, getGentleReminder } from '../types'

interface ReportStore {
  reports: ClutterReport[]
  addReport: (report: Omit<ClutterReport, 'id' | 'fireRisk' | 'createdAt' | 'recurrenceCount' | 'recurrenceGroupKey' | 'gentleReminder' | 'status'>) => string
  claimReport: (id: string, claimedBy: string, claimPhone: string, expectedCleanupTime: string) => void
  updateStatus: (id: string, status: ReportStatus, note?: string) => void
  getRecurrenceCount: (groupKey: string) => number
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],

      addReport: (report) => {
        const id = `RPT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const groupKey = generateGroupKey(report.building, report.floor, report.occupyLocation)
        const existingCount = get().reports.filter(r => r.recurrenceGroupKey === groupKey).length
        const recurrenceCount = existingCount
        const fireRisk = calculateFireRisk(report.itemType, report.occupyLocation, report.blocksPassage)
        const gentleReminder = getGentleReminder(report.itemType, report.occupyLocation, report.blocksPassage, recurrenceCount)

        const newReport: ClutterReport = {
          ...report,
          id,
          fireRisk,
          status: '待处理',
          createdAt: new Date().toISOString(),
          recurrenceCount,
          recurrenceGroupKey: groupKey,
          gentleReminder,
        }

        set((state) => ({ reports: [newReport, ...state.reports] }))
        return id
      },

      claimReport: (id, claimedBy, claimPhone, expectedCleanupTime) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id
              ? { ...r, status: '已认领' as ReportStatus, claimedBy, claimPhone, expectedCleanupTime }
              : r
          ),
        }))
      },

      updateStatus: (id, status, note) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  propertyNote: note ?? r.propertyNote,
                  resolvedAt: status === '已清理' ? new Date().toISOString() : r.resolvedAt,
                }
              : r
          ),
        }))
      },

      getRecurrenceCount: (groupKey) => {
        return get().reports.filter(r => r.recurrenceGroupKey === groupKey).length
      },
    }),
    {
      name: 'hallway-clutter-reports',
    }
  )
)
