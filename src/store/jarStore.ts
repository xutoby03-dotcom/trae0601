import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TeaJar, JarOperation, DamageReason, SealRingStatus, RefillSourceType } from '@/types';
import { mockJars, mockOperations } from '@/data/mockData';
import { generateId } from '@/utils/storage';
import { nowISO } from '@/utils/date';
import { useBatchStore } from './batchStore';

interface JarState {
  jars: TeaJar[];
  operations: JarOperation[];
  addJar: (data: {
    jarNo: string;
    batchId: string;
    sealedWeight: number;
    operator: string;
    sealStatus: SealRingStatus;
    desiccantBatch: string;
  }) => void;
  getJar: (id: string) => TeaJar | undefined;
  getJarOperations: (jarId: string) => JarOperation[];
  openJar: (jarId: string, operator: string) => void;
  sellFromJar: (jarId: string, weight: number, operator: string) => void;
  refillJar: (jarId: string, weight: number, operator: string, sourceType: RefillSourceType, sourceId: string, remark?: string) => void;
  damageJar: (jarId: string, weight: number, operator: string, reason: DamageReason, remark: string) => void;
  getJarsByBatch: (batchId: string) => TeaJar[];
}

export const useJarStore = create<JarState>()(
  persist(
    (set, get) => ({
      jars: mockJars,
      operations: mockOperations,

      addJar: (data) => {
        const newJar: TeaJar = {
          id: generateId(),
          jarNo: data.jarNo,
          batchId: data.batchId,
          sealedWeight: data.sealedWeight,
          currentWeight: data.sealedWeight,
          operator: data.operator,
          sealStatus: data.sealStatus,
          desiccantBatch: data.desiccantBatch,
          sealedAt: nowISO(),
          openedAt: null,
          status: 'sealed',
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };

        const newOp: JarOperation = {
          id: generateId(),
          jarId: newJar.id,
          type: 'seal',
          weight: data.sealedWeight,
          operator: data.operator,
          reason: '',
          operatedAt: nowISO(),
        };

        useBatchStore.getState().decrementWeight(data.batchId, data.sealedWeight);

        set((state) => ({
          jars: [newJar, ...state.jars],
          operations: [newOp, ...state.operations],
        }));
      },

      getJar: (id) => {
        return get().jars.find((j) => j.id === id);
      },

      getJarOperations: (jarId) => {
        return get()
          .operations.filter((o) => o.jarId === jarId)
          .sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime());
      },

      openJar: (jarId, operator) => {
        const newOp: JarOperation = {
          id: generateId(),
          jarId,
          type: 'open',
          weight: 0,
          operator,
          reason: '',
          operatedAt: nowISO(),
        };

        set((state) => ({
          jars: state.jars.map((j) =>
            j.id === jarId
              ? { ...j, status: 'open', openedAt: nowISO(), updatedAt: nowISO() }
              : j
          ),
          operations: [newOp, ...state.operations],
        }));
      },

      sellFromJar: (jarId, weight, operator) => {
        const jar = get().jars.find((j) => j.id === jarId);
        if (!jar) return;

        const newWeight = Math.max(0, jar.currentWeight - weight);
        const newStatus = newWeight <= 0 ? 'sold' : jar.status;

        const newOp: JarOperation = {
          id: generateId(),
          jarId,
          type: 'sale',
          weight,
          operator,
          reason: '',
          operatedAt: nowISO(),
        };

        set((state) => ({
          jars: state.jars.map((j) =>
            j.id === jarId
              ? { ...j, currentWeight: newWeight, status: newStatus, updatedAt: nowISO() }
              : j
          ),
          operations: [newOp, ...state.operations],
        }));
      },

      refillJar: (jarId, weight, operator, sourceType, sourceId, remark) => {
        const targetJar = get().jars.find((j) => j.id === jarId);
        if (!targetJar) return;

        let sourceLabel = '';
        const sourceOps: JarOperation[] = [];

        if (sourceType === 'jar') {
          const sourceJar = get().jars.find((j) => j.id === sourceId);
          if (!sourceJar || sourceJar.currentWeight < weight) return;

          const sourceNewWeight = Math.max(0, sourceJar.currentWeight - weight);
          const sourceNewStatus: typeof sourceJar.status =
            sourceNewWeight <= 0 && sourceJar.status !== 'damaged' ? 'sold' : sourceJar.status;

          sourceLabel = `从罐 ${sourceJar.jarNo} 转入`;

          const sourceOutOp: JarOperation = {
            id: generateId(),
            jarId: sourceJar.id,
            type: 'refill',
            weight,
            operator,
            reason: `转出到罐 ${targetJar.jarNo}`,
            operatedAt: nowISO(),
            sourceType: 'jar',
            sourceId: targetJar.id,
          };

          sourceOps.push(sourceOutOp);

          set((state) => ({
            jars: state.jars.map((j) =>
              j.id === sourceJar.id
                ? { ...j, currentWeight: sourceNewWeight, status: sourceNewStatus, updatedAt: nowISO() }
                : j
            ),
          }));
        } else if (sourceType === 'batch') {
          const batch = useBatchStore.getState().batches.find((b) => b.id === sourceId);
          if (!batch || batch.remainingWeight < weight) return;

          sourceLabel = `从批次 ${batch.name} 转入`;
          useBatchStore.getState().decrementWeight(sourceId, weight);
        }

        const targetOp: JarOperation = {
          id: generateId(),
          jarId,
          type: 'refill',
          weight,
          operator,
          reason: remark ? `${sourceLabel} · ${remark}` : sourceLabel,
          operatedAt: nowISO(),
          sourceType,
          sourceId,
        };

        set((state) => ({
          jars: state.jars.map((j) =>
            j.id === jarId
              ? { ...j, currentWeight: j.currentWeight + weight, updatedAt: nowISO() }
              : j
          ),
          operations: [targetOp, ...sourceOps, ...state.operations],
        }));
      },

      damageJar: (jarId, weight, operator, reason, remark) => {
        const jar = get().jars.find((j) => j.id === jarId);
        if (!jar) return;

        const newWeight = Math.max(0, jar.currentWeight - weight);
        const newStatus = newWeight <= 0 ? 'damaged' : jar.status;

        const newOp: JarOperation = {
          id: generateId(),
          jarId,
          type: 'damage',
          weight,
          operator,
          reason: remark ? `${reason} - ${remark}` : reason,
          operatedAt: nowISO(),
        };

        set((state) => ({
          jars: state.jars.map((j) =>
            j.id === jarId
              ? { ...j, currentWeight: newWeight, status: newStatus, updatedAt: nowISO() }
              : j
          ),
          operations: [newOp, ...state.operations],
        }));
      },

      getJarsByBatch: (batchId) => {
        return get().jars.filter((j) => j.batchId === batchId);
      },
    }),
    {
      name: 'tea-jar-storage',
      partialize: (state) => ({ jars: state.jars, operations: state.operations }),
    }
  )
);
