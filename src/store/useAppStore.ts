import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FamilyMember,
  Cat,
  LitterBox,
  CleanRecord,
  Alert,
} from '../types';
import {
  initialMembers,
  initialCats,
  initialLitterBoxes,
  generateInitialRecords,
  initialCurrentMemberId,
} from '../data/seed';
import { generateId } from '../lib/utils';

interface AppState {
  members: FamilyMember[];
  cats: Cat[];
  litterBoxes: LitterBox[];
  records: CleanRecord[];
  alerts: Alert[];
  currentMemberId: string;

  setCurrentMemberId: (id: string) => void;

  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateMember: (id: string, data: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;

  addCat: (cat: Omit<Cat, 'id'>) => void;
  updateCat: (id: string, data: Partial<Cat>) => void;
  removeCat: (id: string) => void;

  addLitterBox: (box: Omit<LitterBox, 'id'>) => void;
  updateLitterBox: (id: string, data: Partial<LitterBox>) => void;
  removeLitterBox: (id: string) => void;

  addRecord: (record: Omit<CleanRecord, 'id'>) => void;
  removeRecord: (id: string) => void;

  setAlerts: (alerts: Alert[]) => void;
  clearData: () => void;
  resetData: () => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      members: initialMembers,
      cats: initialCats,
      litterBoxes: initialLitterBoxes,
      records: generateInitialRecords(),
      alerts: [],
      currentMemberId: initialCurrentMemberId,

      setCurrentMemberId: (id) => set({ currentMemberId: id }),

      addMember: (member) =>
        set((state) => ({
          members: [...state.members, { ...member, id: generateId() }],
        })),
      updateMember: (id, data) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      addCat: (cat) =>
        set((state) => ({
          cats: [...state.cats, { ...cat, id: generateId() }],
        })),
      updateCat: (id, data) =>
        set((state) => ({
          cats: state.cats.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      removeCat: (id) =>
        set((state) => ({
          cats: state.cats.filter((c) => c.id !== id),
        })),

      addLitterBox: (box) =>
        set((state) => ({
          litterBoxes: [...state.litterBoxes, { ...box, id: generateId() }],
        })),
      updateLitterBox: (id, data) =>
        set((state) => ({
          litterBoxes: state.litterBoxes.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        })),
      removeLitterBox: (id) =>
        set((state) => ({
          litterBoxes: state.litterBoxes.filter((b) => b.id !== id),
          records: state.records.filter((r) => r.litterBoxId !== id),
        })),

      addRecord: (record) => {
        const newRecord: CleanRecord = { ...record, id: generateId() };
        set((state) => {
          let updatedBoxes = state.litterBoxes;
          if (record.isFullChange) {
            updatedBoxes = state.litterBoxes.map((b) =>
              b.id === record.litterBoxId
                ? { ...b, lastFullChange: record.cleanTime }
                : b
            );
          }
          return {
            records: [newRecord, ...state.records].sort(
              (a, b) =>
                new Date(b.cleanTime).getTime() -
                new Date(a.cleanTime).getTime()
            ),
            litterBoxes: updatedBoxes,
          };
        });
      },
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      setAlerts: (alerts) => set({ alerts }),

      clearData: () =>
        set({
          members: [],
          cats: [],
          litterBoxes: [],
          records: [],
          alerts: [],
        }),
      resetData: () =>
        set({
          members: initialMembers,
          cats: initialCats,
          litterBoxes: initialLitterBoxes,
          records: generateInitialRecords(),
          alerts: [],
          currentMemberId: initialCurrentMemberId,
        }),
    }),
    {
      name: 'cat-litter-storage',
    }
  )
);

export default useAppStore;
