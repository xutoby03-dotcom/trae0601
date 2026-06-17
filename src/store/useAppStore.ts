import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, Equipment, Car, ReturnRecord, AssignmentWarning } from '@/types';
import { checkAllAssignments } from '@/utils/assignmentChecker';
import { mockMembers, mockEquipment, mockCars } from '@/data/mockData';

interface AppState {
  members: Member[];
  equipment: Equipment[];
  cars: Car[];
  returnRecords: ReturnRecord[];
  warnings: AssignmentWarning[];

  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  assignEquipment: (equipmentId: string, memberId: string | undefined) => void;

  addCar: (car: Omit<Car, 'id'>) => void;
  updateCar: (id: string, car: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  assignEquipmentToCar: (equipmentId: string, carId: string | undefined) => void;

  updateReturnRecord: (equipmentId: string, record: Partial<ReturnRecord>) => void;

  recalculateWarnings: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      equipment: mockEquipment,
      cars: mockCars,
      returnRecords: [],
      warnings: [],

      addMember: (member) =>
        set((state) => ({
          members: [...state.members, { ...member, id: generateId() }],
        })),

      updateMember: (id, member) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...member } : m)),
        })),

      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          equipment: state.equipment.map((e) =>
            e.assignedTo === id ? { ...e, assignedTo: undefined } : e
          ),
        })),

      addEquipment: (equipment) =>
        set((state) => ({
          equipment: [...state.equipment, { ...equipment, id: generateId() }],
        })),

      updateEquipment: (id, equipment) =>
        set((state) => ({
          equipment: state.equipment.map((e) => (e.id === id ? { ...e, ...equipment } : e)),
        })),

      deleteEquipment: (id) =>
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
        })),

      assignEquipment: (equipmentId, memberId) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === equipmentId ? { ...e, assignedTo: memberId } : e
          ),
        })),

      addCar: (car) =>
        set((state) => ({
          cars: [...state.cars, { ...car, id: generateId() }],
        })),

      updateCar: (id, car) =>
        set((state) => ({
          cars: state.cars.map((c) => (c.id === id ? { ...c, ...car } : c)),
        })),

      deleteCar: (id) =>
        set((state) => ({
          cars: state.cars.filter((c) => c.id !== id),
          equipment: state.equipment.map((e) => (e.carId === id ? { ...e, carId: undefined } : e)),
        })),

      assignEquipmentToCar: (equipmentId, carId) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === equipmentId ? { ...e, carId } : e
          ),
        })),

      updateReturnRecord: (equipmentId, record) =>
        set((state) => {
          const existing = state.returnRecords.find((r) => r.equipmentId === equipmentId);
          if (existing) {
            return {
              returnRecords: state.returnRecords.map((r) =>
                r.equipmentId === equipmentId ? { ...r, ...record } : r
              ),
            };
          }
          return {
            returnRecords: [...state.returnRecords, { equipmentId, ...record } as ReturnRecord],
          };
        }),

      recalculateWarnings: () => {
        const { members, equipment } = get();
        const warnings = checkAllAssignments(members, equipment);
        set({ warnings });
      },
    }),
    {
      name: 'ski-equipment-storage',
    }
  )
);
