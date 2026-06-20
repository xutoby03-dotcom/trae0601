import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudioTake, ComparisonSlot, FilterState, AnnotationKey } from '../types';
import { MOCK_TAKES } from '../data/mockTakes';

interface AppState {
  takes: AudioTake[];
  comparison: ComparisonSlot;
  filters: FilterState;
  selectedTakeId: string | null;
  showExportModal: boolean;
  exportTakeId: string | null;
  currentPlayingId: string | null;

  setSelectedTake: (id: string | null) => void;
  toggleStar: (id: string) => void;
  updateAnnotation: (takeId: string, key: AnnotationKey, value: number) => void;
  updateNotes: (takeId: string, notes: string) => void;
  setComparisonSlot: (slot: 'a' | 'b', take: AudioTake | null) => void;
  toggleComparisonActive: () => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  getFilteredTakes: () => AudioTake[];
  setShowExportModal: (show: boolean, takeId?: string) => void;
  setCurrentPlayingId: (id: string | null) => void;
}

const initialFilters: FilterState = {
  microphones: [],
  preamps: [],
  distances: [10, 30],
  gains: [-12, 12],
  roomPositions: [],
  popFilter: null,
  starredOnly: false,
  sortBy: 'createdAt',
  sortOrder: 'asc',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      takes: MOCK_TAKES,
      comparison: { a: null, b: null, active: 'a' },
      filters: initialFilters,
      selectedTakeId: null,
      showExportModal: false,
      exportTakeId: null,
      currentPlayingId: null,

      setSelectedTake: (id) => set({ selectedTakeId: id }),

      toggleStar: (id) =>
        set((state) => ({
          takes: state.takes.map((t) =>
            t.id === id ? { ...t, starred: !t.starred } : t
          ),
        })),

      updateAnnotation: (takeId, key, value) =>
        set((state) => ({
          takes: state.takes.map((t) =>
            t.id === takeId
              ? { ...t, annotations: { ...t.annotations, [key]: value } }
              : t
          ),
        })),

      updateNotes: (takeId, notes) =>
        set((state) => ({
          takes: state.takes.map((t) => (t.id === takeId ? { ...t, notes } : t)),
        })),

      setComparisonSlot: (slot, take) =>
        set((state) => ({
          comparison: { ...state.comparison, [slot]: take },
        })),

      toggleComparisonActive: () =>
        set((state) => ({
          comparison: {
            ...state.comparison,
            active: state.comparison.active === 'a' ? 'b' : 'a',
          },
        })),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: initialFilters }),

      getFilteredTakes: () => {
        const { takes, filters } = get();
        let result = [...takes];

        if (filters.microphones.length > 0) {
          result = result.filter((t) => filters.microphones.includes(t.microphone));
        }

        if (filters.preamps.length > 0) {
          result = result.filter((t) => filters.preamps.includes(t.preamp));
        }

        if (filters.roomPositions.length > 0) {
          result = result.filter((t) => filters.roomPositions.includes(t.roomPosition));
        }

        result = result.filter(
          (t) => t.distance >= filters.distances[0] && t.distance <= filters.distances[1]
        );

        result = result.filter(
          (t) => t.gain >= filters.gains[0] && t.gain <= filters.gains[1]
        );

        if (filters.popFilter !== null) {
          result = result.filter((t) => t.popFilter === filters.popFilter);
        }

        if (filters.starredOnly) {
          result = result.filter((t) => t.starred);
        }

        result.sort((a, b) => {
          let comparison = 0;
          switch (filters.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'distance':
              comparison = a.distance - b.distance;
              break;
            case 'gain':
              comparison = a.gain - b.gain;
              break;
            case 'createdAt':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
            case 'emotion':
              comparison = a.annotations.emotion - b.annotations.emotion;
              break;
          }
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
      },

      setShowExportModal: (show, takeId) =>
        set({ showExportModal: show, exportTakeId: takeId ?? null }),

      setCurrentPlayingId: (id) => set({ currentPlayingId: id }),
    }),
    {
      name: 'studio-compare-storage',
      partialize: (state) => ({
        takes: state.takes,
        filters: state.filters,
      }),
    }
  )
);
