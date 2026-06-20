import { create } from 'zustand';
import type { Member, Bag, ItemCheck, SealCheck, PostCheck, AppState } from '@/types';
import { loadFromStorage, saveToStorage, clearStorage, generateId } from '@/utils/storage';
import { mockMembers, mockBags, mockItemChecks, mockSealChecks, mockPostChecks } from '@/data/mockData';
import { itemLabels, valuableItems } from '@/types';

const getInitialState = () => {
  const stored = loadFromStorage();
  if (stored) {
    return {
      members: stored.members as Member[],
      bags: stored.bags as Bag[],
      itemChecks: stored.itemChecks as ItemCheck[],
      sealChecks: stored.sealChecks as SealCheck[],
      postChecks: stored.postChecks as PostCheck[],
    };
  }
  return {
    members: mockMembers,
    bags: mockBags,
    itemChecks: mockItemChecks,
    sealChecks: mockSealChecks,
    postChecks: mockPostChecks,
  };
};

const persist = (state: Partial<AppState>) => {
  saveToStorage({
    members: state.members || [],
    bags: state.bags || [],
    itemChecks: state.itemChecks || [],
    sealChecks: state.sealChecks || [],
    postChecks: state.postChecks || [],
  });
};

export const useStore = create<AppState>((set, get) => {
  const initialState = getInitialState();
  
  return {
    ...initialState,
    
    addMember: (member) => {
      const newMember: Member = {
        ...member,
        id: generateId('m'),
        createdAt: new Date().toISOString(),
      };
      const newMembers = [...get().members, newMember];
      set({ members: newMembers });
      persist({ ...get(), members: newMembers });
    },
    
    updateMember: (id, member) => {
      const newMembers = get().members.map(m => 
        m.id === id ? { ...m, ...member } : m
      );
      set({ members: newMembers });
      persist({ ...get(), members: newMembers });
    },
    
    deleteMember: (id) => {
      const hasBags = get().bags.some(b => b.ownerId === id);
      if (hasBags) {
        alert('该成员有关联的防水包，无法删除');
        return;
      }
      const newMembers = get().members.filter(m => m.id !== id);
      set({ members: newMembers });
      persist({ ...get(), members: newMembers });
    },
    
    addBag: (bag) => {
      const newBag: Bag = {
        ...bag,
        id: generateId('b'),
        createdAt: new Date().toISOString(),
      };
      const newBags = [...get().bags, newBag];
      
      const newItemCheck: ItemCheck = {
        id: generateId('ic'),
        bagId: newBag.id,
        phone: false,
        carKey: false,
        dryClothes: false,
        towel: false,
        sunscreen: false,
        medicine: false,
        cash: false,
        notes: '',
        checkedAt: null,
        checkedBy: null,
      };
      const newItemChecks = [...get().itemChecks, newItemCheck];
      
      const newSealCheck: SealCheck = {
        id: generateId('sc'),
        bagId: newBag.id,
        sealed: false,
        notes: '',
        checkedAt: null,
        checkedBy: null,
      };
      const newSealChecks = [...get().sealChecks, newSealCheck];
      
      const newPostCheck: PostCheck = {
        id: generateId('pc'),
        bagId: newBag.id,
        waterIntrusion: false,
        lostItems: false,
        damaged: false,
        dryerId: null,
        notes: '',
        checkedAt: null,
        checkedBy: null,
      };
      const newPostChecks = [...get().postChecks, newPostCheck];
      
      set({ 
        bags: newBags, 
        itemChecks: newItemChecks,
        sealChecks: newSealChecks,
        postChecks: newPostChecks,
      });
      persist({ 
        ...get(), 
        bags: newBags, 
        itemChecks: newItemChecks,
        sealChecks: newSealChecks,
        postChecks: newPostChecks,
      });
    },
    
    updateBag: (id, bag) => {
      const newBags = get().bags.map(b => 
        b.id === id ? { ...b, ...bag } : b
      );
      set({ bags: newBags });
      persist({ ...get(), bags: newBags });
    },
    
    deleteBag: (id) => {
      const hasChecks = get().itemChecks.some(ic => ic.bagId === id && ic.checkedAt) ||
                       get().sealChecks.some(sc => sc.bagId === id && sc.checkedAt) ||
                       get().postChecks.some(pc => pc.bagId === id && pc.checkedAt);
      if (hasChecks) {
        alert('该防水包已有检查记录，无法删除');
        return;
      }
      const newBags = get().bags.filter(b => b.id !== id);
      const newItemChecks = get().itemChecks.filter(ic => ic.bagId !== id);
      const newSealChecks = get().sealChecks.filter(sc => sc.bagId !== id);
      const newPostChecks = get().postChecks.filter(pc => pc.bagId !== id);
      
      set({ 
        bags: newBags, 
        itemChecks: newItemChecks,
        sealChecks: newSealChecks,
        postChecks: newPostChecks,
      });
      persist({ 
        ...get(), 
        bags: newBags, 
        itemChecks: newItemChecks,
        sealChecks: newSealChecks,
        postChecks: newPostChecks,
      });
    },
    
    updateItemCheck: (bagId, items) => {
      const newItemChecks = get().itemChecks.map(ic => 
        ic.bagId === bagId ? { ...ic, ...items } : ic
      );
      set({ itemChecks: newItemChecks });
      persist({ ...get(), itemChecks: newItemChecks });
    },
    
    confirmItemCheck: (bagId, checkedBy) => {
      const now = new Date().toISOString();
      const newItemChecks = get().itemChecks.map(ic => 
        ic.bagId === bagId ? { ...ic, checkedAt: now, checkedBy } : ic
      );
      const newBags = get().bags.map(b => 
        b.id === bagId ? { ...b, sealStatus: 'sealed' as const } : b
      );
      set({ itemChecks: newItemChecks, bags: newBags });
      persist({ ...get(), itemChecks: newItemChecks, bags: newBags });
    },
    
    confirmSealCheck: (bagId, sealed, checkedBy, notes = '') => {
      const now = new Date().toISOString();
      const newSealChecks = get().sealChecks.map(sc => 
        sc.bagId === bagId ? { ...sc, sealed, notes, checkedAt: now, checkedBy } : sc
      );
      const newBags = get().bags.map(b => 
        b.id === bagId ? { ...b, sealStatus: sealed ? 'confirmed' as const : b.sealStatus } : b
      );
      set({ sealChecks: newSealChecks, bags: newBags });
      persist({ ...get(), sealChecks: newSealChecks, bags: newBags });
    },
    
    submitPostCheck: (bagId, check, checkedBy) => {
      const now = new Date().toISOString();
      const newPostChecks = get().postChecks.map(pc => 
        pc.bagId === bagId ? { ...pc, ...check, checkedAt: now, checkedBy } : pc
      );
      const newBags = get().bags.map(b => 
        b.id === bagId && (check.damaged || check.waterIntrusion) 
          ? { ...b, sealStatus: 'damaged' as const } 
          : b
      );
      set({ postChecks: newPostChecks, bags: newBags });
      persist({ ...get(), postChecks: newPostChecks, bags: newBags });
    },
    
    getUnconfirmedItems: () => {
      const { bags, itemChecks } = get();
      return bags.filter(bag => {
        const itemCheck = itemChecks.find(ic => ic.bagId === bag.id);
        return !itemCheck?.checkedAt;
      });
    },
    
    getValuablesLocation: () => {
      const { members, bags, itemChecks } = get();
      const result: Array<{member: Member, bag: Bag, items: string[]}> = [];
      
      bags.forEach(bag => {
        const member = members.find(m => m.id === bag.ownerId);
        const itemCheck = itemChecks.find(ic => ic.bagId === bag.id);
        
        if (member && itemCheck) {
          const items: string[] = [];
          valuableItems.forEach(key => {
            const itemKey = key as keyof typeof itemLabels;
            if (itemCheck[itemKey]) {
              items.push(itemLabels[itemKey]);
            }
          });
          if (member.valuableNotes) {
            items.push(member.valuableNotes);
          }
          if (items.length > 0) {
            result.push({ member, bag, items });
          }
        }
      });
      
      return result;
    },
    
    getDamagedBags: () => {
      const { bags, postChecks } = get();
      const result: Array<{bag: Bag, issue: string}> = [];
      
      postChecks.forEach(pc => {
        if (pc.checkedAt && (pc.waterIntrusion || pc.lostItems || pc.damaged)) {
          const bag = bags.find(b => b.id === pc.bagId);
          if (bag) {
            const issues: string[] = [];
            if (pc.waterIntrusion) issues.push('进水');
            if (pc.lostItems) issues.push('物品遗失');
            if (pc.damaged) issues.push('包体破损');
            result.push({ bag, issue: issues.join('、') + (pc.notes ? `: ${pc.notes}` : '') });
          }
        }
      });
      
      bags.filter(b => b.sealStatus === 'damaged').forEach(bag => {
        if (!result.some(r => r.bag.id === bag.id)) {
          result.push({ bag, issue: '标记为损坏' });
        }
      });
      
      return result;
    },
    
    getDryingList: () => {
      const { members, bags, postChecks } = get();
      const result: Array<{bag: Bag, dryer: Member | null}> = [];
      
      postChecks.forEach(pc => {
        if (pc.checkedAt) {
          const bag = bags.find(b => b.id === pc.bagId);
          if (bag) {
            const dryer = pc.dryerId ? members.find(m => m.id === pc.dryerId) || null : null;
            result.push({ bag, dryer });
          }
        }
      });
      
      bags.filter(b => {
        const pc = postChecks.find(p => p.bagId === b.id);
        return !pc?.checkedAt;
      }).forEach(bag => {
        result.push({ bag, dryer: null });
      });
      
      return result.filter(r => !r.dryer);
    },
    
    resetAllData: () => {
      if (window.confirm('确定要重置所有数据吗？此操作不可撤销。')) {
        clearStorage();
        set({
          members: mockMembers,
          bags: mockBags,
          itemChecks: mockItemChecks,
          sealChecks: mockSealChecks,
          postChecks: mockPostChecks,
        });
      }
    },
  };
});
