import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Checkpoint, InspectionItem, FormState } from '@/types';
import { generateId, generateInspectionChecklist } from '@/utils/helpers';

interface CheckpointStore {
  checkpoints: Checkpoint[];
  inspectionItems: InspectionItem[];
  editingId: string | null;
  eventName: string;
  eventDate: string;

  setEventInfo: (name: string, date: string) => void;
  addCheckpoint: (data: FormState) => void;
  updateCheckpoint: (id: string, data: FormState) => void;
  deleteCheckpoint: (id: string) => void;
  setEditingId: (id: string | null) => void;
  moveCheckpoint: (id: string, direction: 'up' | 'down') => void;
  reorderCheckpoints: (fromIndex: number, toIndex: number) => void;

  generateChecklist: () => void;
  toggleInspectionItem: (id: string) => void;
  resetChecklist: () => void;
  clearAll: () => void;
  loadMockData: () => void;
}

const initialFormState: FormState = {
  pointNumber: '',
  terrainDescription: '',
  hideMethod: '',
  estimatedArrival: '',
  batteryLevel: 85,
  hasBackup: false,
  difficulty: 3,
  distanceToNext: 0,
  notes: '',
};

export const useCheckpointStore = create<CheckpointStore>()(
  persist(
    (set, get) => ({
      checkpoints: [],
      inspectionItems: [],
      editingId: null,
      eventName: '2026夏季定向越野挑战赛',
      eventDate: '2026-06-22',

      setEventInfo: (name, date) => set({ eventName: name, eventDate: date }),

      addCheckpoint: (data) => {
        const { checkpoints } = get();
        const maxOrder = checkpoints.length > 0 
          ? Math.max(...checkpoints.map(cp => cp.orderIndex))
          : 0;

        const newCheckpoint: Checkpoint = {
          id: generateId(),
          pointNumber: data.pointNumber,
          terrainDescription: data.terrainDescription,
          hideMethod: data.hideMethod,
          estimatedArrival: data.estimatedArrival,
          batteryLevel: data.batteryLevel,
          hasBackup: data.hasBackup,
          orderIndex: maxOrder + 1,
          difficulty: data.difficulty,
          distanceToNext: data.distanceToNext,
          notes: data.notes,
        };

        set({ checkpoints: [...checkpoints, newCheckpoint] });
      },

      updateCheckpoint: (id, data) => {
        const { checkpoints } = get();
        set({
          checkpoints: checkpoints.map(cp =>
            cp.id === id
              ? {
                  ...cp,
                  pointNumber: data.pointNumber,
                  terrainDescription: data.terrainDescription,
                  hideMethod: data.hideMethod,
                  estimatedArrival: data.estimatedArrival,
                  batteryLevel: data.batteryLevel,
                  hasBackup: data.hasBackup,
                  difficulty: data.difficulty,
                  distanceToNext: data.distanceToNext,
                  notes: data.notes,
                }
              : cp
          ),
        });
      },

      deleteCheckpoint: (id) => {
        const { checkpoints } = get();
        const remaining = checkpoints.filter(cp => cp.id !== id);
        const reordered = remaining
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((cp, idx) => ({ ...cp, orderIndex: idx + 1 }));
        set({ checkpoints: reordered });
      },

      setEditingId: (id) => set({ editingId: id }),

      moveCheckpoint: (id, direction) => {
        const { checkpoints } = get();
        const sorted = [...checkpoints].sort((a, b) => a.orderIndex - b.orderIndex);
        const index = sorted.findIndex(cp => cp.id === id);
        
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sorted.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];

        const reordered = sorted.map((cp, idx) => ({ ...cp, orderIndex: idx + 1 }));
        set({ checkpoints: reordered });
      },

      reorderCheckpoints: (fromIndex, toIndex) => {
        const { checkpoints } = get();
        const sorted = [...checkpoints].sort((a, b) => a.orderIndex - b.orderIndex);
        const [removed] = sorted.splice(fromIndex, 1);
        sorted.splice(toIndex, 0, removed);
        
        const reordered = sorted.map((cp, idx) => ({ ...cp, orderIndex: idx + 1 }));
        set({ checkpoints: reordered });
      },

      generateChecklist: () => {
        const { checkpoints } = get();
        const items = generateInspectionChecklist(checkpoints);
        set({ inspectionItems: items });
      },

      toggleInspectionItem: (id) => {
        const { inspectionItems } = get();
        set({
          inspectionItems: inspectionItems.map(item =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item
          ),
        });
      },

      resetChecklist: () => {
        const { inspectionItems } = get();
        set({
          inspectionItems: inspectionItems.map(item => ({ ...item, isChecked: false })),
        });
      },

      clearAll: () => set({ checkpoints: [], inspectionItems: [], editingId: null }),

      loadMockData: () => {
        const mockCheckpoints: Checkpoint[] = [
          {
            id: generateId(),
            pointNumber: 'CP01',
            terrainDescription: '山地林区，坡度约15度',
            hideMethod: '树干背面',
            estimatedArrival: '09:15',
            batteryLevel: 92,
            hasBackup: true,
            orderIndex: 1,
            difficulty: 2,
            distanceToNext: 1200,
            notes: '注意树根容易绊倒',
          },
          {
            id: generateId(),
            pointNumber: 'CP02',
            terrainDescription: '山谷溪涧，需跨越小溪',
            hideMethod: '岩石缝隙',
            estimatedArrival: '09:35',
            batteryLevel: 88,
            hasBackup: false,
            orderIndex: 2,
            difficulty: 4,
            distanceToNext: 800,
            notes: '雨季可能涨水',
          },
          {
            id: generateId(),
            pointNumber: 'CP03',
            terrainDescription: '山顶开阔地，视野良好',
            hideMethod: '标志牌后',
            estimatedArrival: '09:50',
            batteryLevel: 76,
            hasBackup: true,
            orderIndex: 3,
            difficulty: 3,
            distanceToNext: 1500,
            notes: '风大注意保暖',
          },
          {
            id: generateId(),
            pointNumber: 'CP04',
            terrainDescription: '丘陵地带，灌木茂密',
            hideMethod: '灌木丛中',
            estimatedArrival: '10:15',
            batteryLevel: 45,
            hasBackup: true,
            orderIndex: 4,
            difficulty: 5,
            distanceToNext: 1000,
            notes: '需准备备用打卡器',
          },
          {
            id: generateId(),
            pointNumber: 'CP05',
            terrainDescription: '平原草地，靠近公路',
            hideMethod: '土堆后面',
            estimatedArrival: '10:35',
            batteryLevel: 95,
            hasBackup: false,
            orderIndex: 5,
            difficulty: 1,
            distanceToNext: 0,
            notes: '终点前最后一个检查点',
          },
        ];

        set({ checkpoints: mockCheckpoints });
      },
    }),
    {
      name: 'checkpoint-storage',
      partialize: (state) => ({
        checkpoints: state.checkpoints,
        inspectionItems: state.inspectionItems,
        eventName: state.eventName,
        eventDate: state.eventDate,
      }),
    }
  )
);

export { initialFormState };
