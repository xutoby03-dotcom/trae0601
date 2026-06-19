import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Employee, Department, PickupPoint } from "@/types";
import { generateMockEmployees } from "@/utils/mockData";
import { uid, formatDate } from "@/utils/formatters";
import { pickColor } from "@/utils/colors";

interface EmployeeStore {
  employees: Employee[];
  initialized: boolean;
  initMockData: () => void;
  addEmployee: (
    data: Omit<Employee, "id" | "createdAt" | "avatarColor">
  ) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getByDepartment: (department: Department | "all") => Employee[];
  getByPickupPoint: (point: PickupPoint | "all") => Employee[];
  searchByName: (keyword: string) => Employee[];
  getLeaders: () => Employee[];
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [],
      initialized: false,

      initMockData: () => {
        if (get().initialized && get().employees.length > 0) return;
        const emps = generateMockEmployees();
        set({ employees: emps, initialized: true });
      },

      addEmployee: (data) => {
        const emp: Employee = {
          ...data,
          id: uid(),
          avatarColor: pickColor(data.name),
          createdAt: formatDate(new Date()),
        };
        set((s) => ({ employees: [emp, ...s.employees] }));
      },

      updateEmployee: (id, data) => {
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...data,
                  avatarColor:
                    data.name !== undefined ? pickColor(data.name) : e.avatarColor,
                }
              : e
          ),
        }));
      },

      deleteEmployee: (id) => {
        set((s) => ({
          employees: s.employees.filter((e) => e.id !== id),
        }));
      },

      getEmployeeById: (id) => get().employees.find((e) => e.id === id),

      getByDepartment: (department) => {
        if (department === "all") return get().employees;
        return get().employees.filter((e) => e.department === department);
      },

      getByPickupPoint: (point) => {
        if (point === "all") return get().employees;
        return get().employees.filter((e) => e.pickupPoint === point);
      },

      searchByName: (keyword) => {
        if (!keyword.trim()) return get().employees;
        const kw = keyword.trim().toLowerCase();
        return get().employees.filter(
          (e) =>
            e.name.toLowerCase().includes(kw) ||
            e.phoneLast4.includes(kw)
        );
      },

      getLeaders: () =>
        get().employees.filter((e) => e.role === "leader" || e.role === "admin"),
    }),
    { name: "lunch-employees" }
  )
);
