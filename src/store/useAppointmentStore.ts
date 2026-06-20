import { create } from "zustand";
import type {
  Appointment,
  AppointmentStatus,
  ServiceType,
} from "../types/appointment";
import { mockAppointments } from "../data/appointments";
import { generateId } from "../utils/date";
import { getFromStorage, saveToStorage } from "../utils/storage";

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  getAppointment: (id: string) => Appointment | undefined;
  getAppointmentsByElder: (elderId: string) => Appointment[];
  getAppointmentsByStatus: (status: AppointmentStatus) => Appointment[];
  getTodayAppointments: () => Appointment[];
  getPendingAppointments: () => Appointment[];
  getSpecialNeedsAppointments: () => Appointment[];
  getOverdueAppointments: () => Appointment[];
  getRecallReminders: () => Appointment[];
  addAppointment: (
    apt: Partial<Omit<Appointment, "id" | "createdAt" | "updatedAt">> & {
      elderId: string;
      barberId: string;
      scheduledTime: string;
      serviceType: ServiceType;
      status?: AppointmentStatus;
    }
  ) => void;
  updateAppointment: (id: string, apt: Partial<Appointment>) => void;
  updateStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  loadAppointments: () => void;
}

const STORAGE_KEY = "elderly-haircut-appointments";

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: true,

  loadAppointments: () => {
    const stored = getFromStorage<Appointment[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      set({ appointments: stored, loading: false });
    } else {
      set({ appointments: mockAppointments, loading: false });
      saveToStorage(STORAGE_KEY, mockAppointments);
    }
  },

  getAppointment: (id) => {
    return get().appointments.find((a) => a.id === id);
  },

  getAppointmentsByElder: (elderId) => {
    return get()
      .appointments.filter((a) => a.elderId === elderId)
      .sort(
        (a, b) =>
          new Date(b.scheduledTime).getTime() -
          new Date(a.scheduledTime).getTime()
      );
  },

  getAppointmentsByStatus: (status) => {
    return get()
      .appointments.filter((a) => a.status === status)
      .sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      );
  },

  getTodayAppointments: () => {
    const today = new Date().toDateString();
    return get().appointments.filter((a) => {
      const aptDate = new Date(a.scheduledTime).toDateString();
      return aptDate === today && a.status !== "cancelled" && a.status !== "completed";
    });
  },

  getPendingAppointments: () => {
    return get().appointments.filter((a) => a.status === "pending");
  },

  getSpecialNeedsAppointments: () => {
    return get().appointments.filter(
      (a) =>
        a.needsWheelchair ||
        a.status === "pending" && a.notes.length > 0
    );
  },

  getOverdueAppointments: () => {
    const now = new Date();
    return get().appointments.filter((a) => {
      if (a.status === "completed" || a.status === "cancelled") return false;
      const scheduled = new Date(a.scheduledTime);
      const diffMs = now.getTime() - scheduled.getTime();
      const diffMins = diffMs / (1000 * 60);
      return diffMins > 30;
    });
  },

  getRecallReminders: () => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completed = get()
      .appointments.filter((a) => {
        if (a.status !== "completed") return false;
        const completedDate = new Date(a.scheduledTime);
        const nextSuggested = a.nextSuggestedTime
          ? new Date(a.nextSuggestedTime)
          : null;
        if (nextSuggested && nextSuggested <= now) return true;
        return completedDate <= thirtyDaysAgo;
      })
      .sort(
        (a, b) =>
          new Date(b.scheduledTime).getTime() -
          new Date(a.scheduledTime).getTime()
      );

    const seen = new Set<string>();
    return completed.filter((apt) => {
      if (seen.has(apt.elderId)) return false;
      seen.add(apt.elderId);
      return true;
    });
  },

  addAppointment: (aptData) => {
    const now = new Date().toISOString();
    const newApt: Appointment = {
      ...aptData,
      id: generateId(),
      status: aptData.status || "pending",
      createdAt: now,
      updatedAt: now,
      toolsChecked: aptData.toolsChecked || false,
      capeChecked: aptData.capeChecked || false,
      disinfectionChecked: aptData.disinfectionChecked || false,
      paymentMethod: aptData.paymentMethod || null,
      hairstylePhoto: aptData.hairstylePhoto || "",
      fee: aptData.fee || 0,
      satisfaction: aptData.satisfaction || 0,
      nextSuggestedTime: aptData.nextSuggestedTime || "",
      needsShampoo: aptData.needsShampoo || false,
      needsWheelchair: aptData.needsWheelchair || false,
      needsCompanion: aptData.needsCompanion || false,
      notes: aptData.notes || "",
      serviceType: aptData.serviceType as ServiceType,
    };
    const newAppointments = [...get().appointments, newApt];
    set({ appointments: newAppointments });
    saveToStorage(STORAGE_KEY, newAppointments);
  },

  updateAppointment: (id, aptData) => {
    const now = new Date().toISOString();
    const newAppointments = get().appointments.map((a) =>
      a.id === id ? { ...a, ...aptData, updatedAt: now } : a
    );
    set({ appointments: newAppointments });
    saveToStorage(STORAGE_KEY, newAppointments);
  },

  updateStatus: (id, status) => {
    get().updateAppointment(id, { status });
  },

  deleteAppointment: (id) => {
    const newAppointments = get().appointments.filter((a) => a.id !== id);
    set({ appointments: newAppointments });
    saveToStorage(STORAGE_KEY, newAppointments);
  },
}));
