import { create } from 'zustand';
import type {
  InspectionRecord,
  InspectionItem,
  PeriodType,
  MaterialType,
  TaskUrgency,
} from '@/types/index';
import { storage, delay, generateId } from '@/utils/storage';
import { mockInspections } from '@/mock/data';
import { useInventoryStore } from './inventoryStore';
import { useTaskStore } from './taskStore';
import { useActivityStore } from './activityStore';
import { useCounterStore } from './counterStore';
import dayjs from 'dayjs';

interface CreateInspectionData {
  counterId: string;
  guideId: string;
  guideName?: string;
  period: PeriodType;
  items: {
    materialType: MaterialType;
    quantity: number;
  }[];
  inspectedAt?: string;
}

interface ShortageResult {
  inspectionItem: InspectionItem;
  shortageQty: number;
  targetQty: number;
  urgency: TaskUrgency;
}

interface InspectionStoreState {
  records: InspectionRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  getTodayRecords: () => InspectionRecord[];
  getRecordsByDateRange: (startDate: string | Date, endDate: string | Date) => InspectionRecord[];
  createInspection: (data: CreateInspectionData) => Promise<{
    record: InspectionRecord;
    createdTaskIds: string[];
  }>;
  getRecordsByCounter: (counterId: string) => InspectionRecord[];
  _calculateShortage: (
    counterId: string,
    materialType: MaterialType,
    currentQty: number,
    baseThreshold: number,
    date?: string | Date
  ) => ShortageResult | null;
}

const STORAGE_KEY = 'inspections';

const loadInitialRecords = (): InspectionRecord[] => {
  if (storage.has(STORAGE_KEY)) {
    return storage.get<InspectionRecord[]>(STORAGE_KEY, []);
  }
  storage.set(STORAGE_KEY, mockInspections);
  return mockInspections;
};

export const useInspectionStore = create<InspectionStoreState>((set, get) => ({
  records: loadInitialRecords(),
  loading: false,

  fetchRecords: async () => {
    set({ loading: true });
    await delay();
    const data = storage.has(STORAGE_KEY)
      ? storage.get<InspectionRecord[]>(STORAGE_KEY, [])
      : mockInspections;
    set({ records: data, loading: false });
  },

  getTodayRecords: () => {
    const today = dayjs().format('YYYY-MM-DD');
    return get().records.filter((r) => dayjs(r.inspectedAt).format('YYYY-MM-DD') === today);
  },

  getRecordsByDateRange: (startDate, endDate) => {
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).endOf('day');
    return get().records.filter((r) => {
      const d = dayjs(r.inspectedAt);
      return d.isAfter(start.subtract(1, 'second')) && d.isBefore(end.add(1, 'second'));
    });
  },

  getRecordsByCounter: (counterId) => {
    return get().records.filter((r) => r.counterId === counterId);
  },

  _calculateShortage: (counterId, materialType, currentQty, baseThreshold, date) => {
    const activityStore = useActivityStore.getState();
    const multiplier = activityStore.getActivityMultiplier(counterId, date);
    const effectiveThreshold = Math.ceil(baseThreshold * multiplier);
    const inspectionItem: InspectionItem = {
      materialType,
      quantity: currentQty,
      threshold: effectiveThreshold,
      isShortage: currentQty < effectiveThreshold,
    };

    if (!inspectionItem.isShortage) {
      return null;
    }

    const targetQty = Math.ceil(effectiveThreshold * 1.5);
    const shortageQty = targetQty - currentQty;
    const ratio = currentQty / effectiveThreshold;

    let urgency: TaskUrgency;
    if (ratio < 0.5) {
      urgency = 'urgent';
    } else if (ratio < 0.8) {
      urgency = 'high';
    } else {
      urgency = 'normal';
    }

    return { inspectionItem, shortageQty, targetQty, urgency };
  },

  createInspection: async (data) => {
    set({ loading: true });
    await delay();

    const inspectionId = generateId();
    const inspectedAt = data.inspectedAt || new Date().toISOString();

    const activityStore = useActivityStore.getState();
    const inventoryStore = useInventoryStore.getState();
    const taskStore = useTaskStore.getState();
    const counterStore = useCounterStore.getState();

    const isActivityDay = activityStore.isActivityDay(data.counterId, inspectedAt);
    const activity = activityStore.getActivityByDate(data.counterId, inspectedAt);
    const thresholdMultiplier = activity?.thresholdMultiplier;

    const counterGuides = counterStore.getCounterGuides(data.counterId);
    const defaultAssignee = counterGuides.find((g) => g.role === 'guide') || counterGuides[0];

    const inspectionItems: InspectionItem[] = [];
    const createdTaskIds: string[] = [];
    const inventoryUpdates: { id: string; quantity: number }[] = [];

    for (const item of data.items) {
      const invItem = inventoryStore.getInventoryItemByCounterAndMaterial(
        data.counterId,
        item.materialType
      );

      if (!invItem) {
        inspectionItems.push({
          materialType: item.materialType,
          quantity: item.quantity,
          threshold: 0,
          isShortage: false,
        });
        continue;
      }

      const result = get()._calculateShortage(
        data.counterId,
        item.materialType,
        item.quantity,
        invItem.threshold,
        inspectedAt
      );

      if (result) {
        inspectionItems.push(result.inspectionItem);
      } else {
        inspectionItems.push({
          materialType: item.materialType,
          quantity: item.quantity,
          threshold: invItem.threshold * (thresholdMultiplier || 1),
          isShortage: false,
        });
      }

      inventoryUpdates.push({ id: invItem.id, quantity: item.quantity });

      if (result) {
        const task = await taskStore.createTask({
          counterId: data.counterId,
          inspectionRecordId: inspectionId,
          materialType: item.materialType,
          shortageQty: result.shortageQty,
          targetQty: result.targetQty,
          urgency: result.urgency,
          assigneeId: defaultAssignee?.id,
          operatorId: data.guideId,
          operatorName: data.guideName,
          remarks: isActivityDay ? '活动日期间紧急补货' : undefined,
        });
        createdTaskIds.push(task.id);
      }
    }

    if (inventoryUpdates.length > 0) {
      await inventoryStore.batchUpdateInventory(inventoryUpdates);
    }

    const newRecord: InspectionRecord = {
      id: inspectionId,
      counterId: data.counterId,
      guideId: data.guideId,
      period: data.period,
      inspectedAt: inspectedAt,
      items: inspectionItems,
      isActivityDay,
      thresholdMultiplier,
      generatedTaskCount: createdTaskIds.length,
    };

    const updatedRecords = [newRecord, ...get().records];
    storage.set(STORAGE_KEY, updatedRecords);
    set({ records: updatedRecords, loading: false });

    return { record: newRecord, createdTaskIds };
  },
}));
