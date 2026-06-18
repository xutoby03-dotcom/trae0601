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

  createRepairTaskFromCheck: (
    deviceId: string,
    failedItems: string[],
    checkRecordId?: string
  ) => RepairTask;

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

const CHECK_ITEM_REPAIR_CONFIG: Record<
  string,
  { title: string; description: string }
> = {
  footPad: {
    title: "脚垫更换或维修",
    description: "脚垫磨损严重，需要检查并更换脚垫，确保防滑效果",
  },
  antiSlipCover: {
    title: "防滑套更换",
    description: "防滑套损坏或老化，需要更换新的防滑套",
  },
  brakeLine: {
    title: "刹车系统检修",
    description: "刹车线检查不通过，需要检查刹车线松紧度、刹车片磨损情况并进行调整或更换",
  },
  armrestSponge: {
    title: "扶手海绵更换",
    description: "扶手海绵破损或塌陷，需要更换新的扶手海绵",
  },
  foldLock: {
    title: "折叠卡扣维修",
    description: "折叠卡扣不牢固或开合不顺畅，需要检查并维修",
  },
  wheelRotation: {
    title: "车轮检修及润滑",
    description: "车轮转动不顺畅或有异响，需要检查轴承、清洁并添加润滑油",
  },
};

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

      createRepairTaskFromCheck: (deviceId, failedItems, checkRecordId) => {
        const validFailedItems = failedItems.filter(
          (key) => CHECK_ITEM_REPAIR_CONFIG[key]
        );

        let title: string;
        let description: string;

        if (validFailedItems.length === 1) {
          title = CHECK_ITEM_REPAIR_CONFIG[validFailedItems[0]].title;
          description = CHECK_ITEM_REPAIR_CONFIG[validFailedItems[0]].description;
        } else {
          const titles = validFailedItems.map(
            (key) => CHECK_ITEM_REPAIR_CONFIG[key].title
          );
          title = titles.slice(0, 2).join(" + ") + (titles.length > 2 ? ` 等${titles.length}项` : "") + "维修";
          const descs = validFailedItems.map(
            (key) => CHECK_ITEM_REPAIR_CONFIG[key].description
          );
          description = descs.join("；");
        }

        const newRepairTask: RepairTask = {
          id: generateId(),
          deviceId,
          incidentId: checkRecordId || "",
          title,
          description,
          status: "pending",
          createdAt: new Date().toISOString(),
          completedAt: "",
          assignee: "维修师傅陈师傅",
        };

        set((state) => ({
          repairTasks: [...state.repairTasks, newRepairTask],
        }));

        return newRepairTask;
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
