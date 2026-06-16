import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, MemberStatus } from '../types';
import { mockMembers } from '../data/mockData';
import { usePickupPointStore } from './pickupPointStore';

interface MemberState {
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'status' | 'proxyById' | 'pickupTime' | 'queueStartTime' | 'createdAt'>) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  confirmPickup: (id: string) => void;
  confirmProxyPickup: (id: string, proxyMemberId: string) => void;
  getMembersByStatus: (status: MemberStatus) => Member[];
  getMembersByPickupPoint: (pickupPointId: string) => Member[];
  getMembersByPickupPointAndStatus: (pickupPointId: string, status: MemberStatus) => Member[];
  getMemberById: (id: string) => Member | undefined;
  searchMembers: (query: string, pickupPointId?: string) => Member[];
  startQueue: (id: string) => void;
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      members: mockMembers,

      addMember: (member) => set((state) => ({
        members: [
          ...state.members,
          {
            ...member,
            id: `member-${Date.now()}`,
            status: 'pending',
            proxyById: null,
            pickupTime: null,
            queueStartTime: null,
            createdAt: new Date().toISOString(),
          },
        ],
      })),

      updateMember: (id, data) => set((state) => ({
        members: state.members.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      })),

      deleteMember: (id) => set((state) => ({
        members: state.members.filter((m) => m.id !== id),
      })),

      confirmPickup: (id) => {
        const now = new Date().toISOString();
        const member = get().members.find((m) => m.id === id);
        
        if (!member) return;

        const queueStartTime = member.queueStartTime || now;
        const waitDuration = Math.max(0, Math.floor(
          (new Date(now).getTime() - new Date(queueStartTime).getTime()) / 1000
        ));

        set((state) => ({
          members: state.members.map((m) =>
            m.id === id
              ? { ...m, status: 'picked', pickupTime: now, proxyById: null }
              : m
          ),
        }));

        usePickupPointStore.getState().addPickupRecord({
          memberId: id,
          pickupPointId: member.pickupPoint,
          type: 'self',
          proxyMemberId: null,
          queueStartTime,
          pickupTime: now,
          waitDuration,
        });
      },

      confirmProxyPickup: (id, proxyMemberId) => {
        const now = new Date().toISOString();
        const member = get().members.find((m) => m.id === id);
        
        if (!member) return;

        const queueStartTime = member.queueStartTime || now;
        const waitDuration = Math.max(0, Math.floor(
          (new Date(now).getTime() - new Date(queueStartTime).getTime()) / 1000
        ));

        set((state) => ({
          members: state.members.map((m) => {
            if (m.id === id) {
              return { ...m, status: 'proxied', pickupTime: now, proxyById: proxyMemberId };
            }
            return m;
          }),
        }));

        usePickupPointStore.getState().addPickupRecord({
          memberId: id,
          pickupPointId: member.pickupPoint,
          type: 'proxy',
          proxyMemberId,
          queueStartTime,
          pickupTime: now,
          waitDuration,
        });
      },

      getMembersByStatus: (status) => get().members.filter((m) => m.status === status),

      getMembersByPickupPoint: (pickupPointId) =>
        get().members.filter((m) => m.pickupPoint === pickupPointId),

      getMembersByPickupPointAndStatus: (pickupPointId, status) =>
        get().members.filter((m) => m.pickupPoint === pickupPointId && m.status === status),

      getMemberById: (id) => get().members.find((m) => m.id === id),

      searchMembers: (query, pickupPointId) => {
        const { members } = get();
        let filtered = members;
        
        if (pickupPointId) {
          filtered = filtered.filter((m) => m.pickupPoint === pickupPointId);
        }
        
        if (query) {
          const lowerQuery = query.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.name.toLowerCase().includes(lowerQuery) ||
              m.phoneLastFour.includes(query) ||
              m.seatSection.toLowerCase().includes(lowerQuery)
          );
        }
        
        return filtered;
      },

      startQueue: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, queueStartTime: now } : m
          ),
        }));
      },
    }),
    {
      name: 'member-storage-v2',
    }
  )
);
