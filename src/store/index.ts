import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Plant,
  ServiceRecord,
  Issue,
  Supplier,
  Staff,
  Reminder,
  OperationType,
  IssueStatus,
} from "@/types";
import {
  SUPPLIERS,
  STAFFS,
  generateMockPlants,
  generateMockServiceRecords,
  generateMockIssues,
  generateMockReminders,
} from "@/utils/mock";
import { generateId } from "@/utils/date";

interface PlantState {
  plants: Plant[];
  serviceRecords: ServiceRecord[];
  issues: Issue[];
  suppliers: Supplier[];
  staffs: Staff[];
  reminders: Reminder[];
  currentStaff: Staff;

  addPlant: (plant: Omit<Plant, "id" | "createdAt" | "status">) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  deletePlant: (id: string) => void;

  addServiceRecord: (
    record: Omit<ServiceRecord, "id" | "createdAt">
  ) => void;

  addIssue: (issue: Omit<Issue, "id" | "createdAt" | "status">) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  updateIssueStatus: (id: string, status: IssueStatus) => void;

  markReminderRead: (id: string) => void;
  unreadReminderCount: () => number;

  getPlantById: (id: string) => Plant | undefined;
  getPlantRecords: (plantId: string) => ServiceRecord[];
  getPlantIssues: (plantId: string) => Issue[];
  getSupplierById: (id: string) => Supplier | undefined;
  getStaffById: (id: string) => Staff | undefined;

  initMockData: () => void;
  resetData: () => void;
}

const initialPlants = generateMockPlants();
const initialRecords = generateMockServiceRecords(initialPlants);
const initialIssues = generateMockIssues(initialPlants);
const initialReminders = generateMockReminders(
  initialPlants,
  initialRecords,
  initialIssues
);

export const useStore = create<PlantState>()(
  persist(
    (set, get) => ({
      plants: initialPlants,
      serviceRecords: initialRecords,
      issues: initialIssues,
      suppliers: SUPPLIERS,
      staffs: STAFFS,
      reminders: initialReminders,
      currentStaff: STAFFS[2],

      addPlant: (plant) =>
        set((state) => ({
          plants: [
            {
              ...plant,
              id: generateId(),
              createdAt: new Date().toISOString(),
              status: "healthy",
            },
            ...state.plants,
          ],
        })),

      updatePlant: (id, updates) =>
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePlant: (id) =>
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
          serviceRecords: state.serviceRecords.filter((r) => r.plantId !== id),
          issues: state.issues.filter((i) => i.plantId !== id),
        })),

      addServiceRecord: (record) => {
        const newRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          serviceRecords: [newRecord, ...state.serviceRecords],
          plants: state.plants.map((p) =>
            p.id === record.plantId
              ? { ...p, lastServiceAt: record.checkinAt }
              : p
          ),
        }));

        const state = get();
        if (record.photos.length === 0) {
          const plant = state.getPlantById(record.plantId);
          if (plant) {
            set((s) => ({
              reminders: [
                {
                  id: generateId(),
                  type: "missing_photo",
                  title: `${plant.location} - ${plant.species} 服务记录缺失照片`,
                  description: "本次养护服务未上传现场照片",
                  plantId: plant.id,
                  createdAt: new Date().toISOString(),
                  read: false,
                },
                ...s.reminders,
              ],
            }));
          }
        }
      },

      addIssue: (issue) =>
        set((state) => ({
          issues: [
            {
              ...issue,
              id: generateId(),
              createdAt: new Date().toISOString(),
              status: "pending",
            },
            ...state.issues,
          ],
        })),

      updateIssue: (id, updates) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      updateIssueStatus: (id, status) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status,
                  closedAt:
                    status === "closed" ? new Date().toISOString() : undefined,
                  responseAt:
                    status === "processing" && !i.responseAt
                      ? new Date().toISOString()
                      : i.responseAt,
                }
              : i
          ),
        })),

      markReminderRead: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, read: true } : r
          ),
        })),

      unreadReminderCount: () =>
        get().reminders.filter((r) => !r.read).length,

      getPlantById: (id) => get().plants.find((p) => p.id === id),
      getPlantRecords: (plantId) =>
        get()
          .serviceRecords.filter((r) => r.plantId === plantId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
      getPlantIssues: (plantId) =>
        get().issues.filter((i) => i.plantId === plantId),
      getSupplierById: (id) => get().suppliers.find((s) => s.id === id),
      getStaffById: (id) => get().staffs.find((s) => s.id === id),

      initMockData: () => {
        const plants = generateMockPlants();
        set({
          plants,
          serviceRecords: generateMockServiceRecords(plants),
          issues: generateMockIssues(plants),
          suppliers: SUPPLIERS,
          staffs: STAFFS,
          reminders: generateMockReminders(
            plants,
            generateMockServiceRecords(plants),
            generateMockIssues(plants)
          ),
        });
      },

      resetData: () => {
        const plants = generateMockPlants();
        const records = generateMockServiceRecords(plants);
        const issues = generateMockIssues(plants);
        set({
          plants,
          serviceRecords: records,
          issues,
          suppliers: SUPPLIERS,
          staffs: STAFFS,
          reminders: generateMockReminders(plants, records, issues),
        });
      },
    }),
    {
      name: "plant-maintenance-storage",
    }
  )
);
