import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Device,
  BatteryRecord,
  CleanRecord,
  Feedback,
  ChecklistItem,
  BatteryStock,
  BatterySize,
  FeedbackType,
  EarSide,
} from '@/types';

const today = new Date().toISOString().split('T')[0];
const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const initialDevices: Device[] = [
  {
    id: 'dev-001',
    name: '爷爷左耳助听器',
    ear: 'left',
    model: 'Phonak Audeo M30',
    batterySize: '312',
    storeName: '悦耳听力验配中心（人民广场店）',
    warrantyDate: '2026-12-31',
    nextCheckup: addDays(today, 28),
    batteryLifeDays: 7,
    createdAt: '2025-06-01',
  },
  {
    id: 'dev-002',
    name: '爷爷右耳助听器',
    ear: 'right',
    model: 'Phonak Audeo M30',
    batterySize: '312',
    storeName: '悦耳听力验配中心（人民广场店）',
    warrantyDate: '2026-12-31',
    nextCheckup: addDays(today, 28),
    batteryLifeDays: 7,
    createdAt: '2025-06-01',
  },
];

const initialBatteryRecords: BatteryRecord[] = [
  {
    id: 'bat-001',
    deviceId: 'dev-001',
    date: addDays(today, -6),
    remainingPercent: 15,
    replacedBy: '妈妈',
    hasLeakage: false,
    notes: '正常消耗',
  },
  {
    id: 'bat-002',
    deviceId: 'dev-002',
    date: addDays(today, -5),
    remainingPercent: 20,
    replacedBy: '妈妈',
    hasLeakage: false,
  },
];

const initialCleanRecords: CleanRecord[] = [
  {
    id: 'cln-001',
    deviceId: 'dev-001',
    date: addDays(today, -3),
    earplug: true,
    soundTube: true,
    dryBox: true,
    microphone: true,
    cleanedBy: '妈妈',
  },
  {
    id: 'cln-002',
    deviceId: 'dev-002',
    date: addDays(today, -3),
    earplug: true,
    soundTube: true,
    dryBox: true,
    microphone: false,
    cleanedBy: '妈妈',
    notes: '麦克风有耳垢堵塞，已用专用工具清理',
  },
];

const initialStock: BatteryStock[] = [
  { size: '10', quantity: 12 },
  { size: '13', quantity: 8 },
  { size: '312', quantity: 3 },
  { size: '675', quantity: 6 },
];

const initialFeedbacks: Feedback[] = [
  {
    id: 'fb-001',
    deviceId: 'dev-001',
    date: addDays(today, -1),
    type: 'whistling',
    description: '爷爷说今天看电视时左耳助听器经常出现啸叫',
    status: 'pending',
  },
];

const initialChecklist: ChecklistItem[] = [
  {
    id: 'chk-001',
    feedbackId: 'fb-001',
    deviceId: 'dev-001',
    title: '检查耳塞是否佩戴紧密',
    completed: false,
    dueDate: today,
  },
  {
    id: 'chk-002',
    feedbackId: 'fb-001',
    deviceId: 'dev-001',
    title: '清理导声管，检查是否有堵塞',
    completed: false,
    dueDate: today,
  },
  {
    id: 'chk-003',
    feedbackId: 'fb-001',
    deviceId: 'dev-001',
    title: '检查音量设置是否过高',
    completed: false,
    dueDate: today,
  },
  {
    id: 'chk-004',
    feedbackId: 'fb-001',
    deviceId: 'dev-001',
    title: '如啸叫持续，联系验配门店预约检查',
    completed: false,
    dueDate: addDays(today, 2),
  },
];

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const WHISTLING_CHECKLIST = [
  '检查耳塞是否佩戴紧密、贴合耳道',
  '清理导声管，检查是否有耳垢堵塞',
  '检查助听器音量是否设置过高',
  '更换新电池排除电量不足问题',
  '如持续啸叫，联系验配门店预约检查',
];

const SOUND_LOW_CHECKLIST = [
  '检查电池电量，必要时更换新电池',
  '清理麦克风口，检查是否被耳垢堵塞',
  '检查耳塞和导声管是否有堵塞',
  '确认音量开关和程序设置是否正确',
  '如问题持续，联系验配门店重新调试',
];

const PAIN_CHECKLIST = [
  '取下助听器休息，检查耳朵是否有红肿',
  '检查耳塞大小是否合适，是否挤压耳道',
  '确认佩戴方式是否正确，角度是否舒适',
  '每天佩戴时间可分段逐步增加',
  '如持续疼痛，联系验配门店调整耳塞或外壳',
];

const getChecklistTemplates = (type: FeedbackType) => {
  switch (type) {
    case 'whistling':
      return WHISTLING_CHECKLIST;
    case 'sound_low':
      return SOUND_LOW_CHECKLIST;
    case 'pain':
      return PAIN_CHECKLIST;
  }
};

interface AppState {
  devices: Device[];
  batteryRecords: BatteryRecord[];
  cleanRecords: CleanRecord[];
  feedbacks: Feedback[];
  checklistItems: ChecklistItem[];
  batteryStock: BatteryStock[];

  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
  deleteDevice: (id: string) => void;

  addBatteryRecord: (record: Omit<BatteryRecord, 'id'>) => void;
  addCleanRecord: (record: Omit<CleanRecord, 'id'>) => void;
  deleteBatteryRecord: (id: string) => void;
  deleteCleanRecord: (id: string) => void;

  addFeedback: (
    feedback: Omit<Feedback, 'id' | 'date' | 'status'>,
  ) => void;
  resolveFeedback: (id: string) => void;

  toggleChecklistItem: (id: string) => void;

  updateBatteryStock: (size: BatterySize, delta: number) => void;
  setBatteryStock: (size: BatterySize, quantity: number) => void;

  getDeviceById: (id: string) => Device | undefined;
  getDeviceLastBatteryDate: (deviceId: string) => string | null;
  getDeviceBatteryDaysLeft: (deviceId: string) => number;
  getDeviceNextBatteryDate: (deviceId: string) => string | null;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      devices: initialDevices,
      batteryRecords: initialBatteryRecords,
      cleanRecords: initialCleanRecords,
      feedbacks: initialFeedbacks,
      checklistItems: initialChecklist,
      batteryStock: initialStock,

      addDevice: (device) =>
        set((state) => ({
          devices: [
            ...state.devices,
            {
              ...device,
              id: generateId('dev'),
              createdAt: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      updateDevice: (id, data) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, ...data } : d,
          ),
        })),

      deleteDevice: (id) =>
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
          batteryRecords: state.batteryRecords.filter((r) => r.deviceId !== id),
          cleanRecords: state.cleanRecords.filter((r) => r.deviceId !== id),
          feedbacks: state.feedbacks.filter((f) => f.deviceId !== id),
          checklistItems: state.checklistItems.filter((c) => c.deviceId !== id),
        })),

      addBatteryRecord: (record) =>
        set((state) => {
          const device = state.devices.find((d) => d.id === record.deviceId);
          let newStock = state.batteryStock;
          if (device) {
            newStock = state.batteryStock.map((s) =>
              s.size === device.batterySize && s.quantity > 0
                ? { ...s, quantity: s.quantity - 1 }
                : s,
            );
          }
          return {
            batteryRecords: [{ ...record, id: generateId('bat') }, ...state.batteryRecords],
            batteryStock: newStock,
          };
        }),

      addCleanRecord: (record) =>
        set((state) => ({
          cleanRecords: [{ ...record, id: generateId('cln') }, ...state.cleanRecords],
        })),

      deleteBatteryRecord: (id) =>
        set((state) => ({
          batteryRecords: state.batteryRecords.filter((r) => r.id !== id),
        })),

      deleteCleanRecord: (id) =>
        set((state) => ({
          cleanRecords: state.cleanRecords.filter((r) => r.id !== id),
        })),

      addFeedback: (feedback) => {
        const feedbackId = generateId('fb');
        const templates = getChecklistTemplates(feedback.type);
        const today = new Date().toISOString().split('T')[0];
        const newItems: ChecklistItem[] = templates.map((title, idx) => ({
          id: generateId('chk'),
          feedbackId,
          deviceId: feedback.deviceId,
          title,
          completed: false,
          dueDate: addDays(today, idx < 3 ? 0 : 2),
        }));
        set((state) => ({
          feedbacks: [
            {
              ...feedback,
              id: feedbackId,
              date: today,
              status: 'pending',
            },
            ...state.feedbacks,
          ],
          checklistItems: [...newItems, ...state.checklistItems],
        }));
      },

      resolveFeedback: (id) =>
        set((state) => ({
          feedbacks: state.feedbacks.map((f) =>
            f.id === id ? { ...f, status: 'resolved' } : f,
          ),
        })),

      toggleChecklistItem: (id) =>
        set((state) => ({
          checklistItems: state.checklistItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: !item.completed,
                  completedAt: !item.completed
                    ? new Date().toISOString().split('T')[0]
                    : undefined,
                }
              : item,
          ),
        })),

      updateBatteryStock: (size, delta) =>
        set((state) => ({
          batteryStock: state.batteryStock.map((s) =>
            s.size === size
              ? { ...s, quantity: Math.max(0, s.quantity + delta) }
              : s,
          ),
        })),

      setBatteryStock: (size, quantity) =>
        set((state) => ({
          batteryStock: state.batteryStock.map((s) =>
            s.size === size ? { ...s, quantity: Math.max(0, quantity) } : s,
          ),
        })),

      getDeviceById: (id) => get().devices.find((d) => d.id === id),

      getDeviceLastBatteryDate: (deviceId) => {
        const records = get()
          .batteryRecords.filter((r) => r.deviceId === deviceId)
          .sort((a, b) => b.date.localeCompare(a.date));
        return records.length > 0 ? records[0].date : null;
      },

      getDeviceBatteryDaysLeft: (deviceId) => {
        const device = get().devices.find((d) => d.id === deviceId);
        if (!device) return 0;
        const lastDate = get().getDeviceLastBatteryDate(deviceId);
        if (!lastDate) return device.batteryLifeDays;
        const last = new Date(lastDate);
        const now = new Date();
        const diff = Math.floor(
          (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
        );
        return Math.max(0, device.batteryLifeDays - diff);
      },

      getDeviceNextBatteryDate: (deviceId) => {
        const device = get().devices.find((d) => d.id === deviceId);
        if (!device) return null;
        const lastDate = get().getDeviceLastBatteryDate(deviceId);
        const baseDate = lastDate ?? new Date().toISOString().split('T')[0];
        const d = new Date(baseDate);
        d.setDate(d.getDate() + device.batteryLifeDays);
        return d.toISOString().split('T')[0];
      },
    }),
    {
      name: 'hearing-aid-storage',
    },
  ),
);

export const getEarLabel = (ear: EarSide) => {
  switch (ear) {
    case 'left':
      return '左耳';
    case 'right':
      return '右耳';
    case 'both':
      return '双耳';
  }
};

export const getFeedbackTypeLabel = (type: FeedbackType) => {
  switch (type) {
    case 'whistling':
      return '连续啸叫';
    case 'sound_low':
      return '声音变小';
    case 'pain':
      return '佩戴疼痛';
  }
};

export const getFeedbackTypeEmoji = (type: FeedbackType) => {
  switch (type) {
    case 'whistling':
      return '📢';
    case 'sound_low':
      return '🔇';
    case 'pain':
      return '😣';
  }
};
