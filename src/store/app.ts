import { create } from 'zustand'
import type { Exhibition, Booth, Application, Stats, SetupRecord } from '../../shared/types'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.error || 'Request failed')
  return data.data as T
}

interface AppState {
  exhibitions: (Exhibition & { total?: number; occupied?: number; pending?: number; conflicts?: number })[]
  currentExhibition: Exhibition | null
  currentExhibitionId: number
  booths: Booth[]
  applications: (Application & { booth_number?: string; booth_status?: string })[]
  setup: { checked_in: SetupRecord[]; pending: any[] } | null
  stats: Stats | null
  alerts: { id: number; type: 'success' | 'error' | 'info'; message: string }[]
  addAlert: (type: 'success' | 'error' | 'info', message: string) => void
  removeAlert: (id: number) => void
  fetchExhibitions: () => Promise<void>
  setCurrentExhibition: (id: number) => Promise<void>
  createExhibition: (payload: any) => Promise<number>
  updateExhibition: (id: number, payload: any) => Promise<void>
  deleteExhibition: (id: number) => Promise<void>
  fetchBooths: (id: number) => Promise<void>
  fetchApplications: (id: number) => Promise<void>
  submitApplication: (payload: any) => Promise<number>
  updateApplicationStatus: (id: number, status: 'approved' | 'rejected') => Promise<void>
  fetchMyApplications: (phone?: string) => Promise<any[]>
  fetchSetup: (id: number) => Promise<void>
  checkIn: (payload: any) => Promise<void>
  swapBooths: (payload: any) => Promise<void>
  fetchStats: (id: number) => Promise<void>
}

let alertCounter = 0

export const useApp = create<AppState>((set, get) => ({
  exhibitions: [],
  currentExhibition: null,
  currentExhibitionId: 0,
  booths: [],
  applications: [],
  setup: null,
  stats: null,
  alerts: [],

  addAlert: (type, message) => {
    const id = ++alertCounter
    set(s => ({ alerts: [...s.alerts, { id, type, message }] }))
    setTimeout(() => {
      set(s => ({ alerts: s.alerts.filter(a => a.id !== id) }))
    }, 3000)
  },
  removeAlert: id => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),

  fetchExhibitions: async () => {
    try {
      const data = await request<any[]>('/api/exhibitions')
      set({ exhibitions: data })
      if (!get().currentExhibitionId && data.length) {
        await get().setCurrentExhibition(data[0].id)
      }
    } catch (e: any) {
      get().addAlert('error', e.message)
    }
  },

  setCurrentExhibition: async id => {
    try {
      const ex = await request<Exhibition>(`/api/exhibitions/${id}`)
      set({ currentExhibition: ex, currentExhibitionId: id })
    } catch (e: any) {
      get().addAlert('error', e.message)
    }
  },

  createExhibition: async payload => {
    try {
      const r = await request<{ id: number }>('/api/exhibitions', { method: 'POST', body: JSON.stringify(payload) })
      get().addAlert('success', '展会创建成功')
      await get().fetchExhibitions()
      return r.id
    } catch (e: any) {
      get().addAlert('error', e.message)
      throw e
    }
  },

  updateExhibition: async (id, payload) => {
    try {
      await request(`/api/exhibitions/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
      get().addAlert('success', '展会已更新')
      await get().fetchExhibitions()
      await get().setCurrentExhibition(id)
    } catch (e: any) {
      get().addAlert('error', e.message)
      throw e
    }
  },

  deleteExhibition: async id => {
    try {
      await request(`/api/exhibitions/${id}`, { method: 'DELETE' })
      get().addAlert('success', '展会已删除')
      await get().fetchExhibitions()
    } catch (e: any) {
      get().addAlert('error', e.message)
      throw e
    }
  },

  fetchBooths: async id => {
    try {
      const data = await request<Booth[]>(`/api/exhibitions/${id}/booths`)
      set({ booths: data })
    } catch (e: any) {
      get().addAlert('error', e.message)
    }
  },

  fetchApplications: async id => {
    try {
      const data = await request<any[]>(`/api/exhibitions/${id}/applications`)
      set({ applications: data })
    } catch (e: any) {
      get().addAlert('error', e.message)
    }
  },

  submitApplication: async payload => {
    try {
      const r = await request<{ id: number }>('/api/applications', { method: 'POST', body: JSON.stringify(payload) })
      get().addAlert('success', '申请已提交，等待审核')
      return r.id
    } catch (e: any) {
      get().addAlert('error', e.message)
      throw e
    }
  },

  updateApplicationStatus: async (id, status) => {
    try {
      await request(`/api/applications/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
      get().addAlert('success', status === 'approved' ? '申请已批准' : '申请已拒绝')
      if (get().currentExhibitionId) {
        await get().fetchBooths(get().currentExhibitionId)
        await get().fetchApplications(get().currentExhibitionId)
      }
    } catch (e: any) {
      get().addAlert('error', e.message)
      throw e
    }
  },

  fetchMyApplications: async phone => {
    try {
      const url = phone ? `/api/applications/my?phone=${encodeURIComponent(phone)}` : `/api/applications/my`
      return await request<any[]>(url)
    } catch (e: any) {
      get().addAlert('error', e.message)
      return []
    }
  },

  fetchSetup: async id => {
    try {
      const data = await request(`/api/exhibitions/${id}/setup`)
      set({ setup: data as any })
    } catch (e: any) {
      get().addAlert('error', e.message)
    }
  },

  checkIn: async payload => {
    try {
      await request('/api/setup/checkin', { method: 'POST', body: JSON.stringify(payload) })
      get().addAlert('success', '签到成功')
      if (get().currentExhibitionId) await get().fetchSetup(get().currentExhibitionId)
    } catch (e: any) {
      get().addAlert('error', e.message)
      throw e
    }
  },

  swapBooths: async payload => {
    try {
      await request('/api/setup/swap', { method: 'POST', body: JSON.stringify(payload) })
      get().addAlert('success', '摊位调换成功')
      if (get().currentExhibitionId) {
        await get().fetchSetup(get().currentExhibitionId)
        await get().fetchBooths(get().currentExhibitionId)
      }
    } catch (e: any) {
      get().addAlert('error', e.message)
      throw e
    }
  },

  fetchStats: async id => {
    try {
      const data = await request<Stats>(`/api/exhibitions/${id}/stats`)
      set({ stats: data })
    } catch (e: any) {
      get().addAlert('error', e.message)
    }
  },
}))
