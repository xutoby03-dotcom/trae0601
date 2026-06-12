import { create } from "zustand";
import type {
  Area,
  Vehicle,
  VehicleWithArea,
  PatrolWithDetails,
  DisposalWithDetails,
  DashboardData,
  VehicleStatus,
  VehicleType,
  DisposalType,
} from "@/types";
import { request } from "@/utils";

interface PendingVehicle extends Vehicle {
  areaName: string;
  daysUnmoved: number;
}

interface AppState {
  dashboard: DashboardData | null;
  areas: Area[];
  vehicles: VehicleWithArea[];
  patrols: PatrolWithDetails[];
  disposals: DisposalWithDetails[];
  pendingDisposals: PendingVehicle[];
  loading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchAreas: () => Promise<void>;
  fetchVehicles: (filters?: { areaId?: string; status?: VehicleStatus }) => Promise<void>;
  fetchPatrols: (filters?: { areaId?: string; status?: VehicleStatus }) => Promise<void>;
  fetchDisposals: () => Promise<void>;
  fetchPendingDisposals: () => Promise<void>;

  createArea: (data: Omit<Area, "id" | "createdAt">) => Promise<Area>;
  updateArea: (id: string, data: Partial<Omit<Area, "id" | "createdAt">>) => Promise<Area>;
  deleteArea: (id: string) => Promise<void>;

  createVehicle: (
    data: Omit<Vehicle, "id" | "createdAt"> & { vehicleType: VehicleType },
  ) => Promise<VehicleWithArea>;
  updateVehicle: (
    id: string,
    data: Partial<Omit<Vehicle, "id" | "createdAt">>,
  ) => Promise<VehicleWithArea>;
  deleteVehicle: (id: string) => Promise<void>;

  createPatrol: (data: {
    vehicleId: string;
    areaId: string;
    status: VehicleStatus;
    remark?: string;
    photoUrl?: string;
    patrolUser?: string;
    patrolTime?: string;
  }) => Promise<PatrolWithDetails>;

  createDisposal: (data: {
    vehicleId: string;
    areaId: string;
    disposalType: DisposalType;
    disposalTime?: string;
    photoUrl?: string;
    remark?: string;
    handledBy?: string;
  }) => Promise<DisposalWithDetails>;
}

export const useStore = create<AppState>((set, get) => ({
  dashboard: null,
  areas: [],
  vehicles: [],
  patrols: [],
  disposals: [],
  pendingDisposals: [],
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const data = await request<DashboardData>("/api/dashboard");
      set({ dashboard: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchAreas: async () => {
    const data = await request<Area[]>("/api/areas");
    set({ areas: data });
  },

  fetchVehicles: async (filters) => {
    const params = new URLSearchParams();
    if (filters?.areaId) params.set("areaId", filters.areaId);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    const data = await request<VehicleWithArea[]>(`/api/vehicles${qs ? `?${qs}` : ""}`);
    set({ vehicles: data });
  },

  fetchPatrols: async (filters) => {
    const params = new URLSearchParams();
    if (filters?.areaId) params.set("areaId", filters.areaId);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    const data = await request<PatrolWithDetails[]>(`/api/patrols${qs ? `?${qs}` : ""}`);
    set({ patrols: data });
  },

  fetchDisposals: async () => {
    const data = await request<DisposalWithDetails[]>("/api/disposals");
    set({ disposals: data });
  },

  fetchPendingDisposals: async () => {
    const data = await request<PendingVehicle[]>("/api/disposals?scope=pending");
    set({ pendingDisposals: data });
  },

  createArea: async (data) => {
    const area = await request<Area>("/api/areas", { method: "POST", body: data });
    set({ areas: [...get().areas, area] });
    return area;
  },

  updateArea: async (id, data) => {
    const area = await request<Area>(`/api/areas/${id}`, { method: "PUT", body: data });
    set({ areas: get().areas.map((a) => (a.id === id ? area : a)) });
    return area;
  },

  deleteArea: async (id) => {
    await request(`/api/areas/${id}`, { method: "DELETE" });
    set({ areas: get().areas.filter((a) => a.id !== id) });
  },

  createVehicle: async (data) => {
    const v = await request<VehicleWithArea>("/api/vehicles", { method: "POST", body: data });
    set({ vehicles: [...get().vehicles, v] });
    return v;
  },

  updateVehicle: async (id, data) => {
    const v = await request<VehicleWithArea>(`/api/vehicles/${id}`, { method: "PUT", body: data });
    set({ vehicles: get().vehicles.map((x) => (x.id === id ? v : x)) });
    return v;
  },

  deleteVehicle: async (id) => {
    await request(`/api/vehicles/${id}`, { method: "DELETE" });
    set({ vehicles: get().vehicles.filter((v) => v.id !== id) });
  },

  createPatrol: async (data) => {
    const p = await request<PatrolWithDetails>("/api/patrols", { method: "POST", body: data });
    set({ patrols: [p, ...get().patrols] });
    return p;
  },

  createDisposal: async (data) => {
    const d = await request<DisposalWithDetails>("/api/disposals", { method: "POST", body: data });
    set({ disposals: [d, ...get().disposals] });
    set({ pendingDisposals: get().pendingDisposals.filter((v) => v.id !== data.vehicleId) });
    return d;
  },
}));
