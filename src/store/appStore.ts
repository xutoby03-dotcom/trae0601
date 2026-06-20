import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Equipment, Inspection, Task, EquipmentStatus } from '@/types';
import { mockEquipments, mockInspections, mockTasks } from '@/data/mockData';

interface AppState {
  equipments: Equipment[];
  inspections: Inspection[];
  tasks: Task[];
  
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt'>) => void;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  getEquipment: (id: string) => Equipment | undefined;
  
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  getTodayInspections: () => Inspection[];
  getEquipmentInspections: (equipmentId: string) => Inspection[];
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  getPendingTasks: () => Task[];
  getProcessingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  
  isPoolReady: () => boolean;
  getAbnormalEquipments: () => Equipment[];
  getZonePassRates: () => { zone: string; passRate: number; total: number; passed: number }[];
  getTodayStats: () => {
    inspected: number;
    pending: number;
    abnormal: number;
    processingTasks: number;
    overallPassRate: number;
  };
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      equipments: mockEquipments,
      inspections: mockInspections,
      tasks: mockTasks,

      addEquipment: (equipment) =>
        set((state) => ({
          equipments: [
            ...state.equipments,
            { ...equipment, id: generateId(), createdAt: new Date().toISOString().split('T')[0] },
          ],
        })),

      updateEquipment: (id, data) =>
        set((state) => ({
          equipments: state.equipments.map((eq) =>
            eq.id === id ? { ...eq, ...data } : eq
          ),
        })),

      deleteEquipment: (id) =>
        set((state) => ({
          equipments: state.equipments.filter((eq) => eq.id !== id),
        })),

      getEquipment: (id) => get().equipments.find((eq) => eq.id === id),

      addInspection: (inspection) => {
        const newInspection = { ...inspection, id: generateId() };
        set((state) => {
          const newStatus: EquipmentStatus = inspection.status === 'pass' ? 'normal' : 'abnormal';
          const updatedEquipments = state.equipments.map((eq) =>
            eq.id === inspection.equipmentId
              ? {
                  ...eq,
                  lastInspectionDate: inspection.inspectionDate,
                  status: newStatus,
                }
              : eq
          );

          let newTasks = [...state.tasks];
          if (inspection.status === 'fail') {
            const abnormalItems = inspection.items
              .filter((item) => item.isAbnormal)
              .map((item) => item.itemName);

            const equipment = state.equipments.find((eq) => eq.id === inspection.equipmentId);

            const isReplaceNeeded = inspection.items.some((item) => {
              if (!item.isAbnormal) return false;
              const { itemKey, rawValue } = item;
              
              switch (itemKey) {
                case 'agingCondition':
                  return rawValue === 'severe';
                case 'ropeCondition':
                  return rawValue === 'missing';
                case 'ropeLength':
                  return parseFloat(rawValue) < 6;
                case 'crackCondition':
                  return rawValue === 'severe';
                case 'hookCondition':
                  return rawValue === 'missing';
                case 'lengthOk':
                  return rawValue === 'false';
                case 'clarity':
                  return rawValue === 'unreadable';
                case 'fixation':
                  return rawValue === 'missing';
                case 'completeness':
                  return rawValue === 'empty';
                case 'expiryOk':
                  return rawValue === 'false';
                case 'sealCondition':
                  return rawValue === 'damaged';
                case 'viewBlocked':
                  return rawValue === 'true';
                case 'working':
                  return rawValue === 'false';
                case 'angleOk':
                  return rawValue === 'false';
                default:
                  return false;
              }
            });

            newTasks.push({
              id: generateId(),
              equipmentId: inspection.equipmentId,
              equipmentName: equipment?.name,
              equipmentCode: equipment?.code,
              equipmentLocation: equipment?.location,
              inspectionId: newInspection.id,
              type: isReplaceNeeded ? 'replace' : 'repair',
              status: 'pending',
              assignee: equipment?.responsiblePerson || '陈运维',
              description: inspection.remark || abnormalItems.join('、') + '存在异常，需处理',
              abnormalItems,
              createdAt: new Date().toISOString().split('T')[0],
            });
          }

          return {
            inspections: [...state.inspections, newInspection],
            equipments: updatedEquipments,
            tasks: newTasks,
          };
        });
      },

      getTodayInspections: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().inspections.filter((ins) => ins.inspectionDate === today);
      },

      getEquipmentInspections: (equipmentId) =>
        get()
          .inspections.filter((ins) => ins.equipmentId === equipmentId)
          .sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate)),

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: generateId(), createdAt: new Date().toISOString().split('T')[0] },
          ],
        })),

      updateTask: (id, data) =>
        set((state) => {
          const updatedTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...data } : task
          );

          let updatedEquipments = state.equipments;
          const completedTask = updatedTasks.find((t) => t.id === id);
          if (completedTask && data.status === 'completed') {
            updatedEquipments = state.equipments.map((eq) =>
              eq.id === completedTask.equipmentId
                ? { ...eq, status: 'normal' }
                : eq
            );
          }

          return { tasks: updatedTasks, equipments: updatedEquipments };
        }),

      getPendingTasks: () => get().tasks.filter((t) => t.status === 'pending'),
      getProcessingTasks: () => get().tasks.filter((t) => t.status === 'processing'),
      getCompletedTasks: () => get().tasks.filter((t) => t.status === 'completed'),

      isPoolReady: () => {
        const { equipments, tasks, inspections } = get();
        const today = new Date().toISOString().split('T')[0];
        const todayInspections = inspections.filter((ins) => ins.inspectionDate === today);
        const inspectedIds = new Set(todayInspections.map((i) => i.equipmentId));
        
        const allInspected = equipments.every((eq) => inspectedIds.has(eq.id));
        const hasFailedToday = todayInspections.some((ins) => ins.status === 'fail');
        const hasAbnormal = equipments.some((eq) => eq.status === 'abnormal');
        const hasPendingCritical = tasks.some(
          (t) => (t.status === 'pending' || t.status === 'processing') && t.type === 'replace'
        );
        return allInspected && !hasFailedToday && !hasAbnormal && !hasPendingCritical;
      },

      getAbnormalEquipments: () =>
        get().equipments.filter((eq) => eq.status === 'abnormal' || eq.status === 'maintaining'),

      getZonePassRates: () => {
        const { equipments, inspections } = get();
        const zones = [...new Set(equipments.map((eq) => eq.zone))];
        const today = new Date().toISOString().split('T')[0];

        return zones.map((zone) => {
          const zoneEquipments = equipments.filter((eq) => eq.zone === zone);
          const zoneTodayInspections = inspections.filter(
            (ins) =>
              ins.inspectionDate === today &&
              zoneEquipments.some((eq) => eq.id === ins.equipmentId)
          );

          const passed = zoneTodayInspections.filter((ins) => ins.status === 'pass').length;
          const total = zoneEquipments.length;
          const inspectedCount = zoneTodayInspections.length;
          const passRate = inspectedCount > 0 ? Math.round((passed / inspectedCount) * 100) : (total === zoneEquipments.filter(e => e.status === 'normal').length ? 100 : Math.round((zoneEquipments.filter(e => e.status === 'normal').length / total) * 100));

          return {
            zone,
            passRate: Math.min(passRate, 100),
            total,
            passed: zoneEquipments.filter((e) => e.status === 'normal').length,
          };
        });
      },

      getTodayStats: () => {
        const { equipments, inspections, tasks } = get();
        const today = new Date().toISOString().split('T')[0];
        const todayInspections = inspections.filter((ins) => ins.inspectionDate === today);
        const inspected = todayInspections.length;
        const pending = equipments.length - inspected;
        const abnormal = equipments.filter((eq) => eq.status === 'abnormal').length;
        const processingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'processing').length;
        const overallPassRate =
          todayInspections.length > 0
            ? Math.round(
                (todayInspections.filter((ins) => ins.status === 'pass').length /
                  todayInspections.length) *
                  100
              )
            : equipments.length > 0
            ? Math.round(
                (equipments.filter((e) => e.status === 'normal').length / equipments.length) * 100
              )
            : 100;

        return { inspected, pending, abnormal, processingTasks, overallPassRate };
      },
    }),
    {
      name: 'pool-inspection-store',
    }
  )
);
