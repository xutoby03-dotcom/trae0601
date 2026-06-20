export interface Member {
  id: string;
  name: string;
  shoeSize: string;
  canSwim: boolean;
  allergies: string;
  emergencyContact: string;
  valuableNotes: string;
  createdAt: string;
}

export interface Bag {
  id: string;
  capacity: string;
  color: string;
  number: string;
  ownerId: string;
  sealStatus: 'unsealed' | 'sealed' | 'confirmed' | 'damaged';
  photoUrl: string;
  createdAt: string;
}

export interface ItemCheck {
  id: string;
  bagId: string;
  phone: boolean;
  carKey: boolean;
  dryClothes: boolean;
  towel: boolean;
  sunscreen: boolean;
  medicine: boolean;
  cash: boolean;
  notes: string;
  checkedAt: string | null;
  checkedBy: string | null;
}

export interface SealCheck {
  id: string;
  bagId: string;
  sealed: boolean;
  notes: string;
  checkedAt: string | null;
  checkedBy: string | null;
}

export interface PostCheck {
  id: string;
  bagId: string;
  waterIntrusion: boolean;
  lostItems: boolean;
  damaged: boolean;
  dryerId: string | null;
  notes: string;
  checkedAt: string | null;
  checkedBy: string | null;
}

export interface AppState {
  members: Member[];
  bags: Bag[];
  itemChecks: ItemCheck[];
  sealChecks: SealCheck[];
  postChecks: PostCheck[];
  
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  addBag: (bag: Omit<Bag, 'id' | 'createdAt'>) => void;
  updateBag: (id: string, bag: Partial<Bag>) => void;
  deleteBag: (id: string) => void;
  
  updateItemCheck: (bagId: string, items: Partial<ItemCheck>) => void;
  confirmItemCheck: (bagId: string, checkedBy: string) => void;
  confirmSealCheck: (bagId: string, sealed: boolean, checkedBy: string, notes?: string) => void;
  submitPostCheck: (bagId: string, check: Partial<PostCheck>, checkedBy: string) => void;
  
  getUnconfirmedItems: () => Bag[];
  getValuablesLocation: () => Array<{member: Member, bag: Bag, items: string[]}>;
  getDamagedBags: () => Array<{bag: Bag, issue: string}>;
  getDryingList: () => Array<{bag: Bag, dryer: Member | null}>;
  resetAllData: () => void;
}

export const itemLabels: Record<keyof Omit<ItemCheck, 'id' | 'bagId' | 'notes' | 'checkedAt' | 'checkedBy'>, string> = {
  phone: '手机',
  carKey: '车钥匙',
  dryClothes: '干衣',
  towel: '毛巾',
  sunscreen: '防晒',
  medicine: '药品',
  cash: '现金',
};

export const valuableItems = ['phone', 'carKey', 'cash'];

export const sealStatusLabels: Record<Bag['sealStatus'], string> = {
  unsealed: '未密封',
  sealed: '已密封',
  confirmed: '已确认',
  damaged: '已损坏',
};

export const sealStatusColors: Record<Bag['sealStatus'], string> = {
  unsealed: 'bg-gray-100 text-gray-700',
  sealed: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  damaged: 'bg-red-100 text-red-700',
};
