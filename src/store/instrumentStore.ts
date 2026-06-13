import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Instrument } from "@/types";
import { mockInstruments } from "@/mock/instruments";

interface InstrumentState {
  instruments: Instrument[];
  searchKeyword: string;
  filterClassroom: string | null;
  filterType: string | null;

  setSearchKeyword: (keyword: string) => void;
  setFilterClassroom: (classroom: string | null) => void;
  setFilterType: (type: string | null) => void;

  addInstrument: (instrument: Omit<Instrument, "id" | "createdAt">) => void;
  updateInstrument: (id: string, data: Partial<Instrument>) => void;
  deleteInstrument: (id: string) => void;
  getInstrumentById: (id: string) => Instrument | undefined;

  getFilteredInstruments: () => Instrument[];
  resetFilters: () => void;
}

const generateId = () =>
  "INS" + String(Date.now()).slice(-6) + Math.floor(Math.random() * 100);

export const useInstrumentStore = create<InstrumentState>()(
  persist(
    (set, get) => ({
      instruments: mockInstruments,
      searchKeyword: "",
      filterClassroom: null,
      filterType: null,

      setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
      setFilterClassroom: (classroom) => set({ filterClassroom: classroom }),
      setFilterType: (type) => set({ filterType: type }),

      addInstrument: (data) => {
        const newInstrument: Instrument = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          instruments: [newInstrument, ...state.instruments],
        }));
      },

      updateInstrument: (id, data) => {
        set((state) => ({
          instruments: state.instruments.map((ins) =>
            ins.id === id ? { ...ins, ...data } : ins
          ),
        }));
      },

      deleteInstrument: (id) => {
        set((state) => ({
          instruments: state.instruments.filter((ins) => ins.id !== id),
        }));
      },

      getInstrumentById: (id) => {
        return get().instruments.find((ins) => ins.id === id);
      },

      getFilteredInstruments: () => {
        const { instruments, searchKeyword, filterClassroom, filterType } =
          get();
        return instruments.filter((ins) => {
          if (searchKeyword) {
            const kw = searchKeyword.toLowerCase();
            const match =
              ins.id.toLowerCase().includes(kw) ||
              ins.type.toLowerCase().includes(kw) ||
              ins.brand.toLowerCase().includes(kw) ||
              ins.classroom.toLowerCase().includes(kw);
            if (!match) return false;
          }
          if (filterClassroom && ins.classroom !== filterClassroom) return false;
          if (filterType && ins.type !== filterType) return false;
          return true;
        });
      },

      resetFilters: () => {
        set({
          searchKeyword: "",
          filterClassroom: null,
          filterType: null,
        });
      },
    }),
    {
      name: "instrument-store",
    }
  )
);
