import type { Material, Member, PickupPoint, InventoryLog, PickupRecord } from '../types';

export const mockPickupPoints: PickupPoint[] = [
  { id: 'pp1', name: 'A区取货点', location: '场馆东门入口' },
  { id: 'pp2', name: 'B区取货点', location: '场馆西门入口' },
  { id: 'pp3', name: 'VIP取货点', location: '内场入口处' },
];

export const mockMaterials: Material[] = [
  {
    id: 'm1',
    name: '演唱会限定手幅',
    category: 'slogan',
    totalQuantity: 200,
    remainingQuantity: 156,
    cost: 15.8,
    producer: '星光手作工作室',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop',
    bagNumber: 'A-01',
    description: '双面印刷，绒布材质，35*80cm',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'm2',
    name: '应援灯牌贴纸',
    category: 'lightSticker',
    totalQuantity: 300,
    remainingQuantity: 278,
    cost: 5.5,
    producer: '荧光文创',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
    bagNumber: 'A-02',
    description: '荧光材质，夜间发光，包含3张',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'm3',
    name: '纪念票套',
    category: 'ticketHolder',
    totalQuantity: 250,
    remainingQuantity: 215,
    cost: 12.0,
    producer: '纸品印象',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
    bagNumber: 'B-01',
    description: '烫金工艺，内含明信片',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'm4',
    name: '金属徽章套装',
    category: 'badge',
    totalQuantity: 180,
    remainingQuantity: 165,
    cost: 28.0,
    producer: '徽章制造局',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop',
    bagNumber: 'B-02',
    description: '一套4枚，锌合金材质，蝴蝶扣',
    createdAt: '2026-01-15T10:00:00Z',
  },
];

const seatSections = ['A1区', 'A2区', 'B1区', 'B2区', 'C区', '内场VIP'];
const names = [
  '李星瑶', '王雨桐', '张梓涵', '陈嘉怡', '刘思琪',
  '杨雪莹', '赵晓萱', '黄诗涵', '周佳琪', '吴雨萱',
  '徐若曦', '孙梦琪', '马雅婷', '朱梦瑶', '胡诗琪',
  '郭雨晨', '何欣怡', '罗欣然', '梁雨桐', '宋佳怡',
  '郑晓燕', '谢雅琴', '韩美玲', '唐丽娜', '冯佳慧',
  '董思彤', '萧雅文', '程雨欣', '曹雪婷', '袁梦洁',
  '邓语菲', '许嫣然', '傅雅琳', '沈若汐', '曾诗雅',
  '彭倩雯', '吕静怡', '苏婉清', '蒋雨彤', '蔡晓琳',
];

function generateMembers(): Member[] {
  const members: Member[] = [];
  for (let i = 0; i < 35; i++) {
    const statusRoll = Math.random();
    let status: Member['status'];
    let pickupTime: string | null = null;
    let proxyById: string | null = null;
    let queueStartTime: string | null = null;

    if (statusRoll < 0.5) {
      status = 'pending';
      queueStartTime = new Date(Date.now() - Math.random() * 10 * 60 * 1000).toISOString();
    } else if (statusRoll < 0.85) {
      status = 'picked';
      pickupTime = new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString();
    } else {
      status = 'proxied';
      pickupTime = new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString();
    }

    members.push({
      id: `member-${i + 1}`,
      name: names[i],
      phoneLastFour: String(Math.floor(1000 + Math.random() * 9000)),
      seatSection: seatSections[Math.floor(Math.random() * seatSections.length)],
      amountDue: Math.floor(Math.random() * 3) === 0 ? 0 : [35, 50, 65, 80][Math.floor(Math.random() * 4)],
      canProxy: Math.random() > 0.6,
      pickupPoint: mockPickupPoints[Math.floor(Math.random() * mockPickupPoints.length)].id,
      status,
      proxyById,
      pickupTime,
      queueStartTime,
      createdAt: '2026-06-01T10:00:00Z',
    });
  }
  return members;
}

export const mockMembers: Member[] = generateMembers();

export const mockInventoryLogs: InventoryLog[] = [
  {
    id: 'log1',
    materialId: 'm1',
    type: 'damaged',
    quantity: 3,
    reason: '运输过程中边角折损',
    operator: '管理员',
    createdAt: '2026-06-16T09:30:00Z',
  },
  {
    id: 'log2',
    materialId: 'm3',
    type: 'missing',
    quantity: 2,
    reason: '现场清点发现缺失',
    operator: '管理员',
    createdAt: '2026-06-16T10:15:00Z',
  },
];

function generatePickupRecords(): PickupRecord[] {
  const records: PickupRecord[] = [];
  const pickedMembers = mockMembers.filter(m => m.status === 'picked' || m.status === 'proxied');
  
  pickedMembers.forEach((member, index) => {
    if (member.pickupTime) {
      const waitTime = Math.floor(60 + Math.random() * 540);
      const queueStart = new Date(new Date(member.pickupTime).getTime() - waitTime * 1000).toISOString();
      
      records.push({
        id: `record-${index + 1}`,
        memberId: member.id,
        pickupPointId: member.pickupPoint,
        type: member.status === 'proxied' ? 'proxy' : 'self',
        proxyMemberId: null,
        queueStartTime: queueStart,
        pickupTime: member.pickupTime,
        waitDuration: waitTime,
      });
    }
  });
  
  return records;
}

export const mockPickupRecords: PickupRecord[] = generatePickupRecords();
