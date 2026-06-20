import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hold, Issue, IssueType, Severity, HoldType } from '@/types';
import { MOCK_HOLDS, MOCK_ISSUES } from '@/data/mockData';

interface HoldState {
  holds: Hold[];
  issues: Issue[];
  selectedHoldId: string | null;
  showIssueModal: boolean;
  patrolMode: boolean;
}

interface HoldActions {
  setSelectedHold: (id: string | null) => void;
  setShowIssueModal: (show: boolean) => void;
  setPatrolMode: (active: boolean) => void;
  addHold: (hold: Omit<Hold, 'id'>) => void;
  updateHold: (id: string, updates: Partial<Hold>) => void;
  deleteHold: (id: string) => void;
  assignHoldToRoute: (holdId: string, routeId: string | null) => void;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'resolved'>) => void;
  resolveIssue: (issueId: string) => void;
  getHoldById: (id: string) => Hold | undefined;
  getIssuesByHold: (holdId: string) => Issue[];
  getIssuesByRoute: (routeId: string) => Issue[];
  getUnresolvedIssues: () => Issue[];
  getHoldsByRoute: (routeId: string) => Hold[];
  hasUnresolvedIssue: (holdId: string) => boolean;
}

export const useHoldStore = create<HoldState & HoldActions>()(
  persist(
    (set, get) => ({
      holds: MOCK_HOLDS,
      issues: MOCK_ISSUES,
      selectedHoldId: null,
      showIssueModal: false,
      patrolMode: false,

      setSelectedHold: (id) => set({ selectedHoldId: id }),
      setShowIssueModal: (show) => set({ showIssueModal: show }),
      setPatrolMode: (active) => set({ patrolMode: active, selectedHoldId: null }),

      addHold: (hold) => {
        const newHold: Hold = {
          ...hold,
          id: `hold-${Date.now()}`,
        };
        set((state) => ({ holds: [...state.holds, newHold] }));
      },

      updateHold: (id, updates) => {
        set((state) => ({
          holds: state.holds.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }));
      },

      deleteHold: (id) => {
        set((state) => ({
          holds: state.holds.filter((h) => h.id !== id),
          selectedHoldId: state.selectedHoldId === id ? null : state.selectedHoldId,
        }));
      },

      assignHoldToRoute: (holdId, routeId) => {
        set((state) => ({
          holds: state.holds.map((h) =>
            h.id === holdId ? { ...h, routeId } : h
          ),
        }));
      },

      addIssue: (issue) => {
        const newIssue: Issue = {
          ...issue,
          id: `issue-${Date.now()}`,
          createdAt: new Date().toISOString(),
          resolved: false,
        };
        set((state) => ({ issues: [...state.issues, newIssue] }));
      },

      resolveIssue: (issueId) => {
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId ? { ...i, resolved: true } : i
          ),
        }));
      },

      getHoldById: (id) => {
        return get().holds.find((h) => h.id === id);
      },

      getIssuesByHold: (holdId) => {
        return get().issues.filter((i) => i.holdId === holdId && !i.resolved);
      },

      getIssuesByRoute: (routeId) => {
        return get().issues.filter((i) => i.routeId === routeId && !i.resolved);
      },

      getUnresolvedIssues: () => {
        return get().issues.filter((i) => !i.resolved);
      },

      getHoldsByRoute: (routeId) => {
        return get().holds.filter((h) => h.routeId === routeId);
      },

      hasUnresolvedIssue: (holdId) => {
        return get().issues.some((i) => i.holdId === holdId && !i.resolved);
      },
    }),
    {
      name: 'climb-hold-storage',
    }
  )
);
