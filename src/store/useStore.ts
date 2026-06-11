import { create } from 'zustand';
import type { Seat, Dispute, StatsData } from '../types';
import { SeatStatus } from '../types';
import { apiClient } from '../api/client';

interface AppState {
  seats: Seat[];
  disputes: Array<Dispute & { seat?: Seat }>;
  stats: StatsData | null;
  filterBuilding: string;
  filterRoom: string;
  searchKeyword: string;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;

  loadSeats: () => Promise<void>;
  loadDisputes: () => Promise<void>;
  loadStats: () => Promise<void>;
  setFilterBuilding: (b: string) => void;
  setFilterRoom: (r: string) => void;
  setSearchKeyword: (k: string) => void;
  setAdmin: (v: boolean) => void;

  groupedSeats: Record<SeatStatus, Seat[]>;
  statusCounts: Record<SeatStatus, number>;
  filteredSeats: Seat[];
  availableBuildings: string[];
  availableRooms: string[];
}

export const useAppStore = create<AppState>((set, get) => ({
  seats: [],
  disputes: [],
  stats: null,
  filterBuilding: '',
  filterRoom: '',
  searchKeyword: '',
  isAdmin: false,
  loading: false,
  error: null,

  async loadSeats() {
    set({ loading: true, error: null });
    try {
      const { filterBuilding, filterRoom } = get();
      const seats = await apiClient.listSeats(filterBuilding || undefined, filterRoom || undefined);
      set({ seats, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async loadDisputes() {
    try {
      const disputes = await apiClient.listDisputes();
      set({ disputes });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async loadStats() {
    try {
      const stats = await apiClient.getStats();
      set({ stats });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  setFilterBuilding(b) {
    set({ filterBuilding: b, filterRoom: '' });
  },
  setFilterRoom(r) {
    set({ filterRoom: r });
  },
  setSearchKeyword(k) {
    set({ searchKeyword: k });
  },
  setAdmin(v) {
    set({ isAdmin: v });
  },

  get filteredSeats() {
    const { seats, searchKeyword } = get();
    if (!searchKeyword.trim()) return seats;
    const kw = searchKeyword.trim().toLowerCase();
    return seats.filter((s) => {
      return (
        s.building.toLowerCase().includes(kw) ||
        s.room.toLowerCase().includes(kw) ||
        s.seatNumber.toLowerCase().includes(kw) ||
        (s.registeredBy || '').toLowerCase().includes(kw)
      );
    });
  },

  get groupedSeats() {
    const result: Record<SeatStatus, Seat[]> = {
      [SeatStatus.EMPTY]: [],
      [SeatStatus.IN_USE]: [],
      [SeatStatus.TEMP_LEAVE]: [],
      [SeatStatus.SUSPECTED]: [],
    };
    get().filteredSeats.forEach((s) => result[s.status].push(s));
    return result;
  },

  get statusCounts() {
    const g = get().groupedSeats;
    return {
      [SeatStatus.EMPTY]: g[SeatStatus.EMPTY].length,
      [SeatStatus.IN_USE]: g[SeatStatus.IN_USE].length,
      [SeatStatus.TEMP_LEAVE]: g[SeatStatus.TEMP_LEAVE].length,
      [SeatStatus.SUSPECTED]: g[SeatStatus.SUSPECTED].length,
    };
  },

  get availableBuildings() {
    return Array.from(new Set(get().seats.map((s) => s.building))).sort();
  },

  get availableRooms() {
    const { seats, filterBuilding } = get();
    const rooms = seats
      .filter((s) => !filterBuilding || s.building === filterBuilding)
      .map((s) => s.room);
    return Array.from(new Set(rooms)).sort();
  },
}));
