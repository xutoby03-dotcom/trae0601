import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Person, Item, ReviewRecord, ViewType, TaskStatus, Priority, TaskCategory } from '@/types';
import { mockTasks, mockPeople, mockReviewRecords } from '@/data/mockData';

interface TaskStore {
  tasks: Task[];
  people: Person[];
  reviewRecords: ReviewRecord[];
  currentView: ViewType;
  selectedTaskId: string | null;
  filterStatus: 'all' | TaskStatus;
  filterPriority: 'all' | Priority;
  filterCategory: 'all' | TaskCategory;
  currentUserId: string;

  setCurrentView: (view: ViewType) => void;
  setSelectedTaskId: (id: string | null) => void;
  setFilterStatus: (status: 'all' | TaskStatus) => void;
  setFilterPriority: (priority: 'all' | Priority) => void;
  setFilterCategory: (category: 'all' | TaskCategory) => void;
  setCurrentUserId: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'changeLogs' | 'isCompleted' | 'isOvertime' | 'itemList' | 'photos' | 'status'> & { itemList?: string[]; photos?: string[]; status?: TaskStatus }) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'itemList'>> & { itemList?: string[] | Item[] }) => void;
  updateTaskWithLog: (
    id: string,
    updates: Partial<Task>,
    logType: 'time' | 'person' | 'location' | 'item' | 'other',
    reason: string,
    oldValue?: string,
    newValue?: string
  ) => void;
  deleteTask: (id: string) => void;

  claimTask: (taskId: string, userId: string) => void;
  confirmTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;

  addChangeLog: (taskId: string, type: string, reason: string, operatorId: string, oldValue?: string, newValue?: string) => void;

  toggleItem: (taskId: string, itemId: string) => void;

  addReviewRecord: (record: Omit<ReviewRecord, 'id' | 'createdAt'>) => void;
  deleteReviewRecord: (id: string) => void;

  resetData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: mockTasks,
      people: mockPeople,
      reviewRecords: mockReviewRecords,
      currentView: 'board',
      selectedTaskId: null,
      filterStatus: 'all',
      filterPriority: 'all',
      filterCategory: 'all',
      currentUserId: 'p3',

      setCurrentView: (view) => set({ currentView: view }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
      setFilterCategory: (category) => set({ filterCategory: category }),
      setCurrentUserId: (id) => set({ currentUserId: id }),

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: generateId(),
              changeLogs: [],
              isCompleted: false,
              isOvertime: false,
              itemList: (taskData.itemList || []).map((name) => ({
                id: generateId(),
                name,
                isChecked: false,
              })),
              photos: taskData.photos || [],
            } as Task,
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const { itemList, ...restUpdates } = updates;
            const processedUpdates: Partial<Task> = { ...restUpdates };
            if (itemList !== undefined) {
              const isStringArray = itemList.length === 0 || typeof itemList[0] === 'string';
              if (isStringArray) {
                processedUpdates.itemList = (itemList as string[]).map((name) => ({
                  id: generateId(),
                  name,
                  isChecked: false,
                }));
              } else {
                processedUpdates.itemList = itemList as Item[];
              }
            }
            return { ...task, ...processedUpdates };
          }),
        })),

      updateTaskWithLog: (id, updates, logType, reason, oldValue, newValue) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  changeLogs: [
                    ...task.changeLogs,
                    {
                      id: generateId(),
                      type: logType,
                      reason,
                      timestamp: new Date().toISOString(),
                      operatorId: state.currentUserId,
                      oldValue,
                      newValue,
                    },
                  ],
                }
              : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
        })),

      claimTask: (taskId, userId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  assigneeId: userId,
                  status: 'claimed',
                  changeLogs: [
                    ...task.changeLogs,
                    {
                      id: generateId(),
                      type: 'person',
                      reason: '认领任务',
                      timestamp: new Date().toISOString(),
                      operatorId: userId,
                      newValue: userId,
                    },
                  ],
                }
              : task
          ),
        })),

      confirmTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'confirmed',
                  confirmedAt: new Date().toISOString(),
                  changeLogs: [
                    ...task.changeLogs,
                    {
                      id: generateId(),
                      type: 'other',
                      reason: '确认到位',
                      timestamp: new Date().toISOString(),
                      operatorId: task.assigneeId || '',
                    },
                  ],
                }
              : task
          ),
        })),

      completeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'completed',
                  isCompleted: true,
                  completedAt: new Date().toISOString(),
                }
              : task
          ),
        })),

      addChangeLog: (taskId, type, reason, operatorId, oldValue, newValue) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  changeLogs: [
                    ...task.changeLogs,
                    {
                      id: generateId(),
                      type: type as any,
                      reason,
                      timestamp: new Date().toISOString(),
                      operatorId,
                      oldValue,
                      newValue,
                    },
                  ],
                }
              : task
          ),
        })),

      toggleItem: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  itemList: task.itemList.map((item) =>
                    item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
                  ),
                }
              : task
          ),
        })),

      addReviewRecord: (record) =>
        set((state) => ({
          reviewRecords: [
            ...state.reviewRecords,
            {
              ...record,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteReviewRecord: (id) =>
        set((state) => ({
          reviewRecords: state.reviewRecords.filter((r) => r.id !== id),
        })),

      resetData: () =>
        set({
          tasks: mockTasks,
          people: mockPeople,
          reviewRecords: mockReviewRecords,
        }),
    }),
    {
      name: 'wedding-task-storage',
    }
  )
);
