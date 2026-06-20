import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Feedback, FeedbackType, ReviewDecision } from '@/types';
import { MOCK_FEEDBACKS } from '@/data/mockData';

interface FeedbackState {
  feedbacks: Feedback[];
  selectedFeedbackId: string | null;
}

interface FeedbackActions {
  setSelectedFeedback: (id: string | null) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => void;
  reviewFeedback: (id: string, decision: ReviewDecision, note: string, reviewer: string) => void;
  getFeedbacksByRoute: (routeId: string) => Feedback[];
  getPendingFeedbacks: () => Feedback[];
  getReviewedFeedbacks: () => Feedback[];
  getFeedbackStats: (routeId: string) => { total: number; pending: number; byType: Record<string, number> };
  getFeedbacksByDecision: (decision: ReviewDecision) => Feedback[];
}

export const useFeedbackStore = create<FeedbackState & FeedbackActions>()(
  persist(
    (set, get) => ({
      feedbacks: MOCK_FEEDBACKS,
      selectedFeedbackId: null,

      setSelectedFeedback: (id) => set({ selectedFeedbackId: id }),

      addFeedback: (feedback) => {
        const newFeedback: Feedback = {
          ...feedback,
          id: `feedback-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({ feedbacks: [...state.feedbacks, newFeedback] }));
      },

      reviewFeedback: (id, decision, note, reviewer) => {
        set((state) => ({
          feedbacks: state.feedbacks.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: 'reviewed',
                  decision,
                  reviewerNote: note,
                  reviewedAt: new Date().toISOString(),
                  reviewer,
                }
              : f
          ),
        }));
      },

      getFeedbacksByRoute: (routeId) => {
        return get().feedbacks.filter((f) => f.routeId === routeId);
      },

      getPendingFeedbacks: () => {
        return get().feedbacks.filter((f) => f.status === 'pending');
      },

      getReviewedFeedbacks: () => {
        return get().feedbacks.filter((f) => f.status === 'reviewed');
      },

      getFeedbackStats: (routeId) => {
        const routeFeedbacks = get().feedbacks.filter((f) => f.routeId === routeId);
        const byType: Record<string, number> = {};
        let pending = 0;

        routeFeedbacks.forEach((f) => {
          byType[f.type] = (byType[f.type] || 0) + 1;
          if (f.status === 'pending') pending++;
        });

        return {
          total: routeFeedbacks.length,
          pending,
          byType,
        };
      },

      getFeedbacksByDecision: (decision) => {
        return get().feedbacks.filter((f) => f.decision === decision);
      },
    }),
    {
      name: 'climb-feedback-storage',
    }
  )
);
