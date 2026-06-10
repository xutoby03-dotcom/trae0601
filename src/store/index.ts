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
  if (stored.length > 0) {
    const fixed = recomputeRepeatedCounts(stored);
    let changed = false;
    for (let i = 0; i < fixed.length; i++) {
      const o = stored[i];
      const n = fixed[i];
      if (!o || !n || o.repeatedCount !== n.repeatedCount || o.status !== n.status) {
        changed = true;
        break;
      }
    }
    if (changed) {
      saveToStorage(STORAGE_KEYS.TICKETS, fixed);
    }
    return fixed;
  }
  const mock = generateMockTickets();
  saveToStorage(STORAGE_KEYS.TICKETS, mock);
  return mock;
}

function elevatorKey(e: { building: string; unit: string; elevatorNo: string }): string {
  return `${e.building}-${e.unit}-${e.elevatorNo}`;
}

function recomputeRepeatedCounts(tickets: FaultTicket[]): FaultTicket[] {
  const counter: Record<string, number> = {};
  const sorted = [...tickets].sort((a, b) => a.occurredAt - b.occurredAt);
  const updated = sorted.map((t) => {
    const key = elevatorKey(t.elevator);
    counter[key] = (counter[key] || 0) + 1;
    const count = counter[key];
    let status = t.status;
    if (t.status === 'urgent' && count >= 3 && !t.hasTrapped) {
      status = 'repeated';
    }
    return { ...t, repeatedCount: count, status };
  });
  return updated.sort((a, b) => b.occurredAt - a.occurredAt);
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

    const existingTickets = get().tickets.filter(
      (t) =>
        t.elevator.building === data.elevator.building &&
        t.elevator.unit === data.elevator.unit &&
        t.elevator.elevatorNo === data.elevator.elevatorNo,
    );
    const historyCount = existingTickets.length;
    const newCount = historyCount + 1;
    const REPEATED_THRESHOLD = 3;
    const isRepeated = newCount >= REPEATED_THRESHOLD;

    let initialStatus: FaultStatus;
    if (data.hasTrapped) {
      initialStatus = 'urgent';
    } else if (isRepeated) {
      initialStatus = 'repeated';
    } else {
      initialStatus = 'urgent';
    }

    const ticket: FaultTicket = {
      ...data,
      id,
      reportedAt: now,
      status: initialStatus,
      timeline: [
        {
          status: initialStatus,
          timestamp: now,
          remark: isRepeated ? `住户上报（历史累计 ${newCount} 次，反复故障）` : '住户上报',
        },
      ],
      repeatedCount: newCount,
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
