import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cat, LitterBox, CleaningRecord, ObservationNote } from '@/types';
import { mockCats, mockLitterBoxes, mockCleaningRecords, mockObservationNotes } from '@/utils/mockData';
import { detectAbnormalities, generateAllObservationNotes } from '@/utils/detection';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface AppState {
  cats: Cat[];
  litterBoxes: LitterBox[];
  cleaningRecords: CleaningRecord[];
  observationNotes: ObservationNote[];
  
  addCat: (cat: Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCat: (id: string, cat: Partial<Cat>) => void;
  deleteCat: (id: string) => void;
  
  addLitterBox: (box: Omit<LitterBox, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLitterBox: (id: string, box: Partial<LitterBox>) => void;
  deleteLitterBox: (id: string) => void;
  
  addCleaningRecord: (record: Omit<CleaningRecord, 'id' | 'isAbnormal' | 'abnormalTypes' | 'createdAt'>) => void;
  deleteCleaningRecord: (id: string) => void;
  
  updateObservationNote: (id: string, note: Partial<ObservationNote>) => void;
  deleteObservationNote: (id: string) => void;
  
  resetToMockData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cats: mockCats,
      litterBoxes: mockLitterBoxes,
      cleaningRecords: mockCleaningRecords,
      observationNotes: mockObservationNotes,
      
      addCat: (cat) => set((state) => ({
        cats: [...state.cats, {
          ...cat,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),
      
      updateCat: (id, cat) => set((state) => ({
        cats: state.cats.map(c => c.id === id ? { ...c, ...cat, updatedAt: new Date().toISOString() } : c),
      })),
      
      deleteCat: (id) => set((state) => ({
        cats: state.cats.filter(c => c.id !== id),
      })),
      
      addLitterBox: (box) => set((state) => ({
        litterBoxes: [...state.litterBoxes, {
          ...box,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),
      
      updateLitterBox: (id, box) => set((state) => {
        const updatedBoxes = state.litterBoxes.map(b => 
          b.id === id ? { ...b, ...box, updatedAt: new Date().toISOString() } : b
        );
        return { litterBoxes: updatedBoxes };
      }),
      
      deleteLitterBox: (id) => set((state) => ({
        litterBoxes: state.litterBoxes.filter(b => b.id !== id),
      })),
      
      addCleaningRecord: (record) => set((state) => {
        const { isAbnormal, abnormalTypes } = detectAbnormalities(record);
        
        const newRecord: CleaningRecord = {
          ...record,
          id: generateId(),
          isAbnormal,
          abnormalTypes,
          createdAt: new Date().toISOString(),
        };
        
        let newNotes: ObservationNote[] = [];
        if (isAbnormal) {
          const notesToAdd = generateAllObservationNotes(newRecord);
          newNotes = notesToAdd.map(note => ({
            ...note,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        
        let updatedBoxes = state.litterBoxes;
        if (record.operationTypes.includes('full_change') || (record.operationTypes.includes('disinfect') && record.deodorizerUsed > 0)) {
          updatedBoxes = state.litterBoxes.map(b => {
            if (b.id !== record.litterBoxId) return b;
            
            const updates: Partial<LitterBox> = { updatedAt: new Date().toISOString() };
            
            if (record.operationTypes.includes('full_change')) {
              updates.lastFullChangeDate = record.date;
            }
            
            if (record.operationTypes.includes('disinfect') && record.deodorizerUsed > 0) {
              const newRemaining = Math.max(0, (b.deodorizerRemaining || 0) - record.deodorizerUsed);
              updates.deodorizerRemaining = newRemaining;
            }
            
            return { ...b, ...updates };
          });
        }
        
        return {
          cleaningRecords: [newRecord, ...state.cleaningRecords],
          observationNotes: [...newNotes, ...state.observationNotes],
          litterBoxes: updatedBoxes,
        };
      }),
      
      deleteCleaningRecord: (id) => set((state) => ({
        cleaningRecords: state.cleaningRecords.filter(r => r.id !== id),
        observationNotes: state.observationNotes.filter(n => n.recordId !== id),
      })),
      
      updateObservationNote: (id, note) => set((state) => ({
        observationNotes: state.observationNotes.map(n => 
          n.id === id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n
        ),
      })),
      
      deleteObservationNote: (id) => set((state) => ({
        observationNotes: state.observationNotes.filter(n => n.id !== id),
      })),
      
      resetToMockData: () => set({
        cats: mockCats,
        litterBoxes: mockLitterBoxes,
        cleaningRecords: mockCleaningRecords,
        observationNotes: mockObservationNotes,
      }),
    }),
    {
      name: 'cat-litter-box-storage',
    }
  )
);
