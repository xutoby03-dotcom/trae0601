import type { Student, ClothingItem, Distribution, ProcessRecord } from "@/types";

export const mockStudents: Student[] = [
  { id: "stu001", name: "张雨涵", className: "高二(3)班", height: 165, weight: 52, shoeSize: 37, voicePart: "女高音", needAlter: false, contact: "13800138001", createdAt: "2026-06-01T09:00:00Z" },
  { id: "stu002", name: "李思琪", className: "高二(3)班", height: 160, weight: 48, shoeSize: 36, voicePart: "女高音", needAlter: false, contact: "13800138002", createdAt: "2026-06-01T09:05:00Z" },
  { id: "stu003", name: "王美琳", className: "高二(5)班", height: 158, weight: 45, shoeSize: 35, voicePart: "女低音", needAlter: true, contact: "13800138003", createdAt: "2026-06-01T09:10:00Z" },
  { id: "stu004", name: "陈雨桐", className: "高二(5)班", height: 162, weight: 55, shoeSize: 37, voicePart: "女低音", needAlter: false, contact: "13800138004", createdAt: "2026-06-01T09:15:00Z" },
  { id: "stu005", name: "刘浩宇", className: "高二(1)班", height: 178, weight: 68, shoeSize: 42, voicePart: "男高音", needAlter: false, contact: "13800138005", createdAt: "2026-06-01T09:20:00Z" },
  { id: "stu006", name: "孙浩然", className: "高二(1)班", height: 175, weight: 65, shoeSize: 41, voicePart: "男高音", needAlter: true, contact: "13800138006", createdAt: "2026-06-01T09:25:00Z" },
  { id: "stu007", name: "周子轩", className: "高二(2)班", height: 182, weight: 75, shoeSize: 44, voicePart: "男低音", needAlter: false, contact: "13800138007", createdAt: "2026-06-01T09:30:00Z" },
  { id: "stu008", name: "吴天宇", className: "高二(2)班", height: 176, weight: 70, shoeSize: 43, voicePart: "男低音", needAlter: false, contact: "13800138008", createdAt: "2026-06-01T09:35:00Z" },
  { id: "stu009", name: "郑小雅", className: "高一(4)班", height: 155, weight: 42, shoeSize: 35, voicePart: "女高音", needAlter: false, contact: "13800138009", createdAt: "2026-06-01T09:40:00Z" },
  { id: "stu010", name: "何欣怡", className: "高一(4)班", height: 168, weight: 54, shoeSize: 38, voicePart: "女低音", needAlter: false, contact: "13800138010", createdAt: "2026-06-01T09:45:00Z" },
  { id: "stu011", name: "黄俊杰", className: "高一(6)班", height: 172, weight: 60, shoeSize: 40, voicePart: "男高音", needAlter: false, contact: "13800138011", createdAt: "2026-06-01T09:50:00Z" },
  { id: "stu012", name: "林涛", className: "高一(6)班", height: 170, weight: 63, shoeSize: 41, voicePart: "男低音", needAlter: true, contact: "13800138012", createdAt: "2026-06-01T09:55:00Z" },
];

export const mockClothingItems: ClothingItem[] = [
  { id: "c001", category: "上衣", size: "S", quantity: 5, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "A-001" },
  { id: "c002", category: "上衣", size: "M", quantity: 8, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "A-002" },
  { id: "c003", category: "上衣", size: "L", quantity: 6, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "A-003" },
  { id: "c004", category: "上衣", size: "XL", quantity: 3, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "A-004" },
  { id: "c005", category: "上衣", size: "XXL", quantity: 1, status: "待修", updatedAt: "2026-06-15T14:30:00Z", setNumber: "A-005" },
  { id: "c006", category: "裙裤", size: "S", quantity: 4, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "B-001" },
  { id: "c007", category: "裙裤", size: "M", quantity: 7, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "B-002" },
  { id: "c008", category: "裙裤", size: "L", quantity: 5, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "B-003" },
  { id: "c009", category: "裙裤", size: "XL", quantity: 2, status: "改衣中", updatedAt: "2026-06-16T09:00:00Z", setNumber: "B-004" },
  { id: "c010", category: "鞋子", size: "35", quantity: 3, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-001" },
  { id: "c011", category: "鞋子", size: "36", quantity: 4, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-002" },
  { id: "c012", category: "鞋子", size: "37", quantity: 5, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-003" },
  { id: "c013", category: "鞋子", size: "38", quantity: 2, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-004" },
  { id: "c014", category: "鞋子", size: "40", quantity: 3, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-005" },
  { id: "c015", category: "鞋子", size: "41", quantity: 4, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-006" },
  { id: "c016", category: "鞋子", size: "42", quantity: 2, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-007" },
  { id: "c017", category: "鞋子", size: "43", quantity: 1, status: "遗失", updatedAt: "2026-06-14T16:00:00Z", setNumber: "C-008" },
  { id: "c018", category: "鞋子", size: "44", quantity: 2, status: "完好", updatedAt: "2026-06-10T10:00:00Z", setNumber: "C-009" },
  { id: "c019", category: "领结", size: "均码", quantity: 20, status: "完好", updatedAt: "2026-06-10T10:00:00Z" },
  { id: "c020", category: "发饰", size: "均码", quantity: 15, status: "完好", updatedAt: "2026-06-10T10:00:00Z" },
];

export const mockDistributions: Distribution[] = [
  { id: "d001", studentId: "stu001", clothingIds: ["c002", "c007", "c012", "c019"], setNumber: "SET-001", isFit: true, distributedAt: "2026-06-15T10:30:00Z", distributedBy: "李老师", isReturned: false },
  { id: "d002", studentId: "stu002", clothingIds: ["c001", "c006", "c011", "c019"], setNumber: "SET-002", isFit: true, distributedAt: "2026-06-15T10:45:00Z", distributedBy: "李老师", isReturned: false },
  { id: "d003", studentId: "stu005", clothingIds: ["c004", "c008", "c016", "c019"], setNumber: "SET-003", isFit: true, distributedAt: "2026-06-15T11:00:00Z", distributedBy: "李老师", isReturned: false },
  { id: "d004", studentId: "stu007", clothingIds: ["c004", "c008", "c018", "c019"], setNumber: "SET-004", isFit: false, distributedAt: "2026-06-15T11:20:00Z", distributedBy: "李老师", isReturned: false },
];

export const mockProcessRecords: ProcessRecord[] = [
  { id: "r001", type: "改衣", studentId: "stu003", clothingId: "c006", description: "裤长需改短3cm", status: "处理中", createdAt: "2026-06-15T14:00:00Z", operator: "李老师" },
  { id: "r002", type: "换码", studentId: "stu007", clothingId: "c004", description: "上衣偏小，申请换XXL", status: "待处理", createdAt: "2026-06-15T15:30:00Z", operator: "李老师" },
  { id: "r003", type: "遗失", studentId: "", description: "43码皮鞋一双遗失，编号C-008", status: "已完成", createdAt: "2026-06-14T16:00:00Z", operator: "王老师" },
  { id: "r004", type: "改衣", studentId: "stu006", description: "裤腰需要收紧", status: "待处理", createdAt: "2026-06-16T09:00:00Z", operator: "李老师" },
];
