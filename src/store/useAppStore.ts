import { create } from 'zustand';
import type { Pet, Medicine, FeedingRecord, FeedingTask, ReactionType } from '@/types';
import { loadFromStorage, saveToStorage, generateMockData } from '@/utils/storage';
import { generateId, getTodayStr, isTimePast, addDays } from '@/utils/date';

interface AppState {
  pets: Pet[];
  medicines: Medicine[];
  feedingRecords: FeedingRecord[];
  initialized: boolean;
  
  init: () => void;
  generateDailyRecords: (date: string) => void;
  refreshTodayStatus: () => void;
  
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void;
  updatePet: (pet: Pet) => void;
  deletePet: (petId: string) => void;
  
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (medicineId: string) => void;
  
  markFed: (recordId: string, reaction: ReactionType, note: string) => void;
  markMissed: (recordId: string) => void;
  markSkipped: (recordId: string) => void;
  
  getTodayTasks: () => FeedingTask[];
  getMedicineById: (id: string) => Medicine | undefined;
  getPetById: (id: string) => Pet | undefined;
  getMedicinesByPetId: (petId: string) => Medicine[];
  getRunningOutMedicines: () => Medicine[];
}

const useAppStore = create<AppState>((set, get) => ({
  pets: [],
  medicines: [],
  feedingRecords: [],
  initialized: false,

  init: () => {
    const stored = loadFromStorage();
    if (stored) {
      set({
        pets: stored.pets,
        medicines: stored.medicines,
        feedingRecords: stored.feedingRecords,
        initialized: true,
      });
    } else {
      const mockData = generateMockData();
      set({
        pets: mockData.pets,
        medicines: mockData.medicines,
        feedingRecords: mockData.feedingRecords,
        initialized: true,
      });
      saveToStorage(mockData);
    }
    
    const today = getTodayStr();
    get().generateDailyRecords(today);
    get().refreshTodayStatus();
  },

  refreshTodayStatus: () => {
    const today = getTodayStr();
    const { feedingRecords } = get();
    let changed = false;
    
    const updatedRecords = feedingRecords.map(record => {
      if (record.date === today && record.status === 'pending') {
        if (isTimePast(record.timeSlot, 2)) {
          changed = true;
          return { ...record, status: 'missed' as const };
        }
      }
      return record;
    });
    
    if (changed) {
      set({ feedingRecords: updatedRecords });
      saveToStorage({
        pets: get().pets,
        medicines: get().medicines,
        feedingRecords: updatedRecords,
      });
    }
  },

  generateDailyRecords: (date: string) => {
    const { medicines, feedingRecords } = get();
    const newRecords: FeedingRecord[] = [];
    
    medicines.forEach(med => {
      const startDate = med.startDate;
      const endDate = addDays(med.startDate, med.durationDays - 1);
      
      if (date < startDate || date > endDate) return;
      
      med.timeSlots.forEach(timeSlot => {
        const existingRecord = feedingRecords.find(
          r => r.medicineId === med.id && r.date === date && r.timeSlot === timeSlot
        );
        
        if (!existingRecord) {
          const isMissed = isTimePast(timeSlot, 2);
          newRecords.push({
            id: generateId(),
            medicineId: med.id,
            date,
            timeSlot,
            status: isMissed ? 'missed' : 'pending',
            reaction: 'normal',
            note: '',
            fedAt: null,
          });
        }
      });
    });
    
    if (newRecords.length > 0) {
      const allRecords = [...feedingRecords, ...newRecords];
      set({ feedingRecords: allRecords });
      saveToStorage({
        pets: get().pets,
        medicines: get().medicines,
        feedingRecords: allRecords,
      });
    }
  },

  addPet: (petData) => {
    const newPet: Pet = {
      ...petData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const pets = [...get().pets, newPet];
    set({ pets });
    saveToStorage({ pets, medicines: get().medicines, feedingRecords: get().feedingRecords });
  },

  updatePet: (updatedPet) => {
    const pets = get().pets.map(p => p.id === updatedPet.id ? updatedPet : p);
    set({ pets });
    saveToStorage({ pets, medicines: get().medicines, feedingRecords: get().feedingRecords });
  },

  deletePet: (petId) => {
    const pets = get().pets.filter(p => p.id !== petId);
    const medicines = get().medicines.filter(m => m.petId !== petId);
    const medicineIds = get().medicines.filter(m => m.petId === petId).map(m => m.id);
    const feedingRecords = get().feedingRecords.filter(r => !medicineIds.includes(r.medicineId));
    set({ pets, medicines, feedingRecords });
    saveToStorage({ pets, medicines, feedingRecords });
  },

  addMedicine: (medicineData) => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const medicines = [...get().medicines, newMedicine];
    set({ medicines });
    
    const today = getTodayStr();
    get().generateDailyRecords(today);
    
    saveToStorage({ pets: get().pets, medicines, feedingRecords: get().feedingRecords });
  },

  updateMedicine: (updatedMedicine) => {
    const medicines = get().medicines.map(m => m.id === updatedMedicine.id ? updatedMedicine : m);
    set({ medicines });
    saveToStorage({ pets: get().pets, medicines, feedingRecords: get().feedingRecords });
  },

  deleteMedicine: (medicineId) => {
    const medicines = get().medicines.filter(m => m.id !== medicineId);
    const feedingRecords = get().feedingRecords.filter(r => r.medicineId !== medicineId);
    set({ medicines, feedingRecords });
    saveToStorage({ pets: get().pets, medicines, feedingRecords });
  },

  markFed: (recordId, reaction, note) => {
    const record = get().feedingRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const feedingRecords = get().feedingRecords.map(r =>
      r.id === recordId
        ? { ...r, status: 'fed' as const, reaction, note, fedAt: new Date().toISOString() }
        : r
    );
    
    const medicines = get().medicines.map(m => {
      if (m.id === record.medicineId) {
        const remaining = Math.max(0, m.remainingQuantity - 1);
        return { ...m, remainingQuantity: remaining };
      }
      return m;
    });
    
    set({ feedingRecords, medicines });
    saveToStorage({ pets: get().pets, medicines, feedingRecords });
  },

  markMissed: (recordId) => {
    const feedingRecords = get().feedingRecords.map(r =>
      r.id === recordId ? { ...r, status: 'missed' as const } : r
    );
    set({ feedingRecords });
    saveToStorage({ pets: get().pets, medicines: get().medicines, feedingRecords });
  },

  markSkipped: (recordId) => {
    const feedingRecords = get().feedingRecords.map(r =>
      r.id === recordId ? { ...r, status: 'skipped' as const } : r
    );
    set({ feedingRecords });
    saveToStorage({ pets: get().pets, medicines: get().medicines, feedingRecords });
  },

  getTodayTasks: () => {
    const today = getTodayStr();
    const { feedingRecords, medicines, pets } = get();
    
    return feedingRecords
      .filter(r => r.date === today)
      .map(record => {
        const medicine = medicines.find(m => m.id === record.medicineId);
        const pet = medicine ? pets.find(p => p.id === medicine.petId) : undefined;
        if (!medicine || !pet) return null;
        return { ...record, medicine, pet };
      })
      .filter(Boolean)
      .sort((a, b) => a!.timeSlot.localeCompare(b!.timeSlot)) as FeedingTask[];
  },

  getMedicineById: (id) => {
    return get().medicines.find(m => m.id === id);
  },

  getPetById: (id) => {
    return get().pets.find(p => p.id === id);
  },

  getMedicinesByPetId: (petId) => {
    return get().medicines.filter(m => m.petId === petId);
  },

  getRunningOutMedicines: () => {
    const { medicines } = get();
    return medicines.filter(m => {
      const dailyUsage = m.frequency;
      const daysLeft = m.remainingQuantity / dailyUsage;
      return daysLeft <= 3 && daysLeft > 0;
    });
  },
}));

export default useAppStore;
