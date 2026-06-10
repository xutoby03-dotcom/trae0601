import { create } from 'zustand';
import type { PetMissing, Clue, GroupType, Statistics } from '@/types';
import { getPetMissingData, savePetMissingData, getClueData, saveClueData, generateId } from '@/utils/storage';
import { mockPetMissing, mockClues } from '@/data/mockData';
import { getHoursAgo, getDurationHours, formatDate } from '@/utils/time';

interface PetStore {
  petMissing: PetMissing[];
  clues: Clue[];
  currentGroup: GroupType;
  loading: boolean;
  initData: () => void;
  setCurrentGroup: (group: GroupType) => void;
  addPetMissing: (data: Omit<PetMissing, 'id' | 'status' | 'createdAt'>) => void;
  addClue: (data: Omit<Clue, 'id' | 'createdAt'>) => void;
  markAsFound: (id: string, foundProcess: string, thankYou: string) => void;
  getPetById: (id: string) => PetMissing | undefined;
  getCluesByMissingId: (missingId: string) => Clue[];
  getGroupedPets: () => { recent: PetMissing[]; seen: PetMissing[]; found: PetMissing[]; urgent: PetMissing[] };
  getStatistics: () => Statistics;
}

export const usePetStore = create<PetStore>((set, get) => ({
  petMissing: [],
  clues: [],
  currentGroup: 'recent',
  loading: true,

  initData: () => {
    let pets = getPetMissingData();
    let clues = getClueData();

    if (pets.length === 0) {
      pets = mockPetMissing;
      savePetMissingData(pets);
    }
    if (clues.length === 0) {
      clues = mockClues;
      saveClueData(clues);
    }

    set({ petMissing: pets, clues, loading: false });
  },

  setCurrentGroup: (group: GroupType) => {
    set({ currentGroup: group });
  },

  addPetMissing: (data) => {
    const newPet: PetMissing = {
      ...data,
      id: generateId(),
      status: 'missing',
      createdAt: new Date().toISOString(),
    };
    const pets = [...get().petMissing, newPet];
    set({ petMissing: pets });
    savePetMissingData(pets);
  },

  addClue: (data) => {
    const newClue: Clue = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const clues = [...get().clues, newClue];
    set({ clues });
    saveClueData(clues);

    const pets = get().petMissing.map(p => 
      p.id === data.missingId ? { ...p, status: 'seen' as const } : p
    );
    set({ petMissing: pets });
    savePetMissingData(pets);
  },

  markAsFound: (id: string, foundProcess: string, thankYou: string) => {
    const pets = get().petMissing.map(p => 
      p.id === id ? { 
        ...p, 
        status: 'found' as const, 
        foundTime: new Date().toISOString(),
        foundProcess,
        thankYou,
      } : p
    );
    set({ petMissing: pets });
    savePetMissingData(pets);
  },

  getPetById: (id: string) => {
    return get().petMissing.find(p => p.id === id);
  },

  getCluesByMissingId: (missingId: string) => {
    return get().clues.filter(c => c.missingId === missingId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getGroupedPets: () => {
    const pets = get().petMissing;
    const clues = get().clues;

    const now = Date.now();
    const twentyFourHours = 24 * 3600000;
    const seventyTwoHours = 72 * 3600000;

    const recent = pets.filter(p => {
      const age = now - new Date(p.createdAt).getTime();
      return p.status === 'missing' && age <= twentyFourHours;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const seen = pets.filter(p => {
      if (p.status !== 'seen') return false;
      const petClues = clues.filter(c => c.missingId === p.id);
      if (petClues.length === 0) return false;
      const latestClue = petClues.reduce((latest, c) => 
        new Date(c.createdAt).getTime() > new Date(latest.createdAt).getTime() ? c : latest
      );
      const clueAge = now - new Date(latestClue.createdAt).getTime();
      return clueAge <= twentyFourHours;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const found = pets.filter(p => p.status === 'found')
      .sort((a, b) => new Date(b.foundTime || b.createdAt).getTime() - new Date(a.foundTime || a.createdAt).getTime());

    const urgent = pets.filter(p => {
      if (p.status === 'found') return false;
      const lostHours = getHoursAgo(p.lostTime);
      return p.urgent || lostHours >= 72;
    }).sort((a, b) => {
      const aHours = getHoursAgo(a.lostTime);
      const bHours = getHoursAgo(b.lostTime);
      return bHours - aHours;
    });

    return { recent, seen, found, urgent };
  },

  getStatistics: () => {
    const pets = get().petMissing;
    const clues = get().clues;

    const totalMissing = pets.filter(p => p.status !== 'found').length;
    const totalFound = pets.filter(p => p.status === 'found').length;
    const total = pets.length;
    const recoveryRate = total > 0 ? Math.round((totalFound / total) * 100) : 0;

    const foundPets = pets.filter(p => p.status === 'found' && p.foundTime);
    const recoveryTimes = foundPets.map(p => getDurationHours(p.lostTime, p.foundTime!));
    const averageRecoveryTime = recoveryTimes.length > 0 
      ? Math.round(recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length)
      : 0;

    const areaCounts: Record<string, number> = {};
    clues.forEach(c => {
      const area = c.location.split('区')[0] + '区';
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });
    const topAreas = Object.entries(areaCounts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const dailyTrend: { date: string; missing: number; found: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date.toISOString());
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const missing = pets.filter(p => {
        const created = new Date(p.createdAt);
        return created >= date && created < nextDate;
      }).length;

      const found = pets.filter(p => {
        if (!p.foundTime) return false;
        const found = new Date(p.foundTime);
        return found >= date && found < nextDate;
      }).length;

      dailyTrend.push({ date: dateStr, missing, found });
    }

    return {
      totalMissing,
      totalFound,
      recoveryRate,
      averageRecoveryTime,
      topAreas,
      dailyTrend,
    };
  },
}));
