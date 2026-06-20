import type { Member, Bag, ItemCheck, SealCheck, PostCheck } from '@/types';

export const mockMembers: Member[] = [
  {
    id: 'm1',
    name: '张三',
    shoeSize: '42',
    canSwim: true,
    allergies: '无',
    emergencyContact: '李四 13800138001',
    valuableNotes: 'iPhone 15 Pro、大众车钥匙',
    createdAt: '2024-06-20T10:00:00Z'
  },
  {
    id: 'm2',
    name: '李四',
    shoeSize: '39',
    canSwim: false,
    allergies: '青霉素过敏',
    emergencyContact: '张三 13900139001',
    valuableNotes: '华为 Mate 60 Pro',
    createdAt: '2024-06-20T10:01:00Z'
  },
  {
    id: 'm3',
    name: '王五',
    shoeSize: '41',
    canSwim: true,
    allergies: '海鲜过敏',
    emergencyContact: '赵六 13700137001',
    valuableNotes: '小米14、丰田车钥匙、现金500元',
    createdAt: '2024-06-20T10:02:00Z'
  },
  {
    id: 'm4',
    name: '赵六',
    shoeSize: '43',
    canSwim: true,
    allergies: '无',
    emergencyContact: '王五 13600136001',
    valuableNotes: 'iPhone 14、本田车钥匙',
    createdAt: '2024-06-20T10:03:00Z'
  }
];

export const mockBags: Bag[] = [
  {
    id: 'b1',
    capacity: '20L',
    color: '蓝色',
    number: '001',
    ownerId: 'm1',
    sealStatus: 'confirmed',
    photoUrl: '',
    createdAt: '2024-06-20T10:00:00Z'
  },
  {
    id: 'b2',
    capacity: '15L',
    color: '橙色',
    number: '002',
    ownerId: 'm2',
    sealStatus: 'sealed',
    photoUrl: '',
    createdAt: '2024-06-20T10:01:00Z'
  },
  {
    id: 'b3',
    capacity: '25L',
    color: '黑色',
    number: '003',
    ownerId: 'm3',
    sealStatus: 'unsealed',
    photoUrl: '',
    createdAt: '2024-06-20T10:02:00Z'
  },
  {
    id: 'b4',
    capacity: '15L',
    color: '绿色',
    number: '004',
    ownerId: 'm4',
    sealStatus: 'damaged',
    photoUrl: '',
    createdAt: '2024-06-20T10:03:00Z'
  }
];

export const mockItemChecks: ItemCheck[] = [
  {
    id: 'ic1',
    bagId: 'b1',
    phone: true,
    carKey: true,
    dryClothes: true,
    towel: true,
    sunscreen: true,
    medicine: false,
    cash: true,
    notes: '现金300元',
    checkedAt: '2024-06-20T11:00:00Z',
    checkedBy: '领队'
  },
  {
    id: 'ic2',
    bagId: 'b2',
    phone: true,
    carKey: false,
    dryClothes: true,
    towel: true,
    sunscreen: true,
    medicine: true,
    cash: false,
    notes: '车钥匙放车上了',
    checkedAt: '2024-06-20T11:05:00Z',
    checkedBy: '领队'
  },
  {
    id: 'ic3',
    bagId: 'b3',
    phone: false,
    carKey: false,
    dryClothes: false,
    towel: false,
    sunscreen: false,
    medicine: false,
    cash: false,
    notes: '',
    checkedAt: null,
    checkedBy: null
  },
  {
    id: 'ic4',
    bagId: 'b4',
    phone: true,
    carKey: true,
    dryClothes: true,
    towel: true,
    sunscreen: false,
    medicine: true,
    cash: true,
    notes: '',
    checkedAt: '2024-06-20T11:10:00Z',
    checkedBy: '领队'
  }
];

export const mockSealChecks: SealCheck[] = [
  {
    id: 'sc1',
    bagId: 'b1',
    sealed: true,
    notes: '密封条完好，已按压排气',
    checkedAt: '2024-06-20T11:30:00Z',
    checkedBy: '领队'
  },
  {
    id: 'sc2',
    bagId: 'b2',
    sealed: false,
    notes: '',
    checkedAt: null,
    checkedBy: null
  },
  {
    id: 'sc3',
    bagId: 'b3',
    sealed: false,
    notes: '',
    checkedAt: null,
    checkedBy: null
  },
  {
    id: 'sc4',
    bagId: 'b4',
    sealed: true,
    notes: '密封条有轻微磨损，已额外加固',
    checkedAt: '2024-06-20T11:35:00Z',
    checkedBy: '领队'
  }
];

export const mockPostChecks: PostCheck[] = [
  {
    id: 'pc1',
    bagId: 'b1',
    waterIntrusion: false,
    lostItems: false,
    damaged: false,
    dryerId: 'm1',
    notes: '状态良好',
    checkedAt: '2024-06-20T16:00:00Z',
    checkedBy: '领队'
  },
  {
    id: 'pc2',
    bagId: 'b2',
    waterIntrusion: false,
    lostItems: false,
    damaged: false,
    dryerId: null,
    notes: '',
    checkedAt: null,
    checkedBy: null
  },
  {
    id: 'pc3',
    bagId: 'b3',
    waterIntrusion: false,
    lostItems: false,
    damaged: false,
    dryerId: null,
    notes: '',
    checkedAt: null,
    checkedBy: null
  },
  {
    id: 'pc4',
    bagId: 'b4',
    waterIntrusion: true,
    lostItems: false,
    damaged: true,
    dryerId: 'm4',
    notes: '底部密封条破损，有少量进水，毛巾湿了',
    checkedAt: '2024-06-20T16:10:00Z',
    checkedBy: '领队'
  }
];
