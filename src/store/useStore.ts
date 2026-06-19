import { create } from 'zustand';
import type { FittingRoom, QueueItem, FittingRecord, Assistant, ConversionStats } from '../../shared/types';
import { api } from '@/lib/api';

interface AppState {
  rooms: FittingRoom[];
  queue: QueueItem[];
  records: FittingRecord[];
  assistants: Assistant[];
  stats: ConversionStats | null;
  leftItems: { roomNumber: string; items: string[]; queueNumber: number }[];
  currentCalledNumber: number | null;
  timeoutThreshold: number;
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetchRooms: () => Promise<void>;
  fetchQueue: () => Promise<void>;
  fetchRecords: () => Promise<void>;
  fetchAssistants: () => Promise<void>;
  fetchStats: (period?: 'today' | 'week' | 'month') => Promise<void>;
  fetchLeftItems: () => Promise<void>;
  fetchTimeoutThreshold: () => Promise<void>;

  addRoom: (room: Omit<FittingRoom, 'id'>) => Promise<void>;
  updateRoom: (id: string, data: Partial<FittingRoom>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;

  addQueueItem: (data: Omit<QueueItem, 'id' | 'queueNumber' | 'status' | 'createdAt'>) => Promise<QueueItem>;
  callNext: () => Promise<boolean>;
  confirmEnter: (queueId: string) => Promise<void>;
  completeFitting: (queueId: string, record: Partial<FittingRecord>) => Promise<void>;
  markTimeout: (queueId: string) => Promise<{ oldTimedOut: QueueItem; nextCalled?: { queue: QueueItem; room: FittingRoom } } | null>;

  setTimeoutThreshold: (seconds: number) => Promise<void>;
  checkTimeouts: () => Promise<{ oldTimedOut: QueueItem; nextCalled?: { queue: QueueItem; room: FittingRoom } }[]>;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  rooms: [],
  queue: [],
  records: [],
  assistants: [],
  stats: null,
  leftItems: [],
  currentCalledNumber: null,
  timeoutThreshold: 120,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchRooms(),
        get().fetchQueue(),
        get().fetchRecords(),
        get().fetchAssistants(),
        get().fetchStats(),
        get().fetchLeftItems(),
        get().fetchTimeoutThreshold(),
      ]);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载数据失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchRooms: async () => {
    try {
      const rooms = await api.rooms.getAll();
      set({ rooms });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载试衣间失败' });
    }
  },

  fetchQueue: async () => {
    try {
      const queue = await api.queue.getAll();
      set({ queue });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载排队信息失败' });
    }
  },

  fetchRecords: async () => {
    try {
      const records = await api.records.getAll();
      set({ records });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载记录失败' });
    }
  },

  fetchAssistants: async () => {
    try {
      const assistants = await api.assistants.getAll();
      set({ assistants });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载导购信息失败' });
    }
  },

  fetchStats: async (period = 'today') => {
    try {
      const stats = await api.stats.getConversion(period);
      set({ stats });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载统计数据失败' });
    }
  },

  fetchLeftItems: async () => {
    try {
      const leftItems = await api.records.getLeftItems();
      set({ leftItems });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载遗落物失败' });
    }
  },

  fetchTimeoutThreshold: async () => {
    try {
      const { threshold } = await api.assistants.getTimeoutThreshold();
      set({ timeoutThreshold: threshold });
    } catch (error) {
      // ignore
    }
  },

  addRoom: async (room) => {
    set({ loading: true });
    try {
      await api.rooms.create(room);
      await get().fetchRooms();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '添加试衣间失败' });
    } finally {
      set({ loading: false });
    }
  },

  updateRoom: async (id, data) => {
    set({ loading: true });
    try {
      await api.rooms.update(id, data);
      await get().fetchRooms();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新试衣间失败' });
    } finally {
      set({ loading: false });
    }
  },

  deleteRoom: async (id) => {
    set({ loading: true });
    try {
      await api.rooms.delete(id);
      await get().fetchRooms();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除试衣间失败' });
    } finally {
      set({ loading: false });
    }
  },

  addQueueItem: async (data) => {
    set({ loading: true });
    try {
      const newItem = await api.queue.create(data);
      await get().fetchQueue();
      return newItem;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '添加排队失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  callNext: async () => {
    set({ loading: true });
    try {
      const result = await api.queue.callNext();
      set({ currentCalledNumber: result.queue.queueNumber });
      await Promise.all([get().fetchQueue(), get().fetchRooms()]);
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '叫号失败' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  confirmEnter: async (queueId) => {
    set({ loading: true });
    try {
      await api.queue.confirmEnter(queueId);
      await Promise.all([get().fetchQueue(), get().fetchRooms()]);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '确认进入失败' });
    } finally {
      set({ loading: false });
    }
  },

  completeFitting: async (queueId, record) => {
    set({ loading: true });
    try {
      await api.queue.complete(queueId, record);
      await Promise.all([get().fetchQueue(), get().fetchRooms(), get().fetchRecords(), get().fetchLeftItems(), get().fetchStats()]);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '完成试衣失败' });
    } finally {
      set({ loading: false });
    }
  },

  markTimeout: async (queueId) => {
    set({ loading: true });
    try {
      const result = await api.queue.markTimeout(queueId);
      
      const currentQueue = get().queue;
      const updatedQueue = currentQueue.map(q => {
        if (q.id === result.oldTimedOut.id) return result.oldTimedOut;
        if (result.nextCalled && q.id === result.nextCalled.queue.id) return result.nextCalled.queue;
        return q;
      });
      
      const currentRooms = get().rooms;
      const updatedRooms = currentRooms.map(r => {
        if (result.nextCalled && r.id === result.nextCalled.room.id) return result.nextCalled.room;
        if (r.id === result.oldTimedOut.roomId) return { ...r, status: 'available' as const, currentQueueId: undefined };
        return r;
      });
      
      set({ 
        queue: updatedQueue, 
        rooms: updatedRooms,
        currentCalledNumber: result.nextCalled?.queue.queueNumber ?? null,
      });
      
      return result;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '标记超时失败' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setTimeoutThreshold: async (seconds) => {
    try {
      await api.assistants.setTimeoutThreshold(seconds);
      set({ timeoutThreshold: seconds });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '设置超时时间失败' });
    }
  },

  checkTimeouts: async () => {
    try {
      const { results } = await api.queue.checkTimeouts();
      if (results.length > 0) {
        let currentQueue = get().queue;
        let currentRooms = get().rooms;
        let latestCalledNumber: number | null = null;
        
        results.forEach(result => {
          currentQueue = currentQueue.map(q => {
            if (q.id === result.oldTimedOut.id) return result.oldTimedOut;
            if (result.nextCalled && q.id === result.nextCalled.queue.id) return result.nextCalled.queue;
            return q;
          });
          
          if (result.nextCalled) {
            currentRooms = currentRooms.map(r => {
              if (r.id === result.nextCalled.room.id) return result.nextCalled.room;
              return r;
            });
            latestCalledNumber = result.nextCalled.queue.queueNumber;
          } else {
            currentRooms = currentRooms.map(r => {
              if (r.id === result.oldTimedOut.roomId) return { ...r, status: 'available' as const, currentQueueId: undefined };
              return r;
            });
          }
        });
        
        set({ 
          queue: currentQueue, 
          rooms: currentRooms,
          currentCalledNumber: latestCalledNumber,
        });
      }
      return results;
    } catch (error) {
      return [];
    }
  },

  clearError: () => set({ error: null }),
}));
