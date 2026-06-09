import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Visitor,
  Appointment,
  Employee,
  MeetingRoom,
  ItemRecord,
  RiskAlert,
  VisitorStatus,
  AppointmentStatus,
  RiskType,
  RiskSeverity,
} from '../types'
import { employees, meetingRooms } from '../utils/constants'
import { generateId, generateBadgeNumber, isToday, isOvertime } from '../utils/helpers'

function createMockData() {
  const now = new Date()
  const today9 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString()
  const today10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString()
  const today11 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0).toISOString()
  const today14 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString()
  const today15 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).toISOString()
  const today16 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30).toISOString()
  const today930 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString()
  const today1030 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30).toISOString()
  const today830 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString()
  const today730 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30).toISOString()

  const appointments: Appointment[] = [
    {
      id: 'apt-001', visitorName: '刘强', visitorCompany: '华为科技', visitorPhone: '13900001001',
      visitorLicensePlate: '京A12345', purpose: '商务洽谈', hostId: 'emp-001', meetingRoomId: 'room-001',
      expectedArrival: today10, expectedDeparture: today11, status: 'confirmed', hostConfirmed: true, createdAt: today9,
    },
    {
      id: 'apt-002', visitorName: '陈丽', visitorCompany: '阿里巴巴', visitorPhone: '13900001002',
      visitorLicensePlate: '', purpose: '面试', hostId: 'emp-004', meetingRoomId: 'room-003',
      expectedArrival: today14, expectedDeparture: today15, status: 'pending', hostConfirmed: false, createdAt: today9,
    },
    {
      id: 'apt-003', visitorName: '王伟', visitorCompany: '腾讯科技', visitorPhone: '13900001003',
      visitorLicensePlate: '京B67890', purpose: '技术对接', hostId: 'emp-005', meetingRoomId: 'room-001',
      expectedArrival: today10, expectedDeparture: today11, status: 'confirmed', hostConfirmed: true, createdAt: today830,
    },
    {
      id: 'apt-004', visitorName: '赵雪', visitorCompany: '字节跳动', visitorPhone: '13900001004',
      visitorLicensePlate: '', purpose: '面试', hostId: 'emp-010', meetingRoomId: 'room-005',
      expectedArrival: today9, expectedDeparture: today10, status: 'confirmed', hostConfirmed: true, createdAt: today730,
    },
    {
      id: 'apt-005', visitorName: '孙鹏', visitorCompany: '京东集团', visitorPhone: '13900001005',
      visitorLicensePlate: '京C11111', purpose: '供应商拜访', hostId: 'emp-006', meetingRoomId: 'room-002',
      expectedArrival: today15, expectedDeparture: today16, status: 'pending', hostConfirmed: true, createdAt: today10,
    },
    {
      id: 'apt-006', visitorName: '林芳', visitorCompany: '美团', visitorPhone: '13900001006',
      visitorLicensePlate: '', purpose: '合作洽谈', hostId: 'emp-002', meetingRoomId: 'room-004',
      expectedArrival: today930, expectedDeparture: today1030, status: 'cancelled', hostConfirmed: false, createdAt: today830,
    },
  ]

  const visitors: Visitor[] = [
    {
      id: 'vis-001', name: '赵雪', company: '字节跳动', phone: '13900001004', licensePlate: '',
      purpose: '面试', status: 'departed', badgeNumber: 'V-1001', badgeReturned: true, hostId: 'emp-010', meetingRoomId: 'room-005',
      appointmentId: 'apt-004', expectedArrival: today9, actualArrival: today930, actualDeparture: today1030, createdAt: today730,
    },
    {
      id: 'vis-002', name: '刘强', company: '华为科技', phone: '13900001001', licensePlate: '京A12345',
      purpose: '商务洽谈', status: 'checked-in', badgeNumber: 'V-1002', badgeReturned: false, hostId: 'emp-001', meetingRoomId: 'room-001',
      appointmentId: 'apt-001', expectedArrival: today10, actualArrival: today930, actualDeparture: null, createdAt: today9,
    },
    {
      id: 'vis-003', name: '陈丽', company: '阿里巴巴', phone: '13900001002', licensePlate: '',
      purpose: '面试', status: 'expected', badgeNumber: null, badgeReturned: false, hostId: 'emp-004', meetingRoomId: 'room-003',
      appointmentId: 'apt-002', expectedArrival: today14, actualArrival: null, actualDeparture: null, createdAt: today9,
    },
    {
      id: 'vis-004', name: '孙鹏', company: '京东集团', phone: '13900001005', licensePlate: '京C11111',
      purpose: '供应商拜访', status: 'expected', badgeNumber: null, badgeReturned: false, hostId: 'emp-006', meetingRoomId: 'room-002',
      appointmentId: 'apt-005', expectedArrival: today15, actualArrival: null, actualDeparture: null, createdAt: today10,
    },
    {
      id: 'vis-005', name: '林芳', company: '美团', phone: '13900001006', licensePlate: '',
      purpose: '合作洽谈', status: 'no-show', badgeNumber: null, badgeReturned: false, hostId: 'emp-002', meetingRoomId: 'room-004',
      appointmentId: 'apt-006', expectedArrival: today930, actualArrival: null, actualDeparture: null, createdAt: today830,
    },
    {
      id: 'vis-006', name: '王伟', company: '腾讯科技', phone: '13900001003', licensePlate: '京B67890',
      purpose: '技术对接', status: 'expected', badgeNumber: null, badgeReturned: false, hostId: 'emp-005', meetingRoomId: 'room-001',
      appointmentId: 'apt-003', expectedArrival: today10, actualArrival: null, actualDeparture: null, createdAt: today830,
    },
  ]

  const riskAlerts: RiskAlert[] = [
    {
      id: 'risk-001', type: 'no-host-confirm', severity: 'high',
      message: '陈丽（阿里巴巴）的预约尚未获得接待人赵婷确认', relatedAppointmentId: 'apt-002',
      relatedVisitorId: 'vis-003', resolved: false, createdAt: today9,
    },
    {
      id: 'risk-002', type: 'room-conflict', severity: 'medium',
      message: '朝阳厅在10:00-11:00时间段存在两场预约冲突', relatedAppointmentId: 'apt-003',
      relatedVisitorId: 'vis-002', resolved: false, createdAt: today830,
    },
    {
      id: 'risk-003', type: 'badge-not-returned', severity: 'high',
      message: '访客刘强已签退但访客牌 V-1002 尚未归还', relatedAppointmentId: 'apt-001',
      relatedVisitorId: 'vis-002', resolved: false, createdAt: today11,
    },
    {
      id: 'risk-004', type: 'overtime-stay', severity: 'low',
      message: '访客刘强已超过预计离开时间30分钟', relatedAppointmentId: 'apt-001',
      relatedVisitorId: 'vis-002', resolved: false, createdAt: today11,
    },
  ]

  const itemRecords: ItemRecord[] = [
    {
      id: 'item-001', visitorId: 'vis-002', appointmentId: 'apt-001', itemType: 'equipment',
      description: '笔记本电脑 x1', direction: 'in', timestamp: today930, operator: '前台',
    },
    {
      id: 'item-002', visitorId: 'vis-004', appointmentId: 'apt-005', itemType: 'parcel',
      description: '合同文件袋 x2', direction: 'in', timestamp: today15, operator: '前台',
    },
  ]

  return { appointments, visitors, riskAlerts, itemRecords }
}

interface VisitorStore {
  employees: Employee[]
  meetingRooms: MeetingRoom[]
  appointments: Appointment[]
  visitors: Visitor[]
  riskAlerts: RiskAlert[]
  itemRecords: ItemRecord[]

  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => string
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  confirmHost: (id: string) => void

  checkIn: (appointmentId: string) => Visitor | null
  checkOut: (visitorId: string, badgeReturned: boolean) => void
  markNoShow: (visitorId: string) => void

  addRiskAlert: (type: RiskType, severity: RiskSeverity, message: string, aptId: string, visitorId: string | null) => void
  resolveRisk: (id: string) => void

  addItemRecord: (record: Omit<ItemRecord, 'id' | 'timestamp'>) => void

  getTodayVisitors: () => Visitor[]
  getTodayVisitorsByStatus: (status: VisitorStatus) => Visitor[]
  getUnresolvedRisks: () => RiskAlert[]
  getEmployee: (id: string) => Employee | undefined
  getMeetingRoom: (id: string) => MeetingRoom | undefined

  getStatsData: () => {
    dailyCounts: { date: string; count: number }[]
    departmentStats: { department: string; count: number }[]
    noShowRate: number
    overtimeVisitors: Visitor[]
  }
}

const mock = createMockData()

export const useStore = create<VisitorStore>()(
  persist(
    (set, get) => ({
      employees,
      meetingRooms,
      appointments: mock.appointments,
      visitors: mock.visitors,
      riskAlerts: mock.riskAlerts,
      itemRecords: mock.itemRecords,

      addAppointment: (apt) => {
        const id = `apt-${generateId()}`
        const now = new Date().toISOString()
        const newApt: Appointment = {
          ...apt,
          id,
          status: apt.hostConfirmed ? 'confirmed' : 'pending',
          createdAt: now,
        }

        const visitorId = `vis-${generateId()}`
        const newVisitor: Visitor = {
          id: visitorId,
          name: apt.visitorName,
          company: apt.visitorCompany,
          phone: apt.visitorPhone,
          licensePlate: apt.visitorLicensePlate,
          purpose: apt.purpose,
          status: 'expected',
          badgeNumber: null,
          badgeReturned: false,
          hostId: apt.hostId,
          meetingRoomId: apt.meetingRoomId,
          appointmentId: id,
          expectedArrival: apt.expectedArrival,
          actualArrival: null,
          actualDeparture: null,
          createdAt: now,
        }

        set((s) => ({
          appointments: [...s.appointments, newApt],
          visitors: [...s.visitors, newVisitor],
        }))

        if (!apt.hostConfirmed) {
          const host = get().getEmployee(apt.hostId)
          get().addRiskAlert(
            'no-host-confirm',
            'high',
            `${apt.visitorName}（${apt.visitorCompany}）的预约尚未获得接待人${host?.name ?? ''}确认`,
            id,
            visitorId
          )
        }

        const conflicting = get().appointments.filter(
          (a) =>
            a.meetingRoomId === apt.meetingRoomId &&
            a.status !== 'cancelled' &&
            new Date(a.expectedArrival) < new Date(apt.expectedDeparture) &&
            new Date(a.expectedDeparture) > new Date(apt.expectedArrival)
        )
        if (conflicting.length > 0) {
          const room = get().getMeetingRoom(apt.meetingRoomId)
          get().addRiskAlert(
            'room-conflict',
            'medium',
            `${room?.name ?? '会议室'}在${new Date(apt.expectedArrival).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}时间段存在预约冲突`,
            id,
            visitorId
          )
        }

        return id
      },

      updateAppointmentStatus: (id, status) => {
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
        }))
      },

      confirmHost: (id) => {
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, hostConfirmed: true, status: 'confirmed' } : a
          ),
        }))
        set((s) => ({
          riskAlerts: s.riskAlerts.map((r) =>
            r.type === 'no-host-confirm' && r.relatedAppointmentId === id
              ? { ...r, resolved: true }
              : r
          ),
        }))
      },

      checkIn: (appointmentId) => {
        const existingVisitor = get().visitors.find(
          (v) => v.appointmentId === appointmentId && v.status === 'expected'
        )
        if (!existingVisitor) return null

        const badgeNumber = generateBadgeNumber()
        const now = new Date().toISOString()

        set((s) => ({
          visitors: s.visitors.map((v) =>
            v.id === existingVisitor.id
              ? { ...v, status: 'checked-in' as VisitorStatus, badgeNumber, actualArrival: now }
              : v
          ),
          appointments: s.appointments.map((a) =>
            a.id === appointmentId ? { ...a, status: 'confirmed' as AppointmentStatus } : a
          ),
        }))

        return { ...existingVisitor, status: 'checked-in' as VisitorStatus, badgeNumber, actualArrival: now }
      },

      checkOut: (visitorId, badgeReturned) => {
        const now = new Date().toISOString()
        const visitor = get().visitors.find((v) => v.id === visitorId)

        set((s) => ({
          visitors: s.visitors.map((v) =>
            v.id === visitorId
              ? { ...v, status: 'departed' as VisitorStatus, actualDeparture: now, badgeReturned }
              : v
          ),
        }))

        if (visitor && !badgeReturned) {
          get().addRiskAlert(
            'badge-not-returned',
            'high',
            `访客${visitor.name}已签退但访客牌 ${visitor.badgeNumber} 尚未归还`,
            visitor.appointmentId,
            visitorId
          )
        }

        if (visitor) {
          set((s) => ({
            appointments: s.appointments.map((a) =>
              a.id === visitor.appointmentId ? { ...a, status: 'completed' as AppointmentStatus } : a
            ),
          }))
        }

        set((s) => ({
          riskAlerts: s.riskAlerts.map((r) =>
            r.type === 'overtime-stay' && r.relatedVisitorId === visitorId
              ? { ...r, resolved: true }
              : r
          ),
        }))
      },

      markNoShow: (visitorId) => {
        const visitor = get().visitors.find((v) => v.id === visitorId)
        set((s) => ({
          visitors: s.visitors.map((v) =>
            v.id === visitorId ? { ...v, status: 'no-show' as VisitorStatus } : v
          ),
        }))
        if (visitor) {
          set((s) => ({
            appointments: s.appointments.map((a) =>
              a.id === visitor.appointmentId ? { ...a, status: 'cancelled' as AppointmentStatus } : a
            ),
          }))
        }
      },

      addRiskAlert: (type, severity, message, aptId, visitorId) => {
        const alert: RiskAlert = {
          id: `risk-${generateId()}`,
          type,
          severity,
          message,
          relatedAppointmentId: aptId,
          relatedVisitorId: visitorId,
          resolved: false,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ riskAlerts: [...s.riskAlerts, alert] }))
      },

      resolveRisk: (id) => {
        set((s) => ({
          riskAlerts: s.riskAlerts.map((r) => (r.id === id ? { ...r, resolved: true } : r)),
        }))
      },

      addItemRecord: (record) => {
        const newRecord: ItemRecord = {
          ...record,
          id: `item-${generateId()}`,
          timestamp: new Date().toISOString(),
        }
        set((s) => ({ itemRecords: [...s.itemRecords, newRecord] }))
      },

      getTodayVisitors: () => {
        return get().visitors.filter((v) => isToday(v.expectedArrival))
      },

      getTodayVisitorsByStatus: (status) => {
        return get().visitors.filter((v) => isToday(v.expectedArrival) && v.status === status)
      },

      getUnresolvedRisks: () => {
        return get().riskAlerts.filter((r) => !r.resolved)
      },

      getEmployee: (id) => {
        return get().employees.find((e) => e.id === id)
      },

      getMeetingRoom: (id) => {
        return get().meetingRooms.find((r) => r.id === id)
      },

      getStatsData: () => {
        const visitors = get().visitors
        const employeesList = get().employees

        const dailyMap = new Map<string, number>()
        for (let i = 29; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const key = d.toISOString().split('T')[0]
          dailyMap.set(key, 0)
        }

        visitors.forEach((v) => {
          const key = new Date(v.expectedArrival).toISOString().split('T')[0]
          if (dailyMap.has(key)) {
            dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1)
          }
        })

        const dailyCounts = Array.from(dailyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-14)
          .map(([date, count]) => ({ date, count }))

        const deptMap = new Map<string, number>()
        visitors.forEach((v) => {
          const emp = employeesList.find((e) => e.id === v.hostId)
          if (emp) {
            deptMap.set(emp.department, (deptMap.get(emp.department) ?? 0) + 1)
          }
        })
        const departmentStats = Array.from(deptMap.entries())
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count)

        const totalExpected = visitors.length
        const noShows = visitors.filter((v) => v.status === 'no-show').length
        const noShowRate = totalExpected > 0 ? Math.round((noShows / totalExpected) * 100) : 0

        const overtimeVisitors = visitors.filter(
          (v) =>
            v.status === 'checked-in' &&
            v.actualArrival &&
            isOvertime(
              new Date(new Date(v.actualArrival).getTime() + 3 * 60 * 60 * 1000).toISOString()
            )
        )

        return { dailyCounts, departmentStats, noShowRate, overtimeVisitors }
      },
    }),
    {
      name: 'visitor-desk-v3',
    }
  )
)
