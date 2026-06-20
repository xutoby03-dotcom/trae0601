import type { Barber } from "../types/barber";

export const mockBarbers: Barber[] = [
  {
    id: "barber-001",
    name: "李师傅",
    phone: "13800001111",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lifhifu&backgroundColor=c0aede",
    specialty: "老年发型、剪发",
    rating: 4.8,
    isActive: true,
  },
  {
    id: "barber-002",
    name: "王师傅",
    phone: "13800002222",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangfufu&backgroundColor=b6e3f4",
    specialty: "染发、烫发",
    rating: 4.6,
    isActive: true,
  },
  {
    id: "barber-003",
    name: "张师傅",
    phone: "13800003333",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangfufu&backgroundColor=ffd5dc",
    specialty: "男士发型、护理",
    rating: 4.9,
    isActive: true,
  },
];
