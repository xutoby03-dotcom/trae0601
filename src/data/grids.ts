import { Grid } from '@/types';

export const mockGrids: Grid[] = [
  {
    id: 'grid-1',
    name: '第一网格',
    managerName: '张建国',
    managerPhone: '13800138001',
  },
  {
    id: 'grid-2',
    name: '第二网格',
    managerName: '李淑芬',
    managerPhone: '13800138002',
  },
  {
    id: 'grid-3',
    name: '第三网格',
    managerName: '王美玲',
    managerPhone: '13800138003',
  },
];

export const getGridById = (id: string): Grid | undefined => {
  return mockGrids.find(g => g.id === id);
};
