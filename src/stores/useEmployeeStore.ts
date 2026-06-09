import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Employee, CreditRecord, CreditType } from '@/types'
import { mockEmployees, mockCreditRecords } from '@/utils/mockData'

interface EmployeeStore {
  employees: Employee[]
  creditRecords: CreditRecord[]
  currentEmployeeId: string
  setCurrentEmployee: (id: string) => void
  addCreditRecord: (employeeId: string, type: CreditType, routeId: string, reason: string, points: number) => void
  getCurrentEmployee: () => Employee | undefined
  getCreditRecordsByEmployee: (employeeId: string) => CreditRecord[]
  getMonthlyNoShows: (year: number, month: number) => CreditRecord[]
  getMonthlyLateCancels: (year: number, month: number) => CreditRecord[]
  isEmployeeBanned: (employeeId: string) => boolean
  checkAndApplyBan: (employeeId: string) => void
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: mockEmployees,
      creditRecords: mockCreditRecords,
      currentEmployeeId: 'e1',

      setCurrentEmployee: (id) => set({ currentEmployeeId: id }),

      addCreditRecord: (employeeId, type, routeId, reason, points) => {
        const record: CreditRecord = {
          id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          employeeId,
          type,
          routeId,
          reason,
          points,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          creditRecords: [...s.creditRecords, record],
          employees: s.employees.map((e) =>
            e.id === employeeId ? { ...e, creditScore: e.creditScore + points } : e
          ),
        }))
        get().checkAndApplyBan(employeeId)
      },

      getCurrentEmployee: () =>
        get().employees.find((e) => e.id === get().currentEmployeeId),

      getCreditRecordsByEmployee: (employeeId) =>
        get().creditRecords.filter((r) => r.employeeId === employeeId),

      getMonthlyNoShows: (year, month) =>
        get().creditRecords.filter((r) => {
          const d = new Date(r.createdAt)
          return r.type === 'no_show' && d.getFullYear() === year && d.getMonth() + 1 === month
        }),

      getMonthlyLateCancels: (year, month) =>
        get().creditRecords.filter((r) => {
          const d = new Date(r.createdAt)
          return r.type === 'late_cancel' && d.getFullYear() === year && d.getMonth() + 1 === month
        }),

      isEmployeeBanned: (employeeId) => {
        const emp = get().employees.find((e) => e.id === employeeId)
        if (!emp || !emp.isBanned) return false
        if (emp.banEndDate && new Date(emp.banEndDate) < new Date()) {
          set((s) => ({
            employees: s.employees.map((e) =>
              e.id === employeeId ? { ...e, isBanned: false, banEndDate: undefined, creditScore: 0 } : e
            ),
          }))
          return false
        }
        return true
      },

      checkAndApplyBan: (employeeId) => {
        const emp = get().employees.find((e) => e.id === employeeId)
        if (!emp) return
        if (emp.creditScore >= 5 && !emp.isBanned) {
          const banEndDate = new Date()
          banEndDate.setDate(banEndDate.getDate() + 7)
          set((s) => ({
            employees: s.employees.map((e) =>
              e.id === employeeId
                ? { ...e, isBanned: true, banEndDate: banEndDate.toISOString().split('T')[0] }
                : e
            ),
          }))
        }
      },
    }),
    { name: 'shuttle-employees' }
  )
)
