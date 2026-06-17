import { create } from 'zustand';
import type { Box, Clothing, Reminder } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { mockBoxes, mockClothes } from '@/data/mockData';
import { 
  isMoisturePackExpired, 
  isMoisturePackExpiringSoon, 
  getDaysUntilExpiry,
  isDonationCandidate,
  formatDate 
} from '@/utils/date';

interface StoreState {
  boxes: Box[];
  clothes: Clothing[];
  reminders: Reminder[];
  
  initData: () => void;
  
  addBox: (box: Omit<Box, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBox: (id: string, updates: Partial<Box>) => void;
  deleteBox: (id: string) => void;
  getBoxById: (id: string) => Box | undefined;
  getBoxClothes: (boxId: string) => Clothing[];
  
  addClothing: (clothing: Omit<Clothing, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClothing: (id: string, updates: Partial<Clothing>) => void;
  deleteClothing: (id: string) => void;
  getClothingById: (id: string) => Clothing | undefined;
  moveClothingToBox: (clothingId: string, boxId: string) => void;
  takeOutClothing: (clothingId: string) => void;
  processPendingClothing: (clothingId: string, boxId?: string) => void;
  
  generateReminders: () => void;
  markReminderRead: (id: string) => void;
  getUnreadReminderCount: () => number;
  
  getMissingSizes: () => Array<{ owner: string; season: string; missing: string[] }>;
  getThisWeekPickups: () => Clothing[];
}

const STORAGE_KEYS = {
  BOXES: 'storage_boxes',
  CLOTHES: 'storage_clothes',
  REMINDERS: 'storage_reminders',
  INITIALIZED: 'storage_initialized',
};

export const useStore = create<StoreState>((set, get) => ({
  boxes: [],
  clothes: [],
  reminders: [],

  initData: () => {
    const initialized = storage.get<boolean>(STORAGE_KEYS.INITIALIZED, false);
    
    if (!initialized) {
      set({ boxes: mockBoxes, clothes: mockClothes });
      storage.set(STORAGE_KEYS.BOXES, mockBoxes);
      storage.set(STORAGE_KEYS.CLOTHES, mockClothes);
      storage.set(STORAGE_KEYS.INITIALIZED, true);
      
      get().generateReminders();
    } else {
      const boxes = storage.get<Box[]>(STORAGE_KEYS.BOXES, []);
      const clothes = storage.get<Clothing[]>(STORAGE_KEYS.CLOTHES, []);
      const reminders = storage.get<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
      set({ boxes, clothes, reminders });
      
      get().generateReminders();
    }
  },

  addBox: (box) => {
    const newBox: Box = {
      ...box,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const boxes = [...get().boxes, newBox];
    set({ boxes });
    storage.set(STORAGE_KEYS.BOXES, boxes);
    get().generateReminders();
  },

  updateBox: (id, updates) => {
    const boxes = get().boxes.map(box => 
      box.id === id 
        ? { ...box, ...updates, updatedAt: new Date().toISOString() } 
        : box
    );
    set({ boxes });
    storage.set(STORAGE_KEYS.BOXES, boxes);
    get().generateReminders();
  },

  deleteBox: (id) => {
    const boxes = get().boxes.filter(box => box.id !== id);
    const clothes = get().clothes.map(c => 
      c.boxId === id ? { ...c, boxId: undefined } : c
    );
    set({ boxes, clothes });
    storage.set(STORAGE_KEYS.BOXES, boxes);
    storage.set(STORAGE_KEYS.CLOTHES, clothes);
    get().generateReminders();
  },

  getBoxById: (id) => {
    return get().boxes.find(box => box.id === id);
  },

  getBoxClothes: (boxId) => {
    return get().clothes.filter(c => c.boxId === boxId && c.status === 'in_box');
  },

  addClothing: (clothing) => {
    const newClothing: Clothing = {
      ...clothing,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const clothes = [...get().clothes, newClothing];
    set({ clothes });
    storage.set(STORAGE_KEYS.CLOTHES, clothes);
    get().generateReminders();
  },

  updateClothing: (id, updates) => {
    const clothes = get().clothes.map(c => 
      c.id === id 
        ? { ...c, ...updates, updatedAt: new Date().toISOString() } 
        : c
    );
    set({ clothes });
    storage.set(STORAGE_KEYS.CLOTHES, clothes);
    get().generateReminders();
  },

  deleteClothing: (id) => {
    const clothes = get().clothes.filter(c => c.id !== id);
    set({ clothes });
    storage.set(STORAGE_KEYS.CLOTHES, clothes);
    get().generateReminders();
  },

  getClothingById: (id) => {
    return get().clothes.find(c => c.id === id);
  },

  moveClothingToBox: (clothingId, boxId) => {
    const clothes = get().clothes.map(c => 
      c.id === clothingId 
        ? { ...c, boxId, status: 'in_box' as const, updatedAt: new Date().toISOString() } 
        : c
    );
    set({ clothes });
    storage.set(STORAGE_KEYS.CLOTHES, clothes);
  },

  takeOutClothing: (clothingId) => {
    const clothes = get().clothes.map(c => 
      c.id === clothingId 
        ? { 
            ...c, 
            status: 'taken_out' as const, 
            boxId: undefined,
            lastWornDate: new Date().toISOString(),
            updatedAt: new Date().toISOString() 
          } 
        : c
    );
    set({ clothes });
    storage.set(STORAGE_KEYS.CLOTHES, clothes);
    get().generateReminders();
  },

  processPendingClothing: (clothingId, boxId) => {
    const clothes = get().clothes.map(c => {
      if (c.id !== clothingId) return c;
      return {
        ...c,
        isWashed: true,
        status: boxId ? 'in_box' as const : 'taken_out' as const,
        boxId: boxId || undefined,
        updatedAt: new Date().toISOString(),
      };
    });
    set({ clothes });
    storage.set(STORAGE_KEYS.CLOTHES, clothes);
    get().generateReminders();
  },

  generateReminders: () => {
    const reminders: Reminder[] = [];
    const { boxes, clothes } = get();

    boxes.forEach(box => {
      if (isMoisturePackExpired(box.moisturePackDate)) {
        reminders.push({
          id: `moisture-${box.id}`,
          type: 'moisture_pack',
          relatedId: box.id,
          relatedType: 'box',
          title: `${box.code} 防潮包已过期`,
          description: `位置：${box.location}，请及时更换防潮包`,
          date: box.moisturePackDate,
          isRead: false,
          level: 'danger',
        });
      } else if (isMoisturePackExpiringSoon(box.moisturePackDate)) {
        const daysLeft = getDaysUntilExpiry(box.moisturePackDate);
        reminders.push({
          id: `moisture-${box.id}`,
          type: 'moisture_pack',
          relatedId: box.id,
          relatedType: 'box',
          title: `${box.code} 防潮包即将到期`,
          description: `还剩 ${daysLeft} 天，位置：${box.location}`,
          date: box.moisturePackDate,
          isRead: false,
          level: 'warning',
        });
      }
    });

    clothes.forEach(c => {
      if (c.lastWornDate && isDonationCandidate(c.lastWornDate) && c.status === 'in_box') {
        reminders.push({
          id: `donation-${c.id}`,
          type: 'donation',
          relatedId: c.id,
          relatedType: 'clothing',
          title: `${c.name} 久未穿着`,
          description: `${c.owner}的${c.name}，上次穿着：${formatDate(c.lastWornDate, 'M月d日')}`,
          date: c.lastWornDate,
          isRead: false,
          level: 'info',
        });
      }
    });

    set({ reminders });
    storage.set(STORAGE_KEYS.REMINDERS, reminders);
  },

  markReminderRead: (id) => {
    const reminders = get().reminders.map(r => 
      r.id === id ? { ...r, isRead: true } : r
    );
    set({ reminders });
    storage.set(STORAGE_KEYS.REMINDERS, reminders);
  },

  getUnreadReminderCount: () => {
    return get().reminders.filter(r => !r.isRead).length;
  },

  getMissingSizes: () => {
    const { clothes } = get();
    const owners = ['爸爸', '妈妈', '孩子'];
    const seasons = ['春季', '夏季', '秋季', '冬季'];
    const result: Array<{ owner: string; season: string; missing: string[] }> = [];

    owners.forEach(owner => {
      seasons.forEach(season => {
        const seasonKey = season === '春季' ? 'spring' : 
                          season === '夏季' ? 'summer' :
                          season === '秋季' ? 'autumn' : 'winter';
        
        const seasonClothes = clothes.filter(
          c => c.owner === owner && (c.season === seasonKey || c.season === 'all') && c.status !== 'pending'
        );
        
        const categories = ['外套', '上衣', '裤子'];
        const missing: string[] = [];
        
        categories.forEach(cat => {
          const catKey = cat === '外套' ? 'coat' : cat === '上衣' ? 'top' : 'pants';
          const count = seasonClothes.filter(c => c.category === catKey).length;
          if (count < 2) {
            missing.push(cat);
          }
        });
        
        if (missing.length > 0) {
          result.push({ owner, season, missing });
        }
      });
    });

    return result;
  },

  getThisWeekPickups: () => {
    const { clothes } = get();
    const now = new Date();
    const weekDay = now.getDay();
    const season = 
      weekDay >= 3 && weekDay <= 5 ? 'spring' :
      weekDay >= 6 && weekDay <= 8 ? 'summer' :
      weekDay >= 9 && weekDay <= 11 ? 'autumn' : 'winter';
    
    return clothes.filter(c => 
      c.status === 'in_box' && 
      (c.season === season || c.season === 'all')
    ).slice(0, 5);
  },
}));
