import type { Application } from '../types';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const mockApplications: Application[] = [
  {
    id: 'a1',
    posterId: 'p1',
    applicant: '张三',
    contact: '13800138001',
    bulletinBoardId: 'bb1',
    quantity: 3,
    needTop: true,
    status: 'approved',
    createdAt: addDays(-10),
    auditedAt: addDays(-8),
  },
  {
    id: 'a2',
    posterId: 'p2',
    applicant: '李四',
    contact: '13800138002',
    bulletinBoardId: 'bb2',
    quantity: 2,
    needTop: false,
    status: 'approved',
    createdAt: addDays(-8),
    auditedAt: addDays(-6),
  },
  {
    id: 'a3',
    posterId: 'p3',
    applicant: '王五',
    contact: '13800138003',
    bulletinBoardId: 'bb6',
    quantity: 5,
    needTop: true,
    status: 'approved',
    createdAt: addDays(-5),
    auditedAt: addDays(-3),
  },
  {
    id: 'a4',
    posterId: 'p4',
    applicant: '赵六',
    contact: '13800138004',
    bulletinBoardId: 'bb7',
    quantity: 4,
    needTop: false,
    status: 'approved',
    createdAt: addDays(-4),
    auditedAt: addDays(-2),
  },
  {
    id: 'a5',
    posterId: 'p5',
    applicant: '钱七',
    contact: '13800138005',
    bulletinBoardId: 'bb8',
    quantity: 3,
    needTop: true,
    status: 'pending',
    createdAt: addDays(-2),
  },
  {
    id: 'a6',
    posterId: 'p6',
    applicant: '孙八',
    contact: '13800138006',
    bulletinBoardId: 'bb4',
    quantity: 6,
    needTop: false,
    status: 'approved',
    createdAt: addDays(-15),
    auditedAt: addDays(-13),
  },
  {
    id: 'a7',
    posterId: 'p7',
    applicant: '周九',
    contact: '13800138007',
    bulletinBoardId: 'bb3',
    quantity: 2,
    needTop: true,
    status: 'pending',
    createdAt: addDays(-1),
  },
];
