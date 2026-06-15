import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BirthdayPlan, Task, TaskColumn, TimelineNode, Participant, SecrecyLevel } from '../types';
import { mockPlan } from '../data/mockData';
import { generateCodeName, generateId, getAvatarColor } from '../utils';

interface PlanState {
  plan: BirthdayPlan;
  planCreated: boolean;
  revealSecrets: boolean;
  setRevealSecrets: (v: boolean) => void;

  createPlan: (data: {
    mainCharacter: string;
    date: string;
    meetingPoint: string;
    totalBudget: number;
    secrecyLevel: SecrecyLevel;
    participants: { name: string; isMainCharacter: boolean }[];
  }) => void;

  resetPlan: () => void;

  loadExamplePlan: () => void;

  updatePlanHeader: (data: Partial<Pick<BirthdayPlan, 'mainCharacter' | 'date' | 'meetingPoint' | 'totalBudget' | 'secrecyLevel'>>) => void;

  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  setMainCharacter: (id: string) => void;

  addTask: (column: TaskColumn, data: Partial<Task>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, newColumn: TaskColumn) => void;
  toggleTaskComplete: (id: string) => void;

  addTimelineNode: (data: Partial<TimelineNode>) => void;
  updateTimelineNode: (id: string, data: Partial<TimelineNode>) => void;
  removeTimelineNode: (id: string) => void;
  toggleTimelineComplete: (id: string) => void;
}

const emptyPlan: BirthdayPlan = {
  id: '',
  mainCharacter: '',
  date: '',
  meetingPoint: '',
  totalBudget: 0,
  secrecyLevel: 'normal',
  participants: [],
  tasks: [],
  timeline: [],
};

const initialState: Omit<PlanState,
  | 'setRevealSecrets'
  | 'createPlan'
  | 'resetPlan'
  | 'loadExamplePlan'
  | 'updatePlanHeader'
  | 'addParticipant'
  | 'removeParticipant'
  | 'setMainCharacter'
  | 'addTask'
  | 'updateTask'
  | 'removeTask'
  | 'moveTask'
  | 'toggleTaskComplete'
  | 'addTimelineNode'
  | 'updateTimelineNode'
  | 'removeTimelineNode'
  | 'toggleTimelineComplete'
> = {
  plan: emptyPlan,
  planCreated: false,
  revealSecrets: false,
};

type PersistedState = PlanState | {
  plan: BirthdayPlan;
  revealSecrets?: boolean;
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRevealSecrets: (v) => set({ revealSecrets: v }),

      createPlan: (data) => {
        const participants: Participant[] = data.participants.map((p, idx) => ({
          id: generateId(),
          name: p.name,
          avatarColor: getAvatarColor(idx),
          isMainCharacter: p.isMainCharacter,
        }));
        const mainChar = participants.find((p) => p.isMainCharacter);
        const newPlan: BirthdayPlan = {
          id: generateId(),
          mainCharacter: mainChar?.name || data.mainCharacter,
          date: data.date,
          meetingPoint: data.meetingPoint,
          totalBudget: data.totalBudget,
          secrecyLevel: data.secrecyLevel,
          participants,
          tasks: [],
          timeline: [],
        };
        set({ plan: newPlan, planCreated: true });
      },

      resetPlan: () => {
        set({ plan: emptyPlan, planCreated: false, revealSecrets: false });
      },

      loadExamplePlan: () => {
        set({ plan: { ...mockPlan, id: generateId() }, planCreated: true });
      },

      updatePlanHeader: (data) =>
        set((state) => ({
          plan: { ...state.plan, ...data },
        })),

      addParticipant: (name) =>
        set((state) => {
          const idx = state.plan.participants.length;
          const newP: Participant = {
            id: generateId(),
            name: name.trim(),
            avatarColor: getAvatarColor(idx),
            isMainCharacter: false,
          };
          return {
            plan: { ...state.plan, participants: [...state.plan.participants, newP] },
          };
        }),

      removeParticipant: (id) =>
        set((state) => ({
          plan: {
            ...state.plan,
            participants: state.plan.participants.filter((p) => p.id !== id),
          },
        })),

      setMainCharacter: (id) =>
        set((state) => {
          const target = state.plan.participants.find((p) => p.id === id);
          return {
            plan: {
              ...state.plan,
              mainCharacter: target?.name || '',
              participants: state.plan.participants.map((p) => ({
                ...p,
                isMainCharacter: p.id === id,
              })),
            },
          };
        }),

      addTask: (column, data) =>
        set((state) => {
          const newTask: Task = {
            id: generateId(),
            column,
            title: data.title || '新任务',
            codeName: generateCodeName(),
            assigneeId: data.assigneeId || null,
            deadline: data.deadline || state.plan.date,
            budget: data.budget || 0,
            isPaid: data.isPaid || false,
            photoEvidence: data.photoEvidence || [],
            isSecret: data.isSecret || (column === 'secret'),
            completed: false,
            notes: data.notes || '',
          };
          return {
            plan: { ...state.plan, tasks: [...state.plan.tasks, newTask] },
          };
        }),

      updateTask: (id, data) =>
        set((state) => ({
          plan: {
            ...state.plan,
            tasks: state.plan.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
          },
        })),

      removeTask: (id) =>
        set((state) => ({
          plan: { ...state.plan, tasks: state.plan.tasks.filter((t) => t.id !== id) },
        })),

      moveTask: (id, newColumn) =>
        set((state) => ({
          plan: {
            ...state.plan,
            tasks: state.plan.tasks.map((t) =>
              t.id === id ? { ...t, column: newColumn, isSecret: newColumn === 'secret' ? true : t.isSecret } : t
            ),
          },
        })),

      toggleTaskComplete: (id) =>
        set((state) => ({
          plan: {
            ...state.plan,
            tasks: state.plan.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
          },
        })),

      addTimelineNode: (data) =>
        set((state) => {
          const newNode: TimelineNode = {
            id: generateId(),
            time: data.time || '20:00',
            title: data.title || '新节点',
            description: data.description || '',
            assigneeId: data.assigneeId || null,
            icon: data.icon || '📍',
            order: state.plan.timeline.length,
            completed: false,
          };
          return {
            plan: { ...state.plan, timeline: [...state.plan.timeline, newNode].sort((a, b) => a.order - b.order) },
          };
        }),

      updateTimelineNode: (id, data) =>
        set((state) => ({
          plan: {
            ...state.plan,
            timeline: state.plan.timeline.map((n) =>
              n.id === id ? { ...n, ...data } : n
            ).sort((a, b) => a.order - b.order),
          },
        })),

      removeTimelineNode: (id) =>
        set((state) => ({
          plan: { ...state.plan, timeline: state.plan.timeline.filter((n) => n.id !== id) },
        })),

      toggleTimelineComplete: (id) =>
        set((state) => ({
          plan: {
            ...state.plan,
            timeline: state.plan.timeline.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n)),
          },
        })),
    }),
    {
      name: 'birthday_plan_data',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as PersistedState;

        // Version 0: 老数据只有 plan，没有 planCreated
        // 一律重置为空状态，避免历史 mockPlan 混进正式看板
        if (version === 0) {
          return {
            ...initialState,
            revealSecrets: state?.revealSecrets ?? false,
          };
        }

        // Version >= 1：只认 planCreated === true，其他字段补默认
        if (state && 'planCreated' in state) {
          return {
            ...initialState,
            ...state,
            plan: state.plan ?? emptyPlan,
            revealSecrets: state.revealSecrets ?? false,
          } as PlanState;
        }

        return { ...initialState } as PlanState;
      },
    }
  )
);
