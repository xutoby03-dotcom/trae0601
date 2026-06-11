import { create } from 'zustand';
import type { Appointment, AppointmentStatus, EventStats, TimeSlotStats, DailyStats } from '@/types';
import { generateId } from '@/utils/time';
import { getFromStorage, setToStorage } from '@/utils/storage';
import { mockAppointments } from '@/data/mockData';

interface AppointmentState {
  appointments: Appointment[];
  
  initAppointments: () => void;
  getAppointmentsByEvent: (eventId: string) => Appointment[];
  getAppointmentsByStatus: (eventId: string, status: AppointmentStatus) => Appointment[];
  
  createAppointment: (data: {
    eventId: string;
    slotId: string | null;
    elderName: string;
    age: number;
    phone: string;
    mobilityIssue: boolean;
    preferredTime: string;
  }) => Appointment;
  
  checkIn: (appointmentId: string) => void;
  startService: (appointmentId: string) => void;
  completeService: (appointmentId: string) => void;
  markNoShow: (appointmentId: string) => void;
  postpone: (appointmentId: string) => void;
  cancelAppointment: (appointmentId: string) => void;
  
  getEventStats: (eventId: string) => EventStats;
  getTimeSlotStats: (eventId: string) => TimeSlotStats[];
  getDailyStats: (days: number) => DailyStats[];
  
  callNext: (eventId: string) => Appointment | null;
  getServingAppointments: (eventId: string) => Appointment[];
  getNextInQueue: (eventId: string) => Appointment | null;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],

  initAppointments: () => {
    const stored = getFromStorage<Appointment[]>('appointments', []);
    if (stored.length === 0) {
      set({ appointments: mockAppointments });
      setToStorage('appointments', mockAppointments);
    } else {
      set({ appointments: stored });
    }
  },

  getAppointmentsByEvent: (eventId: string) => {
    return get().appointments.filter(a => a.eventId === eventId);
  },

  getAppointmentsByStatus: (eventId: string, status: AppointmentStatus) => {
    return get().appointments
      .filter(a => a.eventId === eventId && a.status === status)
      .sort((a, b) => {
        if (a.queueNumber !== null && b.queueNumber !== null) {
          return a.queueNumber - b.queueNumber;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  },

  createAppointment: (data) => {
    const eventAppointments = get().getAppointmentsByEvent(data.eventId);
    const maxQueueNum = eventAppointments.reduce((max, a) => 
      a.queueNumber !== null && a.queueNumber > max ? a.queueNumber : max, 0
    );

    const newAppointment: Appointment = {
      ...data,
      id: generateId(),
      status: data.slotId ? 'booked' : 'waitlist',
      queueNumber: null,
      postponeCount: 0,
      checkInTime: null,
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString(),
    };

    const newAppointments = [...get().appointments, newAppointment];
    set({ appointments: newAppointments });
    setToStorage('appointments', newAppointments);

    return newAppointment;
  },

  checkIn: (appointmentId: string) => {
    const appts = get().appointments;
    const appt = appts.find(a => a.id === appointmentId);
    if (!appt) return;

    const eventAppts = appts.filter(a => a.eventId === appt.eventId);
    const checkedInAppts = eventAppts.filter(a => a.queueNumber !== null);
    const maxQueueNum = checkedInAppts.reduce((max, a) => 
      a.queueNumber !== null && a.queueNumber > max ? a.queueNumber : max, 0
    );

    const newQueueNumber = maxQueueNum + 1;

    const updated = appts.map(a =>
      a.id === appointmentId
        ? { ...a, status: 'checked-in' as AppointmentStatus, queueNumber: newQueueNumber, checkInTime: new Date().toISOString() }
        : a
    );

    set({ appointments: updated });
    setToStorage('appointments', updated);
  },

  startService: (appointmentId: string) => {
    const updated = get().appointments.map(a =>
      a.id === appointmentId
        ? { ...a, status: 'serving' as AppointmentStatus, startTime: new Date().toISOString() }
        : a
    );
    set({ appointments: updated });
    setToStorage('appointments', updated);
  },

  completeService: (appointmentId: string) => {
    const updated = get().appointments.map(a =>
      a.id === appointmentId
        ? { ...a, status: 'completed' as AppointmentStatus, endTime: new Date().toISOString() }
        : a
    );
    set({ appointments: updated });
    setToStorage('appointments', updated);
  },

  markNoShow: (appointmentId: string) => {
    const updated = get().appointments.map(a =>
      a.id === appointmentId
        ? { ...a, status: 'no-show' as AppointmentStatus }
        : a
    );
    set({ appointments: updated });
    setToStorage('appointments', updated);
  },

  postpone: (appointmentId: string) => {
    const appts = get().appointments;
    const appt = appts.find(a => a.id === appointmentId);
    if (!appt) return;

    const newPostponeCount = appt.postponeCount + 1;
    
    if (newPostponeCount >= 3) {
      const updated = appts.map(a =>
        a.id === appointmentId
          ? { ...a, status: 'no-show' as AppointmentStatus, postponeCount: newPostponeCount }
          : a
      );
      set({ appointments: updated });
      setToStorage('appointments', updated);
      return;
    }

    const checkedInAppts = appts.filter(
      a => a.eventId === appt.eventId && a.status === 'checked-in' && a.queueNumber !== null
    );
    const maxQueueNum = checkedInAppts.reduce((max, a) => 
      a.queueNumber !== null && a.queueNumber > max ? a.queueNumber : max, 0
    );

    const updated = appts.map(a =>
      a.id === appointmentId
        ? { 
            ...a, 
            status: 'checked-in' as AppointmentStatus, 
            queueNumber: maxQueueNum + 1,
            postponeCount: newPostponeCount 
          }
        : a
    );

    set({ appointments: updated });
    setToStorage('appointments', updated);
  },

  cancelAppointment: (appointmentId: string) => {
    const appts = get().appointments.filter(a => a.id !== appointmentId);
    set({ appointments: appts });
    setToStorage('appointments', appts);
  },

  getEventStats: (eventId: string) => {
    const eventAppts = get().getAppointmentsByEvent(eventId);
    
    const total = eventAppts.length;
    const checkedIn = eventAppts.filter(a => a.status === 'checked-in').length;
    const serving = eventAppts.filter(a => a.status === 'serving').length;
    const completed = eventAppts.filter(a => a.status === 'completed').length;
    const noShow = eventAppts.filter(a => a.status === 'no-show').length;
    const waitlist = eventAppts.filter(a => a.status === 'waitlist').length;
    
    const attended = completed + serving;
    const totalWithNoShow = attended + noShow;
    const noShowRate = totalWithNoShow > 0 ? (noShow / totalWithNoShow) * 100 : 0;

    return {
      totalAppointments: total,
      checkedInCount: checkedIn,
      completedCount: completed,
      noShowCount: noShow,
      waitlistCount: waitlist,
      noShowRate: Math.round(noShowRate * 10) / 10,
      servingCount: serving,
    };
  },

  getTimeSlotStats: (eventId: string) => {
    const eventAppts = get().getAppointmentsByEvent(eventId);
    const slotMap = new Map<string, number>();

    eventAppts.forEach(appt => {
      if (appt.preferredTime) {
        slotMap.set(appt.preferredTime, (slotMap.get(appt.preferredTime) || 0) + 1);
      }
    });

    return Array.from(slotMap.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  getDailyStats: (days: number) => {
    const result: DailyStats[] = [];
    const allAppts = get().appointments;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAppts = allAppts.filter(a => {
        const apptDate = new Date(a.createdAt).toISOString().split('T')[0];
        return apptDate === dateStr;
      });

      result.push({
        date: dateStr,
        total: dayAppts.length,
        completed: dayAppts.filter(a => a.status === 'completed').length,
        noShow: dayAppts.filter(a => a.status === 'no-show').length,
      });
    }

    return result;
  },

  callNext: (eventId: string) => {
    const checkedIn = get().getAppointmentsByStatus(eventId, 'checked-in');
    if (checkedIn.length === 0) return null;

    const next = checkedIn.sort((a, b) => 
      (a.queueNumber || 0) - (b.queueNumber || 0)
    )[0];
    
    get().startService(next.id);
    return next;
  },

  getServingAppointments: (eventId: string) => {
    return get().getAppointmentsByStatus(eventId, 'serving');
  },

  getNextInQueue: (eventId: string) => {
    const checkedIn = get().getAppointmentsByStatus(eventId, 'checked-in');
    if (checkedIn.length === 0) return null;
    
    return checkedIn.sort((a, b) => 
      (a.queueNumber || 0) - (b.queueNumber || 0)
    )[0];
  },
}));
