import { create } from 'zustand';
import type { CourseSchedule, MaintenanceWindow } from '../types';
import { todaySchedule } from '../data/mockData';
import { calculateMaintenanceWindows } from '../utils/windowCalculator';

interface ScheduleState {
  schedule: CourseSchedule;
  windows: MaintenanceWindow[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  refreshWindows: () => void;
}

export const useScheduleStore = create<ScheduleState>((set) => {
  const windows = calculateMaintenanceWindows(todaySchedule.slots);

  return {
    schedule: todaySchedule,
    windows,
    selectedDate: todaySchedule.date,

    setSelectedDate: (date) => {
      set({ selectedDate: date });
    },

    refreshWindows: () => {
      set((state) => ({
        windows: calculateMaintenanceWindows(state.schedule.slots),
      }));
    },
  };
});
