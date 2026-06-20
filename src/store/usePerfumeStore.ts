import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PerfumeRecord, SceneType, ScentNote, TimePoint } from '@/types';
import { mockPerfumes } from '@/data/mockData';
import { calculateScenesFromRecord } from '@/utils/sceneClassifier';

interface PerfumeState {
  perfumes: PerfumeRecord[];
  addPerfume: (perfume: Omit<PerfumeRecord, 'id' | 'createdAt'>) => void;
  updatePerfume: (id: string, perfume: Partial<PerfumeRecord>) => void;
  deletePerfume: (id: string) => void;
  getPerfumeById: (id: string) => PerfumeRecord | undefined;
  updateTimelineNote: (perfumeId: string, timePoint: TimePoint, note: ScentNote) => void;
}

function computeScenesForRecord(
  record: Omit<PerfumeRecord, 'id' | 'createdAt'> | PerfumeRecord
): SceneType[] {
  return calculateScenesFromRecord(record);
}

export const usePerfumeStore = create<PerfumeState>()(
  persist(
    (set, get) => ({
      perfumes: mockPerfumes,
      
      addPerfume: (perfumeData) => {
        const scenes = computeScenesForRecord(perfumeData);
        const newPerfume: PerfumeRecord = {
          ...perfumeData,
          scenes,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          perfumes: [newPerfume, ...state.perfumes],
        }));
      },
      
      updatePerfume: (id, updates) => {
        set((state) => ({
          perfumes: state.perfumes.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates };
            const scenes = computeScenesForRecord(merged);
            return { ...merged, scenes };
          }),
        }));
      },
      
      deletePerfume: (id) => {
        set((state) => ({
          perfumes: state.perfumes.filter((p) => p.id !== id),
        }));
      },
      
      getPerfumeById: (id) => {
        return get().perfumes.find((p) => p.id === id);
      },
      
      updateTimelineNote: (perfumeId, timePoint, note) => {
        set((state) => ({
          perfumes: state.perfumes.map((p) => {
            if (p.id !== perfumeId) return p;
            const merged = {
              ...p,
              timeline: { ...p.timeline, [timePoint]: note },
            };
            const scenes = computeScenesForRecord(merged);
            return { ...merged, scenes };
          }),
        }));
      },
    }),
    {
      name: 'perfume-storage',
    }
  )
);

export const useFilteredPerfumes = (sceneFilter: SceneType | 'all') => {
  const perfumes = usePerfumeStore((state) => state.perfumes);
  
  if (sceneFilter === 'all') {
    return perfumes;
  }
  
  return perfumes.filter((p) => p.scenes.includes(sceneFilter));
};
