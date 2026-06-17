import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  MotherStarter, FeedingRecord, ProductionOrder, AnomalyRecord,
  StarterStatus, AnomalyType, DashboardData, PendingFeeding, ActivityTrendItem
} from '@/types';
import { mockStarters, mockFeedingRecords, mockProductionOrders, mockAnomalyRecords } from '@/data/mockData';
import { 
  calculateActivityScore, calculateWeightAfterFeeding, 
  deductUsageWeight, isFeedingDue 
} from '@/utils/calculations';
import { generateId } from '@/utils/format';

interface StarterState {
  starters: MotherStarter[];
  feedingRecords: FeedingRecord[];
  productionOrders: ProductionOrder[];
  anomalyRecords: AnomalyRecord[];
  
  addStarter: (starter: Omit<MotherStarter, 'id' | 'status'>) => void;
  updateStarter: (id: string, updates: Partial<MotherStarter>) => void;
  deleteStarter: (id: string) => void;
  
  addFeedingRecord: (record: Omit<FeedingRecord, 'id' | 'activityScore'>) => void;
  
  addProductionOrder: (order: Omit<ProductionOrder, 'id' | 'status'>) => void;
  updateProductionOrder: (id: string, updates: Partial<ProductionOrder>) => void;
  assignStarterToOrder: (orderId: string, starterId: string, amount: number) => void;
  completeProduction: (orderId: string) => void;
  
  lockStarter: (starterId: string, anomalyType: AnomalyType, description: string, detectedBy: string) => void;
  unlockStarter: (starterId: string, handlerName: string, resolutionNotes: string) => void;
  resolveAnomaly: (anomalyId: string) => void;
  
  getDashboardData: () => DashboardData;
  getHealthyStarters: () => MotherStarter[];
  getFeedingRecordsForStarter: (starterId: string) => FeedingRecord[];
  getStarterById: (id: string) => MotherStarter | undefined;
  
  resetData: () => void;
}

const initialState = {
  starters: mockStarters,
  feedingRecords: mockFeedingRecords,
  productionOrders: mockProductionOrders,
  anomalyRecords: mockAnomalyRecords
};

export const useStarterStore = create<StarterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addStarter: (starterData) => {
        const newStarter: MotherStarter = {
          ...starterData,
          id: generateId(),
          status: StarterStatus.HEALTHY
        };
        set((state) => ({
          starters: [...state.starters, newStarter]
        }));
      },

      updateStarter: (id, updates) => {
        set((state) => ({
          starters: state.starters.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          )
        }));
      },

      deleteStarter: (id) => {
        set((state) => ({
          starters: state.starters.filter((s) => s.id !== id),
          feedingRecords: state.feedingRecords.filter((r) => r.starterId !== id),
          anomalyRecords: state.anomalyRecords.filter((a) => a.starterId !== id)
        }));
      },

      addFeedingRecord: (recordData) => {
        const activityScore = calculateActivityScore(
          recordData.riseMultiplier,
          recordData.peakTime,
          recordData.odor,
          recordData.temperature
        );

        const newRecord: FeedingRecord = {
          ...recordData,
          id: generateId(),
          activityScore
        };

        const starter = get().starters.find((s) => s.id === recordData.starterId);
        if (starter) {
          const newWeight = calculateWeightAfterFeeding(
            starter.currentWeight,
            recordData.discardAmount,
            recordData.flourAdded,
            recordData.waterAdded
          );

          let newStatus = starter.status;
          const hasAnomaly = recordData.anomalies.length > 0;
          if (hasAnomaly && starter.status !== StarterStatus.LOCKED) {
            newStatus = StarterStatus.LOCKED;
          } else if (!hasAnomaly && starter.status === StarterStatus.LOCKED) {
            const hasUnresolvedAnomalies = get().anomalyRecords.some(
              (a) => a.starterId === starter.id && a.status === 'open'
            );
            if (!hasUnresolvedAnomalies) {
              newStatus = StarterStatus.HEALTHY;
            }
          }

          set((state) => ({
            feedingRecords: [...state.feedingRecords, newRecord],
            starters: state.starters.map((s) =>
              s.id === recordData.starterId
                ? { ...s, currentWeight: newWeight, lastFedAt: recordData.fedAt, status: newStatus }
                : s
            )
          }));
        } else {
          set((state) => ({
            feedingRecords: [...state.feedingRecords, newRecord]
          }));
        }
      },

      addProductionOrder: (orderData) => {
        const newOrder: ProductionOrder = {
          ...orderData,
          id: generateId(),
          status: 'pending'
        };
        set((state) => ({
          productionOrders: [...state.productionOrders, newOrder]
        }));
      },

      updateProductionOrder: (id, updates) => {
        set((state) => ({
          productionOrders: state.productionOrders.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          )
        }));
      },

      assignStarterToOrder: (orderId, starterId, amount) => {
        const starter = get().starters.find((s) => s.id === starterId);
        if (!starter || starter.status !== StarterStatus.HEALTHY) {
          throw new Error('酸种状态不合格，不能用于生产');
        }
        if (starter.currentWeight < amount) {
          throw new Error('酸种重量不足');
        }

        set((state) => ({
          productionOrders: state.productionOrders.map((o) =>
            o.id === orderId
              ? { ...o, starterId, starterAmount: amount, status: 'in_progress' }
              : o
          ),
          starters: state.starters.map((s) =>
            s.id === starterId
              ? { ...s, currentWeight: deductUsageWeight(s.currentWeight, amount) }
              : s
          )
        }));
      },

      completeProduction: (orderId) => {
        set((state) => ({
          productionOrders: state.productionOrders.map((o) =>
            o.id === orderId ? { ...o, status: 'completed' } : o
          )
        }));
      },

      lockStarter: (starterId, anomalyType, description, detectedBy) => {
        const affectedOrders = get().productionOrders
          .filter((o) => o.starterId === starterId && o.status === 'pending')
          .map((o) => o.id);

        const anomalyRecord: AnomalyRecord = {
          id: generateId(),
          starterId,
          type: anomalyType,
          detectedAt: new Date().toISOString(),
          reportedBy: detectedBy,
          description,
          status: 'open',
          affectedOrderIds: affectedOrders
        };

        set((state) => ({
          starters: state.starters.map((s) =>
            s.id === starterId ? { ...s, status: StarterStatus.LOCKED } : s
          ),
          anomalyRecords: [...state.anomalyRecords, anomalyRecord],
          productionOrders: state.productionOrders.map((o) =>
            o.starterId === starterId && o.status === 'pending'
              ? { ...o, status: 'cancelled' }
              : o
          )
        }));
      },

      unlockStarter: (starterId, handlerName, resolutionNotes) => {
        set((state) => ({
          starters: state.starters.map((s) =>
            s.id === starterId ? { ...s, status: StarterStatus.HEALTHY } : s
          ),
          anomalyRecords: state.anomalyRecords.map((a) =>
            a.starterId === starterId && a.status === 'open'
              ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString(), resolutionNotes }
              : a
          )
        }));
      },

      resolveAnomaly: (anomalyId) => {
        set((state) => ({
          anomalyRecords: state.anomalyRecords.map((a) =>
            a.id === anomalyId
              ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
              : a
          )
        }));
      },

      getDashboardData: (): DashboardData => {
        const state = get();
        const now = new Date();

        const totalStarters = state.starters.filter(
          (s) => s.status !== StarterStatus.ARCHIVED
        ).length;
        const healthyStarters = state.starters.filter(
          (s) => s.status === StarterStatus.HEALTHY
        ).length;
        const lockedStarters = state.starters.filter(
          (s) => s.status === StarterStatus.LOCKED
        ).length;

        const pendingFeedings: PendingFeeding[] = state.starters
          .filter((s) => s.status !== StarterStatus.ARCHIVED)
          .map((s) => {
            const due = isFeedingDue(s, now);
            if (!due) return null;
            return {
              starterId: s.id,
              starterName: s.name,
              dueAt: due.dueAt.toISOString(),
              overdue: due.overdue
            };
          })
          .filter(
            (f): f is PendingFeeding =>
              f !== null &&
              (f.overdue ||
                new Date(f.dueAt).getTime() - now.getTime() < 4 * 60 * 60 * 1000)
          )
          .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

        const recentAnomalies = state.anomalyRecords
          .filter((a) => a.status === 'open')
          .sort(
            (a, b) =>
              new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
          )
          .slice(0, 5);

        const affectedOrders = state.productionOrders.filter((o) =>
          state.anomalyRecords.some(
            (a) => a.status === 'open' && a.affectedOrderIds.includes(o.id)
          )
        );

        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const activityTrend: ActivityTrendItem[] = state.feedingRecords
          .filter((r) => new Date(r.fedAt) >= sevenDaysAgo)
          .map((r) => {
            const starter = state.starters.find((s) => s.id === r.starterId);
            return {
              date: r.fedAt,
              starterId: r.starterId,
              starterName: starter?.name || '未知',
              score: r.activityScore
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
          totalStarters,
          healthyStarters,
          lockedStarters,
          pendingFeedings,
          recentAnomalies,
          affectedOrders,
          activityTrend
        };
      },

      getHealthyStarters: () => {
        return get().starters.filter((s) => s.status === StarterStatus.HEALTHY);
      },

      getFeedingRecordsForStarter: (starterId: string) => {
        return get()
          .feedingRecords.filter((r) => r.starterId === starterId)
          .sort((a, b) => new Date(b.fedAt).getTime() - new Date(a.fedAt).getTime());
      },

      getStarterById: (id: string) => {
        return get().starters.find((s) => s.id === id);
      },

      resetData: () => {
        set(initialState);
      }
    }),
    {
      name: 'sourdough-starter-storage'
    }
  )
);
