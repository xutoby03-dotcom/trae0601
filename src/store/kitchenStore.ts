import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Member {
  id: string
  name: string
  avatar: string
  color: string
}

export interface Task {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  estimatedMinutes: number
  difficulty: 1 | 2 | 3 | 4 | 5
  rotationType: 'rotate' | 'fixed' | 'auto-assign'
  assignedMemberId: string
  nextDueDate: string
  isCompleted: boolean
  stickerColor: string
  rotationOrder: string[]
  createdAt: string
}

export interface CompletionRecord {
  id: string
  taskId: string
  memberId: string
  completedAt: string
  beforePhoto: string
  afterPhoto: string
  note: string
}

const STICKER_COLORS = ['sticker-yellow', 'sticker-green', 'sticker-pink', 'sticker-blue', 'sticker-orange', 'sticker-purple']

const AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👶', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦳']

const MEMBER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: '小明', avatar: '🧑', color: '#EF4444' },
  { id: 'm2', name: '小红', avatar: '👩', color: '#3B82F6' },
  { id: 'm3', name: '小华', avatar: '👨', color: '#10B981' },
]

function getRandomStickerColor(): string {
  return STICKER_COLORS[Math.floor(Math.random() * STICKER_COLORS.length)]
}

function getNextDueDate(frequency: Task['frequency'], fromDate?: Date): string {
  const date = fromDate ? new Date(fromDate) : new Date()
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
  }
  return date.toISOString().split('T')[0]
}

function isOverdue(task: Task): boolean {
  if (task.isCompleted) return false
  const due = new Date(task.nextDueDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return due < now
}

function isDueSoon(task: Task): boolean {
  if (task.isCompleted) return false
  const due = new Date(task.nextDueDate)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours > 0 && diffHours <= 24
}

function isDueToday(task: Task): boolean {
  const due = new Date(task.nextDueDate)
  const now = new Date()
  return due.toDateString() === now.toDateString()
}

function isDueThisWeek(task: Task): boolean {
  if (task.isCompleted) return false
  const due = new Date(task.nextDueDate)
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()))
  weekEnd.setHours(23, 59, 59, 999)
  return due <= weekEnd
}

function isDueThisMonth(task: Task): boolean {
  if (task.isCompleted) return false
  const due = new Date(task.nextDueDate)
  const now = new Date()
  return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
}

interface KitchenStore {
  members: Member[]
  tasks: Task[]
  completionRecords: CompletionRecord[]

  addMember: (name: string) => void
  removeMember: (id: string) => void
  updateMember: (id: string, updates: Partial<Member>) => void

  addTask: (task: Omit<Task, 'id' | 'isCompleted' | 'createdAt' | 'stickerColor'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (record: Omit<CompletionRecord, 'id' | 'completedAt'>) => void
  resetTask: (taskId: string) => void

  getTasksByPeriod: (period: 'today' | 'week' | 'month') => Task[]
  getOverdueTasks: () => Task[]
  getDueSoonTasks: () => Task[]
  getTaskUrgency: (task: Task) => 'overdue' | 'soon' | 'normal' | 'completed'
  getMemberById: (id: string) => Member | undefined
  getMemberStats: () => { memberId: string; name: string; avatar: string; color: string; completedCount: number }[]
  getDelayedTasks: () => { task: Task; delayDays: number }[]
  getKitchenHealthScore: () => number
  getWeeklySchedule: () => { day: string; tasks: Task[] }[]
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const DEFAULT_TASKS: Task[] = [
  {
    id: 't_demo_1',
    name: '擦灶台',
    frequency: 'daily',
    estimatedMinutes: 10,
    difficulty: 2,
    rotationType: 'rotate',
    assignedMemberId: 'm1',
    nextDueDate: getToday(),
    isCompleted: false,
    stickerColor: 'sticker-yellow',
    rotationOrder: ['m1', 'm2', 'm3'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't_demo_2',
    name: '洗油烟机滤网',
    frequency: 'weekly',
    estimatedMinutes: 30,
    difficulty: 4,
    rotationType: 'rotate',
    assignedMemberId: 'm2',
    nextDueDate: getDaysFromNow(2),
    isCompleted: false,
    stickerColor: 'sticker-green',
    rotationOrder: ['m1', 'm2', 'm3'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't_demo_3',
    name: '清冰箱',
    frequency: 'monthly',
    estimatedMinutes: 45,
    difficulty: 3,
    rotationType: 'fixed',
    assignedMemberId: 'm3',
    nextDueDate: getDaysFromNow(5),
    isCompleted: false,
    stickerColor: 'sticker-pink',
    rotationOrder: ['m3'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't_demo_4',
    name: '倒厨余',
    frequency: 'daily',
    estimatedMinutes: 5,
    difficulty: 1,
    rotationType: 'rotate',
    assignedMemberId: 'm3',
    nextDueDate: getToday(),
    isCompleted: false,
    stickerColor: 'sticker-blue',
    rotationOrder: ['m3', 'm1', 'm2'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't_demo_5',
    name: '拖地',
    frequency: 'weekly',
    estimatedMinutes: 20,
    difficulty: 3,
    rotationType: 'auto-assign',
    assignedMemberId: 'm1',
    nextDueDate: getDaysFromNow(3),
    isCompleted: false,
    stickerColor: 'sticker-orange',
    rotationOrder: ['m1', 'm2', 'm3'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't_demo_6',
    name: '洗碗池消毒',
    frequency: 'biweekly',
    estimatedMinutes: 15,
    difficulty: 2,
    rotationType: 'rotate',
    assignedMemberId: 'm2',
    nextDueDate: getDaysFromNow(-1),
    isCompleted: false,
    stickerColor: 'sticker-purple',
    rotationOrder: ['m1', 'm2', 'm3'],
    createdAt: new Date().toISOString(),
  },
]

export const useKitchenStore = create<KitchenStore>()(
  persist(
    (set, get) => ({
      members: DEFAULT_MEMBERS,
      tasks: DEFAULT_TASKS,
      completionRecords: [],

      addMember: (name: string) => {
        const id = 'm_' + Date.now()
        const avatarIndex = get().members.length % AVATARS.length
        const colorIndex = get().members.length % MEMBER_COLORS.length
        const member: Member = {
          id,
          name,
          avatar: AVATARS[avatarIndex],
          color: MEMBER_COLORS[colorIndex],
        }
        set((state) => ({ members: [...state.members, member] }))
      },

      removeMember: (id: string) => {
        set((state) => ({ members: state.members.filter((m) => m.id !== id) }))
      },

      updateMember: (id: string, updates: Partial<Member>) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }))
      },

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          isCompleted: false,
          createdAt: new Date().toISOString(),
          stickerColor: getRandomStickerColor(),
        }
        if (!task.nextDueDate) {
          task.nextDueDate = getNextDueDate(task.frequency)
        }
        set((state) => ({ tasks: [...state.tasks, task] }))
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          completionRecords: state.completionRecords.filter((r) => r.taskId !== id),
        }))
      },

      completeTask: (record) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === record.taskId)
        if (!task) return

        const completionRecord: CompletionRecord = {
          ...record,
          id: 'cr_' + Date.now(),
          completedAt: new Date().toISOString(),
        }

        const updatedTask = { ...task, isCompleted: true }

        if (task.rotationType === 'rotate') {
          const currentIndex = task.rotationOrder.indexOf(task.assignedMemberId)
          const nextIndex = (currentIndex + 1) % task.rotationOrder.length
          updatedTask.assignedMemberId = task.rotationOrder[nextIndex]
          updatedTask.nextDueDate = getNextDueDate(task.frequency)
          updatedTask.isCompleted = false
        } else if (task.rotationType === 'auto-assign') {
          const memberStats = state.completionRecords.reduce<Record<string, number>>((acc, r) => {
            acc[r.memberId] = (acc[r.memberId] || 0) + 1
            return acc
          }, {})
          const sortedMembers = [...state.members].sort(
            (a, b) => (memberStats[a.id] || 0) - (memberStats[b.id] || 0)
          )
          if (sortedMembers.length > 0) {
            updatedTask.assignedMemberId = sortedMembers[0].id
          }
          updatedTask.nextDueDate = getNextDueDate(task.frequency)
          updatedTask.isCompleted = false
        } else {
          updatedTask.nextDueDate = getNextDueDate(task.frequency)
          updatedTask.isCompleted = false
        }

        set((state) => ({
          completionRecords: [...state.completionRecords, completionRecord],
          tasks: state.tasks.map((t) => (t.id === record.taskId ? updatedTask : t)),
        }))
      },

      resetTask: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, isCompleted: false } : t
          ),
        }))
      },

      getTasksByPeriod: (period) => {
        const tasks = get().tasks
        switch (period) {
          case 'today':
            return tasks.filter((t) => isDueToday(t) || isOverdue(t))
          case 'week':
            return tasks.filter((t) => isDueThisWeek(t) || isOverdue(t))
          case 'month':
            return tasks.filter((t) => isDueThisMonth(t) || isOverdue(t))
        }
      },

      getOverdueTasks: () => get().tasks.filter(isOverdue),

      getDueSoonTasks: () => get().tasks.filter(isDueSoon),

      getTaskUrgency: (task: Task) => {
        if (task.isCompleted) return 'completed'
        if (isOverdue(task)) return 'overdue'
        if (isDueSoon(task)) return 'soon'
        return 'normal'
      },

      getMemberById: (id: string) => get().members.find((m) => m.id === id),

      getMemberStats: () => {
        const state = get()
        return state.members.map((m) => ({
          memberId: m.id,
          name: m.name,
          avatar: m.avatar,
          color: m.color,
          completedCount: state.completionRecords.filter((r) => r.memberId === m.id).length,
        })).sort((a, b) => b.completedCount - a.completedCount)
      },

      getDelayedTasks: () => {
        const state = get()
        const delayed = state.completionRecords
          .filter((r) => {
            const task = state.tasks.find((t) => t.id === r.taskId)
            if (!task) return false
            const completedDate = new Date(r.completedAt)
            const dueDate = new Date(task.nextDueDate)
            const recordsForTask = state.completionRecords.filter((cr) => cr.taskId === r.taskId)
            const thisRecordIndex = recordsForTask.indexOf(r)
            if (thisRecordIndex < recordsForTask.length - 1) {
              const prevRecord = recordsForTask[thisRecordIndex + 1]
              const prevDue = new Date(prevRecord.completedAt)
              prevDue.setDate(prevDue.getDate() - getFrequencyDays(task.frequency))
              dueDate.setTime(prevDue.getTime())
            }
            return completedDate > dueDate
          })
          .reduce<Record<string, number>>((acc, r) => {
            acc[r.taskId] = (acc[r.taskId] || 0) + 1
            return acc
          }, {})

        return Object.entries(delayed)
          .map(([taskId, count]) => {
            const task = state.tasks.find((t) => t.id === taskId)
            return task ? { task, delayDays: count } : null
          })
          .filter((x): x is { task: Task; delayDays: number } => x !== null)
          .sort((a, b) => b.delayDays - a.delayDays)
      },

      getKitchenHealthScore: () => {
        const state = get()
        if (state.tasks.length === 0) return 100

        const overdueCount = state.tasks.filter(isOverdue).length
        const dueSoonCount = state.tasks.filter(isDueSoon).length
        const completedRecent = state.completionRecords.filter((r) => {
          const completedAt = new Date(r.completedAt)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return completedAt >= weekAgo
        }).length

        const totalActive = state.tasks.filter((t) => !t.isCompleted).length
        const penalty = overdueCount * 15 + dueSoonCount * 5
        const bonus = Math.min(completedRecent * 2, 20)

        const score = Math.max(0, Math.min(100, 100 - penalty + bonus))
        return Math.round(score)
      },

      getWeeklySchedule: () => {
        const state = get()
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        const now = new Date()
        const currentDay = now.getDay()
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay

        return days.map((day, i) => {
          const date = new Date(now)
          date.setDate(now.getDate() + mondayOffset + i)
          const dateStr = date.toISOString().split('T')[0]

          const dayTasks = state.tasks.filter((t) => {
            const due = new Date(t.nextDueDate)
            return due.toISOString().split('T')[0] === dateStr || (t.frequency === 'daily' && !t.isCompleted)
          })

          return { day, tasks: dayTasks }
        })
      },
    }),
    {
      name: 'kitchen-clean-board',
    }
  )
)

function getFrequencyDays(frequency: Task['frequency']): number {
  switch (frequency) {
    case 'daily': return 1
    case 'weekly': return 7
    case 'biweekly': return 14
    case 'monthly': return 30
  }
}

export { isOverdue, isDueSoon, isDueToday, isDueThisWeek, isDueThisMonth, STICKER_COLORS, AVATARS, MEMBER_COLORS, getNextDueDate }
