import { create } from 'zustand';
import type { ChecklistTarget, DeepSkyTarget, EquipmentItem, ObservationRecord } from '@/types';
import { DEFAULT_EQUIPMENT } from '@/data/equipment';
import { DEEP_SKY_TARGETS } from '@/data/constellations';

const CHECKLIST_PREFIX = 'astro-plan-checklist-';
const EQUIPMENT_KEY = 'astro-plan-equipment';
const RECORDS_KEY = 'astro-plan-records';
const SELECTED_DATE_KEY = 'astro-plan-selected-date';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface AstroState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  checklistTargets: ChecklistTarget[];
  addTarget: (date: string, target: DeepSkyTarget) => void;
  removeTarget: (id: string) => void;
  updateTargetNotes: (id: string, notes: string) => void;
  reorderTargets: (fromIndex: number, toIndex: number) => void;
  toggleTargetCompleted: (id: string) => void;
  isTargetInChecklist: (date: string, targetId: string) => boolean;
  loadChecklist: (date: string) => void;

  equipment: EquipmentItem[];
  toggleEquipment: (id: string) => void;
  addCustomEquipment: (name: string, category: EquipmentItem['category']) => void;
  removeEquipment: (id: string) => void;
  resetEquipment: () => void;
  getPackedProgress: () => { total: number; packed: number; percent: number };

  records: ObservationRecord[];
  saveRecord: (record: Omit<ObservationRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, patch: Partial<ObservationRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordsByDate: (date: string) => ObservationRecord[];
  getRecordsByTarget: (targetId: string) => ObservationRecord[];
  getStatistics: () => {
    totalSessions: number;
    totalTargets: number;
    successCount: number;
    successRate: number;
    totalExposureMinutes: number;
    typeBreakdown: Record<string, number>;
  };
}

function getTargetById(id: string): DeepSkyTarget | undefined {
  return DEEP_SKY_TARGETS.find(t => t.id === id);
}

export const useAstroStore = create<AstroState>((set, get) => ({
  selectedDate: loadJSON(SELECTED_DATE_KEY, todayStr()),
  setSelectedDate: (date: string) => {
    saveJSON(SELECTED_DATE_KEY, date);
    set({ selectedDate: date });
    get().loadChecklist(date);
  },

  checklistTargets: loadJSON<ChecklistTarget[]>(CHECKLIST_PREFIX + todayStr(), []),
  addTarget: (date: string, target: DeepSkyTarget) => {
    const state = get();
    if (state.isTargetInChecklist(date, target.id)) return;
    const newItem: ChecklistTarget = {
      id: `${date}-${target.id}-${Date.now()}`,
      planDate: date,
      targetId: target.id,
      target,
      order: state.checklistTargets.length,
      notes: '',
      completed: false,
    };
    const newList = [...state.checklistTargets, newItem];
    saveJSON(CHECKLIST_PREFIX + date, newList);
    set({ checklistTargets: newList });
  },
  removeTarget: (id: string) => {
    const state = get();
    const item = state.checklistTargets.find(t => t.id === id);
    if (!item) return;
    const newList = state.checklistTargets.filter(t => t.id !== id);
    saveJSON(CHECKLIST_PREFIX + item.planDate, newList);
    set({ checklistTargets: newList });
  },
  updateTargetNotes: (id: string, notes: string) => {
    const state = get();
    const item = state.checklistTargets.find(t => t.id === id);
    if (!item) return;
    const newList = state.checklistTargets.map(t => t.id === id ? { ...t, notes } : t);
    saveJSON(CHECKLIST_PREFIX + item.planDate, newList);
    set({ checklistTargets: newList });
  },
  reorderTargets: (fromIndex: number, toIndex: number) => {
    const state = get();
    const list = [...state.checklistTargets];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    const reordered = list.map((t, i) => ({ ...t, order: i }));
    const date = reordered[0]?.planDate ?? state.selectedDate;
    saveJSON(CHECKLIST_PREFIX + date, reordered);
    set({ checklistTargets: reordered });
  },
  toggleTargetCompleted: (id: string) => {
    const state = get();
    const item = state.checklistTargets.find(t => t.id === id);
    if (!item) return;
    const newList = state.checklistTargets.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveJSON(CHECKLIST_PREFIX + item.planDate, newList);
    set({ checklistTargets: newList });
  },
  isTargetInChecklist: (date: string, targetId: string) => {
    const list = loadJSON<ChecklistTarget[]>(CHECKLIST_PREFIX + date, []);
    return list.some(t => t.targetId === targetId);
  },
  loadChecklist: (date: string) => {
    const list = loadJSON<ChecklistTarget[]>(CHECKLIST_PREFIX + date, []);
    set({ checklistTargets: list });
  },

  equipment: loadJSON<EquipmentItem[]>(EQUIPMENT_KEY, DEFAULT_EQUIPMENT.map(e => ({ ...e }))),
  toggleEquipment: (id: string) => {
    const newList = get().equipment.map(e => e.id === id ? { ...e, packed: !e.packed } : e);
    saveJSON(EQUIPMENT_KEY, newList);
    set({ equipment: newList });
  },
  addCustomEquipment: (name: string, category: EquipmentItem['category']) => {
    const catLabels: Record<string, string> = {
      optics: '光学设备', imaging: '摄影设备', mount: '赤道仪/支架', accessory: '辅助装备', power: '电源供给',
    };
    const newItem: EquipmentItem = {
      id: `custom-${Date.now()}`,
      name,
      category,
      categoryLabel: catLabels[category] ?? '辅助装备',
      essential: false,
      packed: false,
    };
    const newList = [...get().equipment, newItem];
    saveJSON(EQUIPMENT_KEY, newList);
    set({ equipment: newList });
  },
  removeEquipment: (id: string) => {
    const newList = get().equipment.filter(e => e.id !== id);
    saveJSON(EQUIPMENT_KEY, newList);
    set({ equipment: newList });
  },
  resetEquipment: () => {
    const reset = DEFAULT_EQUIPMENT.map(e => ({ ...e, packed: false }));
    saveJSON(EQUIPMENT_KEY, reset);
    set({ equipment: reset });
  },
  getPackedProgress: () => {
    const list = get().equipment;
    const total = list.length;
    const packed = list.filter(e => e.packed).length;
    return { total, packed, percent: total === 0 ? 0 : Math.round((packed / total) * 100) };
  },

  records: loadJSON<ObservationRecord[]>(RECORDS_KEY, []),
  saveRecord: (record) => {
    const newRecord: ObservationRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    const newList = [newRecord, ...get().records];
    saveJSON(RECORDS_KEY, newList);
    set({ records: newList });
  },
  updateRecord: (id: string, patch: Partial<ObservationRecord>) => {
    const newList = get().records.map(r => r.id === id ? { ...r, ...patch } : r);
    saveJSON(RECORDS_KEY, newList);
    set({ records: newList });
  },
  deleteRecord: (id: string) => {
    const newList = get().records.filter(r => r.id !== id);
    saveJSON(RECORDS_KEY, newList);
    set({ records: newList });
  },
  getRecordsByDate: (date: string) => get().records.filter(r => r.date === date),
  getRecordsByTarget: (targetId: string) => get().records.filter(r => r.targetId === targetId),
  getStatistics: () => {
    const records = get().records;
    const sessions = new Set(records.map(r => r.date)).size;
    const successes = records.filter(r => r.seen).length;
    let exposure = 0;
    records.forEach(r => {
      const matches = r.totalExposure?.match(/(\d+)\s*(小时|h|分钟|min)/i);
      if (matches) {
        const value = parseFloat(matches[1]);
        if (/小时|h/i.test(matches[2])) exposure += value * 60;
        else exposure += value;
      }
      const numFrames = Number(r.frames) || 0;
      const shutterStr = r.shutter || '';
      const sMatch = shutterStr.match(/(\d+(\.\d+)?)\s*s?/);
      if (sMatch && numFrames > 0 && !matches) {
        exposure += (parseFloat(sMatch[1]) * numFrames) / 60;
      }
    });
    const typeBreakdown: Record<string, number> = {};
    records.forEach(r => {
      const target = getTargetById(r.targetId);
      if (target) {
        typeBreakdown[target.typeLabel] = (typeBreakdown[target.typeLabel] ?? 0) + 1;
      }
    });
    return {
      totalSessions: sessions,
      totalTargets: records.length,
      successCount: successes,
      successRate: records.length === 0 ? 0 : Math.round((successes / records.length) * 100),
      totalExposureMinutes: Math.round(exposure),
      typeBreakdown,
    };
  },
}));

export { getTargetById };
