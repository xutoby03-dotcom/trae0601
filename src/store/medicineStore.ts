import { create } from 'zustand';
import type { Medicine, MedicationRecord, FamilyMember, MedicineCategory, ContraindicatedMedicine, ContraindicationReason } from '@/types';
import { generateId, getMedicineStatus } from '@/utils/medicine';

interface MedicineStore {
  medicines: Medicine[];
  records: MedicationRecord[];
  familyMembers: FamilyMember[];
  
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  getMedicineById: (id: string) => Medicine | undefined;
  
  addRecord: (record: Omit<MedicationRecord, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
  
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  
  getExpiredMedicines: () => Medicine[];
  getExpiringMedicines: () => Medicine[];
  getLowStockMedicines: () => Medicine[];
  getContraindicatedMedicines: (memberId: string) => Medicine[];
  getMedicinesByCategory: (category: MedicineCategory) => Medicine[];
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'medicine_cabinet_data';

export const useMedicineStore = create<MedicineStore>((set, get) => ({
  medicines: [],
  records: [],
  familyMembers: [],
  
  addMedicine: (medicine) => {
    const now = new Date().toISOString();
    const newMedicine: Medicine = {
      ...medicine,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ medicines: [...state.medicines, newMedicine] }));
    get().saveToStorage();
  },
  
  updateMedicine: (id, data) => {
    set((state) => ({
      medicines: state.medicines.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      ),
    }));
    get().saveToStorage();
  },
  
  deleteMedicine: (id) => {
    set((state) => ({
      medicines: state.medicines.filter((m) => m.id !== id),
    }));
    get().saveToStorage();
  },
  
  getMedicineById: (id) => {
    return get().medicines.find((m) => m.id === id);
  },
  
  addRecord: (record) => {
    const newRecord: MedicationRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ records: [newRecord, ...state.records] }));
    get().saveToStorage();
  },
  
  deleteRecord: (id) => {
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    }));
    get().saveToStorage();
  },
  
  addFamilyMember: (member) => {
    const newMember: FamilyMember = {
      ...member,
      id: generateId(),
    };
    set((state) => ({ familyMembers: [...state.familyMembers, newMember] }));
    get().saveToStorage();
  },
  
  updateFamilyMember: (id, data) => {
    set((state) => ({
      familyMembers: state.familyMembers.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    }));
    get().saveToStorage();
  },
  
  deleteFamilyMember: (id) => {
    set((state) => ({
      familyMembers: state.familyMembers.filter((m) => m.id !== id),
    }));
    get().saveToStorage();
  },
  
  getExpiredMedicines: () => {
    return get().medicines.filter((m) => getMedicineStatus(m).color === 'red');
  },
  
  getExpiringMedicines: () => {
    return get().medicines.filter((m) => getMedicineStatus(m).color === 'orange');
  },
  
  getLowStockMedicines: () => {
    return get().medicines.filter((m) => m.quantity <= 2);
  },
  
  getContraindicatedMedicines: (memberId): ContraindicatedMedicine[] => {
    const member = get().familyMembers.find((m) => m.id === memberId);
    if (!member) return [];
    
    return get().medicines
      .map((medicine) => {
        const reasons: ContraindicationReason[] = [];
        
        member.allergies.forEach((allergy) => {
          const matchedContra = medicine.contraindications.find(c => 
            c.includes(allergy)
          );
          if (matchedContra) {
            reasons.push({
              type: 'allergy',
              label: `${allergy}过敏`,
              detail: matchedContra
            });
          }
          if (medicine.name.includes(allergy) && !matchedContra) {
            reasons.push({
              type: 'allergy',
              label: `${allergy}过敏`,
              detail: `药品名称含${allergy}成分`
            });
          }
        });
        
        member.chronicDiseases.forEach((disease) => {
          const matchedContra = medicine.contraindications.find(c => 
            c.includes(disease) || disease.includes(c)
          );
          if (matchedContra) {
            reasons.push({
              type: 'chronic',
              label: disease,
              detail: matchedContra
            });
          }
        });
        
        if (member.allergies.length > 0) {
          const matchedConstitution = medicine.contraindications.find(c => 
            c.includes('过敏体质') || c.includes('过敏者')
          );
          if (matchedConstitution && reasons.every(r => r.type !== 'allergy')) {
            reasons.push({
              type: 'allergy_constitution',
              label: '过敏体质',
              detail: matchedConstitution
            });
          }
        }
        
        return reasons.length > 0 ? { ...medicine, reasons } : null;
      })
      .filter((item): item is ContraindicatedMedicine => item !== null);
  },
  
  getMedicinesByCategory: (category) => {
    return get().medicines.filter((m) => m.category === category);
  },
  
  loadFromStorage: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          medicines: parsed.medicines || [],
          records: parsed.records || [],
          familyMembers: parsed.familyMembers || [],
        });
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  },
  
  saveToStorage: () => {
    try {
      const { medicines, records, familyMembers } = get();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ medicines, records, familyMembers })
      );
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  },
}));
