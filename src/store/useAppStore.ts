import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Device,
  CheckRecord,
  Incident,
  RepairTask,
  RepairStatus,
  IncidentType,
} from "@/types";
import { FOOT_PAD_REPLACE_THRESHOLD } from "@/types";
import { generateId, getLastDays } from "@/utils/helpers";
import {
  mockDevices,
  mockCheckRecords,
  mockIncidents,
  mockRepairTasks,
} from "@/utils/mockData";

interface AppStore {
  devices: Device[];
  checkRecords: CheckRecord[];
  incidents: Incident[];
  repairTasks: RepairTask[];

  addDevice: (
    device: Omit<Device, "id" | "createdAt" | "lastCheckDate" | "footPadUsageDays">
  ) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;

  addCheckRecord: (record: Omit<CheckRecord, "id">) => void;

  addIncident: (
    incident: Omit<Incident, "id">
  ) => { incident: Incident; repairTask: RepairTask };

  updateRepairStatus: (id: string, status: RepairStatus) => void;

  getDeviceById: (id: string) => Device | undefined;
  getIncidentById: (id: string) => Incident | undefined;
  getPendingChecks: () => number;
  getPendingRepairs: () => number;
  getFootPadWarnings: () => Device[];
  getIncidentTrend: () => { date: string; count: number }[];
  getCheckRecordsByDevice: (deviceId: string) => CheckRecord[];
  getIncidentsByDevice: (deviceId: string) => Incident[];
  getRepairTasksByDevice: (deviceId: string) => RepairTask[];
}

const generateRepairTaskFromIncident = (
  incident: Incident
): Omit<RepairTask, "id" | "createdAt" | "completedAt"> => {
  const incidentTitles: Record<IncidentType, string> = {
    fall: "摔倒相关检查维修",
    brake_failure: "刹车系统检修",
    noise: "异响排查及处理",
    uneven: "行走偏斜调整",
  };

  const incidentDescriptions: Record<IncidentType, string> = {
    fall: "设备发生摔倒事件，需要全面检查设备结构安全性",
    brake_failure: "刹车系统故障，需要检查刹车线、刹车片及刹车手柄",
    noise: "设备存在异常响声，需要检查车轮、轴承及连接部位",
    uneven: "推行时偏斜，需要检查车轮对齐及转向系统",
  };

  return {
    deviceId: incident.deviceId,
    incidentId: incident.id,
    title: incidentTitles[incident.type],
    description: `${incidentDescriptions[incident.type]}。地点：${incident.location}。详情：${incident.description}`,
    status: "pending",
    assignee: "维修师傅陈师傅",
  };
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      devices: mockDevices,
      checkRecords: mockCheckRecords,
      incidents: mockIncidents,
      repairTasks: mockRepairTasks,

      addDevice: (device) =>
        set((state) => ({
          devices: [
            ...state.devices,
            {
              ...device,
              id: generateId(),
              createdAt: new Date().toISOString(),
              lastCheckDate: new Date().toISOString(),
              footPadUsageDays: 0,
            },
          ],
        })),

      updateDevice: (id, device) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, ...device } : d
          ),
        })),

      deleteDevice: (id) =>
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
          checkRecords: state.checkRecords.filter((r) => r.deviceId !== id),
          incidents: state.incidents.filter((i) => i.deviceId !== id),
          repairTasks: state.repairTasks.filter((t) => t.deviceId !== id),
        })),

      addCheckRecord: (record) => {
        const hasFootPadIssue = !record.footPad;
        set((state) => {
          const device = state.devices.find((d) => d.id === record.deviceId);
          const updatedFootPadDays = hasFootPadIssue
            ? device?.footPadUsageDays || 0
            : 0;

          return {
            checkRecords: [
              ...state.checkRecords,
              { ...record, id: generateId() },
            ],
            devices: state.devices.map((d) =>
              d.id === record.deviceId
                ? {
                    ...d,
                    lastCheckDate: record.checkDate,
                    footPadUsageDays: hasFootPadIssue
                      ? updatedFootPadDays + 1
                      : d.footPadUsageDays + 1,
                  }
                : d
            ),
          };
        });
      },

      addIncident: (incident) => {
        const newIncident: Incident = {
          ...incident,
          id: generateId(),
        };
        const repairTaskData = generateRepairTaskFromIncident(newIncident);
        const newRepairTask: RepairTask = {
          ...repairTaskData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          completedAt: "",
        };

        set((state) => ({
          incidents: [...state.incidents, newIncident],
          repairTasks: [...state.repairTasks, newRepairTask],
        }));

        return { incident: newIncident, repairTask: newRepairTask };
      },

      updateRepairStatus: (id, status) =>
        set((state) => ({
          repairTasks: state.repairTasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === "completed" ? new Date().toISOString() : "",
                }
              : t
          ),
        })),

      getDeviceById: (id) => get().devices.find((d) => d.id === id),

      getIncidentById: (id) => get().incidents.find((i) => i.id === id),

      getPendingChecks: () => {
        const { devices } = get();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return devices.filter((d) => new Date(d.lastCheckDate) < sevenDaysAgo)
          .length;
      },

      getPendingRepairs: () => {
        const { repairTasks } = get();
        return repairTasks.filter((t) => t.status !== "completed").length;
      },

      getFootPadWarnings: () => {
        const { devices } = get();
        return devices.filter(
          (d) => d.footPadUsageDays >= FOOT_PAD_REPLACE_THRESHOLD
        );
      },

      getIncidentTrend: () => {
        const { incidents } = get();
        const last7Days = getLastDays(7);
        return last7Days.map((date) => ({
          date,
          count: incidents.filter(
            (i) => i.incidentDate.split("T")[0] === date
          ).length,
        }));
      },

      getCheckRecordsByDevice: (deviceId) =>
        get()
          .checkRecords.filter((r) => r.deviceId === deviceId)
          .sort(
            (a, b) =>
              new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime()
          ),

      getIncidentsByDevice: (deviceId) =>
        get()
          .incidents.filter((i) => i.deviceId === deviceId)
          .sort(
            (a, b) =>
              new Date(b.incidentDate).getTime() -
              new Date(a.incidentDate).getTime()
          ),

      getRepairTasksByDevice: (deviceId) =>
        get()
          .repairTasks.filter((t) => t.deviceId === deviceId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
    }),
    {
      name: "walker-maintenance-storage",
    }
  )
);
