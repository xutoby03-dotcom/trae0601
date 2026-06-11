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

  filteredSeats: Seat[];
  groupedSeats: Record<SeatStatus, Seat[]>;
  statusCounts: Record<SeatStatus, number>;
  availableBuildings: string[];
  availableRooms: string[];

  loadSeats: () => Promise<void>;
  loadDisputes: () => Promise<void>;
  loadStats: () => Promise<void>;
  setFilterBuilding: (b: string) => void;
  setFilterRoom: (r: string) => void;
  setSearchKeyword: (k: string) => void;
  setAdmin: (v: boolean) => void;

  _recompute: () => void;
}

function emptyGroups(): Record<SeatStatus, Seat[]> {
  return {
    [SeatStatus.EMPTY]: [],
    [SeatStatus.IN_USE]: [],
    [SeatStatus.TEMP_LEAVE]: [],
    [SeatStatus.SUSPECTED]: [],
  };
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

  filteredSeats: [],
  groupedSeats: emptyGroups(),
  statusCounts: {
    [SeatStatus.EMPTY]: 0,
    [SeatStatus.IN_USE]: 0,
    [SeatStatus.TEMP_LEAVE]: 0,
    [SeatStatus.SUSPECTED]: 0,
  },
  availableBuildings: [],
  availableRooms: [],

  _recompute() {
    const { seats, searchKeyword, filterBuilding, filterRoom } = get();

    // 1. filteredSeats - 先按教学楼/教室过滤，再搜索过滤
    let filtered = seats;
    if (filterBuilding) {
      filtered = filtered.filter((s) => s.building === filterBuilding);
    }
    if (filterRoom) {
      filtered = filtered.filter((s) => s.room === filterRoom);
    }
    const kw = searchKeyword.trim().toLowerCase();
    if (kw) {
      filtered = filtered.filter((s) =>
        s.building.toLowerCase().includes(kw) ||
        s.room.toLowerCase().includes(kw) ||
        s.seatNumber.toLowerCase().includes(kw) ||
        (s.registeredBy || '').toLowerCase().includes(kw)
      );
    }

    // 2. groupedSeats
    const groups = emptyGroups();
    filtered.forEach((s) => {
      groups[s.status].push(s);
    });

    // 3. statusCounts
    const counts = {
      [SeatStatus.EMPTY]: groups[SeatStatus.EMPTY].length,
      [SeatStatus.IN_USE]: groups[SeatStatus.IN_USE].length,
      [SeatStatus.TEMP_LEAVE]: groups[SeatStatus.TEMP_LEAVE].length,
      [SeatStatus.SUSPECTED]: groups[SeatStatus.SUSPECTED].length,
    };

    // 4. availableBuildings
    const buildings = Array.from(new Set(seats.map((s) => s.building))).sort();

    // 5. availableRooms（按教学楼过滤）
    const rooms = Array.from(
      new Set(
        seats
          .filter((s) => !filterBuilding || s.building === filterBuilding)
          .map((s) => s.room)
      )
    ).sort();

    set({
      filteredSeats: filtered,
      groupedSeats: groups,
      statusCounts: counts,
      availableBuildings: buildings,
      availableRooms: rooms,
    });
  },

  async loadSeats() {
    set({ loading: true, error: null });
    try {
      const { filterBuilding, filterRoom } = get();
      const seats = await apiClient.listSeats(
        filterBuilding || undefined,
        filterRoom || undefined
      );
      set({ seats, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    } finally {
      get()._recompute();
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
    get()._recompute();
  },

  setFilterRoom(r) {
    set({ filterRoom: r });
    get()._recompute();
  },

  setSearchKeyword(k) {
    set({ searchKeyword: k });
    get()._recompute();
  },

  setAdmin(v) {
    set({ isAdmin: v });
  },
}));
