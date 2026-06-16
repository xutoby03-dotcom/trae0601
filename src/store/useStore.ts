import { create } from 'zustand';
import { 
  Braces, DailyRecord, Reminder, Inventory, CheckupNote, 
  AppState, OdorLevel, BracesStage 
} from '../types';
import { loadState, saveState, generateId, getTodayString, getDateString } from '../utils/storage';
import { checkAllReminders } from '../utils/reminderRules';

const createMockData = (): Partial<AppState> => {
  const bracesId1 = generateId();
  const bracesId2 = generateId();
  
  const braces: Braces[] = [
    {
      id: bracesId1,
      name: '上颌牙套',
      stage: '第一阶段',
      doctor: '李医生',
      receiveDate: getDateString(30),
      boxColor: '#FFB6C1',
      cleanCycle: 3,
      photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20dental%20braces%20for%20kids%20on%20white%20background%20clean%20product%20photo&image_size=square',
      createdAt: getDateString(30),
      updatedAt: getDateString(30),
    },
    {
      id: bracesId2,
      name: '下颌保持器',
      stage: '保持器',
      doctor: '王医生',
      receiveDate: getDateString(60),
      boxColor: '#87CEEB',
      cleanCycle: 2,
      photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clear%20dental%20retainer%20for%20kids%20on%20white%20background%20clean%20product%20photo&image_size=square',
      createdAt: getDateString(60),
      updatedAt: getDateString(60),
    },
  ];
  
  const records: DailyRecord[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = getDateString(i);
    const wearHours = i === 0 ? 18 : i === 3 ? 15 : 22;
    const isSoaked = i !== 2;
    
    records.push({
      id: generateId(),
      bracesId: bracesId1,
      recordDate: date,
      wearHours,
      isBrushed: i !== 1,
      isSoaked,
      tookBoxOut: i === 4,
      boxReturned: i === 4,
      odorLevel: (i % 3) as OdorLevel,
      hasPain: i === 5,
      painLocation: i === 5 ? '左侧后牙' : undefined,
      hasCrack: false,
      isLoose: i === 2,
      notes: i === 5 ? '今天说牙齿有点酸' : undefined,
      createdAt: date,
    });
    
    records.push({
      id: generateId(),
      bracesId: bracesId2,
      recordDate: date,
      wearHours: 20,
      isBrushed: true,
      isSoaked: true,
      tookBoxOut: false,
      boxReturned: true,
      odorLevel: 0,
      createdAt: date,
    });
  }
  
  const inventories: Inventory[] = [
    {
      id: generateId(),
      bracesId: bracesId1,
      currentStock: 3,
      lowStockThreshold: 5,
      lastRestockDate: getDateString(10),
    },
    {
      id: generateId(),
      bracesId: bracesId2,
      currentStock: 12,
      lowStockThreshold: 5,
      lastRestockDate: getDateString(5),
    },
  ];
  
  return { braces, records, inventories, reminders: [], checkupNotes: [] };
};

interface StoreState extends AppState {
  initialized: boolean;
  init: () => void;
  addBraces: (braces: Omit<Braces, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBraces: (id: string, braces: Partial<Braces>) => void;
  deleteBraces: (id: string) => void;
  addRecord: (record: Omit<DailyRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, record: Partial<DailyRecord>) => void;
  deleteRecord: (id: string) => void;
  resolveReminder: (id: string) => void;
  updateInventory: (bracesId: string, delta: number) => void;
  setInventoryThreshold: (bracesId: string, threshold: number) => void;
  addCheckupNote: (note: Omit<CheckupNote, 'id' | 'createdAt'>) => void;
  runReminderCheck: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  braces: [],
  records: [],
  reminders: [],
  inventories: [],
  checkupNotes: [],
  initialized: false,
  
  init: () => {
    const savedState = loadState();
    let initialState: Partial<AppState>;
    
    if (savedState && savedState.braces && savedState.braces.length > 0) {
      initialState = savedState;
    } else {
      initialState = createMockData();
    }
    
    set({
      braces: initialState.braces || [],
      records: initialState.records || [],
      reminders: initialState.reminders || [],
      inventories: initialState.inventories || [],
      checkupNotes: initialState.checkupNotes || [],
      initialized: true,
    });
    
    setTimeout(() => {
      get().runReminderCheck();
    }, 100);
  },
  
  addBraces: (bracesData) => {
    const newBraces: Braces = {
      ...bracesData,
      id: generateId(),
      createdAt: getTodayString(),
      updatedAt: getTodayString(),
    };
    
    const newInventory: Inventory = {
      id: generateId(),
      bracesId: newBraces.id,
      currentStock: 30,
      lowStockThreshold: 5,
      lastRestockDate: getTodayString(),
    };
    
    set((state) => {
      const newState = {
        braces: [...state.braces, newBraces],
        inventories: [...state.inventories, newInventory],
      };
      saveState({ ...state, ...newState });
      return newState;
    });
    
    get().runReminderCheck();
  },
  
  updateBraces: (id, bracesData) => {
    set((state) => {
      const newBraces = state.braces.map(b => 
        b.id === id ? { ...b, ...bracesData, updatedAt: getTodayString() } : b
      );
      const newState = { braces: newBraces };
      saveState({ ...state, ...newState });
      return newState;
    });
  },
  
  deleteBraces: (id) => {
    set((state) => {
      const newState = {
        braces: state.braces.filter(b => b.id !== id),
        records: state.records.filter(r => r.bracesId !== id),
        reminders: state.reminders.filter(r => r.bracesId !== id),
        inventories: state.inventories.filter(i => i.bracesId !== id),
        checkupNotes: state.checkupNotes.filter(c => c.bracesId !== id),
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },
  
  addRecord: (recordData) => {
    const newRecord: DailyRecord = {
      ...recordData,
      id: generateId(),
      createdAt: getTodayString(),
    };
    
    set((state) => {
      const existingIndex = state.records.findIndex(
        r => r.recordDate === recordData.recordDate && r.bracesId === recordData.bracesId
      );
      
      let newRecords;
      if (existingIndex >= 0) {
        newRecords = [...state.records];
        newRecords[existingIndex] = { ...newRecords[existingIndex], ...newRecord };
      } else {
        newRecords = [...state.records, newRecord];
      }
      
      const newState = { records: newRecords };
      saveState({ ...state, ...newState });
      return newState;
    });
    
    get().runReminderCheck();
  },
  
  updateRecord: (id, recordData) => {
    set((state) => {
      const newRecords = state.records.map(r => 
        r.id === id ? { ...r, ...recordData } : r
      );
      const newState = { records: newRecords };
      saveState({ ...state, ...newState });
      return newState;
    });
    
    get().runReminderCheck();
  },
  
  deleteRecord: (id) => {
    set((state) => {
      const newState = {
        records: state.records.filter(r => r.id !== id),
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },
  
  resolveReminder: (id) => {
    set((state) => {
      const newReminders = state.reminders.map(r => 
        r.id === id ? { ...r, isResolved: true, resolvedAt: getTodayString() } : r
      );
      const newState = { reminders: newReminders };
      saveState({ ...state, ...newState });
      return newState;
    });
  },
  
  updateInventory: (bracesId, delta) => {
    set((state) => {
      const newInventories = state.inventories.map(i => {
        if (i.bracesId === bracesId) {
          return {
            ...i,
            currentStock: Math.max(0, i.currentStock + delta),
            lastRestockDate: delta > 0 ? getTodayString() : i.lastRestockDate,
          };
        }
        return i;
      });
      const newState = { inventories: newInventories };
      saveState({ ...state, ...newState });
      return newState;
    });
    
    get().runReminderCheck();
  },
  
  setInventoryThreshold: (bracesId, threshold) => {
    set((state) => {
      const newInventories = state.inventories.map(i => 
        i.bracesId === bracesId ? { ...i, lowStockThreshold: threshold } : i
      );
      const newState = { inventories: newInventories };
      saveState({ ...state, ...newState });
      return newState;
    });
  },
  
  addCheckupNote: (noteData) => {
    const newNote: CheckupNote = {
      ...noteData,
      id: generateId(),
      createdAt: getTodayString(),
    };
    
    set((state) => {
      const newState = {
        checkupNotes: [...state.checkupNotes, newNote],
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },
  
  runReminderCheck: () => {
    const { braces, records, inventories, reminders } = get();
    const newReminders = checkAllReminders(braces, records, inventories, reminders);
    
    if (newReminders.length > 0) {
      set((state) => {
        const newState = {
          reminders: [...state.reminders, ...newReminders],
        };
        saveState({ ...state, ...newState });
        return newState;
      });
    }
  },
}));
