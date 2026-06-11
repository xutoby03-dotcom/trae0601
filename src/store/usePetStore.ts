import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PetProfile, WaterRecord } from '@/types';
import { generateId, getTodayString } from '@/utils/date';

interface PetState {
  pet: PetProfile | null;
  records: WaterRecord[];
  setPet: (pet: PetProfile) => void;
  updatePet: (updates: Partial<PetProfile>) => void;
  addRecord: (record: Omit<WaterRecord, 'id' | 'petId' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, updates: Partial<WaterRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordByDate: (date: string) => WaterRecord | undefined;
  initDefaultPet: () => void;
}

const defaultPet: PetProfile = {
  id: generateId(),
  name: '小橘',
  weight: 4.5,
  age: 2,
  foodType: '全价猫粮',
  bowlLocation: '客厅角落',
  healthNotes: '暂无特殊健康问题',
  waterBaseCoefficient: 1.0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function generateMockRecords(petId: string): WaterRecord[] {
  const records: WaterRecord[] = [];
  const today = new Date();
  
  const mockData = [
    { waterAdded: 250, waterRemaining: 30, urineClumps: 3, fountainOn: true, abnormalities: '' },
    { waterAdded: 250, waterRemaining: 50, urineClumps: 2, fountainOn: true, abnormalities: '' },
    { waterAdded: 200, waterRemaining: 80, urineClumps: 2, fountainOn: false, abnormalities: '喝水比平时少' },
    { waterAdded: 250, waterRemaining: 40, urineClumps: 3, fountainOn: true, abnormalities: '' },
    { waterAdded: 300, waterRemaining: 20, urineClumps: 4, fountainOn: true, abnormalities: '' },
    { waterAdded: 250, waterRemaining: 45, urineClumps: 3, fountainOn: true, abnormalities: '' },
    { waterAdded: 250, waterRemaining: 35, urineClumps: 3, fountainOn: true, abnormalities: '' },
  ];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const data = mockData[6 - i];
    
    records.push({
      id: generateId(),
      petId,
      date: dateStr,
      waterAdded: data.waterAdded,
      waterRemaining: data.waterRemaining,
      fountainOn: data.fountainOn,
      urineClumps: data.urineClumps,
      abnormalities: data.abnormalities,
      bowlLocation: i <= 3 ? '客厅角落' : '卧室门口',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  return records;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pet: null,
      records: [],
      
      setPet: (pet) => set({ pet }),
      
      updatePet: (updates) => set((state) => ({
        pet: state.pet ? {
          ...state.pet,
          ...updates,
          updatedAt: new Date().toISOString(),
        } : null,
      })),
      
      addRecord: (record) => {
        const { pet } = get();
        if (!pet) return;
        
        const newRecord: WaterRecord = {
          ...record,
          id: generateId(),
          petId: pet.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => {
          const existingIndex = state.records.findIndex(r => r.date === record.date);
          if (existingIndex >= 0) {
            const updated = [...state.records];
            updated[existingIndex] = { ...updated[existingIndex], ...record, updatedAt: new Date().toISOString() };
            return { records: updated };
          }
          return { records: [...state.records, newRecord] };
        });
      },
      
      updateRecord: (id, updates) => set((state) => ({
        records: state.records.map(r => 
          r.id === id 
            ? { ...r, ...updates, updatedAt: new Date().toISOString() }
            : r
        ),
      })),
      
      deleteRecord: (id) => set((state) => ({
        records: state.records.filter(r => r.id !== id),
      })),
      
      getRecordByDate: (date) => {
        const { records } = get();
        return records.find(r => r.date === date);
      },
      
      initDefaultPet: () => {
        const { pet, records } = get();
        if (!pet) {
          const newPet = defaultPet;
          const mockRecords = generateMockRecords(newPet.id);
          set({ pet: newPet, records: records.length > 0 ? records : mockRecords });
        }
      },
    }),
    {
      name: 'cat-water-tracker-storage',
    }
  )
);
