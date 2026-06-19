import type { Friend, Box, BorrowRecord, MovePlan } from '@/types';

export const initialFriends: Friend[] = [
  { id: '1', name: '小明', avatar: '👨', community: '阳光花园', phone: '13800138001', createdAt: '2026-01-15' },
  { id: '2', name: '小红', avatar: '👩', community: '翠湖小区', phone: '13800138002', createdAt: '2026-01-20' },
  { id: '3', name: '大壮', avatar: '🧔', community: '阳光花园', phone: '13800138003', createdAt: '2026-02-01' },
  { id: '4', name: '小美', avatar: '👧', community: '金桂苑', phone: '13800138004', createdAt: '2026-02-10' },
];

export const initialBoxes: Box[] = [
  { id: '1', category: 'large', length: 80, width: 60, height: 50, loadCapacity: 30, source: '京东购买', usageCount: 2, status: 'available', photo: '', notes: '大号搬家箱', createdAt: '2026-03-01', updatedAt: '2026-05-15' },
  { id: '2', category: 'wardrobe', length: 60, width: 50, height: 100, loadCapacity: 15, source: '上次搬家留下', usageCount: 1, status: 'reserved', photo: '', notes: '衣柜箱带挂衣杆', createdAt: '2026-03-05', updatedAt: '2026-06-01' },
  { id: '3', category: 'book', length: 40, width: 30, height: 25, loadCapacity: 20, source: '当当网', usageCount: 3, status: 'in_use', photo: '', notes: '书箱，承重好', createdAt: '2026-02-20', updatedAt: '2026-06-10' },
  { id: '4', category: 'large', length: 70, width: 50, height: 40, loadCapacity: 25, source: '朋友赠送', usageCount: 0, status: 'available', photo: '', notes: '几乎全新', createdAt: '2026-06-15', updatedAt: '2026-06-15' },
  { id: '5', category: 'book', length: 35, width: 25, height: 20, loadCapacity: 15, source: '淘宝', usageCount: 4, status: 'scrapped', photo: '', notes: '', createdAt: '2026-01-10', updatedAt: '2026-05-20' },
  { id: '6', category: 'wardrobe', length: 55, width: 45, height: 90, loadCapacity: 12, source: '上次搬家留下', usageCount: 2, status: 'available', photo: '', notes: '挂衣杆完好', createdAt: '2026-04-01', updatedAt: '2026-06-01' },
  { id: '7', category: 'large', length: 90, width: 60, height: 55, loadCapacity: 35, source: '顺丰购买', usageCount: 1, status: 'need_repair', photo: '', notes: '边角有轻微破损', createdAt: '2026-05-10', updatedAt: '2026-06-12' },
  { id: '8', category: 'book', length: 45, width: 35, height: 25, loadCapacity: 25, source: '京东购买', usageCount: 2, status: 'available', photo: '', notes: '加厚型', createdAt: '2026-05-20', updatedAt: '2026-06-10' },
];

export const initialBorrowRecords: BorrowRecord[] = [
  { id: '1', boxId: '2', friendId: '1', community: '阳光花园', reserveStartDate: '2026-06-18', reserveEndDate: '2026-06-25', status: 'pending', createdAt: '2026-06-15' },
  { id: '2', boxId: '3', friendId: '2', community: '翠湖小区', reserveStartDate: '2026-06-10', reserveEndDate: '2026-06-20', actualPickupDate: '2026-06-10', status: 'picked_up', createdAt: '2026-06-08' },
  { id: '3', boxId: '5', friendId: '3', community: '阳光花园', reserveStartDate: '2026-05-01', reserveEndDate: '2026-05-10', actualPickupDate: '2026-05-01', actualReturnDate: '2026-05-10', status: 'returned', dampCheck: 2, holeCheck: 3, tapeCheck: 1, scrapReason: '破洞严重无法修复', createdAt: '2026-04-28' },
];

export const initialMovePlans: MovePlan[] = [
  { id: '1', friendId: '1', moveDate: '2026-06-25', fromCommunity: '阳光花园', toCommunity: '金桂苑', notes: '周末搬家，需要人手帮忙', createdAt: '2026-06-10' },
  { id: '2', friendId: '4', moveDate: '2026-07-05', fromCommunity: '金桂苑', toCommunity: '翠湖小区', notes: '', createdAt: '2026-06-12' },
  { id: '3', friendId: '2', moveDate: '2026-07-15', fromCommunity: '翠湖小区', toCommunity: '阳光花园', notes: '需要大量纸箱', createdAt: '2026-06-08' },
];
