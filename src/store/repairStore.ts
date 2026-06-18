import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RepairTicket,
  RepairIssueType,
  RepairStatus,
  MaintenanceRecord,
  PartItem,
  StationStatus,
} from "../types";
import { generateRepairTickets, generateMaintenanceRecords } from "../mock/repairs";
import { mockStations } from "../mock/stations";
import { generateTicketNo, generateId } from "../utils/formatters";

const STATION_IDS = mockStations.map((s) => s.id);
const initialTickets = generateRepairTickets(STATION_IDS);
const initialMaintenance = generateMaintenanceRecords(STATION_IDS, initialTickets);

interface RepairState {
  tickets: RepairTicket[];
  maintenanceRecords: MaintenanceRecord[];
  getTicketById: (id: string) => RepairTicket | undefined;
  getTicketsByStatus: (status: RepairStatus | "all") => RepairTicket[];
  getTicketsByStation: (stationId: string) => RepairTicket[];
  getPendingCount: () => number;
  getOpenTickets: () => RepairTicket[];
  getMaintenanceByStation: (stationId: string) => MaintenanceRecord[];
  submitRepair: (data: {
    stationId: string;
    issueType: RepairIssueType;
    description: string;
    photos: string[];
    reporterName: string;
    reporterPhone: string;
    reporterBuilding: string;
  }) => RepairTicket;
  assignTicket: (ticketId: string, assignee: string) => void;
  updateTicketStatus: (ticketId: string, status: RepairStatus, note?: string) => void;
  completeTicket: (ticketId: string, resolution: string) => void;
  createMaintenance: (data: {
    stationId: string;
    repairTicketId?: string;
    faultReason: string;
    faultCategory: string;
    partsReplaced: PartItem[];
    totalCost: number;
    technician: string;
    technicianPhone: string;
    notes: string;
    stationStatusAfter: StationStatus;
  }) => MaintenanceRecord;
}

export const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      tickets: initialTickets,
      maintenanceRecords: initialMaintenance,

      getTicketById: (id) => get().tickets.find((t) => t.id === id),

      getTicketsByStatus: (status) =>
        status === "all"
          ? get().tickets
          : get().tickets.filter((t) => t.status === status),

      getTicketsByStation: (stationId) =>
        get().tickets.filter((t) => t.stationId === stationId),

      getPendingCount: () =>
        get().tickets.filter((t) => t.status === "pending").length,

      getOpenTickets: () =>
        get().tickets.filter(
          (t) =>
            t.status === "pending" ||
            t.status === "processing" ||
            t.status === "maintenance"
        ),

      getMaintenanceByStation: (stationId) =>
        get()
          .maintenanceRecords.filter((m) => m.stationId === stationId)
          .sort(
            (a, b) =>
              new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          ),

      submitRepair: (data) => {
        const now = new Date();
        const newTicket: RepairTicket = {
          id: generateId("ticket"),
          ticketNo: generateTicketNo(),
          ...data,
          status: "pending",
          createdAt: now.toISOString(),
          assignee: null,
          assignedAt: null,
          completedAt: null,
          resolution: null,
          timeline: [
            {
              time: now.toISOString(),
              action: "提交报修",
              operator: data.reporterName,
            },
          ],
        };
        set((state) => ({
          tickets: [newTicket, ...state.tickets],
        }));
        return newTicket;
      },

      assignTicket: (ticketId, assignee) => {
        const now = new Date();
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            return {
              ...t,
              status: "processing",
              assignee,
              assignedAt: now.toISOString(),
              timeline: [
                ...t.timeline,
                {
                  time: now.toISOString(),
                  action: "受理派单",
                  operator: "物业管理员",
                  note: `指派给${assignee}处理`,
                },
              ],
            };
          }),
        }));
      },

      updateTicketStatus: (ticketId, status, note) => {
        const now = new Date();
        const actionMap: Record<RepairStatus, string> = {
          pending: "重置为待处理",
          processing: "开始处理",
          maintenance: "进入维修阶段",
          completed: "完成处理",
          cancelled: "取消工单",
        };
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            return {
              ...t,
              status,
              timeline: [
                ...t.timeline,
                {
                  time: now.toISOString(),
                  action: actionMap[status],
                  operator: t.assignee || "物业管理员",
                  note,
                },
              ],
            };
          }),
        }));
      },

      completeTicket: (ticketId, resolution) => {
        const now = new Date();
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            return {
              ...t,
              status: "completed",
              completedAt: now.toISOString(),
              resolution,
              timeline: [
                ...t.timeline,
                {
                  time: now.toISOString(),
                  action: "维修完成",
                  operator: t.assignee || "维修人员",
                  note: resolution,
                },
              ],
            };
          }),
        }));
      },

      createMaintenance: (data) => {
        const now = new Date();
        const newRecord: MaintenanceRecord = {
          id: generateId("maint"),
          startedAt: now.toISOString(),
          completedAt: now.toISOString(),
          beforePhotos: [],
          afterPhotos: [],
          ...data,
        };
        set((state) => ({
          maintenanceRecords: [newRecord, ...state.maintenanceRecords],
        }));
        if (data.repairTicketId) {
          get().completeTicket(data.repairTicketId, data.notes);
        }
        return newRecord;
      },
    }),
    {
      name: "repair-data",
      partialize: (state) => ({
        tickets: state.tickets,
        maintenanceRecords: state.maintenanceRecords,
      }),
    }
  )
);
