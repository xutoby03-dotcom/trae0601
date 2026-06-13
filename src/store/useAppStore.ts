import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Supply, Member, Assignment, Segment, Importance, SupplyCategory, StrengthLevel } from '@/types';

const mockSupplies: Supply[] = [
  { id: 's1', name: '瓶装水 500ml', weightGrams: 520, quantity: 12, importance: 'high', isFragile: false, category: 'water', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mineral%20water%20bottle%20500ml%20hiking%20outdoor%20product%20photo&image_size=square' },
  { id: 's2', name: '电解质水 1L', weightGrams: 1050, quantity: 4, importance: 'high', isFragile: false, category: 'water', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=electrolyte%20sports%20drink%201L%20bottle%20hiking%20outdoor&image_size=square' },
  { id: 's3', name: '能量胶', weightGrams: 35, quantity: 20, importance: 'high', isFragile: false, category: 'food', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=energy%20gel%20pack%20running%20hiking%20supplement&image_size=square' },
  { id: 's4', name: '压缩饼干', weightGrams: 100, quantity: 10, importance: 'medium', isFragile: false, category: 'food', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=compressed%20biscuit%20energy%20bar%20hiking%20food&image_size=square' },
  { id: 's5', name: '巧克力', weightGrams: 50, quantity: 8, importance: 'medium', isFragile: true, category: 'food', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20chocolate%20bar%20energy%20hiking%20snack&image_size=square' },
  { id: 's6', name: '综合急救包', weightGrams: 450, quantity: 2, importance: 'high', isFragile: true, category: 'first_aid', isConsumable: false, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=first%20aid%20kit%20red%20cross%20outdoor%20hiking&image_size=square' },
  { id: 's7', name: '止血带', weightGrams: 25, quantity: 4, importance: 'high', isFragile: false, category: 'first_aid', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tourniquet%20medical%20first%20aid%20outdoor&image_size=square' },
  { id: 's8', name: '登山杖', weightGrams: 280, quantity: 4, importance: 'medium', isFragile: false, category: 'equipment', isConsumable: false, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=trekking%20poles%20hiking%20sticks%20outdoor%20gear&image_size=square' },
  { id: 's9', name: '头灯', weightGrams: 120, quantity: 4, importance: 'high', isFragile: false, category: 'equipment', isConsumable: false, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=headlamp%20LED%20hiking%20camping%20gear&image_size=square' },
  { id: 's10', name: '保温毯', weightGrams: 60, quantity: 4, importance: 'high', isFragile: false, category: 'first_aid', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emergency%20thermal%20blanket%20silver%20outdoor%20survival&image_size=square' },
  { id: 's11', name: '对讲机', weightGrams: 200, quantity: 3, importance: 'medium', isFragile: false, category: 'equipment', isConsumable: false, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=walkie%20talkie%20two%20way%20radio%20outdoor%20hiking&image_size=square' },
  { id: 's12', name: '雨衣', weightGrams: 180, quantity: 5, importance: 'medium', isFragile: false, category: 'equipment', isConsumable: false, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=foldable%20rain%20poncho%20hiking%20outdoor&image_size=square' },
  { id: 's13', name: '防晒霜', weightGrams: 80, quantity: 3, importance: 'low', isFragile: true, category: 'other', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sunscreen%20lotion%20bottle%20outdoor%20hiking&image_size=square' },
  { id: 's14', name: '驱蚊液', weightGrams: 60, quantity: 2, importance: 'low', isFragile: true, category: 'other', isConsumable: true, photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=insect%20repellent%20spray%20outdoor%20hiking&image_size=square' },
];

const mockMembers: Member[] = [
  { id: 'm1', name: '张伟', strengthLevel: 5, backpackCapacityKg: 20, allergies: [], emergencyContactName: '张妻', emergencyContactPhone: '13800001111', confirmed: true, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangwei&backgroundColor=b6e3f4' },
  { id: 'm2', name: '李娜', strengthLevel: 3, backpackCapacityKg: 12, allergies: ['花生'], emergencyContactName: '李父', emergencyContactPhone: '13800002222', confirmed: true, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lina&backgroundColor=ffd5dc' },
  { id: 'm3', name: '王强', strengthLevel: 4, backpackCapacityKg: 18, allergies: [], emergencyContactName: '王姐', emergencyContactPhone: '13800003333', confirmed: false, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangqiang&backgroundColor=c0aede' },
  { id: 'm4', name: '刘芳', strengthLevel: 2, backpackCapacityKg: 10, allergies: ['海鲜', '青霉素'], emergencyContactName: '刘母', emergencyContactPhone: '13800004444', confirmed: true, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liufang&backgroundColor=ffdfbf' },
  { id: 'm5', name: '陈明', strengthLevel: 4, backpackCapacityKg: 15, allergies: [], emergencyContactName: '陈兄', emergencyContactPhone: '13800005555', confirmed: false, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenming&backgroundColor=d1d4f9' },
];

const mockSegments: Segment[] = [
  { id: 'seg1', name: '第一段：山脚-半山腰', order: 1 },
  { id: 'seg2', name: '第二段：半山腰-垭口', order: 2 },
  { id: 'seg3', name: '第三段：垭口-山顶', order: 3 },
  { id: 'seg4', name: '第四段：山顶-露营地', order: 4 },
];

const mockAssignments: Assignment[] = [
  { id: 'a1', supplyId: 's1', memberId: 'm1', quantityAssigned: 3, usedSegments: [] },
  { id: 'a2', supplyId: 's1', memberId: 'm2', quantityAssigned: 2, usedSegments: ['seg1'] },
  { id: 'a3', supplyId: 's1', memberId: 'm3', quantityAssigned: 3, usedSegments: [] },
  { id: 'a4', supplyId: 's1', memberId: 'm4', quantityAssigned: 2, usedSegments: [] },
  { id: 'a5', supplyId: 's1', memberId: 'm5', quantityAssigned: 2, usedSegments: [] },
  { id: 'a6', supplyId: 's2', memberId: 'm1', quantityAssigned: 2, usedSegments: [] },
  { id: 'a7', supplyId: 's2', memberId: 'm3', quantityAssigned: 2, usedSegments: [] },
  { id: 'a8', supplyId: 's3', memberId: 'm1', quantityAssigned: 4, usedSegments: [] },
  { id: 'a9', supplyId: 's3', memberId: 'm2', quantityAssigned: 4, usedSegments: [] },
  { id: 'a10', supplyId: 's3', memberId: 'm3', quantityAssigned: 4, usedSegments: [] },
  { id: 'a11', supplyId: 's3', memberId: 'm4', quantityAssigned: 4, usedSegments: [] },
  { id: 'a12', supplyId: 's3', memberId: 'm5', quantityAssigned: 4, usedSegments: [] },
  { id: 'a13', supplyId: 's6', memberId: 'm1', quantityAssigned: 1, usedSegments: [] },
  { id: 'a14', supplyId: 's6', memberId: 'm3', quantityAssigned: 1, usedSegments: [] },
  { id: 'a15', supplyId: 's7', memberId: 'm1', quantityAssigned: 2, usedSegments: [] },
  { id: 'a16', supplyId: 's7', memberId: 'm3', quantityAssigned: 2, usedSegments: [] },
  { id: 'a17', supplyId: 's8', memberId: 'm1', quantityAssigned: 1, usedSegments: [] },
  { id: 'a18', supplyId: 's8', memberId: 'm3', quantityAssigned: 1, usedSegments: [] },
  { id: 'a19', supplyId: 's8', memberId: 'm5', quantityAssigned: 2, usedSegments: [] },
  { id: 'a20', supplyId: 's9', memberId: 'm1', quantityAssigned: 1, usedSegments: [] },
  { id: 'a21', supplyId: 's9', memberId: 'm2', quantityAssigned: 1, usedSegments: [] },
  { id: 'a22', supplyId: 's9', memberId: 'm4', quantityAssigned: 1, usedSegments: [] },
  { id: 'a23', supplyId: 's9', memberId: 'm5', quantityAssigned: 1, usedSegments: [] },
  { id: 'a24', supplyId: 's10', memberId: 'm1', quantityAssigned: 1, usedSegments: [] },
  { id: 'a25', supplyId: 's10', memberId: 'm2', quantityAssigned: 1, usedSegments: [] },
  { id: 'a26', supplyId: 's10', memberId: 'm4', quantityAssigned: 1, usedSegments: [] },
  { id: 'a27', supplyId: 's10', memberId: 'm5', quantityAssigned: 1, usedSegments: [] },
];

interface AppStore {
  supplies: Supply[];
  members: Member[];
  assignments: Assignment[];
  segments: Segment[];

  addSupply: (data: Omit<Supply, 'id'>) => void;
  updateSupply: (id: string, data: Partial<Supply>) => void;
  removeSupply: (id: string) => void;

  addMember: (data: Omit<Member, 'id'>) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  removeMember: (id: string) => void;
  toggleMemberConfirmed: (id: string) => void;

  assignSupply: (supplyId: string, memberId: string, quantity?: number) => void;
  unassignSupply: (assignmentId: string) => void;
  updateAssignmentQuantity: (assignmentId: string, quantity: number) => void;
  toggleSegmentUsed: (assignmentId: string, segmentId: string) => void;

  resetAll: () => void;
}

function generateId(prefix: string) {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      supplies: mockSupplies,
      members: mockMembers,
      assignments: mockAssignments,
      segments: mockSegments,

      addSupply: (data) =>
        set((s) => ({ supplies: [...s.supplies, { ...data, id: generateId('s') }] })),

      updateSupply: (id, data) =>
        set((s) => ({
          supplies: s.supplies.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),

      removeSupply: (id) =>
        set((s) => ({
          supplies: s.supplies.filter((item) => item.id !== id),
          assignments: s.assignments.filter((a) => a.supplyId !== id),
        })),

      addMember: (data) =>
        set((s) => ({ members: [...s.members, { ...data, id: generateId('m') }] })),

      updateMember: (id, data) =>
        set((s) => ({
          members: s.members.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),

      removeMember: (id) =>
        set((s) => ({
          members: s.members.filter((item) => item.id !== id),
          assignments: s.assignments.filter((a) => a.memberId !== id),
        })),

      toggleMemberConfirmed: (id) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, confirmed: !m.confirmed } : m)),
        })),

      assignSupply: (supplyId, memberId, quantity = 1) => {
        const { supplies, assignments } = get();
        const supply = supplies.find((s) => s.id === supplyId);
        if (!supply) return;

        const remaining = supply.quantity - assignments
          .filter((a) => a.supplyId === supplyId)
          .reduce((sum, a) => sum + a.quantityAssigned, 0);

        const actualQty = Math.min(quantity, remaining);
        if (actualQty <= 0) return;

        const existing = assignments.find((a) => a.supplyId === supplyId && a.memberId === memberId);
        if (existing) {
          set((s) => ({
            assignments: s.assignments.map((a) =>
              a.id === existing.id
                ? { ...a, quantityAssigned: a.quantityAssigned + actualQty }
                : a
            ),
          }));
        } else {
          set((s) => ({
            assignments: [
              ...s.assignments,
              {
                id: generateId('a'),
                supplyId,
                memberId,
                quantityAssigned: actualQty,
                usedSegments: [],
              },
            ],
          }));
        }
      },

      unassignSupply: (assignmentId) =>
        set((s) => ({
          assignments: s.assignments.filter((a) => a.id !== assignmentId),
        })),

      updateAssignmentQuantity: (assignmentId, quantity) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === assignmentId ? { ...a, quantityAssigned: Math.max(0, quantity) } : a
          ),
        })),

      toggleSegmentUsed: (assignmentId, segmentId) =>
        set((s) => ({
          assignments: s.assignments.map((a) => {
            if (a.id !== assignmentId) return a;
            const has = a.usedSegments.includes(segmentId);
            return {
              ...a,
              usedSegments: has
                ? a.usedSegments.filter((sid) => sid !== segmentId)
                : [...a.usedSegments, segmentId],
            };
          }),
        })),

      resetAll: () =>
        set({
          supplies: mockSupplies,
          members: mockMembers,
          assignments: mockAssignments,
          segments: mockSegments,
        }),
    }),
    {
      name: 'hiking-supplies-store',
    }
  )
);

export type { Importance, SupplyCategory, StrengthLevel };
