import type { Child, Vaccine } from '@/types';

export const mockChildren: Omit<Child, 'id' | 'createdAt'>[] = [
  {
    name: '李小乐',
    birthday: '2023-03-15',
    gender: '男',
    allergyHistory: '青霉素过敏',
    vaccinationSite: '朝阳区社区卫生服务中心',
    guardianPhone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaole&backgroundColor=b6e3f4',
    vaccineBookPhoto: '',
  },
  {
    name: '王小美',
    birthday: '2024-06-20',
    gender: '女',
    allergyHistory: '无',
    vaccinationSite: '海淀区妇幼保健院',
    guardianPhone: '13900139002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei&backgroundColor=ffd5dc',
    vaccineBookPhoto: '',
  },
];

const generateMockVaccines = (): Omit<Vaccine, 'id' | 'createdAt'>[] => {
  const today = new Date();
  const fmt = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const addDays = (base: Date, days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };

  const base = new Date(today);

  return [
    {
      childId: 'CHILD-1',
      name: '乙肝疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, -90)),
      latestDate: fmt(addDays(base, -60)),
      status: 'completed',
      notes: '无特殊注意事项',
      actualDate: fmt(addDays(base, -85)),
      delayedCount: 0,
    },
    {
      childId: 'CHILD-1',
      name: '卡介苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, -88)),
      latestDate: fmt(addDays(base, -58)),
      status: 'completed',
      notes: '接种后2-3周出现小硬结属正常反应',
      actualDate: fmt(addDays(base, -83)),
      delayedCount: 0,
    },
    {
      childId: 'CHILD-1',
      name: '脊灰灭活疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, -20)),
      latestDate: fmt(addDays(base, 10)),
      originalSuggestedDate: fmt(addDays(base, -35)),
      originalLatestDate: fmt(addDays(base, -5)),
      status: 'overdue',
      notes: '注射后可能发热',
      delayedReason: '感冒咳嗽，医生建议延期',
      delayedCount: 1,
    },
    {
      childId: 'CHILD-1',
      name: '百白破疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, 5)),
      latestDate: fmt(addDays(base, 25)),
      status: 'pending',
      notes: '接种部位可能红肿',
      delayedCount: 0,
    },
    {
      childId: 'CHILD-1',
      name: '麻腮风疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, 30)),
      latestDate: fmt(addDays(base, 60)),
      status: 'appointed',
      notes: '接种后6-12天可能出现轻微皮疹',
      appointmentTime: fmt(addDays(base, 32)) + ' 09:30',
      appointmentLocation: '朝阳区社区卫生服务中心',
      queueNumber: 'A-015',
      delayedCount: 0,
    },
    {
      childId: 'CHILD-1',
      name: '乙脑减毒活疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, 90)),
      latestDate: fmt(addDays(base, 120)),
      status: 'pending',
      notes: '',
      delayedCount: 0,
    },
    {
      childId: 'CHILD-2',
      name: '乙肝疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, -180)),
      latestDate: fmt(addDays(base, -150)),
      status: 'completed',
      notes: '',
      actualDate: fmt(addDays(base, -178)),
      delayedCount: 0,
    },
    {
      childId: 'CHILD-2',
      name: '乙肝疫苗',
      dose: 2,
      suggestedDate: fmt(addDays(base, -10)),
      latestDate: fmt(addDays(base, 3)),
      status: 'appointed',
      notes: '需与第一剂间隔至少28天',
      appointmentTime: fmt(addDays(base, 1)) + ' 10:00',
      appointmentLocation: '海淀区妇幼保健院',
      queueNumber: 'B-008',
      delayedCount: 0,
    },
    {
      childId: 'CHILD-2',
      name: '脊灰灭活疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, 20)),
      latestDate: fmt(addDays(base, 50)),
      status: 'pending',
      notes: '',
      delayedCount: 0,
    },
    {
      childId: 'CHILD-2',
      name: 'A群流脑多糖疫苗',
      dose: 1,
      suggestedDate: fmt(addDays(base, 100)),
      latestDate: fmt(addDays(base, 140)),
      status: 'pending',
      notes: '满6月龄后接种',
      delayedCount: 0,
    },
  ];
};

export const mockVaccines = generateMockVaccines();
