import { useGroomingStore } from '@/store/useGroomingStore'
import { isToday, isPast, parseISO, format } from 'date-fns'
import { useEffect } from 'react'
import type { Appointment, AppointmentStatus } from '@/types'

export function useAutoStatusUpdate() {
  const appointments = useGroomingStore((s) => s.appointments)
  const updateAppointment = useGroomingStore((s) => s.updateAppointment)

  useEffect(() => {
    const now = new Date()
    appointments.forEach((apt) => {
      if (apt.status === 'completed') return
      const aptDate = parseISO(apt.datetime)
      if (apt.status === 'pending' && isToday(aptDate)) {
        updateAppointment(apt.id, { status: 'today' })
      }
    })
  }, [appointments, updateAppointment])
}

export function groupByStatus(appointments: Appointment[]): Record<AppointmentStatus, Appointment[]> {
  const groups: Record<AppointmentStatus, Appointment[]> = {
    pending: [],
    today: [],
    pickup: [],
    completed: [],
  }
  appointments.forEach((apt) => {
    groups[apt.status].push(apt)
  })
  return groups
}

export function getOverdueReminders() {
  const reminders = useGroomingStore.getState().reminders
  const now = new Date()
  return reminders.filter((r) => !r.isCompleted && isPast(parseISO(r.dueDate)))
}

export function getUpcomingReminders(days: number = 7) {
  const reminders = useGroomingStore.getState().reminders
  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return reminders.filter((r) => {
    if (r.isCompleted) return false
    const d = parseISO(r.dueDate)
    return d >= now && d <= future
  })
}

export function formatDateTime(dt: string) {
  return format(parseISO(dt), 'yyyy/MM/dd HH:mm')
}

export function formatDate(dt: string) {
  return format(parseISO(dt), 'yyyy/MM/dd')
}
