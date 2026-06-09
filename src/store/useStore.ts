import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Job, Shift, LeaveSwap } from '@/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

const now = new Date()
const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

const SEED_JOBS: Job[] = [
  { id: 'job1', name: '星巴克咖啡师', hourlyRate: 28, settlementCycle: 'daily', contact: '王经理', location: '中关村星巴克', color: '#F97316', createdAt: thisMonth },
  { id: 'job2', name: '高中数学家教', hourlyRate: 120, settlementCycle: 'weekly', contact: '李妈妈', location: '海淀区学生家', color: '#22C55E', createdAt: thisMonth },
  { id: 'job3', name: '展会活动协助', hourlyRate: 35, settlementCycle: 'monthly', contact: '张主管', location: '国展中心', color: '#3B82F6', createdAt: thisMonth },
]

const SEED_SHIFTS: Shift[] = [
  { id: 'shift1', jobId: 'job1', startTime: today + 8 * 3600000, endTime: today + 14 * 3600000, isOvertime: false, transportFee: 6, mealAllowance: 15, lateDeduction: 0, status: 'settled', commuteMinutes: 35, createdAt: thisMonth },
  { id: 'shift2', jobId: 'job2', startTime: today + 15 * 3600000, endTime: today + 17 * 3600000, isOvertime: false, transportFee: 8, mealAllowance: 0, lateDeduction: 0, status: 'pending', commuteMinutes: 45, createdAt: thisMonth },
  { id: 'shift3', jobId: 'job1', startTime: today + (1 * 86400000) + 8 * 3600000, endTime: today + (1 * 86400000) + 16 * 3600000, isOvertime: true, transportFee: 6, mealAllowance: 15, lateDeduction: 0, status: 'pending', commuteMinutes: 35, createdAt: thisMonth },
  { id: 'shift4', jobId: 'job3', startTime: today + (2 * 86400000) + 9 * 3600000, endTime: today + (2 * 86400000) + 18 * 3600000, isOvertime: false, transportFee: 12, mealAllowance: 30, lateDeduction: 20, status: 'settled', commuteMinutes: 60, createdAt: thisMonth },
  { id: 'shift5', jobId: 'job2', startTime: today + (3 * 86400000) + 14 * 3600000, endTime: today + (3 * 86400000) + 16 * 3600000, isOvertime: false, transportFee: 8, mealAllowance: 0, lateDeduction: 0, status: 'pending', commuteMinutes: 45, createdAt: thisMonth },
  { id: 'shift6', jobId: 'job1', startTime: today + (4 * 86400000) + 7 * 3600000, endTime: today + (4 * 86400000) + 15 * 3600000, isOvertime: false, transportFee: 6, mealAllowance: 15, lateDeduction: 10, status: 'settled', commuteMinutes: 35, createdAt: thisMonth },
  { id: 'shift7', jobId: 'job3', startTime: today - (2 * 86400000) + 9 * 3600000, endTime: today - (2 * 86400000) + 17 * 3600000, isOvertime: false, transportFee: 12, mealAllowance: 30, lateDeduction: 0, status: 'settled', commuteMinutes: 60, createdAt: thisMonth },
  { id: 'shift8', jobId: 'job2', startTime: today - (5 * 86400000) + 14 * 3600000, endTime: today - (5 * 86400000) + 16.5 * 3600000, isOvertime: false, transportFee: 8, mealAllowance: 0, lateDeduction: 0, status: 'settled', commuteMinutes: 45, createdAt: thisMonth },
]

const SEED_LEAVE_SWAPS: LeaveSwap[] = [
  { id: 'ls1', shiftId: 'shift7', jobId: 'job3', type: 'leave', substituteName: '', note: '身体不舒服请假', createdAt: thisMonth },
  { id: 'ls2', shiftId: 'shift8', jobId: 'job2', type: 'swap', substituteName: '赵同学', note: '有事换班', createdAt: thisMonth },
]

interface AppState {
  jobs: Job[]
  shifts: Shift[]
  leaveSwaps: LeaveSwap[]

  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => void
  updateJob: (id: string, job: Partial<Omit<Job, 'id' | 'createdAt'>>) => void
  deleteJob: (id: string) => void

  addShift: (shift: Omit<Shift, 'id' | 'createdAt'>) => void
  updateShift: (id: string, shift: Partial<Omit<Shift, 'id' | 'createdAt'>>) => void
  deleteShift: (id: string) => void
  markShiftSettled: (id: string) => void
  markShiftPending: (id: string) => void

  addLeaveSwap: (leaveSwap: Omit<LeaveSwap, 'id' | 'createdAt'>) => void
  updateLeaveSwap: (id: string, leaveSwap: Partial<Omit<LeaveSwap, 'id' | 'createdAt'>>) => void
  deleteLeaveSwap: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      jobs: SEED_JOBS,
      shifts: SEED_SHIFTS,
      leaveSwaps: SEED_LEAVE_SWAPS,

      addJob: (job) =>
        set((state) => ({
          jobs: [...state.jobs, { ...job, id: generateId(), createdAt: Date.now() }],
        })),

      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        })),

      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
          shifts: state.shifts.filter((s) => s.jobId !== id),
          leaveSwaps: state.leaveSwaps.filter((l) => l.jobId !== id),
        })),

      addShift: (shift) =>
        set((state) => ({
          shifts: [...state.shifts, { ...shift, id: generateId(), createdAt: Date.now() }],
        })),

      updateShift: (id, updates) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      deleteShift: (id) =>
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== id),
          leaveSwaps: state.leaveSwaps.filter((l) => l.shiftId !== id),
        })),

      markShiftSettled: (id) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, status: 'settled' as const } : s)),
        })),

      markShiftPending: (id) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, status: 'pending' as const } : s)),
        })),

      addLeaveSwap: (leaveSwap) =>
        set((state) => ({
          leaveSwaps: [...state.leaveSwaps, { ...leaveSwap, id: generateId(), createdAt: Date.now() }],
        })),

      updateLeaveSwap: (id, updates) =>
        set((state) => ({
          leaveSwaps: state.leaveSwaps.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      deleteLeaveSwap: (id) =>
        set((state) => ({
          leaveSwaps: state.leaveSwaps.filter((l) => l.id !== id),
        })),
    }),
    {
      name: 'part-time-scheduler-storage',
    }
  )
)
