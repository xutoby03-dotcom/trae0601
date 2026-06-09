import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Report, ReportStatus } from '@/types'
import { mockReports } from '@/data/mockData'
import { setPrinterStatusIfHigher, recalculatePrinterStatus } from '@/utils/statusSync'

interface ReportStore {
  reports: Report[]
  addReport: (report: Report) => string
  updateReportStatus: (id: string, status: ReportStatus) => void
  mergeReport: (targetId: string, sourceId: string) => void
  closeReport: (id: string) => void
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: mockReports,
      addReport: (report) => {
        const existing = get().reports.find(
          (r) =>
            r.printerId === report.printerId &&
            r.type === report.type &&
            r.status !== 'closed'
        )
        if (existing) {
          set((state) => ({
            reports: state.reports.map((r) =>
              r.id === existing.id
                ? {
                    ...r,
                    mergedCount: r.mergedCount + 1,
                    mergedFrom: [...r.mergedFrom, report.id],
                  }
                : r
            ),
          }))
          setPrinterStatusIfHigher(report.printerId, 'fault')
          return existing.id
        }
        set((state) => ({ reports: [...state.reports, report] }))
        setPrinterStatusIfHigher(report.printerId, 'fault')
        return report.id
      },
      updateReportStatus: (id, status) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        })),
      mergeReport: (targetId, sourceId) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === targetId
              ? {
                  ...r,
                  mergedCount: r.mergedCount + 1,
                  mergedFrom: [...r.mergedFrom, sourceId],
                }
              : r
          ),
        })),
      closeReport: (id) =>
        set((state) => {
          const report = state.reports.find((r) => r.id === id)
          const updated = state.reports.map((r) =>
            r.id === id ? { ...r, status: 'closed' as const } : r
          )
          if (report) {
            setTimeout(() => recalculatePrinterStatus(report.printerId), 0)
          }
          return { reports: updated }
        }),
    }),
    { name: 'report-store' }
  )
)
