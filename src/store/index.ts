import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Equipment,
  Trip,
  PackingItem,
  ReturnCheck,
  DryingRecord,
  MaintenanceRecord,
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceStatus,
} from "@/types";
import { MOCK_DATA } from "@/data/mockData";
import { uid } from "@/data/constants";

interface StoreState {
  equipment: Equipment[];
  trips: Trip[];
  packingItems: PackingItem[];
  returnChecks: ReturnCheck[];
  dryingRecords: DryingRecord[];
  maintenance: MaintenanceRecord[];

  addEquipment: (data: Omit<Equipment, "id" | "createdAt" | "updatedAt">) => void;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  getEquipment: (id: string) => Equipment | undefined;

  addTrip: (data: Omit<Trip, "id" | "createdAt">) => void;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;

  addPackingItem: (tripId: string, equipmentId: string) => void;
  togglePacked: (packingItemId: string) => void;
  removePackingItem: (packingItemId: string) => void;
  getTripPackingItems: (tripId: string) => PackingItem[];
  generatePackingList: (tripId: string, categoryFilter?: EquipmentCategory[]) => void;

  addReturnCheck: (data: Omit<ReturnCheck, "id">) => void;
  updateReturnCheck: (id: string, data: Partial<ReturnCheck>) => void;
  getTripReturnChecks: (tripId: string) => ReturnCheck[];
  completeReturnCheck: (
    tripId: string,
    checks: Omit<ReturnCheck, "id" | "tripId" | "checkedAt">[]
  ) => void;

  addDryingRecord: (
    data: Omit<DryingRecord, "id" | "status"> & { status?: "drying" }
  ) => void;
  updateDryingRecord: (id: string, data: Partial<DryingRecord>) => void;
  recordFlip: (id: string) => void;
  completeDrying: (id: string) => void;
  getActiveDrying: () => DryingRecord[];
  getEquipmentDrying: (equipmentId: string) => DryingRecord | undefined;

  addMaintenance: (
    data: Omit<MaintenanceRecord, "id" | "createdAt" | "status"> & {
      status?: MaintenanceStatus;
    }
  ) => void;
  updateMaintenance: (id: string, data: Partial<MaintenanceRecord>) => void;
  completeMaintenance: (id: string, actualCost?: number) => void;
  deleteMaintenance: (id: string) => void;

  getDryingCount: () => number;
  getRepairCount: () => number;
  getPurchaseCount: () => number;
  getUnavailableCount: () => number;

  resetData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      equipment: MOCK_DATA.equipment,
      trips: MOCK_DATA.trips,
      packingItems: MOCK_DATA.packingItems,
      returnChecks: MOCK_DATA.returnChecks,
      dryingRecords: MOCK_DATA.dryingRecords,
      maintenance: MOCK_DATA.maintenance,

      addEquipment: (data) => {
        const now = new Date().toISOString();
        set({
          equipment: [
            ...get().equipment,
            {
              ...data,
              id: uid(),
              createdAt: now,
              updatedAt: now,
            },
          ],
        });
      },
      updateEquipment: (id, data) => {
        set({
          equipment: get().equipment.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
          ),
        });
      },
      deleteEquipment: (id) => {
        set({
          equipment: get().equipment.filter((e) => e.id !== id),
          packingItems: get().packingItems.filter((p) => p.equipmentId !== id),
          returnChecks: get().returnChecks.filter((r) => r.equipmentId !== id),
          dryingRecords: get().dryingRecords.filter((d) => d.equipmentId !== id),
        });
      },
      getEquipment: (id) => get().equipment.find((e) => e.id === id),

      addTrip: (data) => {
        set({
          trips: [
            ...get().trips,
            {
              ...data,
              id: uid(),
              createdAt: new Date().toISOString(),
            },
          ],
        });
      },
      updateTrip: (id, data) => {
        set({
          trips: get().trips.map((t) => (t.id === id ? { ...t, ...data } : t)),
        });
      },
      deleteTrip: (id) => {
        set({
          trips: get().trips.filter((t) => t.id !== id),
          packingItems: get().packingItems.filter((p) => p.tripId !== id),
          returnChecks: get().returnChecks.filter((r) => r.tripId !== id),
        });
      },
      getTrip: (id) => get().trips.find((t) => t.id === id),

      addPackingItem: (tripId, equipmentId) => {
        set({
          packingItems: [
            ...get().packingItems,
            {
              id: uid(),
              tripId,
              equipmentId,
              packed: false,
            },
          ],
        });
      },
      togglePacked: (packingItemId) => {
        set({
          packingItems: get().packingItems.map((p) =>
            p.id === packingItemId
              ? {
                  ...p,
                  packed: !p.packed,
                  packedAt: !p.packed ? new Date().toISOString() : undefined,
                }
              : p
          ),
        });
      },
      removePackingItem: (packingItemId) => {
        set({
          packingItems: get().packingItems.filter((p) => p.id !== packingItemId),
        });
      },
      getTripPackingItems: (tripId) =>
        get().packingItems.filter((p) => p.tripId === tripId),
      generatePackingList: (tripId, categoryFilter) => {
        const { equipment, packingItems } = get();
        const existingIds = new Set(
          packingItems.filter((p) => p.tripId === tripId).map((p) => p.equipmentId)
        );
        const toAdd = equipment.filter(
          (e) =>
            !existingIds.has(e.id) &&
            e.status === "available" &&
            (!categoryFilter || categoryFilter.includes(e.category))
        );
        const newItems: PackingItem[] = toAdd.map((e) => ({
          id: uid(),
          tripId,
          equipmentId: e.id,
          packed: false,
        }));
        set({ packingItems: [...packingItems, ...newItems] });
      },

      addReturnCheck: (data) => {
        set({
          returnChecks: [...get().returnChecks, { ...data, id: uid() }],
        });
      },
      updateReturnCheck: (id, data) => {
        set({
          returnChecks: get().returnChecks.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        });
      },
      getTripReturnChecks: (tripId) =>
        get().returnChecks.filter((r) => r.tripId === tripId),

      completeReturnCheck: (tripId, checks) => {
        const {
          equipment: eqList,
          dryingRecords,
          maintenance,
        } = get();
        const now = new Date().toISOString();
        const newReturnChecks: ReturnCheck[] = [];
        const newDrying: DryingRecord[] = [];
        const newMaintenance: MaintenanceRecord[] = [];
        const updatedEquipment: Record<string, Partial<Equipment>> = {};

        checks.forEach((check) => {
          newReturnChecks.push({
            ...check,
            id: uid(),
            tripId,
            checkedAt: now,
          });

          const eq = eqList.find((e) => e.id === check.equipmentId);
          if (!eq) return;

          let newStatus: EquipmentStatus = "available";
          if (check.isDamaged) {
            newStatus = "repairing";
            newMaintenance.push({
              id: uid(),
              equipmentId: eq.id,
              type: "repair",
              title: `${eq.name} - 破损维修`,
              description:
                check.notes ||
                `在露营活动中发现破损，需要维修处理。检查详情：泥土${
                  check.hasDirt ? "是" : "否"
                }、潮湿${check.isWet ? "是" : "否"}、缺件${
                  check.isMissingParts ? "是" : "否"
                }、破损是`,
              priority: 2,
              status: "pending",
              createdAt: now,
            });
          } else if (check.isWet) {
            newStatus = "drying";
            newDrying.push({
              id: uid(),
              equipmentId: eq.id,
              tripId,
              location: "待分配",
              startTime: now,
              status: "drying",
              notes: check.notes,
            });
          } else if (check.isMissingParts) {
            newStatus = "missing";
            newMaintenance.push({
              id: uid(),
              equipmentId: eq.id,
              type: "purchase",
              title: `${eq.name} - 缺件补购`,
              description:
                check.notes ||
                `在露营活动中发现缺件，需要补购配件或更换。`,
              priority: 2,
              status: "pending",
              createdAt: now,
            });
          }

          if (
            eq.batteryLevel !== undefined &&
            check.batteryLevel !== undefined
          ) {
            updatedEquipment[eq.id] = {
              status: newStatus,
              batteryLevel: check.batteryLevel,
            };
          } else {
            updatedEquipment[eq.id] = { status: newStatus };
          }
        });

        set({
          returnChecks: [...get().returnChecks, ...newReturnChecks],
          dryingRecords: [...dryingRecords, ...newDrying],
          maintenance: [...maintenance, ...newMaintenance],
          equipment: eqList.map((e) =>
            updatedEquipment[e.id]
              ? { ...e, ...updatedEquipment[e.id], updatedAt: now }
              : e
          ),
          trips: get().trips.map((t) =>
            t.id === tripId ? { ...t, status: "completed" as const } : t
          ),
        });
      },

      addDryingRecord: (data) => {
        const { equipment } = get();
        set({
          dryingRecords: [
            ...get().dryingRecords,
            {
              ...data,
              id: uid(),
              status: data.status || "drying",
            },
          ],
          equipment: equipment.map((e) =>
            e.id === data.equipmentId
              ? { ...e, status: "drying", updatedAt: new Date().toISOString() }
              : e
          ),
        });
      },
      updateDryingRecord: (id, data) => {
        set({
          dryingRecords: get().dryingRecords.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        });
      },
      recordFlip: (id) => {
        set({
          dryingRecords: get().dryingRecords.map((d) =>
            d.id === id ? { ...d, flipTime: new Date().toISOString() } : d
          ),
        });
      },
      completeDrying: (id) => {
        const { equipment, dryingRecords } = get();
        const record = dryingRecords.find((d) => d.id === id);
        const now = new Date().toISOString();
        set({
          dryingRecords: dryingRecords.map((d) =>
            d.id === id ? { ...d, endTime: now, status: "completed" as const } : d
          ),
          equipment: equipment.map((e) =>
            e.id === record?.equipmentId && e.status === "drying"
              ? { ...e, status: "available", updatedAt: now }
              : e
          ),
        });
      },
      getActiveDrying: () =>
        get().dryingRecords.filter((d) => d.status === "drying"),
      getEquipmentDrying: (equipmentId) =>
        get().dryingRecords.find(
          (d) => d.equipmentId === equipmentId && d.status === "drying"
        ),

      addMaintenance: (data) => {
        const { equipment } = get();
        const now = new Date().toISOString();
        const newRecord: MaintenanceRecord = {
          ...data,
          id: uid(),
          status: data.status || "pending",
          createdAt: now,
        };
        set({
          maintenance: [...get().maintenance, newRecord],
          equipment:
            data.equipmentId
              ? equipment.map((e) =>
                  e.id === data.equipmentId
                    ? {
                        ...e,
                        status:
                          data.type === "repair"
                            ? "repairing"
                            : ("missing" as EquipmentStatus),
                        updatedAt: now,
                      }
                    : e
                )
              : equipment,
        });
      },
      updateMaintenance: (id, data) => {
        set({
          maintenance: get().maintenance.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        });
      },
      completeMaintenance: (id, actualCost) => {
        const { equipment, maintenance } = get();
        const record = maintenance.find((m) => m.id === id);
        const now = new Date().toISOString();
        set({
          maintenance: maintenance.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "completed" as const,
                  completedAt: now,
                  actualCost,
                }
              : m
          ),
          equipment:
            record?.equipmentId
              ? equipment.map((e) => {
                  if (e.id !== record.equipmentId) return e;
                  if (e.status === "repairing" || e.status === "missing") {
                    return { ...e, status: "available", updatedAt: now };
                  }
                  return e;
                })
              : equipment,
        });
      },
      deleteMaintenance: (id) => {
        set({
          maintenance: get().maintenance.filter((m) => m.id !== id),
        });
      },

      getDryingCount: () =>
        get().dryingRecords.filter((d) => d.status === "drying").length,
      getRepairCount: () =>
        get().maintenance.filter(
          (m) => m.type === "repair" && m.status !== "completed"
        ).length,
      getPurchaseCount: () =>
        get().maintenance.filter(
          (m) => m.type === "purchase" && m.status !== "completed"
        ).length,
      getUnavailableCount: () =>
        get().equipment.filter((e) => e.status !== "available").length,

      resetData: () => {
        set({
          equipment: MOCK_DATA.equipment,
          trips: MOCK_DATA.trips,
          packingItems: MOCK_DATA.packingItems,
          returnChecks: MOCK_DATA.returnChecks,
          dryingRecords: MOCK_DATA.dryingRecords,
          maintenance: MOCK_DATA.maintenance,
        });
      },
    }),
    {
      name: "camping-gear-storage",
      partialize: (state) => ({
        equipment: state.equipment,
        trips: state.trips,
        packingItems: state.packingItems,
        returnChecks: state.returnChecks,
        dryingRecords: state.dryingRecords,
        maintenance: state.maintenance,
      }),
    }
  )
);
