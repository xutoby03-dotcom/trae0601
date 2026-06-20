import { create } from 'zustand';
import type { IssueMarker, IssueType, Severity } from '../types';
import { mockIssues } from '../data/mockData';

interface IssueState {
  issues: IssueMarker[];
  addIssue: (issue: Omit<IssueMarker, 'id' | 'createdAt' | 'resolved'>) => void;
  resolveIssue: (id: string) => void;
  removeIssue: (id: string) => void;
  updateIssue: (id: string, updates: Partial<IssueMarker>) => void;
  clearResolved: () => void;
  getUnresolvedIssues: () => IssueMarker[];
  getIssuesByType: (type: IssueType) => IssueMarker[];
  getIssuesBySeverity: (severity: Severity) => IssueMarker[];
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: mockIssues,

  addIssue: (issue) =>
    set((state) => ({
      issues: [
        ...state.issues,
        {
          ...issue,
          id: `issue-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          createdAt: Date.now(),
          resolved: false,
          radius: issue.radius || 2,
        },
      ],
    })),

  resolveIssue: (id) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? { ...issue, resolved: true, resolvedAt: Date.now() }
          : issue
      ),
    })),

  removeIssue: (id) =>
    set((state) => ({
      issues: state.issues.filter((issue) => issue.id !== id),
    })),

  updateIssue: (id, updates) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id ? { ...issue, ...updates } : issue
      ),
    })),

  clearResolved: () =>
    set((state) => ({
      issues: state.issues.filter((issue) => !issue.resolved),
    })),

  getUnresolvedIssues: () => get().issues.filter((i) => !i.resolved),
  getIssuesByType: (type) => get().issues.filter((i) => i.type === type && !i.resolved),
  getIssuesBySeverity: (severity) => get().issues.filter((i) => i.severity === severity && !i.resolved),
}));
