import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import type {
  User, Shift, Device, Disinfectant, DisinfectantLog,
  Task, Record, Notification, NotificationSettings, RecordItem, RecordPhoto
} from '@/types'

function svgImg(bg: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" font-family="Arial" font-size="36" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}
const MOCK_IMAGES = {
 缸体: svgImg('#1677ff', '料缸消毒完成'),
 '出料口': svgImg('#52c41a', '出料口清洗'),
 '搅拌轴': svgImg('#f5222d', '搅拌轴有磨损异常'),
 '搅拌轴完成': svgImg('#fa8c16', '搅拌轴清洗完成'),
 '接水盘': svgImg('#722ed1', '接水盘刷洗'),
 外壳: svgImg('#13c2c2', '外壳擦拭完成')
}

const STORAGE_KEYS = {
  USERS: 'icms_users',
  SHIFTS: 'icms_shifts',
  DEVICES: 'icms_devices',
  DISINFECTANTS: 'icms_disinfectants',
  DISINFECTANT_LOGS: 'icms_disinfectant_logs',
  TASKS: 'icms_tasks',
  RECORDS: 'icms_records',
  NOTIFICATIONS: 'icms_notifications',
  NOTIFICATION_SETTINGS: 'icms_notification_settings',
  INIT_FLAG: 'icms_initialized',
  CURRENT_USER: 'icms_current_user'
}

function readLS<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLS<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

function readSingle<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSingle<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function genId(): string {
  return uuidv4().replace(/-/g, '').slice(0, 16)
}

export function initMockData() {
  if (localStorage.getItem(STORAGE_KEYS.INIT_FLAG) === '1') return

  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  const defaultUsers: User[] = [
    { id: 'u001', username: 'manager', password: '123456', name: '张店长', role: 'manager', status: 'active', createdAt: new Date().toISOString() },
    { id: 'u002', username: 'staff01', password: '123456', name: '李员工', role: 'staff', shiftId: 's001', status: 'active', createdAt: new Date().toISOString() },
    { id: 'u003', username: 'staff02', password: '123456', name: '王员工', role: 'staff', shiftId: 's002', status: 'active', createdAt: new Date().toISOString() },
    { id: 'u004', username: 'staff03', password: '123456', name: '赵员工', role: 'staff', shiftId: 's003', status: 'active', createdAt: new Date().toISOString() }
  ]

  const defaultShifts: Shift[] = [
    { id: 's001', name: '开店前', startTime: '07:30', endTime: '08:30', type: 'opening', description: '门店营业前准备' },
    { id: 's002', name: '午间', startTime: '12:30', endTime: '13:30', type: 'midday', description: '午间高峰后清洁' },
    { id: 's003', name: '打烊', startTime: '22:00', endTime: '23:00', type: 'closing', description: '当日营业结束清洁' }
  ]

  const defaultDisinfectants: Disinfectant[] = [
    { id: 'd001', model: 'D-84-500', name: '84消毒液', manufacturer: '利康日化', expireDate: '2026-12-31', stock: 50, unitConsumption: 50, status: 'active', createdAt: new Date().toISOString() },
    { id: 'd002', model: 'D-QX-100', name: '强力消毒剂', manufacturer: '安洁科技', expireDate: '2026-08-15', stock: 20, unitConsumption: 30, status: 'active', createdAt: new Date().toISOString() }
  ]

  const defaultDevices: Device[] = [
    {
      id: 'dev001', machineNo: 'ICM-2025-A001', name: '软质冰淇淋机1号', flavorSlots: 3,
      disinfectantId: 'd001', shiftIds: ['s001', 's002', 's003'], location: '前台左侧',
      purchaseDate: '2025-01-15', status: 'active', createdAt: new Date().toISOString(),
      parts: [
        { id: 'p001', deviceId: 'dev001', name: '左料缸', category: '缸体', sortOrder: 1, required: true, description: '拆卸浸泡消毒，擦拭内壁无残留' },
        { id: 'p002', deviceId: 'dev001', name: '中料缸', category: '缸体', sortOrder: 2, required: true, description: '拆卸浸泡消毒，擦拭内壁无残留' },
        { id: 'p003', deviceId: 'dev001', name: '右料缸', category: '缸体', sortOrder: 3, required: true, description: '拆卸浸泡消毒，擦拭内壁无残留' },
        { id: 'p004', deviceId: 'dev001', name: '出料口总成', category: '出料', sortOrder: 4, required: true, description: '拆解所有橡胶圈，彻底清洗每个缝隙' },
        { id: 'p005', deviceId: 'dev001', name: '搅拌轴×3', category: '搅拌', sortOrder: 5, required: true, description: '毛刷清洗螺旋纹路，检查有无磨损' },
        { id: 'p006', deviceId: 'dev001', name: '接水盘', category: '接水', sortOrder: 6, required: true, description: '倾倒废水刷洗，检查排水孔通畅' },
        { id: 'p007', deviceId: 'dev001', name: '设备外壳', category: '外壳', sortOrder: 7, required: true, description: '从上到下擦拭，注意边角缝隙' }
      ],
      photos: []
    },
    {
      id: 'dev002', machineNo: 'ICM-2025-A002', name: '硬质冰淇淋机2号', flavorSlots: 2,
      disinfectantId: 'd001', shiftIds: ['s001', 's003'], location: '前台右侧',
      purchaseDate: '2025-03-20', status: 'active', createdAt: new Date().toISOString(),
      parts: [
        { id: 'p008', deviceId: 'dev002', name: '左料缸', category: '缸体', sortOrder: 1, required: true, description: '拆卸浸泡消毒' },
        { id: 'p009', deviceId: 'dev002', name: '右料缸', category: '缸体', sortOrder: 2, required: true, description: '拆卸浸泡消毒' },
        { id: 'p010', deviceId: 'dev002', name: '出料口总成', category: '出料', sortOrder: 3, required: true, description: '拆解清洗' },
        { id: 'p011', deviceId: 'dev002', name: '搅拌轴×2', category: '搅拌', sortOrder: 4, required: true, description: '毛刷清洗纹路' },
        { id: 'p012', deviceId: 'dev002', name: '接水盘', category: '接水', sortOrder: 5, required: true, description: '刷洗并检查排水' },
        { id: 'p013', deviceId: 'dev002', name: '设备外壳', category: '外壳', sortOrder: 6, required: true, description: '整体擦拭消毒' }
      ],
      photos: []
    }
  ]

  const defaultSettings: NotificationSettings = {
    missedEnabled: true,
    disinfectantWarningDays: 7,
    taskExpiredEnabled: true,
    abnormalEnabled: true
  }

  const tasks: Task[] = []
  const records: Record[] = []
  const disinfectantLogs: DisinfectantLog[] = []
  const notifications: Notification[] = []

  function generateTasksForDate(dateStr: string, shiftAssignees: { [key: string]: string }) {
    defaultDevices.forEach(dev => {
      dev.shiftIds.forEach(sid => {
        const shift = defaultShifts.find(s => s.id === sid)!
        const tid = genId()
        tasks.push({
          id: tid, deviceId: dev.id, shiftId: sid, disinfectantId: dev.disinfectantId,
          name: `${dev.machineNo} - ${shift.name}消毒`,
          taskDate: dateStr, timeSlot: shift.type, scheduledTime: shift.startTime,
          assigneeId: shiftAssignees[shift.type],
          status: dateStr < today ? (shift.type === 'closing' ? 'completed' : 'completed') : 'pending',
          createdAt: new Date().toISOString()
        })
      })
    })
  }

  generateTasksForDate(yesterday, { opening: 'u002', midday: 'u003', closing: 'u004' })
  generateTasksForDate(today, { opening: 'u002', midday: 'u003', closing: 'u004' })

  const yesterdayTasks = tasks.filter(t => t.taskDate === yesterday)
  yesterdayTasks.forEach((t, idx) => {
    const rid = genId()
    const dev = defaultDevices.find(d => d.id === t.deviceId)!
    const items: RecordItem[] = dev.parts.map(p => ({
      id: genId(), recordId: rid, partId: p.id, partName: p.name,
      category: p.category, completed: !(idx === 2 && p.sortOrder === 5),
      sortOrder: p.sortOrder, remark: idx === 2 && p.sortOrder === 5 ? '搅拌轴有磨损暂未彻底清洗' : undefined
    }))
    const completedCount = items.filter(i => i.completed).length
    const hasMissed = completedCount < items.length
    const photos: RecordPhoto[] = []
    if (idx === 2) {
      items.forEach(item => {
        if (!item.completed && item.partName.includes('搅拌轴')) {
          photos.push({
            id: genId(), recordId: rid, partId: item.partId,
            url: MOCK_IMAGES['搅拌轴'], type: 'abnormal',
            description: '搅拌轴有明显划痕和磨损，建议更换',
            uploadedAt: dayjs(`${yesterday} ${t.scheduledTime}`).add(5, 'minute').toISOString()
          })
        }
        if (item.completed) {
          const imgKey = (item.partName.includes('搅拌轴') ? '搅拌轴完成' : item.partName) as keyof typeof MOCK_IMAGES
          const url = MOCK_IMAGES[imgKey] || MOCK_IMAGES.外壳
          photos.push({
            id: genId(), recordId: rid, partId: item.partId,
            url, type: 'completion',
            uploadedAt: dayjs(`${yesterday} ${t.scheduledTime}`).add(5 + photos.length, 'minute').toISOString()
          })
        }
      })
    } else {
      items.slice(0, 3).forEach((item, k) => {
        const imgKey = (item.partName.includes('搅拌轴') ? '搅拌轴完成' : item.partName) as keyof typeof MOCK_IMAGES
        const url = MOCK_IMAGES[imgKey] || MOCK_IMAGES.外壳
        photos.push({
          id: genId(), recordId: rid, partId: item.partId,
          url, type: 'completion',
          uploadedAt: dayjs(`${yesterday} ${t.scheduledTime}`).add(5 + k, 'minute').toISOString()
        })
      })
    }
    records.push({
      id: rid, taskId: t.id, deviceId: t.deviceId, operatorId: t.assigneeId || 'u002',
      shiftId: t.shiftId, recordDate: t.taskDate, timeSlot: t.timeSlot,
      completedCount, totalCount: items.length,
      completionRate: Math.round((completedCount / items.length) * 100),
      hasMissed, hasAbnormal: hasMissed,
      missedReason: hasMissed ? '部分零件因磨损临时跳过' : undefined,
      disinfectantUsed: defaultDisinfectants.find(d => d.id === t.disinfectantId)!.model,
      disinfectantValid: true,
      startTime: dayjs(`${yesterday} ${t.scheduledTime}`).toISOString(),
      endTime: dayjs(`${yesterday} ${t.scheduledTime}`).add(25, 'minute').toISOString(),
      duration: 25, reviewStatus: hasMissed ? 'pending' : 'approved',
      createdAt: new Date().toISOString(), items, photos
    })
    t.status = 'completed'
    t.recordId = rid
    t.completedAt = dayjs(`${yesterday} ${t.scheduledTime}`).add(25, 'minute').toISOString()

    disinfectantLogs.push({
      id: genId(), disinfectantId: t.disinfectantId, type: 'consume',
      quantity: defaultDisinfectants.find(d => d.id === t.disinfectantId)!.unitConsumption,
      operatorId: t.assigneeId || 'u002', remark: `${dev.machineNo} ${t.timeSlot}消毒`,
      createdAt: new Date().toISOString()
    })

    if (hasMissed) {
      notifications.push({
        id: genId(), type: 'missed',
        title: `【漏做提醒】${dev.machineNo} ${t.timeSlot === 'opening' ? '开店前' : t.timeSlot === 'midday' ? '午间' : '打烊'}消毒`,
        content: `有1个步骤未完成：搅拌轴×2。员工说明：${items.find(i => !i.completed)?.remark || '无'}`,
        relatedId: rid, relatedType: 'record', read: false, createdAt: new Date().toISOString()
      })
    }
  })

  writeLS(STORAGE_KEYS.USERS, defaultUsers)
  writeLS(STORAGE_KEYS.SHIFTS, defaultShifts)
  writeLS(STORAGE_KEYS.DEVICES, defaultDevices)
  writeLS(STORAGE_KEYS.DISINFECTANTS, defaultDisinfectants)
  writeLS(STORAGE_KEYS.DISINFECTANT_LOGS, disinfectantLogs)
  writeLS(STORAGE_KEYS.TASKS, tasks)
  writeLS(STORAGE_KEYS.RECORDS, records)
  writeLS(STORAGE_KEYS.NOTIFICATIONS, notifications)
  writeSingle(STORAGE_KEYS.NOTIFICATION_SETTINGS, defaultSettings)
  localStorage.setItem(STORAGE_KEYS.INIT_FLAG, '1')
}

export const storage = {
  users: {
    getAll: () => readLS<User>(STORAGE_KEYS.USERS),
    save: (d: User[]) => writeLS(STORAGE_KEYS.USERS, d),
    login: (username: string, password: string) => {
      const users = readLS<User>(STORAGE_KEYS.USERS)
      return users.find(u => u.username === username && u.password === password && u.status === 'active') || null
    },
    getCurrent: () => readSingle<User>(STORAGE_KEYS.CURRENT_USER),
    setCurrent: (u: User | null) => u ? writeSingle(STORAGE_KEYS.CURRENT_USER, u) : localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },
  shifts: {
    getAll: () => readLS<Shift>(STORAGE_KEYS.SHIFTS),
    save: (d: Shift[]) => writeLS(STORAGE_KEYS.SHIFTS, d)
  },
  devices: {
    getAll: () => readLS<Device>(STORAGE_KEYS.DEVICES),
    save: (d: Device[]) => writeLS(STORAGE_KEYS.DEVICES, d)
  },
  disinfectants: {
    getAll: () => readLS<Disinfectant>(STORAGE_KEYS.DISINFECTANTS),
    save: (d: Disinfectant[]) => writeLS(STORAGE_KEYS.DISINFECTANTS, d)
  },
  disinfectantLogs: {
    getAll: () => readLS<DisinfectantLog>(STORAGE_KEYS.DISINFECTANT_LOGS),
    save: (d: DisinfectantLog[]) => writeLS(STORAGE_KEYS.DISINFECTANT_LOGS, d)
  },
  tasks: {
    getAll: () => readLS<Task>(STORAGE_KEYS.TASKS),
    save: (d: Task[]) => writeLS(STORAGE_KEYS.TASKS, d)
  },
  records: {
    getAll: () => readLS<Record>(STORAGE_KEYS.RECORDS),
    save: (d: Record[]) => writeLS(STORAGE_KEYS.RECORDS, d)
  },
  notifications: {
    getAll: () => readLS<Notification>(STORAGE_KEYS.NOTIFICATIONS),
    save: (d: Notification[]) => writeLS(STORAGE_KEYS.NOTIFICATIONS, d)
  },
  notificationSettings: {
    get: () => readSingle<NotificationSettings>(STORAGE_KEYS.NOTIFICATION_SETTINGS) || { missedEnabled: true, disinfectantWarningDays: 7, taskExpiredEnabled: true, abnormalEnabled: true },
    save: (s: NotificationSettings) => writeSingle(STORAGE_KEYS.NOTIFICATION_SETTINGS, s)
  }
}
