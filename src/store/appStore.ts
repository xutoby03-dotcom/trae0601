import { create } from 'zustand';
import type { Session, InventoryItem, Registration, DashboardData } from '../../shared/types';

interface AppState {
  sessions: Session[];
  inventory: InventoryItem[];
  registrations: Registration[];
  dashboard: DashboardData | null;
  selectedSessionId: string;
  loading: boolean;

  fetchSessions: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchRegistrations: (sessionId?: string) => Promise<void>;
  fetchDashboard: (sessionId: string) => Promise<void>;
  refreshAllForSession: (sessionId: string) => Promise<void>;

  setSelectedSessionId: (id: string) => void;
}

const api = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || '请求失败');
  }
  return res.json();
};

export const useAppStore = create<AppState>((set, get) => ({
  sessions: [],
  inventory: [],
  registrations: [],
  dashboard: null,
  selectedSessionId: '',
  loading: false,

  fetchSessions: async () => {
    set({ loading: true });
    try {
      const sessions = await api<Session[]>('/api/sessions');
      set({ sessions });
      if (!get().selectedSessionId && sessions.length > 0) {
        set({ selectedSessionId: sessions[0].id });
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchInventory: async () => {
    const inventory = await api<InventoryItem[]>('/api/inventory');
    set({ inventory });
  },

  fetchRegistrations: async (sessionId?: string) => {
    const sid = sessionId || get().selectedSessionId;
    const url = sid ? `/api/registrations?sessionId=${sid}` : '/api/registrations';
    const registrations = await api<Registration[]>(url);
    set({ registrations });
  },

  fetchDashboard: async (sessionId: string) => {
    set({ loading: true });
    try {
      const dashboard = await api<DashboardData>(`/api/dashboard/${sessionId}`);
      set({ dashboard });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedSessionId: (id: string) => set({ selectedSessionId: id }),

  refreshAllForSession: async (sessionId: string) => {
    if (!sessionId) return;
    const sid = sessionId;
    const [regs] = await Promise.all([
      api<Registration[]>(`/api/registrations?sessionId=${sid}`),
      (async () => {
        try {
          const d = await api<DashboardData>(`/api/dashboard/${sid}`);
          set({ dashboard: d });
        } catch {}
      })(),
    ]);
    set({ registrations: regs });
  },
}));

export { api };
