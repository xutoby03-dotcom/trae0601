import { create } from 'zustand';
import type {
  FaultTicket,
  FaultStatus,
  BuildingSubscription,
  UserRole,
  AppNotification,
  ElevatorId,
  FaultPhenomenon,
} from '@/shared/types';
import { STORAGE_KEYS } from '@/shared/constants';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';
import { generateMockTickets } from '@/utils/mock';
import { computeStatistics, sortTicketsForList } from '@/utils/statistics';

interface AddTicketInput {
  elevator: ElevatorId;
  phenomenon: FaultPhenomenon;
  description: string;
  hasTrapped: boolean;
  trappedCount?: number;
  photos: string[];
  occurredAt: number;
  reportedBy: string;
}

interface AppState {
  tickets: FaultTicket[];
  currentRole: UserRole;
  subscriptions: BuildingSubscription;
  notifications: AppNotification[];

  addTicket: (data: AddTicketInput) => string;
  updateStatus: (id: string, status: FaultStatus, update: Partial<FaultTicket> & { operator?: string; remark?: string }) => void;
  toggleRole: () => void;
  toggleBuildingSubscribe: (building: string) => void;
  setSubscriptionOptions: (opts: Partial<BuildingSubscription>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  getTicketById: (id: string) => FaultTicket | undefined;
  getFilteredTickets: (status?: FaultStatus) => FaultTicket[];
  computeStatistics: () => ReturnType<typeof computeStatistics>;
  unreadCount: () => number;
}

function initTickets(): FaultTicket[] {
  const stored = loadFromStorage<FaultTicket[]>(STORAGE_KEYS.TICKETS, []);
  if (stored.length > 0) return stored;
  const mock = generateMockTickets();
  saveToStorage(STORAGE_KEYS.TICKETS, mock);
  return mock;
}

function pushNotificationForState(
  state: AppState,
  ticket: FaultTicket,
  message: string,
): AppNotification[] {
  const sub = state.subscriptions;
  if (!sub.buildings.includes(ticket.elevator.building)) return state.notifications;
  const note: AppNotification = {
    id: generateId(),
    ticketId: ticket.id,
    message,
    read: false,
    createdAt: Date.now(),
  };
  return [note, ...state.notifications];
}

export const useAppStore = create<AppState>((set, get) => ({
  tickets: initTickets(),
  currentRole: loadFromStorage<UserRole>(STORAGE_KEYS.ROLE, 'resident'),
  subscriptions: loadFromStorage<BuildingSubscription>(STORAGE_KEYS.SUBSCRIPTIONS, {
    buildings: [],
    notifyOnRecovered: true,
    notifyOnStatusChange: true,
  }),
  notifications: loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []),

  addTicket: (data) => {
    const id = generateId();
    const now = Date.now();
    const initialStatus: FaultStatus = data.hasTrapped ? 'urgent' : 'urgent';
    const ticket: FaultTicket = {
      ...data,
      id,
      reportedAt: now,
      status: initialStatus,
      timeline: [{ status: initialStatus, timestamp: now, remark: '住户上报' }],
      repeatedCount: 1,
    };
    set((s) => {
      const tickets = [ticket, ...s.tickets];
      saveToStorage(STORAGE_KEYS.TICKETS, tickets);
      return { tickets };
    });
    return id;
  },

  updateStatus: (id, status, update) => {
    const now = Date.now();
    set((s) => {
      const tickets = s.tickets.map((t) => {
        if (t.id !== id) return t;
        const next: FaultTicket = {
          ...t,
          ...update,
          status,
          timeline: [
            ...t.timeline,
            {
              status,
              timestamp: now,
              operator: update.operator,
              remark: update.remark,
            },
          ],
        };
        if (status === 'recovered' && !next.recoveredAt) {
          next.recoveredAt = now;
        }
        return next;
      });
      saveToStorage(STORAGE_KEYS.TICKETS, tickets);
      const updated = tickets.find((t) => t.id === id)!;
      let notifications = s.notifications;
      const sub = s.subscriptions;
      if (sub.buildings.includes(updated.elevator.building)) {
        if (status === 'recovered' && sub.notifyOnRecovered) {
          notifications = [
            {
              id: generateId(),
              ticketId: updated.id,
              message: `✅ ${updated.elevator.building}${updated.elevator.unit}${updated.elevator.elevatorNo} 已恢复运行`,
              read: false,
              createdAt: Date.now(),
            },
            ...notifications,
          ];
        } else if (sub.notifyOnStatusChange) {
          const labels: Record<FaultStatus, string> = {
            urgent: '紧急待处理',
            processing: '处理中',
            waiting_parts: '等待配件',
            recovered: '已恢复',
            repeated: '反复故障关注',
          };
          notifications = [
            {
              id: generateId(),
              ticketId: updated.id,
              message: `🔧 ${updated.elevator.building}${updated.elevator.unit}${updated.elevator.elevatorNo} 状态更新为「${labels[status]}」`,
              read: false,
              createdAt: Date.now(),
            },
            ...notifications,
          ];
        }
      }
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return { tickets, notifications };
    });
  },

  toggleRole: () => {
    set((s) => {
      const role: UserRole = s.currentRole === 'resident' ? 'property' : 'resident';
      saveToStorage(STORAGE_KEYS.ROLE, role);
      return { currentRole: role };
    });
  },

  toggleBuildingSubscribe: (building) => {
    set((s) => {
      const has = s.subscriptions.buildings.includes(building);
      const buildings = has
        ? s.subscriptions.buildings.filter((b) => b !== building)
        : [...s.subscriptions.buildings, building];
      const subscriptions = { ...s.subscriptions, buildings };
      saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
      return { subscriptions };
    });
  },

  setSubscriptionOptions: (opts) => {
    set((s) => {
      const subscriptions = { ...s.subscriptions, ...opts };
      saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
      return { subscriptions };
    });
  },

  markNotificationRead: (id) => {
    set((s) => {
      const notifications = s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return { notifications };
    });
  },

  markAllNotificationsRead: () => {
    set((s) => {
      const notifications = s.notifications.map((n) => ({ ...n, read: true }));
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return { notifications };
    });
  },

  getTicketById: (id) => get().tickets.find((t) => t.id === id),

  getFilteredTickets: (status) => {
    const all = get().tickets;
    let filtered = all;
    if (status) {
      filtered = all.filter((t) => t.status === status);
    }
    return sortTicketsForList(filtered);
  },

  computeStatistics: () => computeStatistics(get().tickets),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
