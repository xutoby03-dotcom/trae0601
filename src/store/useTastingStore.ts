import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TastingItem, Feedback, TastingStatus } from '@/types';
import { generateMockTastingItems, generateMockFeedbacks, generateId } from '@/utils/mockData';
import { determineStatus } from '@/utils/statistics';

interface TastingState {
  items: TastingItem[];
  feedbacks: Feedback[];
  addItem: (item: Omit<TastingItem, 'id' | 'createdAt' | 'status'>) => void;
  updateItem: (id: string, updates: Partial<TastingItem>) => void;
  deleteItem: (id: string) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
  getItemById: (id: string) => TastingItem | undefined;
  getFeedbacksByItemId: (id: string) => Feedback[];
  getItemsByStatus: (status: TastingStatus) => TastingItem[];
  markAsReady: (id: string) => void;
  resetData: () => void;
}

const mockItems = generateMockTastingItems();
const mockFeedbacks = generateMockFeedbacks(mockItems);

const initialItems = mockItems.map(item => ({
  ...item,
  status: determineStatus(item, mockFeedbacks.filter(f => f.tastingItemId === item.id)),
}));

export const useTastingStore = create<TastingState>()(
  persist(
    (set, get) => ({
      items: initialItems,
      feedbacks: mockFeedbacks,

      addItem: (itemData) => {
        const newItem: TastingItem = {
          ...itemData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          status: 'collecting',
        };
        set(state => ({ items: [newItem, ...state.items] }));
      },

      updateItem: (id, updates) => {
        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      deleteItem: (id) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id),
          feedbacks: state.feedbacks.filter(f => f.tastingItemId !== id),
        }));
      },

      addFeedback: (feedbackData) => {
        const newFeedback: Feedback = {
          ...feedbackData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          feedbacks: [newFeedback, ...state.feedbacks],
        }));

        const state = get();
        const item = state.items.find(i => i.id === feedbackData.tastingItemId);
        if (item) {
          const itemFeedbacks = state.feedbacks.filter(f => f.tastingItemId === item.id);
          const newStatus = determineStatus(item, itemFeedbacks);
          if (newStatus !== item.status && item.status !== 'ready') {
            set(state => ({
              items: state.items.map(i =>
                i.id === item.id ? { ...i, status: newStatus } : i
              ),
            }));
          }
        }
      },

      getItemById: (id) => {
        return get().items.find(item => item.id === id);
      },

      getFeedbacksByItemId: (id) => {
        return get().feedbacks.filter(f => f.tastingItemId === id);
      },

      getItemsByStatus: (status) => {
        return get().items.filter(item => item.status === status);
      },

      markAsReady: (id) => {
        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, status: 'ready' } : item
          ),
        }));
      },

      resetData: () => {
        const items = generateMockTastingItems();
        const feedbacks = generateMockFeedbacks(items);
        set({
          items: items.map(item => ({
            ...item,
            status: determineStatus(item, feedbacks.filter(f => f.tastingItemId === item.id)),
          })),
          feedbacks,
        });
      },
    }),
    {
      name: 'tasting-feedback-storage',
    }
  )
);
