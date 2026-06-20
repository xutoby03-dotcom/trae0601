import dayjs from 'dayjs';
import type { BorrowRecord, InventoryItem, MedicineBox, Reminder } from '@/types';
import { computeItemStatus } from '@/utils';

const now = dayjs();

export const mockBoxes: MedicineBox[] = [
  {
    id: 'box-1',
    location: '活动室入口',
    manager: '张阿姨',
    capacity: 50,
    applicableActivities: '日常便民、老年活动',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    createdAt: now.subtract(3, 'month').toISOString(),
    updatedAt: now.subtract(1, 'week').toISOString(),
  },
  {
    id: 'box-2',
    location: '多功能厅',
    manager: '李叔叔',
    capacity: 40,
    applicableActivities: '会议、演出、培训活动',
    photoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    createdAt: now.subtract(2, 'month').toISOString(),
    updatedAt: now.subtract(3, 'day').toISOString(),
  },
  {
    id: 'box-3',
    location: '健身室',
    manager: '王教练',
    capacity: 30,
    applicableActivities: '健身运动、体育赛事',
    photoUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&q=80',
    createdAt: now.subtract(1, 'month').toISOString(),
    updatedAt: now.subtract(1, 'day').toISOString(),
  },
];

export const mockItems: InventoryItem[] = [
  { id: 'item-1', boxId: 'box-1', name: '创可贴', category: 'band-aid', expiryDate: now.add(6, 'month').format('YYYY-MM-DD'), quantity: 50, storageCell: 'A1', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(1, 'day').toISOString() },
  { id: 'item-2', boxId: 'box-1', name: '纱布', category: 'gauze', expiryDate: now.add(12, 'month').format('YYYY-MM-DD'), quantity: 20, storageCell: 'A2', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(2, 'day').toISOString() },
  { id: 'item-3', boxId: 'box-1', name: '碘伏棉签', category: 'iodine-swab', expiryDate: now.add(8, 'month').format('YYYY-MM-DD'), quantity: 30, storageCell: 'A3', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(3, 'day').toISOString() },
  { id: 'item-4', boxId: 'box-1', name: '冰袋', category: 'ice-pack', expiryDate: now.add(24, 'month').format('YYYY-MM-DD'), quantity: 5, storageCell: 'B1', status: 'low-stock', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(1, 'week').toISOString() },
  { id: 'item-5', boxId: 'box-1', name: '体温计', category: 'thermometer', expiryDate: now.add(36, 'month').format('YYYY-MM-DD'), quantity: 3, storageCell: 'B2', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(2, 'week').toISOString() },
  { id: 'item-6', boxId: 'box-1', name: '血压计', category: 'blood-pressure-monitor', expiryDate: now.add(60, 'month').format('YYYY-MM-DD'), quantity: 2, storageCell: 'B3', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(1, 'week').toISOString() },

  { id: 'item-7', boxId: 'box-2', name: '创可贴', category: 'band-aid', expiryDate: now.add(5, 'month').format('YYYY-MM-DD'), quantity: 3, storageCell: 'A1', status: 'low-stock', createdAt: now.subtract(2, 'month').toISOString(), updatedAt: now.subtract(2, 'day').toISOString() },
  { id: 'item-8', boxId: 'box-2', name: '纱布', category: 'gauze', expiryDate: now.add(10, 'month').format('YYYY-MM-DD'), quantity: 15, storageCell: 'A2', status: 'normal', createdAt: now.subtract(2, 'month').toISOString(), updatedAt: now.subtract(1, 'week').toISOString() },
  { id: 'item-9', boxId: 'box-2', name: '碘伏棉签', category: 'iodine-swab', expiryDate: now.subtract(5, 'day').format('YYYY-MM-DD'), quantity: 10, storageCell: 'A3', status: 'expired', createdAt: now.subtract(2, 'month').toISOString(), updatedAt: now.toISOString() },
  { id: 'item-10', boxId: 'box-2', name: '冰袋', category: 'ice-pack', expiryDate: now.add(20, 'month').format('YYYY-MM-DD'), quantity: 8, storageCell: 'B1', status: 'normal', createdAt: now.subtract(2, 'month').toISOString(), updatedAt: now.subtract(3, 'day').toISOString() },
  { id: 'item-11', boxId: 'box-2', name: '体温计', category: 'thermometer', expiryDate: now.add(30, 'month').format('YYYY-MM-DD'), quantity: 2, storageCell: 'B2', status: 'normal', createdAt: now.subtract(2, 'month').toISOString(), updatedAt: now.subtract(1, 'month').toISOString() },
  { id: 'item-12', boxId: 'box-2', name: '血压计', category: 'blood-pressure-monitor', expiryDate: now.add(48, 'month').format('YYYY-MM-DD'), quantity: 1, storageCell: 'B3', status: 'normal', createdAt: now.subtract(2, 'month').toISOString(), updatedAt: now.subtract(2, 'week').toISOString() },

  { id: 'item-13', boxId: 'box-3', name: '创可贴', category: 'band-aid', expiryDate: now.add(3, 'month').format('YYYY-MM-DD'), quantity: 40, storageCell: 'A1', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(3, 'day').toISOString() },
  { id: 'item-14', boxId: 'box-3', name: '纱布', category: 'gauze', expiryDate: now.add(15, 'day').format('YYYY-MM-DD'), quantity: 8, storageCell: 'A2', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(1, 'week').toISOString() },
  { id: 'item-15', boxId: 'box-3', name: '碘伏棉签', category: 'iodine-swab', expiryDate: now.add(6, 'month').format('YYYY-MM-DD'), quantity: 25, storageCell: 'A3', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(2, 'week').toISOString() },
  { id: 'item-16', boxId: 'box-3', name: '冰袋', category: 'ice-pack', expiryDate: now.add(18, 'month').format('YYYY-MM-DD'), quantity: 1, storageCell: 'B1', status: 'low-stock', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(1, 'day').toISOString() },
  { id: 'item-17', boxId: 'box-3', name: '体温计', category: 'thermometer', expiryDate: now.add(24, 'month').format('YYYY-MM-DD'), quantity: 0, storageCell: 'B2', status: 'damaged', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.toISOString() },
  { id: 'item-18', boxId: 'box-3', name: '血压计', category: 'blood-pressure-monitor', expiryDate: now.add(36, 'month').format('YYYY-MM-DD'), quantity: 1, storageCell: 'B3', status: 'normal', createdAt: now.subtract(1, 'month').toISOString(), updatedAt: now.subtract(1, 'week').toISOString() },
].map((item: InventoryItem) => {
  if (item.status === 'damaged') return item;
  return { ...item, status: computeItemStatus(item) };
});

export const mockBorrows: BorrowRecord[] = [
  { id: 'borrow-1', residentName: '赵大爷', building: '3号楼', purpose: '手部擦伤', itemId: 'item-1', itemName: '创可贴', category: 'band-aid', quantity: 2, returnRequirement: '一次性用品无需归还', expectedReturnDate: now.format('YYYY-MM-DD'), actualReturnDate: null, cleanlinessStatus: null, status: 'borrowing', borrowDate: now.format('YYYY-MM-DD'), createdAt: now.toISOString() },
  { id: 'borrow-2', residentName: '陈大姐', building: '5号楼', purpose: '发烧测量', itemId: 'item-5', itemName: '体温计', category: 'thermometer', quantity: 1, returnRequirement: '请擦拭消毒后归还', expectedReturnDate: now.add(1, 'day').format('YYYY-MM-DD'), actualReturnDate: null, cleanlinessStatus: null, status: 'borrowing', borrowDate: now.format('YYYY-MM-DD'), createdAt: now.subtract(2, 'hour').toISOString() },
  { id: 'borrow-3', residentName: '刘先生', building: '1号楼', purpose: '运动扭伤', itemId: 'item-16', itemName: '冰袋', category: 'ice-pack', quantity: 1, returnRequirement: '归还后请放回冷冻层', expectedReturnDate: now.subtract(2, 'day').format('YYYY-MM-DD'), actualReturnDate: null, cleanlinessStatus: null, status: 'overdue', borrowDate: now.subtract(5, 'day').format('YYYY-MM-DD'), createdAt: now.subtract(5, 'day').toISOString() },
  { id: 'borrow-4', residentName: '孙奶奶', building: '7号楼', purpose: '血压测量', itemId: 'item-6', itemName: '血压计', category: 'blood-pressure-monitor', quantity: 1, returnRequirement: '请擦拭清洁后归还', expectedReturnDate: now.subtract(3, 'day').format('YYYY-MM-DD'), actualReturnDate: now.subtract(1, 'day').format('YYYY-MM-DD'), cleanlinessStatus: 'clean', status: 'returned', borrowDate: now.subtract(7, 'day').format('YYYY-MM-DD'), createdAt: now.subtract(7, 'day').toISOString() },
  { id: 'borrow-5', residentName: '周阿姨', building: '2号楼', purpose: '伤口消毒', itemId: 'item-3', itemName: '碘伏棉签', category: 'iodine-swab', quantity: 5, returnRequirement: '一次性用品无需归还', expectedReturnDate: now.subtract(1, 'day').format('YYYY-MM-DD'), actualReturnDate: now.subtract(1, 'day').format('YYYY-MM-DD'), cleanlinessStatus: null, status: 'returned', borrowDate: now.subtract(1, 'day').format('YYYY-MM-DD'), createdAt: now.subtract(1, 'day').toISOString() },
  { id: 'borrow-6', residentName: '吴师傅', building: '4号楼', purpose: '健身扭伤', itemId: 'item-16', itemName: '冰袋', category: 'ice-pack', quantity: 1, returnRequirement: '归还后请放回冷冻层', expectedReturnDate: now.format('YYYY-MM-DD'), actualReturnDate: null, cleanlinessStatus: null, status: 'borrowing', borrowDate: now.subtract(1, 'day').format('YYYY-MM-DD'), createdAt: now.subtract(1, 'day').toISOString() },
];

export const mockReminders: Reminder[] = [
  { id: 'rem-1', type: 'low-stock', relatedId: 'item-7', title: '创可贴 库存不足', description: '当前库存: 3，建议及时补货', level: 'warning', isRead: false, createdAt: now.subtract(1, 'hour').toISOString() },
  { id: 'rem-2', type: 'expiry', relatedId: 'item-9', title: '碘伏棉签 已过期', description: '存放格: A3，请及时更换过期物品', level: 'danger', isRead: false, createdAt: now.subtract(3, 'hour').toISOString() },
  { id: 'rem-3', type: 'damage', relatedId: 'item-17', title: '体温计 已破损', description: '存放格: B2，请及时处理或更换', level: 'danger', isRead: true, createdAt: now.subtract(1, 'day').toISOString() },
  { id: 'rem-4', type: 'low-stock', relatedId: 'item-16', title: '冰袋 库存不足', description: '当前库存: 1，建议及时补货', level: 'danger', isRead: false, createdAt: now.subtract(6, 'hour').toISOString() },
  { id: 'rem-5', type: 'overdue-return', relatedId: 'borrow-3', title: '刘先生 逾期未还', description: '物品: 冰袋，已逾期 2 天', level: 'danger', isRead: false, createdAt: now.subtract(1, 'hour').toISOString() },
];
