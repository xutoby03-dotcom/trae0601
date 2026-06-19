import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Student, ClothingItem, Distribution, ProcessRecord, DashboardStats, VoicePart, ClothingCategory } from "@/types";
import { mockStudents, mockClothingItems, mockDistributions, mockProcessRecords } from "@/utils/mockData";
import { generateId } from "@/utils/formatters";

interface AppState {
  students: Student[];
  clothingItems: ClothingItem[];
  distributions: Distribution[];
  processRecords: ProcessRecord[];

  addStudent: (data: Omit<Student, "id" | "createdAt">) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudent: (id: string) => Student | undefined;

  addClothingItem: (data: Omit<ClothingItem, "id" | "updatedAt">) => void;
  updateClothingItem: (id: string, data: Partial<ClothingItem>) => void;
  deleteClothingItem: (id: string) => void;

  addDistribution: (data: Omit<Distribution, "id" | "distributedAt">) => void;
  markReturned: (distributionId: string) => void;

  addProcessRecord: (data: Omit<ProcessRecord, "id" | "createdAt">) => void;
  updateProcessRecord: (id: string, data: Partial<ProcessRecord>) => void;

  getDashboardStats: () => DashboardStats;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: mockStudents,
      clothingItems: mockClothingItems,
      distributions: mockDistributions,
      processRecords: mockProcessRecords,

      addStudent: (data) => {
        const student: Student = { ...data, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ students: [...s.students, student] }));
      },
      updateStudent: (id, data) => {
        set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, ...data } : st)) }));
      },
      deleteStudent: (id) => {
        set((s) => ({ students: s.students.filter((st) => st.id !== id) }));
      },
      getStudent: (id) => get().students.find((s) => s.id === id),

      addClothingItem: (data) => {
        const item: ClothingItem = { ...data, id: generateId(), updatedAt: new Date().toISOString() };
        set((s) => ({ clothingItems: [...s.clothingItems, item] }));
      },
      updateClothingItem: (id, data) => {
        set((s) => ({
          clothingItems: s.clothingItems.map((it) =>
            it.id === id ? { ...it, ...data, updatedAt: new Date().toISOString() } : it
          ),
        }));
      },
      deleteClothingItem: (id) => {
        set((s) => ({ clothingItems: s.clothingItems.filter((it) => it.id !== id) }));
      },

      addDistribution: (data) => {
        const dist: Distribution = { ...data, id: generateId(), distributedAt: new Date().toISOString() };
        set((s) => ({ distributions: [...s.distributions, dist] }));
      },
      markReturned: (distributionId) => {
        set((s) => ({
          distributions: s.distributions.map((d) => (d.id === distributionId ? { ...d, isReturned: true } : d)),
        }));
      },

      addProcessRecord: (data) => {
        const record: ProcessRecord = { ...data, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ processRecords: [...s.processRecords, record] }));
      },
      updateProcessRecord: (id, data) => {
        set((s) => ({
          processRecords: s.processRecords.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },

      getDashboardStats: () => {
        const { students, clothingItems, distributions, processRecords } = get();

        const totalStudents = students.length;
        const distributedStudentIds = new Set(distributions.map((d) => d.studentId));
        const distributedCount = distributedStudentIds.size;

        const pendingAlter = processRecords.filter((r) => r.type === "改衣" && r.status !== "已完成").length;
        const notReturned = distributions.filter((d) => !d.isReturned).length;

        const voiceParts: VoicePart[] = ["女高音", "女低音", "男高音", "男低音", "童声"];
        const voicePartProgress = voiceParts.map((part) => {
          const partStudents = students.filter((s) => s.voicePart === part);
          const partDistributed = partStudents.filter((s) => distributedStudentIds.has(s.id));
          return {
            part,
            total: partStudents.length,
            distributed: partDistributed.length,
            percent: partStudents.length > 0 ? Math.round((partDistributed.length / partStudents.length) * 100) : 0,
          };
        }).filter((p) => p.total > 0);

        const categories: ClothingCategory[] = ["上衣", "裙裤", "鞋子", "领结", "发饰"];
        const sizeShortage: { category: ClothingCategory; size: string; needed: number; available: number }[] = [];

        categories.forEach((cat) => {
          const catItems = clothingItems.filter((i) => i.category === cat);
          const sizeMap = new Map<string, { needed: number; available: number }>();

          catItems.forEach((item) => {
            const existing = sizeMap.get(item.size) || { needed: 0, available: 0 };
            sizeMap.set(item.size, { ...existing, available: existing.available + (item.status === "完好" ? item.quantity : 0) });
          });

          students.forEach((stu) => {
            let size: string;
            if (cat === "鞋子") size = String(stu.shoeSize);
            else if (cat === "领结" || cat === "发饰") size = "均码";
            else {
              const h = stu.height;
              const bmi = stu.weight / ((stu.height / 100) ** 2);
              if (h < 150) size = bmi < 24 ? "S" : "M";
              else if (h < 160) size = bmi < 24 ? "S" : "M";
              else if (h < 170) size = bmi < 24 ? "M" : "L";
              else if (h < 180) size = bmi < 24 ? "L" : "XL";
              else size = bmi < 24 ? "XL" : "XXL";
            }
            const existing = sizeMap.get(size) || { needed: 0, available: 0 };
            sizeMap.set(size, { ...existing, needed: existing.needed + 1 });
          });

          sizeMap.forEach((v, k) => {
            if (v.needed > v.available) {
              sizeShortage.push({ category: cat, size: k, needed: v.needed, available: v.available });
            }
          });
        });

        const pendingStudents = students.filter((s) => !distributedStudentIds.has(s.id)).slice(0, 8);
        const pendingRecords = processRecords.filter((r) => r.status !== "已完成").sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : -1
        ).slice(0, 8);

        return {
          totalStudents,
          distributedCount,
          pendingAlter,
          notReturned,
          voicePartProgress,
          sizeShortage,
          pendingStudents,
          pendingRecords,
        };
      },
    }),
    { name: "choir-wardrobe-storage" }
  )
);
