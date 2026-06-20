import { create } from 'zustand';
import type { Mission, MissionEquipment, MissionStatus } from '../types';
import { mockMissions } from '../data/mockData';
import { saveToStorage, loadFromStorage, generateId } from '../utils/storage';

interface MissionState {
  missions: Mission[];
  isInitialized: boolean;

  init: () => void;

  addMission: (mission: Omit<Mission, 'id'>) => void;
  createMission: (mission: Omit<Mission, 'id'>) => Mission;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  updateMissionStatus: (id: string, status: MissionStatus) => void;

  addEquipmentToMission: (missionId: string, equipmentId: string, assignedTo?: string) => void;
  removeEquipmentFromMission: (missionId: string, missionEquipmentId: string) => void;
  updateEquipmentAssignment: (missionId: string, missionEquipmentId: string, assignedTo: string) => void;
  addKitToMission: (missionId: string, equipmentIds: string[]) => void;

  getMissionsByStatus: (status: MissionStatus) => Mission[];
  getUpcomingMissions: () => Mission[];
  getActiveMission: () => Mission | undefined;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  isInitialized: false,

  init: () => {
    if (get().isInitialized) return;

    const savedMissions = loadFromStorage<Mission[]>('missions');
    const missions = savedMissions || mockMissions;

    set({ missions, isInitialized: true });

    if (!savedMissions) saveToStorage('missions', missions);
  },

  addMission: (missionData) => {
    const newMission: Mission = {
      ...missionData,
      id: generateId('mission'),
    };
    const missions = [...get().missions, newMission];
    set({ missions });
    saveToStorage('missions', missions);
  },

  createMission: (missionData) => {
    const newMission: Mission = {
      ...missionData,
      id: generateId('mission'),
    };
    const missions = [...get().missions, newMission];
    set({ missions });
    saveToStorage('missions', missions);
    return newMission;
  },

  updateMission: (id, updates) => {
    const missions = get().missions.map(m =>
      m.id === id ? { ...m, ...updates } : m
    );
    set({ missions });
    saveToStorage('missions', missions);
  },

  deleteMission: (id) => {
    const missions = get().missions.filter(m => m.id !== id);
    set({ missions });
    saveToStorage('missions', missions);
  },

  updateMissionStatus: (id, status) => {
    get().updateMission(id, { status });
  },

  addEquipmentToMission: (missionId, equipmentId, assignedTo) => {
    const newMissionEquipment: MissionEquipment = {
      id: generateId('me'),
      equipmentId,
      assignedTo,
    };
    const missions = get().missions.map(m =>
      m.id === missionId
        ? { ...m, equipmentList: [...m.equipmentList, newMissionEquipment] }
        : m
    );
    set({ missions });
    saveToStorage('missions', missions);
  },

  removeEquipmentFromMission: (missionId, missionEquipmentId) => {
    const missions = get().missions.map(m =>
      m.id === missionId
        ? { ...m, equipmentList: m.equipmentList.filter(me => me.id !== missionEquipmentId) }
        : m
    );
    set({ missions });
    saveToStorage('missions', missions);
  },

  updateEquipmentAssignment: (missionId, missionEquipmentId, assignedTo) => {
    const missions = get().missions.map(m =>
      m.id === missionId
        ? {
            ...m,
            equipmentList: m.equipmentList.map(me =>
              me.id === missionEquipmentId ? { ...me, assignedTo } : me
            ),
          }
        : m
    );
    set({ missions });
    saveToStorage('missions', missions);
  },

  addKitToMission: (missionId, equipmentIds) => {
    const missions = get().missions.map(m => {
      if (m.id !== missionId) return m;

      const newEquipmentList = [...m.equipmentList];
      equipmentIds.forEach(eqId => {
        const exists = newEquipmentList.some(me => me.equipmentId === eqId);
        if (!exists) {
          newEquipmentList.push({
            id: generateId('me'),
            equipmentId: eqId,
          });
        }
      });

      return { ...m, equipmentList: newEquipmentList };
    });
    set({ missions });
    saveToStorage('missions', missions);
  },

  getMissionsByStatus: (status) => {
    return get().missions.filter(m => m.status === status);
  },

  getUpcomingMissions: () => {
    const now = new Date();
    return get().missions
      .filter(m => new Date(m.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },

  getActiveMission: () => {
    return get().missions.find(m => m.status === 'shooting' || m.status === 'packing');
  },
}));
