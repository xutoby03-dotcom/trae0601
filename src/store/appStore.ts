import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Remote, BorrowRecord, PurchaseOrder, Notification, RemoteStatus, BorrowStatus } from '../data/types';
import { mockRemotes, mockBorrowRecords, mockPurchaseOrders, mockNotifications } from '../data/mockData';

interface AppState {
  remotes: Remote[];
  borrowRecords: BorrowRecord[];
  purchaseOrders: PurchaseOrder[];
  notifications: Notification[];
  addRemote: (remote: Omit<Remote, 'id' | 'createdAt'>) => void;
  updateRemote: (id: string, updates: Partial<Remote>) => void;
  deleteRemote: (id: string) => void;
  addBorrowRecord: (record: Omit<BorrowRecord, 'id'>) => void;
  updateBorrowRecord: (id: string, updates: Partial<BorrowRecord>) => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  borrowRemote: (remoteId: string, borrower: string, department: string, conferenceRoom: string, expectedReturn: string, purpose: string) => void;
  returnRemote: (recordId: string, returnBatteryLevel: number, hasDamage: boolean, inOriginalBox: boolean, notes?: string) => void;
  markRemoteLost: (remoteId: string, reason: string) => void;
  resetData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      remotes: mockRemotes,
      borrowRecords: mockBorrowRecords,
      purchaseOrders: mockPurchaseOrders,
      notifications: mockNotifications,

      addRemote: (remote) => set((state) => ({
        remotes: [...state.remotes, { ...remote, id: generateId(), createdAt: new Date().toISOString() }]
      })),

      updateRemote: (id, updates) => set((state) => ({
        remotes: state.remotes.map(r => r.id === id ? { ...r, ...updates } : r)
      })),

      deleteRemote: (id) => set((state) => ({
        remotes: state.remotes.filter(r => r.id !== id)
      })),

      addBorrowRecord: (record) => set((state) => ({
        borrowRecords: [...state.borrowRecords, { ...record, id: generateId() }]
      })),

      updateBorrowRecord: (id, updates) => set((state) => ({
        borrowRecords: state.borrowRecords.map(r => r.id === id ? { ...r, ...updates } : r)
      })),

      addPurchaseOrder: (order) => set((state) => ({
        purchaseOrders: [...state.purchaseOrders, { ...order, id: generateId() }]
      })),

      updatePurchaseOrder: (id, updates) => set((state) => ({
        purchaseOrders: state.purchaseOrders.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      addNotification: (notification) => set((state) => ({
        notifications: [{ ...notification, id: generateId(), timestamp: new Date().toISOString(), read: false }, ...state.notifications]
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      borrowRemote: (remoteId, borrower, department, conferenceRoom, expectedReturn, purpose) => {
        const state = get();
        const remote = state.remotes.find(r => r.id === remoteId);
        if (!remote || remote.status !== 'available') return;

        const now = new Date().toISOString();
        const newRecord: BorrowRecord = {
          id: generateId(),
          remoteId,
          borrower,
          department,
          conferenceRoom,
          borrowTime: now,
          expectedReturn,
          purpose,
          status: 'borrowing'
        };

        set((state) => ({
          remotes: state.remotes.map(r => r.id === remoteId ? { ...r, status: 'borrowed' as RemoteStatus } : r),
          borrowRecords: [...state.borrowRecords, newRecord]
        }));
      },

      returnRemote: (recordId, returnBatteryLevel, hasDamage, inOriginalBox, notes) => {
        const state = get();
        const record = state.borrowRecords.find(r => r.id === recordId);
        if (!record) return;

        const now = new Date().toISOString();
        
        set((state) => ({
          borrowRecords: state.borrowRecords.map(r => 
            r.id === recordId 
              ? { ...r, actualReturn: now, returnBatteryLevel, hasDamage, inOriginalBox, status: 'returned' as BorrowStatus, notes } 
              : r
          ),
          remotes: state.remotes.map(r => 
            r.id === record.remoteId 
              ? { 
                  ...r, 
                  status: hasDamage ? 'maintenance' as RemoteStatus : 'available' as RemoteStatus,
                  batteryLevel: returnBatteryLevel
                } 
              : r
          )
        }));

        if (returnBatteryLevel < 20) {
          get().addNotification({
            type: 'lowBattery',
            title: '电池电量低',
            message: `遥控器${state.remotes.find(r => r.id === record.remoteId)?.code}电量仅${returnBatteryLevel}%，请及时更换电池`,
            remoteId: record.remoteId,
            recordId
          });
        }

        if (hasDamage) {
          get().addNotification({
            type: 'maintenance',
            title: '设备需维修',
            message: `遥控器${state.remotes.find(r => r.id === record.remoteId)?.code}归还时发现外壳破损，已转入维修状态`,
            remoteId: record.remoteId,
            recordId
          });
        }
      },

      markRemoteLost: (remoteId, reason) => {
        const state = get();
        const remote = state.remotes.find(r => r.id === remoteId);
        if (!remote) return;

        const activeRecord = state.borrowRecords.find(
          r => r.remoteId === remoteId && (r.status === 'borrowing' || r.status === 'overdue')
        );

        set((state) => ({
          remotes: state.remotes.map(r => r.id === remoteId ? { ...r, status: 'lost' as RemoteStatus } : r),
          borrowRecords: activeRecord 
            ? state.borrowRecords.map(r => r.id === activeRecord.id ? { ...r, status: 'lost' as BorrowStatus, notes: reason } : r)
            : state.borrowRecords
        }));

        get().addPurchaseOrder({
          remoteId,
          reason: `遥控器${remote.code}丢失，需补购。原因：${reason}`,
          applicant: '系统',
          applyDate: new Date().toISOString(),
          status: 'pending'
        });
      },

      resetData: () => set({
        remotes: mockRemotes,
        borrowRecords: mockBorrowRecords,
        purchaseOrders: mockPurchaseOrders,
        notifications: mockNotifications
      })
    }),
    {
      name: 'remote-control-storage',
    }
  )
);
