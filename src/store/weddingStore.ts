import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, TimelineNode, Task, Item, Handover, MemberWorkload, TimeConflict, TaskStatus } from '@/types';
import { mockMembers, mockTimelineNodes, mockTasks, mockItems, mockHandovers } from '@/data/mockData';

interface WeddingState {
  members: Member[];
  timelineNodes: TimelineNode[];
  tasks: Task[];
  items: Item[];
  handovers: Handover[];
  currentTime: string;

  setCurrentTime: (time: string) => void;
  confirmTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  confirmHandoverFrom: (handoverId: string) => void;
  confirmHandoverTo: (handoverId: string) => void;
  createHandover: (handover: Omit<Handover, 'id'>) => void;
  getMemberById: (id: string) => Member | undefined;
  getTasksByNodeId: (nodeId: string) => Task[];
  getTasksByMemberId: (memberId: string) => Task[];
  getHandoversByItemId: (itemId: string) => Handover[];
  getLateTasks: () => Task[];
  getPendingTasks: () => Task[];
  getUnconfirmedHandovers: () => Handover[];
  getMemberWorkloads: () => MemberWorkload[];
  getTimeConflicts: () => TimeConflict[];
  resetAllData: () => void;
}

const parseTimeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
};

const getTaskTimeRange = (task: Task, nodes: TimelineNode[]): { start: number; end: number } | null => {
  const node = nodes.find(n => n.id === task.timelineNodeId);
  if (!node) return null;

  const timeMatch = node.time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!timeMatch) return null;

  return {
    start: parseTimeToMinutes(timeMatch[1]),
    end: parseTimeToMinutes(timeMatch[2]),
  };
};

const checkTimeOverlap = (task1: Task, task2: Task, nodes: TimelineNode[]): number => {
  const range1 = getTaskTimeRange(task1, nodes);
  const range2 = getTaskTimeRange(task2, nodes);

  if (!range1 || !range2) return 0;

  const overlapStart = Math.max(range1.start, range2.start);
  const overlapEnd = Math.min(range1.end, range2.end);

  if (overlapStart < overlapEnd) {
    return overlapEnd - overlapStart;
  }
  return 0;
};

export const useWeddingStore = create<WeddingState>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      timelineNodes: mockTimelineNodes,
      tasks: mockTasks,
      items: mockItems,
      handovers: mockHandovers,
      currentTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),

      setCurrentTime: (time: string) => set({ currentTime: time }),

      confirmTask: (taskId: string) =>
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? { ...t, status: 'confirmed' as TaskStatus, confirmedAt: new Date().toISOString() }
              : t
          ),
        })),

      updateTaskStatus: (taskId: string, status: TaskStatus) =>
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? { ...t, status, confirmedAt: status === 'confirmed' ? new Date().toISOString() : t.confirmedAt }
              : t
          ),
        })),

      confirmHandoverFrom: (handoverId: string) =>
        set(state => ({
          handovers: state.handovers.map(h =>
            h.id === handoverId ? { ...h, fromConfirmed: true } : h
          ),
        })),

      confirmHandoverTo: (handoverId: string) => {
        const handover = get().handovers.find(h => h.id === handoverId);
        if (!handover) return;

        set(state => ({
          handovers: state.handovers.map(h =>
            h.id === handoverId ? { ...h, toConfirmed: true } : h
          ),
          items: state.items.map(i =>
            i.id === handover.itemId ? { ...i, currentHolderId: handover.toMemberId, status: 'handedover' as const } : i
          ),
        }));
      },

      createHandover: (handover: Omit<Handover, 'id'>) =>
        set(state => ({
          handovers: [...state.handovers, { ...handover, id: `h${Date.now()}` }],
          items: state.items.map(i =>
            i.id === handover.itemId ? { ...i, status: 'intransit' as const } : i
          ),
        })),

      getMemberById: (id: string) => get().members.find(m => m.id === id),

      getTasksByNodeId: (nodeId: string) =>
        get().tasks.filter(t => t.timelineNodeId === nodeId),

      getTasksByMemberId: (memberId: string) =>
        get().tasks.filter(t => t.responsibleId === memberId || t.backupId === memberId),

      getHandoversByItemId: (itemId: string) =>
        get().handovers.filter(h => h.itemId === itemId).sort((a, b) =>
          new Date(b.handoverTime).getTime() - new Date(a.handoverTime).getTime()
        ),

      getLateTasks: () => get().tasks.filter(t => t.status === 'late'),

      getPendingTasks: () => get().tasks.filter(t => t.status === 'pending'),

      getUnconfirmedHandovers: () =>
        get().handovers.filter(h => !h.fromConfirmed || !h.toConfirmed),

      getMemberWorkloads: (): MemberWorkload[] => {
        const { members, tasks, timelineNodes } = get();

        return members.map(member => {
          const memberTasks = tasks.filter(
            t => t.responsibleId === member.id || t.backupId === member.id
          );

          const confirmedTasks = memberTasks.filter(t => t.status === 'confirmed' || t.status === 'completed').length;
          const pendingTasks = memberTasks.filter(t => t.status === 'pending' || t.status === 'late').length;

          const conflicts: TimeConflict[] = [];
          for (let i = 0; i < memberTasks.length; i++) {
            for (let j = i + 1; j < memberTasks.length; j++) {
              const overlap = checkTimeOverlap(memberTasks[i], memberTasks[j], timelineNodes);
              if (overlap > 0) {
                const existingConflict = conflicts.find(c =>
                  c.tasks.some(t => t.id === memberTasks[i].id) &&
                  c.tasks.some(t => t.id === memberTasks[j].id)
                );
                if (!existingConflict) {
                  conflicts.push({
                    memberId: member.id,
                    memberName: member.name,
                    tasks: [memberTasks[i], memberTasks[j]],
                    overlapMinutes: overlap,
                  });
                }
              }
            }
          }

          return {
            memberId: member.id,
            memberName: member.name,
            memberRole: member.role,
            totalTasks: memberTasks.length,
            confirmedTasks,
            pendingTasks,
            conflicts,
            tasks: memberTasks,
          };
        }).sort((a, b) => b.totalTasks - a.totalTasks);
      },

      getTimeConflicts: (): TimeConflict[] => {
        const workloads = get().getMemberWorkloads();
        return workloads.flatMap(w => w.conflicts);
      },

      resetAllData: () =>
        set({
          members: mockMembers,
          timelineNodes: mockTimelineNodes,
          tasks: mockTasks,
          items: mockItems,
          handovers: mockHandovers,
        }),
    }),
    {
      name: 'wedding-coordination-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        items: state.items,
        handovers: state.handovers,
      }),
    }
  )
);
