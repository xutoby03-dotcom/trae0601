import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DewormFormData,
  DewormRecord,
  Pet,
  PetFormData,
  WeightHistory,
} from "../types";
import { uid, todayStr } from "../utils/date";
import { mockPets, mockRecords, mockWeightHistory } from "../data/mock";
import { checkWeightSignificantChange } from "../utils/deworm";

interface PetStore {
  pets: Pet[];
  records: DewormRecord[];
  weightHistory: WeightHistory[];
  dismissedWeightAlerts: string[];
  addPet: (data: PetFormData) => Pet;
  updatePet: (id: string, data: PetFormData) => Pet | undefined;
  deletePet: (id: string) => void;
  getPet: (id: string) => Pet | undefined;
  addDewormRecord: (petId: string, data: DewormFormData) => DewormRecord;
  deleteDewormRecord: (id: string) => void;
  dismissWeightAlert: (petId: string) => void;
  checkNeedsDoseReview: (petId: string) => boolean;
}

const STORAGE_KEY = "pet-deworm-tracker-v1";

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: mockPets,
      records: mockRecords,
      weightHistory: mockWeightHistory,
      dismissedWeightAlerts: [],

      getPet: (id) => get().pets.find((p) => p.id === id),

      addPet: (data) => {
        const now = new Date().toISOString();
        const newPet: Pet = {
          ...data,
          id: uid(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          pets: [...state.pets, newPet],
          weightHistory: [
            ...state.weightHistory,
            {
              id: uid(),
              petId: newPet.id,
              weight: newPet.weight,
              recordedAt: todayStr(),
            },
          ],
        }));
        return newPet;
      },

      updatePet: (id, data) => {
        const state = get();
        const existing = state.pets.find((p) => p.id === id);
        if (!existing) return undefined;

        const weightChanged = existing.weight !== data.weight;
        const updated: Pet = {
          ...existing,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        set((s) => ({
          pets: s.pets.map((p) => (p.id === id ? updated : p)),
          weightHistory: weightChanged
            ? [
                ...s.weightHistory,
                {
                  id: uid(),
                  petId: id,
                  weight: data.weight,
                  recordedAt: todayStr(),
                },
              ]
            : s.weightHistory,
          dismissedWeightAlerts: weightChanged
            ? s.dismissedWeightAlerts.filter((x) => x !== id)
            : s.dismissedWeightAlerts,
        }));
        return updated;
      },

      deletePet: (id) => {
        set((s) => ({
          pets: s.pets.filter((p) => p.id !== id),
          records: s.records.filter((r) => r.petId !== id),
          weightHistory: s.weightHistory.filter((w) => w.petId !== id),
          dismissedWeightAlerts: s.dismissedWeightAlerts.filter(
            (x) => x !== id
          ),
        }));
      },

      addDewormRecord: (petId, data) => {
        const record: DewormRecord = {
          ...data,
          id: uid(),
          petId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          records: [...s.records, record],
        }));
        return record;
      },

      deleteDewormRecord: (id) => {
        set((s) => ({
          records: s.records.filter((r) => r.id !== id),
        }));
      },

      dismissWeightAlert: (petId) => {
        set((s) => ({
          dismissedWeightAlerts: [...s.dismissedWeightAlerts, petId],
        }));
      },

      checkNeedsDoseReview: (petId) => {
        const state = get();
        if (state.dismissedWeightAlerts.includes(petId)) return false;
        const history = state.weightHistory
          .filter((w) => w.petId === petId)
          .sort(
            (a, b) =>
              new Date(a.recordedAt).getTime() -
              new Date(b.recordedAt).getTime()
          );
        if (history.length < 2) return false;
        const first = history[0];
        const last = history[history.length - 1];
        return checkWeightSignificantChange(first.weight, last.weight);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pets: state.pets,
        records: state.records,
        weightHistory: state.weightHistory,
        dismissedWeightAlerts: state.dismissedWeightAlerts,
      }),
    }
  )
);
