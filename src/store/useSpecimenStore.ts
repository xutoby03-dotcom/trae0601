import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Specimen, SpecimenFormData } from '../types/specimen';
import { mockSpecimens } from '../data/mockData';
import { calculateDryness } from '../utils/dryness';
import { todayISO } from '../utils/date';

interface SpecimenState {
  specimens: Specimen[];
  addSpecimen: (data: SpecimenFormData) => void;
  updateSpecimen: (id: string, updates: Partial<Specimen>) => void;
  deleteSpecimen: (id: string) => void;
  recordPaperChange: (id: string) => void;
  toggleAlert: (id: string, alertType: 'hasMold' | 'hasEdgeRoll' | 'hasColorFade' | 'hasMissingLabel') => void;
  markCompleted: (id: string) => void;
  refreshDryness: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const useSpecimenStore = create<SpecimenState>()(
  persist(
    (set, get) => ({
      specimens: mockSpecimens.map((s) => ({
        ...s,
        currentDryness: calculateDryness(s),
      })),

      addSpecimen: (data) => {
        const now = todayISO();
        const hasMissingLabel = !data.absorbentPaperBatch.trim();
        const newSpecimen: Specimen = {
          ...data,
          id: generateId(),
          currentDryness: 0,
          hasMold: false,
          hasEdgeRoll: false,
          hasColorFade: false,
          hasMissingLabel,
          isCompleted: false,
          lastPaperChangeDate: data.pressingDate,
          paperChangeCount: 0,
          notes: data.notes || '',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ specimens: [newSpecimen, ...state.specimens] }));
      },

      updateSpecimen: (id, updates) => {
        set((state) => ({
          specimens: state.specimens.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: todayISO() } : s,
          ),
        }));
      },

      deleteSpecimen: (id) => {
        set((state) => ({
          specimens: state.specimens.filter((s) => s.id !== id),
        }));
      },

      recordPaperChange: (id) => {
        set((state) => ({
          specimens: state.specimens.map((s) => {
            if (s.id !== id) return s;
            const updated = {
              ...s,
              lastPaperChangeDate: todayISO(),
              paperChangeCount: s.paperChangeCount + 1,
              updatedAt: todayISO(),
            };
            return {
              ...updated,
              currentDryness: calculateDryness(updated),
            };
          }),
        }));
      },

      toggleAlert: (id, alertType) => {
        set((state) => ({
          specimens: state.specimens.map((s) =>
            s.id === id
              ? { ...s, [alertType]: !s[alertType], updatedAt: todayISO() }
              : s,
          ),
        }));
      },

      markCompleted: (id) => {
        set((state) => ({
          specimens: state.specimens.map((s) =>
            s.id === id
              ? { ...s, isCompleted: true, currentDryness: 100, updatedAt: todayISO() }
              : s,
          ),
        }));
      },

      refreshDryness: () => {
        const { specimens } = get();
        set({
          specimens: specimens.map((s) => ({
            ...s,
            currentDryness: s.isCompleted ? 100 : calculateDryness(s),
          })),
        });
      },
    }),
    {
      name: 'specimen-store',
    },
  ),
);
