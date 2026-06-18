import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInHours } from 'date-fns';
import type { ReminderLog, ReminderType, ReminderLevel, PackageItem, ExceptionRecord } from '@/types';
import { generateId } from '@/utils';
import { MOCK_REMINDERS } from '@/mock/data';
import { usePackageStore } from './packageStore';
import { useExceptionStore } from './exceptionStore';

interface ReminderState {
  logs: ReminderLog[];
  checkedPackageIds: Set<string>;
  checkAndTriggerReminders: () => { new24h: ReminderLog[]; new48h: ReminderLog[]; new72h: PackageItem[] };
  triggerManualReminder: (packageId: string, operator: string, result: string) => void;
  getLogsByPackageId: (packageId: string) => ReminderLog[];
  getRecentLogs: (limit?: number) => ReminderLog[];
  getTodayReminderCount: () => { auto: number; manual: number };
}

function isSameDay(date1: string, date2: Date): boolean {
  const d1 = new Date(date1);
  return (
    d1.getFullYear() === date2.getFullYear() &&
    d1.getMonth() === date2.getMonth() &&
    d1.getDate() === date2.getDate()
  );
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      logs: MOCK_REMINDERS,
      checkedPackageIds: new Set<string>(),

      checkAndTriggerReminders: () => {
        const { packages, markTransferred } = usePackageStore.getState();
        const stored = packages.filter((p) => p.status === 'stored');
        const new24h: ReminderLog[] = [];
        const new48h: ReminderLog[] = [];
        const new72h: PackageItem[] = [];
        const newLogs: ReminderLog[] = [];
        const newExceptionRecords: ExceptionRecord[] = [];
        const now = new Date();

        stored.forEach((pkg) => {
          const hours = differenceInHours(now, new Date(pkg.storedAt));
          const pkgLogs = get().logs.filter((l) => l.packageId === pkg.id);
          const has24h = pkgLogs.some((l) => l.type === 'auto_24h');
          const has48h = pkgLogs.some((l) => l.type === 'auto_48h');
          const hasManual72h = pkgLogs.some((l) => l.type === 'manual_72h');

          if (hours >= 24 && !has24h) {
            const log: ReminderLog = {
              id: generateId(),
              packageId: pkg.id,
              recipientName: pkg.recipientName,
              slotLabel: pkg.slotLabel,
              type: 'auto_24h' as ReminderType,
              level: 'warning' as ReminderLevel,
              remindedAt: now.toISOString(),
              result: '系统自动发送取件提醒短信',
            };
            newLogs.push(log);
            new24h.push(log);
          }
          if (hours >= 48 && !has48h) {
            const log: ReminderLog = {
              id: generateId(),
              packageId: pkg.id,
              recipientName: pkg.recipientName,
              slotLabel: pkg.slotLabel,
              type: 'auto_48h' as ReminderType,
              level: 'danger' as ReminderLevel,
              remindedAt: now.toISOString(),
              result: '系统再次提醒，通知保安关注',
            };
            newLogs.push(log);
            new48h.push(log);
          }
          if (hours >= 72 && !hasManual72h) {
            const manualLog: ReminderLog = {
              id: generateId(),
              packageId: pkg.id,
              recipientName: pkg.recipientName,
              slotLabel: pkg.slotLabel,
              type: 'manual_72h',
              level: 'critical',
              remindedAt: now.toISOString(),
              operator: '系统自动',
              result: '存放超过72小时无人认领，自动转人工处理并释放格口',
            };
            newLogs.push(manualLog);
            newExceptionRecords.push({
              id: generateId(),
              packageId: pkg.id,
              recipientName: pkg.recipientName,
              slotLabel: pkg.slotLabel,
              type: 'unclaimed',
              description: `存放超过${Math.floor(hours / 24)}天无人认领，系统自动转人工处理，已释放对应格口`,
              handler: '系统自动',
              createdAt: now.toISOString(),
            });
            markTransferred(pkg.id);
            new72h.push(pkg);
          }
        });

        if (newLogs.length > 0) {
          set((state) => ({ logs: [...newLogs, ...state.logs] }));
        }
        if (newExceptionRecords.length > 0) {
          useExceptionStore.setState((state) => ({
            records: [...newExceptionRecords, ...state.records],
          }));
        }

        return { new24h, new48h, new72h };
      },

      triggerManualReminder: (packageId, operator, result) => {
        const pkg = usePackageStore.getState().packages.find((p) => p.id === packageId);
        if (!pkg) return;
        const log: ReminderLog = {
          id: generateId(),
          packageId,
          recipientName: pkg.recipientName,
          slotLabel: pkg.slotLabel,
          type: 'manual_72h',
          level: 'critical',
          remindedAt: new Date().toISOString(),
          operator,
          result,
        };
        set((state) => ({ logs: [log, ...state.logs] }));
      },

      getLogsByPackageId: (packageId) =>
        get()
          .logs.filter((l) => l.packageId === packageId)
          .sort((a, b) => new Date(b.remindedAt).getTime() - new Date(a.remindedAt).getTime()),

      getRecentLogs: (limit = 50) =>
        [...get().logs]
          .sort((a, b) => new Date(b.remindedAt).getTime() - new Date(a.remindedAt).getTime())
          .slice(0, limit),

      getTodayReminderCount: () => {
        const today = new Date();
        let auto = 0;
        let manual = 0;
        get().logs.forEach((l) => {
          if (isSameDay(l.remindedAt, today)) {
            if (l.type === 'manual_72h') manual++;
            else auto++;
          }
        });
        return { auto, manual };
      },
    }),
    {
      name: 'reminder-storage',
    },
  ),
);
