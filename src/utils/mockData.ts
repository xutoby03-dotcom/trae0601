import type { Bag, BorrowRecord } from '@/types';
import { generateId } from './helpers';

function createBagPhoto(color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    gradient.addColorStop(0, '#FFF5F0');
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);
    
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(150, 110, 70, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(100, 180, 100, 80);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(100, 180, 100, 60);
    
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(130, 70);
    ctx.quadraticCurveTo(150, 40, 170, 70);
    ctx.stroke();
  }
  return canvas.toDataURL();
}

function daysAgo(days: number, hours: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function daysLater(days: number, hours: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function getMockBags(): Bag[] {
  const colors = ['#FF7A45', '#2ECC71', '#3498DB', '#9B59B6', '#F39C12', '#E74C3C', '#1ABC9C', '#34495E', '#E67E22', '#16A085'];
  const bags: Bag[] = [];
  
  const bagConfigs = [
    { code: 'BWD-001', capacity: 32, color: '橙色', colorHex: colors[0], status: 'available' as const, insulation: 'excellent' as const },
    { code: 'BWD-002', capacity: 32, color: '绿色', colorHex: colors[1], status: 'borrowed' as const, insulation: 'good' as const },
    { code: 'BWD-003', capacity: 48, color: '蓝色', colorHex: colors[2], status: 'available' as const, insulation: 'excellent' as const },
    { code: 'BWD-004', capacity: 22, color: '紫色', colorHex: colors[3], status: 'borrowed' as const, insulation: 'good' as const },
    { code: 'BWD-005', capacity: 32, color: '黄色', colorHex: colors[4], status: 'damaged' as const, insulation: 'fair' as const },
    { code: 'BWD-006', capacity: 48, color: '红色', colorHex: colors[5], status: 'available' as const, insulation: 'good' as const },
    { code: 'BWD-007', capacity: 22, color: '青色', colorHex: colors[6], status: 'borrowed' as const, insulation: 'excellent' as const },
    { code: 'BWD-008', capacity: 32, color: '深灰', colorHex: colors[7], status: 'lost' as const, insulation: 'poor' as const },
    { code: 'BWD-009', capacity: 48, color: '橙色', colorHex: colors[8], status: 'available' as const, insulation: 'good' as const },
    { code: 'BWD-010', capacity: 22, color: '青绿', colorHex: colors[9], status: 'borrowed' as const, insulation: 'excellent' as const },
  ];
  
  bagConfigs.forEach((config, index) => {
    bags.push({
      id: generateId() + index,
      code: config.code,
      capacity: config.capacity,
      color: config.color,
      insulationStatus: config.insulation,
      deposit: config.capacity >= 40 ? 100 : config.capacity >= 30 ? 80 : 50,
      photo: createBagPhoto(config.colorHex),
      status: config.status,
      turnoverCount: Math.floor(Math.random() * 20) + 5,
      damageCount: Math.floor(Math.random() * 3),
      createdAt: daysAgo(30 + index),
      updatedAt: daysAgo(index),
    });
  });
  
  return bags;
}

export function getMockRecords(bags: Bag[]): BorrowRecord[] {
  const availableBags = bags.filter(b => b.status === 'borrowed');
  const records: BorrowRecord[] = [];
  
  const riderNames = ['张伟', '李强', '王磊', '刘洋', '陈明', '赵鹏', '孙浩', '周涛', '吴明', '郑飞', '冯军', '黄勇', '徐超', '马强', '朱波'];
  const platforms: Array<'meituan' | 'eleme' | 'douyin' | 'other'> = ['meituan', 'eleme', 'meituan', 'eleme', 'douyin', 'meituan', 'eleme', 'other', 'meituan', 'eleme', 'meituan', 'douyin', 'eleme', 'meituan', 'eleme'];
  
  const recordConfigs = [
    { daysBorrowed: 0, daysOverdue: 0, status: 'active' as const, bagIdx: 1 },
    { daysBorrowed: 1, daysOverdue: 0, status: 'active' as const, bagIdx: 3 },
    { daysBorrowed: 2, daysOverdue: 0, status: 'active' as const, bagIdx: 6 },
    { daysBorrowed: 3, daysOverdue: 1, status: 'overdue' as const, bagIdx: 9 },
    { daysBorrowed: 1, daysOverdue: 0, status: 'returned' as const, bagIdx: 0 },
    { daysBorrowed: 2, daysOverdue: 0, status: 'returned' as const, bagIdx: 2 },
    { daysBorrowed: 3, daysOverdue: 0, status: 'returned' as const, bagIdx: 5 },
    { daysBorrowed: 1, daysOverdue: 0, status: 'returned' as const, bagIdx: 8 },
    { daysBorrowed: 4, daysOverdue: 2, status: 'returned' as const, bagIdx: 4 },
    { daysBorrowed: 5, daysOverdue: 0, status: 'returned' as const, bagIdx: 0 },
    { daysBorrowed: 2, daysOverdue: 0, status: 'returned' as const, bagIdx: 2 },
    { daysBorrowed: 1, daysOverdue: 0, status: 'returned' as const, bagIdx: 5 },
    { daysBorrowed: 3, daysOverdue: 0, status: 'returned' as const, bagIdx: 8 },
    { daysBorrowed: 7, daysOverdue: 5, status: 'lost' as const, bagIdx: 7 },
    { daysBorrowed: 4, daysOverdue: 0, status: 'returned' as const, bagIdx: 0 },
  ];
  
  recordConfigs.forEach((config, index) => {
    const borrowTime = daysAgo(config.daysBorrowed + config.daysOverdue, index % 5);
    const expectedReturn = daysAgo(config.daysOverdue, index % 5);
    const actualReturn = config.status === 'returned' ? daysAgo(config.daysOverdue, (index % 5) - 1) : undefined;
    
    records.push({
      id: generateId() + index,
      bagId: availableBags[config.bagIdx % availableBags.length]?.id || bags[0].id,
      riderName: riderNames[index],
      platform: platforms[index],
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      orderNo: `DD${Date.now()}${String(index).padStart(4, '0')}`,
      borrowTime,
      expectedReturnTime: expectedReturn,
      actualReturnTime: actualReturn,
      status: config.status,
      hasStain: config.status === 'returned' ? Math.random() > 0.7 : undefined,
      hasDamage: config.status === 'returned' ? Math.random() > 0.85 : undefined,
      zipperOk: config.status === 'returned' ? Math.random() > 0.1 : undefined,
      hasPad: config.status === 'returned' ? Math.random() > 0.15 : undefined,
      damageNote: '',
      depositRefunded: config.status === 'returned' ? true : false,
      createdAt: borrowTime,
    });
  });
  
  return records;
}
