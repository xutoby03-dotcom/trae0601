import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Pet,
  FosterTask,
  DailyCheckIn,
  CheckInItem,
  CheckInPhoto,
  TaskStatus,
  ReviewReport,
  CheckInItemType,
} from '@/types';
import { generateId } from '@/utils';

interface AppState {
  pets: Pet[];
  tasks: FosterTask[];
  checkins: DailyCheckIn[];
  checkinItems: CheckInItem[];
  checkinPhotos: CheckInPhoto[];

  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  getPetById: (id: string) => Pet | undefined;

  addTask: (task: Omit<FosterTask, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, task: Partial<FosterTask>) => void;
  getTaskById: (id: string) => FosterTask | undefined;
  getTasksByPetId: (petId: string) => FosterTask[];
  getTaskStatus: (task: FosterTask) => TaskStatus;

  addCheckIn: (checkin: Omit<DailyCheckIn, 'id' | 'createdAt'>) => DailyCheckIn;
  addCheckInItem: (item: Omit<CheckInItem, 'id'>) => void;
  updateCheckInItem: (id: string, data: Partial<CheckInItem>) => void;
  addPhoto: (photo: Omit<CheckInPhoto, 'id' | 'uploadedAt'>) => void;
  getCheckInsByTaskId: (taskId: string) => DailyCheckIn[];
  getCheckInById: (id: string) => DailyCheckIn | undefined;
  getCheckInItemsByCheckInId: (checkinId: string) => CheckInItem[];
  getPhotosByCheckInId: (checkinId: string) => CheckInPhoto[];
  getTodayCheckIn: (taskId: string) => DailyCheckIn | null;
  getMissedItems: (taskId: string, date: string) => CheckInItem[];

  generateReviewReport: (taskId: string) => ReviewReport;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      pets: [],
      tasks: [],
      checkins: [],
      checkinItems: [],
      checkinPhotos: [],

      addPet: (pet) => {
        const newPet: Pet = {
          ...pet,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ pets: [...state.pets, newPet] }));
      },

      updatePet: (id, pet) => {
        set((state) => ({
          pets: state.pets.map((p) => (p.id === id ? { ...p, ...pet } : p)),
        }));
      },

      deletePet: (id) => {
        set((state) => ({
          pets: state.pets.filter((p) => p.id !== id),
        }));
      },

      getPetById: (id) => {
        return get().pets.find((p) => p.id === id);
      },

      addTask: (task) => {
        const newTask: FosterTask = {
          ...task,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, task) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
        }));
      },

      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      getTasksByPetId: (petId) => {
        return get().tasks.filter((t) => t.petId === petId);
      },

      getTaskStatus: (task) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        endDate.setHours(23, 59, 59, 999);

        if (today < startDate) return 'pending';
        if (today > endDate) return 'completed';
        return 'active';
      },

      addCheckIn: (checkin) => {
        const newCheckIn: DailyCheckIn = {
          ...checkin,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ checkins: [...state.checkins, newCheckIn] }));
        return newCheckIn;
      },

      addCheckInItem: (item) => {
        const newItem: CheckInItem = {
          ...item,
          id: generateId(),
        };
        set((state) => ({ checkinItems: [...state.checkinItems, newItem] }));
      },

      updateCheckInItem: (id, data) => {
        set((state) => ({
          checkinItems: state.checkinItems.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      },

      addPhoto: (photo) => {
        const newPhoto: CheckInPhoto = {
          ...photo,
          id: generateId(),
          uploadedAt: new Date().toISOString(),
        };
        set((state) => ({ checkinPhotos: [...state.checkinPhotos, newPhoto] }));
      },

      getCheckInsByTaskId: (taskId) => {
        return get()
          .checkins.filter((c) => c.taskId === taskId)
          .sort(
            (a, b) =>
              new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
          );
      },

      getCheckInById: (id) => {
        return get().checkins.find((c) => c.id === id);
      },

      getCheckInItemsByCheckInId: (checkinId) => {
        return get().checkinItems.filter((item) => item.checkinId === checkinId);
      },

      getPhotosByCheckInId: (checkinId) => {
        return get()
          .checkinPhotos.filter((p) => p.checkinId === checkinId)
          .sort(
            (a, b) =>
              new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
      },

      getTodayCheckIn: (taskId) => {
        const today = new Date().toISOString().split('T')[0];
        const checkins = get().checkins.filter(
          (c) => c.taskId === taskId && c.checkinDate === today
        );
        return checkins.length > 0 ? checkins[0] : null;
      },

      getMissedItems: (taskId, date) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return [];

        const checkins = state.checkins.filter(
          (c) => c.taskId === taskId && c.checkinDate === date
        );
        if (checkins.length === 0) return [];

        return state.checkinItems.filter(
          (item) =>
            checkins.some((c) => c.id === item.checkinId) && !item.completed
        );
      },

      generateReviewReport: (taskId) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) {
          return {
            taskId,
            totalDays: 0,
            completedCheckins: 0,
            missedFeedings: 0,
            missedMedications: 0,
            anomalyRecords: [],
            remainingFoodAmount: 0,
            initialFoodAmount: 0,
            consumedFoodAmount: 0,
            suppliesToBuy: [],
            checkinPhotos: [],
          };
        }

        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const totalDays =
          Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) +
          1;

        const checkins = state.getCheckInsByTaskId(taskId);
        const completedCheckins = checkins.length;

        const allCheckinItems: CheckInItem[] = [];
        checkins.forEach((c) => {
          allCheckinItems.push(...state.getCheckInItemsByCheckInId(c.id));
        });

        const missedFeedings = allCheckinItems.filter(
          (item) => item.type === 'feeding' && !item.completed
        ).length;

        const missedMedications = allCheckinItems.filter(
          (item) => item.type === 'medication' && !item.completed
        ).length;

        const anomalyRecords = checkins.filter((c) => c.hasAnomaly);

        const latestCheckin = checkins[0];
        const remainingFoodAmount = latestCheckin
          ? latestCheckin.remainingFoodAmount
          : task.initialFoodAmount;
        const consumedFoodAmount = task.initialFoodAmount - remainingFoodAmount;

        const suppliesToBuy: string[] = [];
        const pet = state.pets.find((p) => p.id === task.petId);
        if (remainingFoodAmount < task.initialFoodAmount * 0.2) {
          suppliesToBuy.push(`${pet?.foodBrand || '宠物粮'} - 剩余不足20%`);
        }
        if (missedMedications > 0) {
          suppliesToBuy.push('常用药品 - 请检查备药量是否充足');
        }
        if (anomalyRecords.length > 0) {
          suppliesToBuy.push('宠物健康检查 - 建议进行体检');
        }

        const allPhotos: CheckInPhoto[] = [];
        checkins.forEach((c) => {
          allPhotos.push(...state.getPhotosByCheckInId(c.id));
        });

        return {
          taskId,
          totalDays,
          completedCheckins,
          missedFeedings,
          missedMedications,
          anomalyRecords,
          remainingFoodAmount,
          initialFoodAmount: task.initialFoodAmount,
          consumedFoodAmount,
          suppliesToBuy,
          checkinPhotos: allPhotos,
        };
      },
    }),
    {
      name: 'pet-foster-storage',
    }
  )
);

export const generateCheckInItems = (
  task: FosterTask,
  checkinId: string
): Omit<CheckInItem, 'id'>[] => {
  const items: Omit<CheckInItem, 'id'>[] = [];
  const feedingTimes = task.feedingTimesPerDay || 2;

  const feedingSchedules = ['08:00', '12:00', '18:00', '21:00'];
  for (let i = 0; i < Math.min(feedingTimes, 4); i++) {
    items.push({
      checkinId,
      type: 'feeding' as CheckInItemType,
      label: `第${i + 1}餐喂食`,
      completed: false,
      scheduledTime: feedingSchedules[i] || '12:00',
    });
  }

  if (task.medicationInstructions) {
    items.push({
      checkinId,
      type: 'medication' as CheckInItemType,
      label: '喂药',
      completed: false,
      scheduledTime: '09:00',
    });
  }

  if (task.walkingRequirements) {
    items.push({
      checkinId,
      type: 'walking' as CheckInItemType,
      label: '遛弯',
      completed: false,
      scheduledTime: '19:00',
    });
  }

  return items;
};
