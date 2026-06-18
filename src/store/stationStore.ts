import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChargingStation, StationStatus } from "../types";
import { mockStations } from "../mock/stations";

interface StationState {
  stations: ChargingStation[];
  getStationById: (id: string) => ChargingStation | undefined;
  getStationsByBuilding: (building: string) => ChargingStation[];
  getStationsByStatus: (status: StationStatus) => ChargingStation[];
  getFaultStations: () => ChargingStation[];
  addStation: (station: Omit<ChargingStation, "id" | "createdAt">) => void;
  updateStation: (id: string, updates: Partial<ChargingStation>) => void;
  updateStationStatus: (id: string, status: StationStatus) => void;
  deleteStation: (id: string) => void;
  updateLastInspection: (id: string) => void;
  stats: {
    total: number;
    online: number;
    offline: number;
    fault: number;
    maintenance: number;
  };
  computeStats: () => void;
}

export const useStationStore = create<StationState>()(
  persist(
    (set, get) => ({
      stations: mockStations,

      getStationById: (id) => get().stations.find((s) => s.id === id),

      getStationsByBuilding: (building) =>
        get().stations.filter((s) => s.building === building),

      getStationsByStatus: (status) =>
        get().stations.filter((s) => s.status === status),

      getFaultStations: () =>
        get().stations.filter((s) => s.status === "fault" || s.status === "maintenance"),

      addStation: (station) =>
        set((state) => ({
          stations: [
            ...state.stations,
            {
              ...station,
              id: `station_${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateStation: (id, updates) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      updateStationStatus: (id, status) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, status } : s
          ),
        })),

      deleteStation: (id) =>
        set((state) => ({
          stations: state.stations.filter((s) => s.id !== id),
        })),

      updateLastInspection: (id) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, lastInspectionAt: new Date().toISOString() } : s
          ),
        })),

      stats: { total: 0, online: 0, offline: 0, fault: 0, maintenance: 0 },

      computeStats: () => {
        const stations = get().stations;
        set({
          stats: {
            total: stations.length,
            online: stations.filter((s) => s.status === "online").length,
            offline: stations.filter((s) => s.status === "offline").length,
            fault: stations.filter((s) => s.status === "fault").length,
            maintenance: stations.filter((s) => s.status === "maintenance").length,
          },
        });
      },
    }),
    {
      name: "charging-stations",
      partialize: (state) => ({ stations: state.stations }),
    }
  )
);
