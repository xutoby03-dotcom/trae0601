import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MeetingRoom, Ticket, TicketStatus, Urgency, PhotoItem } from '@/types'
import { normalizePhotos } from '@/types'

interface AppState {
  rooms: MeetingRoom[]
  tickets: Ticket[]

  addRoom: (room: MeetingRoom) => void
  updateRoom: (id: string, data: Partial<MeetingRoom>) => void
  deleteRoom: (id: string) => void

  addTicket: (ticket: Ticket) => void
  updateTicket: (id: string, data: Partial<Ticket>) => void
  deleteTicket: (id: string) => void

  acceptTicket: (id: string, assignee: string) => void
  resolveTicket: (id: string) => void
  moveToProcurement: (id: string) => void

  getTicketsByStatus: (status: TicketStatus) => Ticket[]
  getRoomById: (id: string) => MeetingRoom | undefined
  getAvailableRooms: (requiredEquipment?: string) => MeetingRoom[]
  getTicketsByRoom: (roomId: string) => Ticket[]
}

const mockRooms: MeetingRoom[] = [
  {
    id: 'room-1',
    name: '朝阳厅',
    floor: '3F',
    capacity: 12,
    equipment: ['投影仪', '麦克风', '白板', '视频会议终端'],
    responsiblePerson: '王建国',
    status: 'active',
  },
  {
    id: 'room-2',
    name: '星辰厅',
    floor: '3F',
    capacity: 8,
    equipment: ['投影仪', '白板', '翻页笔'],
    responsiblePerson: '李明',
    status: 'active',
  },
  {
    id: 'room-3',
    name: '云端厅',
    floor: '5F',
    capacity: 20,
    equipment: ['投影仪', '麦克风', '音响系统', '视频会议终端', '电子白板'],
    responsiblePerson: '张薇',
    status: 'maintenance',
  },
  {
    id: 'room-4',
    name: '碧海厅',
    floor: '5F',
    capacity: 6,
    equipment: ['显示屏', '白板', 'HDMI线缆'],
    responsiblePerson: '陈刚',
    status: 'active',
  },
  {
    id: 'room-5',
    name: '翠竹厅',
    floor: '7F',
    capacity: 16,
    equipment: ['投影仪', '麦克风', '音响系统', '视频会议终端', '白板', '空调'],
    responsiblePerson: '赵琳',
    status: 'active',
  },
  {
    id: 'room-6',
    name: '明德厅',
    floor: '2F',
    capacity: 10,
    equipment: ['投影仪', '麦克风', '白板'],
    responsiblePerson: '周伟',
    status: 'active',
  },
  {
    id: 'room-7',
    name: '致远厅',
    floor: '7F',
    capacity: 30,
    equipment: ['投影仪', '麦克风', '音响系统', '视频会议终端', '电子白板', '空调'],
    responsiblePerson: '孙丽',
    status: 'active',
  },
  {
    id: 'room-8',
    name: '博学厅',
    floor: '2F',
    capacity: 8,
    equipment: ['显示屏', 'HDMI线缆', '白板'],
    responsiblePerson: '吴强',
    status: 'active',
  },
]

const now = new Date()
const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000)

const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    roomId: 'room-1',
    equipmentType: '投影仪',
    faultDescription: '无法开机，按下电源键无反应，指示灯不亮',
    urgency: 'urgent',
    photos: [],
    affectedMeetingTime: hourFromNow.toISOString(),
    status: 'pending',
    createdAt: fiveHoursAgo.toISOString(),
    assignee: '',
    faultCause: '',
    solution: '',
    needVendor: false,
    estimatedRecovery: '',
    completedAt: '',
    reporter: '刘小明',
  },
  {
    id: 'ticket-2',
    roomId: 'room-3',
    equipmentType: '麦克风',
    faultDescription: '会议麦克风完全无声音，已尝试更换电池仍无效',
    urgency: 'high',
    photos: [],
    affectedMeetingTime: twoHoursFromNow.toISOString(),
    status: 'repairing',
    createdAt: oneDayAgo.toISOString(),
    assignee: '维修张工',
    faultCause: '麦克风主板电路损坏',
    solution: '',
    needVendor: false,
    estimatedRecovery: twoHoursFromNow.toISOString(),
    completedAt: '',
    reporter: '陈思远',
  },
  {
    id: 'ticket-3',
    roomId: 'room-2',
    equipmentType: '白板',
    faultDescription: '白板笔全部没墨，白板擦丢失',
    urgency: 'normal',
    photos: [],
    affectedMeetingTime: '',
    status: 'resolved',
    createdAt: threeDaysAgo.toISOString(),
    assignee: '维修李工',
    faultCause: '消耗品用尽未及时补充',
    solution: '已补充新白板笔3支和白板擦1个',
    needVendor: false,
    estimatedRecovery: '',
    completedAt: twoDaysAgo.toISOString(),
    reporter: '周婷',
  },
  {
    id: 'ticket-4',
    roomId: 'room-5',
    equipmentType: '视频会议终端',
    faultDescription: '摄像头画面黑屏，对方看不到我们',
    urgency: 'urgent',
    photos: [],
    affectedMeetingTime: hourFromNow.toISOString(),
    status: 'pending',
    createdAt: threeDaysAgo.toISOString(),
    assignee: '',
    faultCause: '',
    solution: '',
    needVendor: false,
    estimatedRecovery: '',
    completedAt: '',
    reporter: '赵经理',
  },
  {
    id: 'ticket-5',
    roomId: 'room-3',
    equipmentType: '音响系统',
    faultDescription: '音响系统喇叭损坏，播放有严重杂音',
    urgency: 'high',
    photos: [],
    affectedMeetingTime: '',
    status: 'procurement',
    createdAt: twoDaysAgo.toISOString(),
    assignee: '维修王工',
    faultCause: '喇叭单元烧毁',
    solution: '需要更换喇叭单元',
    needVendor: true,
    estimatedRecovery: '',
    completedAt: '',
    reporter: '孙副总',
  },
  {
    id: 'ticket-6',
    roomId: 'room-6',
    equipmentType: '投影仪',
    faultDescription: '投影画面模糊，调焦无效',
    urgency: 'high',
    photos: [],
    affectedMeetingTime: twoHoursFromNow.toISOString(),
    status: 'repairing',
    createdAt: oneDayAgo.toISOString(),
    assignee: '维修赵工',
    faultCause: '投影仪镜头老化',
    solution: '',
    needVendor: false,
    estimatedRecovery: twoHoursFromNow.toISOString(),
    completedAt: '',
    reporter: '钱晓晨',
  },
  {
    id: 'ticket-7',
    roomId: 'room-7',
    equipmentType: '空调',
    faultDescription: '空调无法启动，会议室温度过高',
    urgency: 'urgent',
    photos: [],
    affectedMeetingTime: hourFromNow.toISOString(),
    status: 'pending',
    createdAt: fiveHoursAgo.toISOString(),
    assignee: '',
    faultCause: '',
    solution: '',
    needVendor: false,
    estimatedRecovery: '',
    completedAt: '',
    reporter: '郑浩然',
  },
  {
    id: 'ticket-8',
    roomId: 'room-4',
    equipmentType: '显示屏',
    faultDescription: '显示屏花屏，颜色异常偏绿',
    urgency: 'normal',
    photos: [],
    affectedMeetingTime: '',
    status: 'resolved',
    createdAt: threeDaysAgo.toISOString(),
    assignee: '维修李工',
    faultCause: 'HDMI线缆接触不良',
    solution: '更换HDMI线缆，问题解决',
    needVendor: false,
    estimatedRecovery: '',
    completedAt: twoDaysAgo.toISOString(),
    reporter: '冯悦',
  },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      rooms: mockRooms,
      tickets: mockTickets,

      addRoom: (room) =>
        set((state) => ({ rooms: [...state.rooms, room] })),

      updateRoom: (id, data) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      deleteRoom: (id) =>
        set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) })),

      addTicket: (ticket) =>
        set((state) => ({ tickets: [...state.tickets, ticket] })),

      updateTicket: (id, data) =>
        set((state) => ({
          tickets: state.tickets.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTicket: (id) =>
        set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) })),

      acceptTicket: (id, assignee) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, status: 'repairing' as TicketStatus, assignee } : t
          ),
        })),

      resolveTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id
              ? { ...t, status: 'resolved' as TicketStatus, completedAt: new Date().toISOString() }
              : t
          ),
        })),

      moveToProcurement: (id) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, status: 'procurement' as TicketStatus } : t
          ),
        })),

      getTicketsByStatus: (status) => {
        const state = get()
        return state.tickets
          .filter((t) => t.status === status)
          .sort((a, b) => {
            const urgencyOrder: Record<Urgency, number> = { urgent: 0, high: 1, normal: 2 }
            const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
            if (urgencyDiff !== 0) return urgencyDiff

            const aHasMeeting = !!a.affectedMeetingTime
            const bHasMeeting = !!b.affectedMeetingTime
            if (aHasMeeting && bHasMeeting) {
              return new Date(a.affectedMeetingTime).getTime() - new Date(b.affectedMeetingTime).getTime()
            }
            if (aHasMeeting) return -1
            if (bHasMeeting) return 1

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
      },

      getRoomById: (id) => {
        return get().rooms.find((r) => r.id === id)
      },

      getAvailableRooms: (requiredEquipment) => {
        const state = get()
        const roomIdsWithActiveTickets = new Set(
          state.tickets
            .filter((t) => t.status === 'pending' || t.status === 'repairing' || t.status === 'procurement')
            .map((t) => t.roomId)
        )
        return state.rooms.filter((r) => {
          if (r.status !== 'active') return false
          if (roomIdsWithActiveTickets.has(r.id)) return false
          if (requiredEquipment && !r.equipment.includes(requiredEquipment)) return false
          return true
        })
      },

      getTicketsByRoom: (roomId) => {
        return get().tickets.filter((t) => t.roomId === roomId)
      },
    }),
    {
      name: 'meeting-room-repair-storage',
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState>
        if (p.tickets) {
          p.tickets = p.tickets.map((t) => ({
            ...t,
            photos: normalizePhotos(t.photos as PhotoItem[] | string[]),
          }))
        }
        return { ...current, ...p }
      },
    }
  )
)
