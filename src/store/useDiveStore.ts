import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Member,
  Equipment,
  Allocation,
  Luggage,
  PackingItem,
  ReturnCheck,
  WarningItem,
  EquipmentType,
} from '@/types';
import {
  mockMembers,
  mockEquipment,
  mockAllocations,
  mockLuggage,
  mockPackingItems,
  mockReturnChecks,
} from '@/data/mockData';

interface DiveStore {
  members: Member[];
  equipment: Equipment[];
  allocations: Allocation[];
  luggage: Luggage[];
  packingItems: PackingItem[];
  returnChecks: ReturnCheck[];

  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  addAllocation: (memberId: string, equipmentId: string) => void;
  removeAllocation: (allocationId: string) => void;
  removeAllocationByEquipment: (equipmentId: string) => void;

  addLuggage: (luggage: Omit<Luggage, 'id'>) => void;
  updateLuggage: (id: string, luggage: Partial<Luggage>) => void;
  deleteLuggage: (id: string) => void;

  addPackingItem: (luggageId: string, equipmentId: string) => void;
  togglePacked: (packingItemId: string) => void;
  removePackingItem: (packingItemId: string) => void;

  updateReturnCheck: (equipmentId: string, check: Partial<ReturnCheck>) => void;
  getReturnCheck: (equipmentId: string) => ReturnCheck | undefined;

  getWarnings: () => WarningItem[];
  getEquipmentByType: (type: EquipmentType) => Equipment[];
  getMemberEquipment: (memberId: string) => Equipment[];
  getAvailableEquipment: (type: EquipmentType) => Equipment[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const parseFinsSize = (size: string): number => {
  const match = size.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

export const useDiveStore = create<DiveStore>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      equipment: mockEquipment,
      allocations: mockAllocations,
      luggage: mockLuggage,
      packingItems: mockPackingItems,
      returnChecks: mockReturnChecks,

      addMember: (member) =>
        set((state) => ({
          members: [...state.members, { ...member, id: generateId() }],
        })),

      updateMember: (id, member) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...member } : m
          ),
        })),

      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          allocations: state.allocations.filter((a) => a.memberId !== id),
        })),

      addEquipment: (equipment) =>
        set((state) => ({
          equipment: [...state.equipment, { ...equipment, id: generateId() }],
        })),

      updateEquipment: (id, equipment) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, ...equipment } : e
          ),
        })),

      deleteEquipment: (id) =>
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
          allocations: state.allocations.filter((a) => a.equipmentId !== id),
          packingItems: state.packingItems.filter((p) => p.equipmentId !== id),
        })),

      addAllocation: (memberId, equipmentId) => {
        const state = get();
        const existing = state.allocations.find(
          (a) => a.equipmentId === equipmentId
        );
        if (existing) return;

        set({
          allocations: [
            ...state.allocations,
            { id: generateId(), memberId, equipmentId },
          ],
        });
      },

      removeAllocation: (allocationId) =>
        set((state) => ({
          allocations: state.allocations.filter((a) => a.id !== allocationId),
        })),

      removeAllocationByEquipment: (equipmentId) =>
        set((state) => ({
          allocations: state.allocations.filter(
            (a) => a.equipmentId !== equipmentId
          ),
        })),

      addLuggage: (luggage) =>
        set((state) => ({
          luggage: [...state.luggage, { ...luggage, id: generateId() }],
        })),

      updateLuggage: (id, luggage) =>
        set((state) => ({
          luggage: state.luggage.map((l) =>
            l.id === id ? { ...l, ...luggage } : l
          ),
        })),

      deleteLuggage: (id) =>
        set((state) => ({
          luggage: state.luggage.filter((l) => l.id !== id),
          packingItems: state.packingItems.filter((p) => p.luggageId !== id),
        })),

      addPackingItem: (luggageId, equipmentId) =>
        set((state) => ({
          packingItems: [
            ...state.packingItems,
            { id: generateId(), luggageId, equipmentId, packed: false },
          ],
        })),

      togglePacked: (packingItemId) =>
        set((state) => ({
          packingItems: state.packingItems.map((p) =>
            p.id === packingItemId ? { ...p, packed: !p.packed } : p
          ),
        })),

      removePackingItem: (packingItemId) =>
        set((state) => ({
          packingItems: state.packingItems.filter((p) => p.id !== packingItemId),
        })),

      updateReturnCheck: (equipmentId, check) => {
        const state = get();
        const existing = state.returnChecks.find(
          (r) => r.equipmentId === equipmentId
        );
        if (existing) {
          set({
            returnChecks: state.returnChecks.map((r) =>
              r.equipmentId === equipmentId ? { ...r, ...check } : r
            ),
          });
        } else {
          set({
            returnChecks: [
              ...state.returnChecks,
              {
                id: generateId(),
                equipmentId,
                waterIntrusion: false,
                scratches: false,
                lost: false,
                ...check,
              },
            ],
          });
        }
      },

      getReturnCheck: (equipmentId) => {
        return get().returnChecks.find((r) => r.equipmentId === equipmentId);
      },

      getWarnings: () => {
        const state = get();
        const warnings: WarningItem[] = [];

        state.members.forEach((member) => {
          if (member.isMyopia) {
            const memberAllocations = state.allocations.filter(
              (a) => a.memberId === member.id
            );
            const masks = memberAllocations
              .map((a) => state.equipment.find((e) => e.id === a.equipmentId))
              .filter((e) => e && e.type === 'mask');

            const hasPrescriptionMask = masks.some(
              (m) => m && m.hasPrescriptionLens
            );

            if (masks.length > 0 && !hasPrescriptionMask) {
              warnings.push({
                type: 'myopia',
                severity: 'warning',
                message: `${member.name} 近视 ${member.myopiaDegree}度，但分配的面镜没有度数镜片`,
                memberId: member.id,
              });
            }

            if (masks.length === 0) {
              warnings.push({
                type: 'myopia',
                severity: 'warning',
                message: `${member.name} 近视但还没有分配面镜`,
                memberId: member.id,
              });
            }
          }

          const memberAllocations = state.allocations.filter(
            (a) => a.memberId === member.id
          );
          const fins = memberAllocations
            .map((a) => state.equipment.find((e) => e.id === a.equipmentId))
            .filter((e) => e && e.type === 'fins');

          fins.forEach((fin) => {
            if (fin) {
              const finSize = parseFinsSize(fin.size);
              if (finSize > 0 && Math.abs(finSize - member.footSize) > 2) {
                warnings.push({
                  type: 'finsSize',
                  severity: 'warning',
                  message: `${member.name} 的脚蹼尺码可能不合适 (脚码:${member.footSize} vs 脚蹼:${fin.size})`,
                  memberId: member.id,
                  equipmentId: fin.id,
                });
              }
            }
          });

          if (member.swimLevel === 'beginner') {
            const hasLifeJacket = memberAllocations.some((a) => {
              const eq = state.equipment.find((e) => e.id === a.equipmentId);
              return eq && eq.type === 'lifeJacket';
            });
            if (!hasLifeJacket) {
              warnings.push({
                type: 'lifeJacket',
                severity: 'error',
                message: `${member.name} 是游泳初学者，但没有分配救生衣`,
                memberId: member.id,
              });
            }
          }
        });

        const lifeJackets = state.equipment.filter(
          (e) => e.type === 'lifeJacket' && e.status === 'good'
        );
        const beginners = state.members.filter(
          (m) => m.swimLevel === 'beginner'
        );
        if (lifeJackets.length < beginners.length) {
          warnings.push({
            type: 'lifeJacket',
            severity: 'error',
            message: `救生衣数量不足 (${beginners.length}位初学者 vs ${lifeJackets.length}件救生衣)`,
          });
        }

        state.equipment
          .filter((e) => e.type === 'actionCam')
          .forEach((cam) => {
            if (cam.batteryLevel !== undefined && cam.batteryLevel < 30) {
              warnings.push({
                type: 'battery',
                severity: 'warning',
                message: `${cam.name} 电量不足 (${cam.batteryLevel}%)`,
                equipmentId: cam.id,
              });
            }
          });

        return warnings;
      },

      getEquipmentByType: (type) => {
        return get().equipment.filter((e) => e.type === type);
      },

      getMemberEquipment: (memberId) => {
        const state = get();
        return state.allocations
          .filter((a) => a.memberId === memberId)
          .map((a) => state.equipment.find((e) => e.id === a.equipmentId))
          .filter((e): e is Equipment => e !== undefined);
      },

      getAvailableEquipment: (type) => {
        const state = get();
        const allocatedIds = new Set(state.allocations.map((a) => a.equipmentId));
        return state.equipment.filter(
          (e) => e.type === type && !allocatedIds.has(e.id)
        );
      },
    }),
    {
      name: 'dive-equipment-store',
    }
  )
);
