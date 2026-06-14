import type { Department, Employee } from '@/types';

export const departments: Department[] = [
  { id: 'd-tech', name: '技术部', color: '#4573AD' },
  { id: 'd-product', name: '产品部', color: '#36CFC9' },
  { id: 'd-design', name: '设计部', color: '#A855F7' },
  { id: 'd-sales', name: '销售部', color: '#FF7A45' },
  { id: 'd-market', name: '市场部', color: '#EC4899' },
  { id: 'd-hr', name: '人力资源部', color: '#10B981' },
  { id: 'd-finance', name: '财务部', color: '#F59E0B' },
  { id: 'd-ops', name: '运营部', color: '#6366F1' },
  { id: 'd-legal', name: '法务部', color: '#14B8A6' },
  { id: 'd-admin', name: '行政部', color: '#64748B' },
];

export const employees: Employee[] = [
  { id: 'u-admin-001', name: '王前台', departmentId: 'd-admin', phone: '13800138001', role: 'receptionist' },
  { id: 'u-admin-002', name: '李行政', departmentId: 'd-admin', phone: '13800138002', role: 'admin' },
  { id: 'u-tech-001', name: '张伟', departmentId: 'd-tech', phone: '13900139001', role: 'host' },
  { id: 'u-tech-002', name: '刘芳', departmentId: 'd-tech', phone: '13900139002', role: 'host' },
  { id: 'u-tech-003', name: '陈磊', departmentId: 'd-tech', phone: '13900139003', role: 'host' },
  { id: 'u-product-001', name: '赵雪', departmentId: 'd-product', phone: '13700137001', role: 'host' },
  { id: 'u-product-002', name: '孙明', departmentId: 'd-product', phone: '13700137002', role: 'host' },
  { id: 'u-design-001', name: '周婷', departmentId: 'd-design', phone: '13600136001', role: 'host' },
  { id: 'u-design-002', name: '吴昊', departmentId: 'd-design', phone: '13600136002', role: 'host' },
  { id: 'u-sales-001', name: '郑浩', departmentId: 'd-sales', phone: '13500135001', role: 'host' },
  { id: 'u-sales-002', name: '钱丽娜', departmentId: 'd-sales', phone: '13500135002', role: 'host' },
  { id: 'u-market-001', name: '冯佳', departmentId: 'd-market', phone: '13400134001', role: 'host' },
  { id: 'u-hr-001', name: '林美玲', departmentId: 'd-hr', phone: '13300133001', role: 'host' },
  { id: 'u-finance-001', name: '黄建国', departmentId: 'd-finance', phone: '13200132001', role: 'host' },
  { id: 'u-ops-001', name: '何勇', departmentId: 'd-ops', phone: '13100131001', role: 'host' },
  { id: 'u-legal-001', name: '罗律师', departmentId: 'd-legal', phone: '13000130001', role: 'host' },
];

export const CURRENT_USER_ID = 'u-admin-001';
