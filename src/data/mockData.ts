import type { Canopy, BorrowRecord, RepairRecord } from '@/types';

export const initialCanopies: Canopy[] = [
  {
    id: 'c1',
    name: '雨棚 A-01',
    status: 'available',
    accessories: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
  },
  {
    id: 'c2',
    name: '雨棚 A-02',
    status: 'available',
    accessories: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
  },
  {
    id: 'c3',
    name: '雨棚 B-01',
    status: 'borrowed',
    accessories: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
  },
  {
    id: 'c4',
    name: '雨棚 B-02',
    status: 'drying',
    accessories: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
  },
  {
    id: 'c5',
    name: '雨棚 C-01',
    status: 'repairing',
    accessories: { tarp: 1, pole: 4, bar: 7, stake: 10, bag: 1 },
  },
];

const now = new Date();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const threeHoursAhead = new Date(now.getTime() + 3 * 60 * 60 * 1000);
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
const oneHourAhead = new Date(now.getTime() + 1 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const yesterdayAhead = new Date(yesterday.getTime() + 4 * 60 * 60 * 1000);

export const initialBorrowRecords: BorrowRecord[] = [
  {
    id: 'br1',
    canopyId: 'c3',
    activityName: '社区端午节活动',
    location: '3号楼前广场',
    contact: '张阿姨 13800138001',
    deposit: 200,
    borrowTime: twoHoursAgo.toISOString(),
    dueTime: threeHoursAhead.toISOString(),
    borrowedItems: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
    status: 'active',
  },
  {
    id: 'br2',
    canopyId: 'c5',
    activityName: '业主入伙仪式',
    location: '1栋大堂门口',
    contact: '李先生 13900139002',
    deposit: 200,
    borrowTime: yesterday.toISOString(),
    dueTime: yesterdayAhead.toISOString(),
    returnTime: oneHourAgo.toISOString(),
    borrowedItems: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
    returnedItems: { tarp: 1, pole: 4, bar: 7, stake: 10, bag: 1 },
    isWet: false,
    isOverdue: true,
    status: 'returned',
  },
  {
    id: 'br3',
    canopyId: 'c4',
    activityName: '便民服务日',
    location: '物业服务中心门口',
    contact: '王主任 13700137003',
    deposit: 200,
    borrowTime: oneHourAgo.toISOString(),
    dueTime: oneHourAhead.toISOString(),
    returnTime: now.toISOString(),
    borrowedItems: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
    returnedItems: { tarp: 1, pole: 4, bar: 8, stake: 12, bag: 1 },
    isWet: true,
    isOverdue: false,
    status: 'returned',
  },
];

export const initialRepairRecords: RepairRecord[] = [
  {
    id: 'rp1',
    canopyId: 'c5',
    borrowRecordId: 'br2',
    issueType: 'missing',
    accessoryType: 'bar',
    description: '少了1根横杆',
    status: 'pending',
    createdAt: oneHourAgo.toISOString(),
  },
  {
    id: 'rp2',
    canopyId: 'c5',
    borrowRecordId: 'br2',
    issueType: 'missing',
    accessoryType: 'stake',
    description: '少了2根地钉',
    status: 'pending',
    createdAt: oneHourAgo.toISOString(),
  },
];
