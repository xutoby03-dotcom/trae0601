export interface Activity {
  id: string
  title: string
  location: string
  startTime: string
  endTime: string
  maxParticipants: number
  cost: number
  bringItems: string
  poster: string
  status: 'not_started' | 'registering' | 'full' | 'ended'
  type: string
  createdAt: string
  confirmedCount: number
  registrations?: Registration[]
}

export interface Registration {
  id: string
  activityId: string
  name: string
  contact: string
  note: string
  bringFriends: number
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  checkedIn: boolean
  createdAt: string
}

export interface HistoryStats {
  totalActivities: number
  avgAttendanceRate: number
  activities: Array<{
    id: string
    title: string
    confirmedCount: number
    checkedInCount: number
    attendanceRate: number
  }>
}

export interface ActivityTypeStat {
  type: string
  participantCount: number
}

export interface CreateActivityPayload {
  title: string
  location: string
  startTime: string
  endTime: string
  maxParticipants: number
  cost: number
  bringItems: string
  poster: string
  type: string
}

export interface RegisterPayload {
  name: string
  contact: string
  note: string
  bringFriends: number
}

function mapActivity(raw: any): Activity {
  return {
    id: raw.id,
    title: raw.title,
    location: raw.location,
    startTime: raw.start_time,
    endTime: raw.end_time,
    maxParticipants: raw.max_participants,
    cost: raw.cost,
    bringItems: raw.bring_items,
    poster: raw.poster,
    status: raw.status,
    type: raw.type,
    createdAt: raw.created_at,
    confirmedCount: raw.confirmed_count ?? 0,
    registrations: raw.registrations ? raw.registrations.map(mapRegistration) : undefined,
  }
}

function mapRegistration(raw: any): Registration {
  return {
    id: raw.id,
    activityId: raw.activity_id,
    name: raw.name,
    contact: raw.contact,
    note: raw.note,
    bringFriends: raw.bring_friends,
    status: raw.status,
    checkedIn: !!raw.checked_in,
    createdAt: raw.created_at,
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.error || error.message || `Request failed: ${res.status}`)
  }
  const json = await res.json()
  return json.data !== undefined ? json.data : json
}

function toSnakeCase(payload: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(payload)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[snakeKey] = value
  }
  return result
}

export const api = {
  getActivities: async (status?: string): Promise<Activity[]> => {
    const raw = await request<any[]>(`/api/activities${status ? `?status=${status}` : ''}`)
    return raw.map(mapActivity)
  },

  getActivity: async (id: string): Promise<Activity> => {
    const raw = await request<any>(`/api/activities/${id}`)
    return mapActivity(raw)
  },

  createActivity: async (data: CreateActivityPayload): Promise<Activity> => {
    const raw = await request<any>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(data)),
    })
    return mapActivity(raw)
  },

  updateActivity: async (id: string, data: Partial<CreateActivityPayload>): Promise<Activity> => {
    const raw = await request<any>(`/api/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(data)),
    })
    return mapActivity(raw)
  },

  deleteActivity: (id: string) =>
    request<void>(`/api/activities/${id}`, { method: 'DELETE' }),

  register: async (activityId: string, data: RegisterPayload): Promise<Registration> => {
    const raw = await request<any>(`/api/activities/${activityId}/registrations`, {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(data)),
    })
    return mapRegistration(raw)
  },

  cancelRegistration: async (registrationId: string): Promise<Registration> => {
    const raw = await request<any>(`/api/registrations/${registrationId}/cancel`, { method: 'PUT' })
    return mapRegistration(raw)
  },

  checkinRegistration: async (registrationId: string): Promise<Registration> => {
    const raw = await request<any>(`/api/registrations/${registrationId}/checkin`, { method: 'PUT' })
    return mapRegistration(raw)
  },

  exportCSV: (activityId: string) =>
    `/api/activities/${activityId}/export`,

  getHistoryStats: async (): Promise<HistoryStats> => {
    const raw = await request<any>('/api/stats/history')
    return {
      totalActivities: raw.total_activities,
      avgAttendanceRate: raw.avg_attendance_rate,
      activities: (raw.activities || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        confirmedCount: a.confirmed_count,
        checkedInCount: a.checked_in_count,
        attendanceRate: a.attendance_rate,
      })),
    }
  },

  getActivityTypeStats: async (): Promise<ActivityTypeStat[]> => {
    const raw = await request<any[]>('/api/stats/activity-types')
    return raw.map((item: any) => ({
      type: item.type,
      participantCount: item.participant_count,
    }))
  },
}
