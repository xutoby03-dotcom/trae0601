import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FamilyMember,
  KeyTrustee,
  KeyArchive,
  BorrowRecord,
  Reminder,
  AppSettings,
  KeyStatus,
  ReminderType,
} from '../types';
import {
  mockFamilyMembers,
  mockTrustees,
  mockKeyArchives,
  mockBorrowRecords,
  mockReminders,
  mockSettings,
} from '../data/mockData';
import { generateId, todayStr, daysFromToday, formatDate } from '../utils/helpers';

interface AppStore {
  familyMembers: FamilyMember[];
  trustees: KeyTrustee[];
  keyArchives: KeyArchive[];
  borrowRecords: BorrowRecord[];
  reminders: Reminder[];
  settings: AppSettings;

  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;

  addTrustee: (trustee: Omit<KeyTrustee, 'id'>) => void;
  updateTrustee: (id: string, data: Partial<KeyTrustee>) => void;
  deleteTrustee: (id: string) => void;

  addKeyArchive: (archive: Omit<KeyArchive, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateKeyArchive: (id: string, data: Partial<KeyArchive>) => void;
  deleteKeyArchive: (id: string) => void;
  computeArchiveStatus: (archiveId: string) => KeyStatus;
  markCoreReplaced: (archiveId: string) => void;
  markKeyAsVerified: (archiveId: string) => void;

  addBorrowRecord: (record: Omit<BorrowRecord, 'id' | 'isReturned'>) => void;
  returnBorrowRecord: (recordId: string, returnData: Partial<BorrowRecord>) => void;

  generateReminders: () => void;
  markReminderRead: (id: string) => void;
  resolveReminder: (id: string) => void;
  resolveRemindersForArchive: (archiveId: string, type: ReminderType) => void;
  deleteReminder: (id: string) => void;

  updateSettings: (data: Partial<AppSettings>) => void;

  getActiveBorrowRecord: (archiveId: string) => BorrowRecord | undefined;
  getUnresolvedRemindersCount: () => number;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      familyMembers: mockFamilyMembers,
      trustees: mockTrustees,
      keyArchives: mockKeyArchives,
      borrowRecords: mockBorrowRecords,
      reminders: mockReminders,
      settings: mockSettings,

      addFamilyMember: (member) =>
        set((s) => ({
          familyMembers: [...s.familyMembers, { ...member, id: generateId() }],
        })),

      updateFamilyMember: (id, data) =>
        set((s) => ({
          familyMembers: s.familyMembers.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),

      deleteFamilyMember: (id) =>
        set((s) => ({
          familyMembers: s.familyMembers.filter((m) => m.id !== id),
        })),

      addTrustee: (trustee) =>
        set((s) => ({
          trustees: [...s.trustees, { ...trustee, id: generateId() }],
        })),

      updateTrustee: (id, data) =>
        set((s) => ({
          trustees: s.trustees.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),

      deleteTrustee: (id) =>
        set((s) => ({
          trustees: s.trustees.filter((t) => t.id !== id),
        })),

      addKeyArchive: (archive) => {
        const now = todayStr();
        const newArchive: KeyArchive = {
          ...archive,
          id: generateId(),
          status: 'available',
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          keyArchives: [...s.keyArchives, newArchive],
        }));
      },

      updateKeyArchive: (id, data) =>
        set((s) => ({
          keyArchives: s.keyArchives.map((k) =>
            k.id === id ? { ...k, ...data, updatedAt: todayStr() } : k
          ),
        })),

      deleteKeyArchive: (id) =>
        set((s) => ({
          keyArchives: s.keyArchives.filter((k) => k.id !== id),
        })),

      computeArchiveStatus: (archiveId) => {
        const { borrowRecords } = get();
        const active = borrowRecords.find(
          (r) => r.keyArchiveId === archiveId && !r.isReturned
        );
        return active ? 'borrowed' : 'available';
      },

      markCoreReplaced: (archiveId) => {
        const { updateKeyArchive } = get();
        updateKeyArchive(archiveId, {
          coreReplacedDate: todayStr(),
          oldKeysRecovered: false,
        });
      },

      markKeyAsVerified: (archiveId) => {
        const { updateKeyArchive, resolveRemindersForArchive } = get();
        updateKeyArchive(archiveId, { lastVerifiedDate: todayStr() });
        resolveRemindersForArchive(archiveId, 'long_unverified');
      },

      addBorrowRecord: (record) => {
        const newRecord: BorrowRecord = {
          ...record,
          id: generateId(),
          isReturned: false,
        };
        set((s) => ({
          borrowRecords: [...s.borrowRecords, newRecord],
        }));
      },

      returnBorrowRecord: (recordId, returnData) =>
        set((s) => {
          const targetRecord = s.borrowRecords.find((r) => r.id === recordId);
          const newBorrowRecords = s.borrowRecords.map((r) =>
            r.id === recordId
              ? {
                  ...r,
                  isReturned: true,
                  returnDate: todayStr(),
                  ...returnData,
                }
              : r
          );
          let newKeyArchives = s.keyArchives;
          if (targetRecord) {
            const hasOtherActive = newBorrowRecords.some(
              (r) =>
                r.keyArchiveId === targetRecord.keyArchiveId && !r.isReturned
            );
            if (!hasOtherActive) {
              newKeyArchives = s.keyArchives.map((k) =>
                k.id === targetRecord.keyArchiveId && k.status === 'borrowed'
                  ? { ...k, status: 'available' as const }
                  : k
              );
            }
          }
          return {
            borrowRecords: newBorrowRecords,
            keyArchives: newKeyArchives,
          };
        }),

      generateReminders: () => {
        const { keyArchives, trustees, reminders, settings } = get();
        const today = todayStr();
        const newReminders: Reminder[] = [];

        for (const archive of keyArchives) {
          const trustee = trustees.find((t) => t.id === archive.trusteeId);
          const unverifiedDays = daysFromToday(archive.lastVerifiedDate);

          if (unverifiedDays > settings.unverifiedDaysThreshold) {
            const exists = reminders.some(
              (r) =>
                r.keyArchiveId === archive.id &&
                r.type === 'long_unverified' &&
                !r.isResolved
            );
            if (!exists) {
              newReminders.push({
                id: generateId(),
                type: 'long_unverified',
                keyArchiveId: archive.id,
                title: `${archive.lockName}钥匙已 ${unverifiedDays} 天未核对`,
                description: `距离上次核对（${archive.lastVerifiedDate}）已超过设置的 ${settings.unverifiedDaysThreshold} 天阈值，建议联系${trustee?.name ?? '托管人'}确认钥匙仍完好存放。`,
                relatedDate: archive.lastVerifiedDate,
                isRead: false,
                isResolved: false,
                createdAt: today,
              });
            }
          }

          if (trustee?.movedFlag) {
            const exists = reminders.some(
              (r) =>
                r.keyArchiveId === archive.id &&
                r.type === 'trustee_moved' &&
                !r.isResolved
            );
            if (!exists) {
              newReminders.push({
                id: generateId(),
                type: 'trustee_moved',
                keyArchiveId: archive.id,
                title: `托管人${trustee.name}已搬家`,
                description: `${trustee.name}已标记为搬家${trustee.moveNote ? '：' + trustee.moveNote : ''}，请尽快取回${archive.lockName}钥匙，或更新新的存放地址。`,
                relatedDate: today,
                isRead: false,
                isResolved: false,
                createdAt: today,
              });
            }
          }

          if (archive.coreReplacedDate && !archive.oldKeysRecovered) {
            const exists = reminders.some(
              (r) =>
                r.keyArchiveId === archive.id &&
                r.type === 'old_keys_unrecovered' &&
                !r.isResolved
            );
            if (!exists) {
              const daysSince = daysFromToday(archive.coreReplacedDate);
              newReminders.push({
                id: generateId(),
                type: 'old_keys_unrecovered',
                keyArchiveId: archive.id,
                title: `锁芯已更换 ${daysSince} 天，旧钥匙未回收`,
                description: `${archive.lockName}锁芯已于 ${archive.coreReplacedDate} 更换，存放在${trustee?.name ?? '托管人'}处的旧钥匙需要回收或确认销毁。`,
                relatedDate: archive.coreReplacedDate,
                isRead: false,
                isResolved: false,
                createdAt: today,
              });
            }
          }
        }

        if (newReminders.length > 0) {
          set((s) => ({
            reminders: [...newReminders, ...s.reminders],
            settings: { ...s.settings, lastScanDate: today },
          }));
        }
      },

      markReminderRead: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, isRead: true } : r
          ),
        })),

      resolveReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id
              ? { ...r, isResolved: true, resolvedDate: todayStr(), isRead: true }
              : r
          ),
        })),

      resolveRemindersForArchive: (archiveId, type) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.keyArchiveId === archiveId && r.type === type
              ? { ...r, isResolved: true, resolvedDate: todayStr(), isRead: true }
              : r
          ),
        })),

      deleteReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.filter((r) => r.id !== id),
        })),

      updateSettings: (data) =>
        set((s) => ({
          settings: { ...s.settings, ...data },
        })),

      getActiveBorrowRecord: (archiveId) => {
        const { borrowRecords } = get();
        return borrowRecords.find(
          (r) => r.keyArchiveId === archiveId && !r.isReturned
        );
      },

      getUnresolvedRemindersCount: () => {
        const { reminders } = get();
        return reminders.filter((r) => !r.isResolved).length;
      },
    }),
    {
      name: 'key-keeper-storage',
      version: 1,
      partialize: (state) => ({
        familyMembers: state.familyMembers,
        trustees: state.trustees,
        keyArchives: state.keyArchives,
        borrowRecords: state.borrowRecords,
        reminders: state.reminders,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const { keyArchives, borrowRecords } = state;
        const repairedArchives = keyArchives.map((k) => {
          if (k.status !== 'borrowed') return k;
          const hasActive = borrowRecords.some(
            (r) => r.keyArchiveId === k.id && !r.isReturned
          );
          if (!hasActive) {
            return { ...k, status: 'available' as const };
          }
          return k;
        });
        const needRepair = repairedArchives.some(
          (k, i) => k !== keyArchives[i]
        );
        setTimeout(() => {
          if (needRepair) {
            useStore.setState({ keyArchives: repairedArchives });
          }
          useStore.getState().generateReminders();
        }, 0);
      },
    }
  )
);
