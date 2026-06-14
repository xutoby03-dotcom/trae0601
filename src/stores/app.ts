import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Device, Shift, Disinfectant, Task, Record, Notification, DisinfectantLog, NotificationSettings, User } from '@/types'
import { storage, genId } from '@/services/storage'

export const useAppStore = defineStore('app', () => {
  const devices = ref<Device[]>(storage.devices.getAll().map(d => ({ ...d, photos: d.photos || [] })))
  const shifts = ref<Shift[]>(storage.shifts.getAll())
  const disinfectants = ref<Disinfectant[]>(storage.disinfectants.getAll())
  const disinfectantLogs = ref<DisinfectantLog[]>(storage.disinfectantLogs.getAll())
  const tasks = ref<Task[]>(storage.tasks.getAll())
  const records = ref<Record[]>(storage.records.getAll())
  const notifications = ref<Notification[]>(storage.notifications.getAll())
  const users = ref<User[]>(storage.users.getAll())
  const notificationSettings = ref<NotificationSettings>(storage.notificationSettings.get())

  function persist() {
    storage.devices.save(devices.value)
    storage.shifts.save(shifts.value)
    storage.disinfectants.save(disinfectants.value)
    storage.disinfectantLogs.save(disinfectantLogs.value)
    storage.tasks.save(tasks.value)
    storage.records.save(records.value)
    storage.notifications.save(notifications.value)
    storage.users.save(users.value)
    storage.notificationSettings.save(notificationSettings.value)
  }

  const unreadNotificationCount = computed(() => notifications.value.filter(n => !n.read).length)
  const todayTasks = computed(() => tasks.value.filter(t => t.taskDate === dayjs().format('YYYY-MM-DD')))
  const pendingTaskCount = computed(() => todayTasks.value.filter(t => t.status === 'pending' || t.status === 'in_progress').length)
  const completedTaskCount = computed(() => todayTasks.value.filter(t => t.status === 'completed').length)
  const expiredTaskCount = computed(() => todayTasks.value.filter(t => t.status === 'expired').length)
  const abnormalRecords = computed(() => records.value.filter(r => r.hasMissed || r.hasAbnormal))

  function getDevice(id: string) { return devices.value.find(d => d.id === id) }
  function getShift(id: string) { return shifts.value.find(s => s.id === id) }
  function getDisinfectant(id: string) { return disinfectants.value.find(d => d.id === id) }
  function getTask(id: string) { return tasks.value.find(t => t.id === id) }
  function getRecord(id: string) { return records.value.find(r => r.id === id) }
  function getUser(id: string) { return users.value.find(u => u.id === id) }

  function addDevice(device: Omit<Device, 'id' | 'createdAt' | 'parts' | 'photos'> & { parts: Omit<import('@/types').Part, 'id' | 'deviceId'>[]; photos?: Omit<import('@/types').DevicePhoto, 'id' | 'deviceId'>[] }) {
    const id = genId()
    const parts = device.parts.map(p => ({ ...p, id: genId(), deviceId: id }))
    const photos = (device.photos || []).map(p => ({ ...p, id: genId(), deviceId: id }))
    devices.value.push({ ...device, id, createdAt: new Date().toISOString(), parts, photos } as Device)
    persist()
    return id
  }

  function updateDevice(id: string, data: Partial<Device> & { parts?: Omit<import('@/types').Part, 'id'>[]; photos?: Omit<import('@/types').DevicePhoto, 'id' | 'deviceId'>[] }) {
    const idx = devices.value.findIndex(d => d.id === id)
    if (idx >= 0) {
      const parts = data.parts?.map(p => ({ ...p, id: p.id || genId(), deviceId: id }))
      const photos = data.photos?.map(p => ({ ...p, id: p.id || genId(), deviceId: id }))
      devices.value[idx] = { ...devices.value[idx], ...data, parts: parts || devices.value[idx].parts, photos: photos ?? devices.value[idx].photos }
      persist()
    }
  }

  function deleteDevice(id: string) {
    devices.value = devices.value.filter(d => d.id !== id)
    persist()
  }

  function addDisinfectant(data: Omit<Disinfectant, 'id' | 'createdAt'>) {
    const id = genId()
    disinfectants.value.push({ ...data, id, createdAt: new Date().toISOString() })
    persist()
    return id
  }

  function updateDisinfectant(id: string, data: Partial<Disinfectant>) {
    const idx = disinfectants.value.findIndex(d => d.id === id)
    if (idx >= 0) {
      disinfectants.value[idx] = { ...disinfectants.value[idx], ...data }
      persist()
    }
  }

  function checkDisinfectantValid(id: string): { valid: boolean; warning: boolean; daysLeft: number } {
    const d = getDisinfectant(id)
    if (!d) return { valid: false, warning: true, daysLeft: -1 }
    const daysLeft = dayjs(d.expireDate).diff(dayjs(), 'day')
    return {
      valid: daysLeft >= 0,
      warning: daysLeft <= notificationSettings.value.disinfectantWarningDays,
      daysLeft
    }
  }

  function consumeDisinfectant(id: string, qty: number, operatorId: string, remark: string) {
    const idx = disinfectants.value.findIndex(d => d.id === id)
    if (idx >= 0) {
      disinfectants.value[idx].stock = Math.max(0, disinfectants.value[idx].stock - qty / 1000)
    }
    disinfectantLogs.value.push({
      id: genId(), disinfectantId: id, type: 'consume',
      quantity: qty, operatorId, remark, createdAt: new Date().toISOString()
    })
    persist()
  }

  function startTask(taskId: string) {
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx >= 0 && tasks.value[idx].status === 'pending') {
      tasks.value[idx].status = 'in_progress'
      tasks.value[idx].startedAt = new Date().toISOString()
      persist()
    }
  }

  function completeTask(taskId: string, recordId: string) {
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx >= 0) {
      tasks.value[idx].status = 'completed'
      tasks.value[idx].completedAt = new Date().toISOString()
      tasks.value[idx].recordId = recordId
      persist()
    }
  }

  function addRecord(data: Omit<Record, 'id' | 'createdAt'>) {
    const id = genId()
    records.value.push({ ...data, id, createdAt: new Date().toISOString() } as Record)
    persist()
    return id
  }

  function updateRecord(id: string, data: Partial<Record>) {
    const idx = records.value.findIndex(r => r.id === id)
    if (idx >= 0) {
      records.value[idx] = { ...records.value[idx], ...data }
      persist()
    }
  }

  function addNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read' | 'handled'>) {
    notifications.value.unshift({
      ...data, id: genId(), read: false,
      createdAt: new Date().toISOString(), handled: false
    })
    persist()
  }

  function markNotificationRead(id: string) {
    const n = notifications.value.find(n => n.id === id)
    if (n) { n.read = true; persist() }
  }

  function markAllNotificationsRead() {
    notifications.value.forEach(n => n.read = true)
    persist()
  }

  function updateNotificationSettings(data: Partial<NotificationSettings>) {
    notificationSettings.value = { ...notificationSettings.value, ...data }
    persist()
  }

  function addShift(data: Omit<Shift, 'id'>) {
    const id = genId()
    shifts.value.push({ ...data, id })
    persist()
    return id
  }

  function updateShift(id: string, data: Partial<Shift>) {
    const idx = shifts.value.findIndex(s => s.id === id)
    if (idx >= 0) {
      shifts.value[idx] = { ...shifts.value[idx], ...data }
      persist()
    }
  }

  function deleteShift(id: string) {
    shifts.value = shifts.value.filter(s => s.id !== id)
    persist()
  }

  function addUser(data: Omit<User, 'id' | 'createdAt'>) {
    const id = genId()
    users.value.push({ ...data, id, createdAt: new Date().toISOString() } as User)
    persist()
    return id
  }

  function updateUser(id: string, data: Partial<User>) {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx >= 0) {
      users.value[idx] = { ...users.value[idx], ...data }
      persist()
    }
  }

  return {
    devices, shifts, disinfectants, disinfectantLogs, tasks, records, notifications, users, notificationSettings,
    unreadNotificationCount, todayTasks, pendingTaskCount, completedTaskCount, expiredTaskCount, abnormalRecords,
    getDevice, getShift, getDisinfectant, getTask, getRecord, getUser,
    addDevice, updateDevice, deleteDevice,
    addDisinfectant, updateDisinfectant, checkDisinfectantValid, consumeDisinfectant,
    startTask, completeTask,
    addRecord, updateRecord,
    addNotification, markNotificationRead, markAllNotificationsRead,
    updateNotificationSettings,
    addShift, updateShift, deleteShift,
    addUser, updateUser,
    persist
  }
})
