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
            const abnormalInspectionItems = inspection.items.filter((item) => item.isAbnormal);
            const abnormalItems = abnormalInspectionItems.map((item) => item.itemName);

            const equipment = state.equipments.find((eq) => eq.id === inspection.equipmentId);

            const getItemDecision = (item: typeof inspection.items[0]) => {
              const { itemKey, rawValue, itemName } = item;
              switch (itemKey) {
                case 'agingCondition':
                  if (rawValue === 'severe') {
                    return { type: 'replace' as const, reason: `${itemName}为严重老化，需补采` };
                  } else if (rawValue === 'minor') {
                    return { type: 'repair' as const, reason: `${itemName}为轻微老化，可维修` };
                  }
                  return null;
                case 'ropeCondition':
                  if (rawValue === 'missing') {
                    return { type: 'replace' as const, reason: `${itemName}缺失，需补采` };
                  } else if (rawValue === 'damaged') {
                    return { type: 'replace' as const, reason: `${itemName}磨损严重，需更换` };
                  }
                  return null;
                case 'ropeLength':
                  if (parseFloat(rawValue) < 6) {
                    return { type: 'replace' as const, reason: `${itemName}不足6米，不达标需补采` };
                  }
                  return null;
                case 'crackCondition':
                  if (rawValue === 'severe') {
                    return { type: 'replace' as const, reason: `${itemName}为严重裂纹，存在安全隐患需补采` };
                  } else if (rawValue === 'minor') {
                    return { type: 'repair' as const, reason: `${itemName}为轻微裂纹，可维修加固` };
                  }
                  return null;
                case 'hookCondition':
                  if (rawValue === 'missing') {
                    return { type: 'replace' as const, reason: `${itemName}缺失，需补采` };
                  } else if (rawValue === 'damaged') {
                    return { type: 'repair' as const, reason: `${itemName}损坏，可维修` };
                  }
                  return null;
                case 'lengthOk':
                  if (rawValue === 'false') {
                    return { type: 'replace' as const, reason: `${itemName}不符合要求，需补采` };
                  }
                  return null;
                case 'clarity':
                  if (rawValue === 'unreadable') {
                    return { type: 'replace' as const, reason: `${itemName}无法辨认，需补采更换` };
                  } else if (rawValue === 'faded') {
                    return { type: 'repair' as const, reason: `${itemName}轻微褪色，可清洁或重新喷漆` };
                  }
                  return null;
                case 'fixation':
                  if (rawValue === 'missing') {
                    return { type: 'replace' as const, reason: `${itemName}缺失，需重新购置安装` };
                  } else if (rawValue === 'loose') {
                    return { type: 'repair' as const, reason: `${itemName}松动，需加固维修` };
                  }
                  return null;
                case 'completeness':
                  if (rawValue === 'empty') {
                    return { type: 'replace' as const, reason: `${itemName}为空，需补采补充` };
                  } else if (rawValue === 'partial') {
                    return { type: 'repair' as const, reason: `${itemName}部分缺失，可补充维修` };
                  }
                  return null;
                case 'expiryOk':
                  if (rawValue === 'false') {
                    return { type: 'replace' as const, reason: `药品已过期，需补采更换` };
                  }
                  return null;
                case 'sealCondition':
                  if (rawValue === 'damaged') {
                    return { type: 'repair' as const, reason: `${itemName}破损，需更换封条` };
                  }
                  return null;
                case 'viewBlocked':
                  if (rawValue === 'true') {
                    return { type: 'replace' as const, reason: `视野被严重遮挡，需调整或更换位置` };
                  }
                  return null;
                case 'working':
                  if (rawValue === 'false') {
                    return { type: 'replace' as const, reason: `摄像头不工作，需维修或更换` };
                  }
                  return null;
                case 'angleOk':
                  if (rawValue === 'false') {
                    return { type: 'repair' as const, reason: `角度不合适，需调整` };
                  }
                  return null;
                default:
                  return { type: 'repair' as const, reason: `${itemName}存在异常，需处理` };
              }
            };

            const decisions = abnormalInspectionItems.map((item) => {
              const decision = getItemDecision(item);
              if (decision) return decision;
              return { type: 'repair' as const, reason: `${item.itemName}存在异常，需处理` };
            });

            const abnormalItemSources = abnormalInspectionItems.map((item, idx) => ({
              itemKey: item.itemKey,
              itemName: item.itemName,
              rawValue: item.rawValue,
              itemValue: item.itemValue,
              type: decisions[idx].type,
              reason: decisions[idx].reason,
              description: item.description,
            }));

            const hasReplace = decisions.some((d) => d.type === 'replace');
            const taskType = hasReplace ? 'replace' : 'repair';
            const decisionReason = decisions.map((d) => d.reason).join('；');

            newTasks.push({
              id: generateId(),
              equipmentId: inspection.equipmentId,
              equipmentName: equipment?.name,
              equipmentCode: equipment?.code,
              equipmentLocation: equipment?.location,
              inspectionId: newInspection.id,
              type: taskType,
              status: 'pending',
              assignee: equipment?.responsiblePerson || '陈运维',
              description: inspection.remark || abnormalItems.join('、') + '存在异常，需处理',
              abnormalItems,
              abnormalItemSources,
              decisionReason,
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
