import type { ReimbursementItem } from '../types';

export const mockRoommates = [
  { id: 'u1', name: '张三' },
  { id: 'u2', name: '李四' },
  { id: 'u3', name: '王五' },
  { id: 'u4', name: '赵六' },
];

export const mockReimbursements: ReimbursementItem[] = [
  {
    id: 'r1',
    date: '2026-06-10',
    amount: 45.5,
    description: '加班晚餐 - 外卖',
    applicant: '张三',
    status: 'pending',
    createdAt: '2026-06-10T20:30:00Z',
  },
  {
    id: 'r2',
    date: '2026-06-09',
    amount: 68.0,
    description: '加班晚餐 - 烧烤',
    applicant: '李四',
    status: 'approved',
    createdAt: '2026-06-09T21:15:00Z',
    reviewedBy: '王五',
  },
  {
    id: 'r3',
    date: '2026-06-08',
    amount: 32.0,
    description: '加班晚餐 - 便利店',
    applicant: '王五',
    status: 'reviewing',
    createdAt: '2026-06-08T19:45:00Z',
  },
];
