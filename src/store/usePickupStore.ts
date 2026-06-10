import { create } from 'zustand';
import { FamilyMember, School, Child, PickupRecord, PickupStatus, SwapStatus } from '@/types';
import { familyMembers, schools, children, pickupRecords as mockRecords, currentUserId } from '@/data/mockData';
import { getToday } from '@/utils/dateUtils';

interface PickupState {
  familyMembers: FamilyMember[];
  schools: School[];
  children: Child[];
  pickupRecords: PickupRecord[];
  currentUserId: string;

  getMemberById: (id: string) => FamilyMember | undefined;
  getSchoolById: (id: string) => School | undefined;
  getChildById: (id: string) => Child | undefined;
  getRecordsByDate: (date: string) => PickupRecord[];
  getRecordsByDateRange: (startDate: string, endDate: string) => PickupRecord[];
  getTodayRecords: () => PickupRecord[];
  getWeekRecords: () => PickupRecord[];

  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (child: Child) => void;
  deleteChild: (id: string) => void;

  addSchool: (school: Omit<School, 'id'>) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (id: string) => void;

  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateMember: (member: FamilyMember) => void;
  deleteMember: (id: string) => void;

  updatePickupRecord: (record: PickupRecord) => void;
  claimPickup: (recordId: string, memberId: string) => void;
  requestSwap: (recordId: string, fromMemberId: string, toMemberId: string) => void;
  confirmSwap: (recordId: string) => void;
  rejectSwap: (recordId: string) => void;
  markPicked: (recordId: string, remark?: string) => void;
  markLate: (recordId: string, lateMinutes: number) => void;

  getStatsByMember: () => { memberId: string; totalPickups: number; lateCount: number; onTimeRate: number }[];
  getSwapStats: () => { date: string; count: number }[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const usePickupStore = create<PickupState>((set, get) => ({
  familyMembers,
  schools,
  children,
  pickupRecords: mockRecords,
  currentUserId,

  getMemberById: (id) => get().familyMembers.find((m) => m.id === id),
  getSchoolById: (id) => get().schools.find((s) => s.id === id),
  getChildById: (id) => get().children.find((c) => c.id === id),

  getRecordsByDate: (date) =>
    get().pickupRecords.filter((r) => r.date === date).sort((a, b) => {
      const schoolA = get().getSchoolById(a.schoolId);
      const schoolB = get().getSchoolById(b.schoolId);
      return (schoolA?.dismissTime || '').localeCompare(schoolB?.dismissTime || '');
    }),

  getRecordsByDateRange: (startDate, endDate) =>
    get().pickupRecords.filter((r) => r.date >= startDate && r.date <= endDate),

  getTodayRecords: () => get().getRecordsByDate(getToday()),

  getWeekRecords: () => {
    const today = new Date(getToday());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return get().getRecordsByDateRange(formatDate(startOfWeek), formatDate(endOfWeek));
  },

  addChild: (child) =>
    set((state) => ({
      children: [...state.children, { ...child, id: generateId() }],
    })),

  updateChild: (child) =>
    set((state) => ({
      children: state.children.map((c) => (c.id === child.id ? child : c)),
    })),

  deleteChild: (id) =>
    set((state) => ({
      children: state.children.filter((c) => c.id !== id),
    })),

  addSchool: (school) =>
    set((state) => ({
      schools: [...state.schools, { ...school, id: generateId() }],
    })),

  updateSchool: (school) =>
    set((state) => ({
      schools: state.schools.map((s) => (s.id === school.id ? school : s)),
    })),

  deleteSchool: (id) =>
    set((state) => ({
      schools: state.schools.filter((s) => s.id !== id),
    })),

  addMember: (member) =>
    set((state) => ({
      familyMembers: [...state.familyMembers, { ...member, id: generateId() }],
    })),

  updateMember: (member) =>
    set((state) => ({
      familyMembers: state.familyMembers.map((m) => (m.id === member.id ? member : m)),
    })),

  deleteMember: (id) =>
    set((state) => ({
      familyMembers: state.familyMembers.filter((m) => m.id !== id),
    })),

  updatePickupRecord: (record) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) => (r.id === record.id ? record : r)),
    })),

  claimPickup: (recordId, memberId) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              assignedTo: memberId,
              swapStatus: 'confirmed' as SwapStatus,
              swapFrom: r.assignedTo,
              swapTo: memberId,
              swapConfirmTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      ),
    })),

  requestSwap: (recordId, fromMemberId, toMemberId) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              swapStatus: 'requested' as SwapStatus,
              swapFrom: fromMemberId,
              swapTo: toMemberId,
              swapRequestTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      ),
    })),

  confirmSwap: (recordId) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === recordId && r.swapTo
          ? {
              ...r,
              swapStatus: 'confirmed' as SwapStatus,
              assignedTo: r.swapTo,
              swapConfirmTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      ),
    })),

  rejectSwap: (recordId) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              swapStatus: 'none' as SwapStatus,
              swapFrom: undefined,
              swapTo: undefined,
              swapRequestTime: undefined,
            }
          : r
      ),
    })),

  markPicked: (recordId, remark) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'picked' as PickupStatus,
              pickedTime: timeStr,
              remark: remark || r.remark,
            }
          : r
      ),
    }));
  },

  markLate: (recordId, lateMinutes) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'late' as PickupStatus,
              isLate: true,
              lateMinutes,
            }
          : r
      ),
    })),

  getStatsByMember: () => {
    const { familyMembers, pickupRecords } = get();
    return familyMembers.map((member) => {
      const memberRecords = pickupRecords.filter(
        (r) => r.assignedTo === member.id && (r.status === 'picked' || r.status === 'late')
      );
      const totalPickups = memberRecords.length;
      const lateCount = memberRecords.filter((r) => r.isLate).length;
      const onTimeRate = totalPickups > 0 ? ((totalPickups - lateCount) / totalPickups) * 100 : 0;
      return {
        memberId: member.id,
        totalPickups,
        lateCount,
        onTimeRate: Math.round(onTimeRate),
      };
    });
  },

  getSwapStats: () => {
    const { pickupRecords } = get();
    const swapMap: Record<string, number> = {};
    pickupRecords.forEach((r) => {
      if (r.swapStatus === 'confirmed') {
        swapMap[r.date] = (swapMap[r.date] || 0) + 1;
      }
    });
    return Object.entries(swapMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },
}));
