import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyMenu, MenuItem, MealType, Student } from '@/types';
import { mockMenuItems, generateWeekMenus } from '@/utils/mockData';
import { todayStr } from '@/utils/dateUtils';

interface ReplacementResult {
  studentId: string;
  studentName: string;
  className: string;
  originalDish: string;
  replacementDish: string;
  allergies: string[];
}

interface MenuStore {
  menuItems: MenuItem[];
  dailyMenus: DailyMenu[];
  currentDate: string;
  setCurrentDate: (date: string) => void;
  getCurrentMenu: () => DailyMenu | undefined;
  getMenuByDate: (date: string) => DailyMenu | undefined;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  saveDailyMenu: (menu: DailyMenu) => void;
  calculateReplacements: (date: string, mealType: MealType, students: Student[]) => ReplacementResult[];
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      menuItems: mockMenuItems,
      dailyMenus: generateWeekMenus(),
      currentDate: todayStr(),

      setCurrentDate: (date) => set({ currentDate: date }),

      getCurrentMenu: () => get().getMenuByDate(get().currentDate),

      getMenuByDate: (date) => get().dailyMenus.find((m) => m.date === date),

      addMenuItem: (item) =>
        set((state) => ({
          menuItems: [...state.menuItems, { ...item, id: `dish-${Date.now()}` }],
        })),

      updateMenuItem: (id, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((m) => m.id !== id),
        })),

      saveDailyMenu: (menu) =>
        set((state) => {
          const existing = state.dailyMenus.find((m) => m.date === menu.date);
          if (existing) {
            return {
              dailyMenus: state.dailyMenus.map((m) =>
                m.date === menu.date ? menu : m
              ),
            };
          }
          return { dailyMenus: [...state.dailyMenus, menu] };
        }),

      calculateReplacements: (date, mealType, students) => {
        const menu = get().getMenuByDate(date);
        if (!menu) return [];
        const dishes = menu[mealType];
        const results: ReplacementResult[] = [];

        students.forEach((student) => {
          const studentAllergies = student.allergies.map((a) => a.type);
          dishes.forEach((dish) => {
            const hasConflict = dish.allergies.some((a) => studentAllergies.includes(a));
            if (hasConflict && dish.replacementId) {
              const replacement = get().menuItems.find((m) => m.id === dish.replacementId);
              if (replacement) {
                results.push({
                  studentId: student.id,
                  studentName: student.name,
                  className: student.className,
                  originalDish: dish.name,
                  replacementDish: replacement.name,
                  allergies: dish.allergies.filter((a) => studentAllergies.includes(a)),
                });
              }
            }
          });
        });

        return results;
      },
    }),
    {
      name: 'allergy-menu-store',
    }
  )
);
