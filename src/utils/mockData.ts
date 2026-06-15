import type {
  Student,
  MenuItem,
  DailyMenu,
  PrepItem,
  PickupRecord,
  AllergyTag,
  AllergyType,
} from '@/types';
import { ALLERGY_META } from '@/types';
import { todayStr, addDays, getWeekDates, formatDate } from './dateUtils';
import { generateQrCodeData } from './qrcode';

function createAllergyTag(type: AllergyType, severity: 'mild' | 'moderate' | 'severe' = 'severe'): AllergyTag {
  const meta = ALLERGY_META[type];
  return {
    id: `allergy-${type}-${Date.now()}-${Math.random()}`,
    type,
    name: meta.name,
    severity,
    icon: meta.icon,
  };
}

const CLASSES = [
  '一年级(1)班', '一年级(2)班', '一年级(3)班',
  '二年级(1)班', '二年级(2)班',
  '三年级(1)班', '三年级(2)班',
  '四年级(1)班',
  '五年级(1)班', '五年级(2)班',
  '六年级(1)班',
];

const SURNAMES = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
const GIVEN_NAMES = ['小明', '小红', '小华', '小丽', '小强', '小芳', '小军', '小燕', '小龙', '小梅', '小杰', '小娟', '小涛', '小敏', '小磊'];

function randomName(): string {
  return SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
}

function randomPhone(): string {
  return '139' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

function randomAllergies(): AllergyTag[] {
  const types: AllergyType[] = ['nuts', 'dairy', 'seafood', 'eggs', 'wheat', 'soy', 'other'];
  const count = Math.floor(Math.random() * 2) + 1;
  const shuffled = [...types].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  return selected.map(t => {
    const severity = Math.random() > 0.6 ? 'severe' : Math.random() > 0.5 ? 'moderate' : 'mild';
    return createAllergyTag(t, severity);
  });
}

export const mockStudents: Student[] = [
  {
    id: 'stu-001',
    name: '张明轩',
    className: '三年级(1)班',
    grade: '三年级',
    studentNo: '20230101',
    allergies: [createAllergyTag('nuts', 'severe'), createAllergyTag('dairy', 'moderate')],
    guardianName: '张伟',
    guardianPhone: '13900000001',
    guardianConfirmed: true,
    medicalCertificateUrl: '#',
    notes: '接触坚果会导致严重过敏反应，需特别注意',
    createdAt: '2024-09-01',
    updatedAt: '2025-05-10',
  },
  {
    id: 'stu-002',
    name: '李思琪',
    className: '三年级(1)班',
    grade: '三年级',
    studentNo: '20230102',
    allergies: [createAllergyTag('seafood', 'severe')],
    guardianName: '李建国',
    guardianPhone: '13900000002',
    guardianConfirmed: true,
    medicalCertificateUrl: '#',
    createdAt: '2024-09-01',
    updatedAt: '2024-12-15',
  },
  {
    id: 'stu-003',
    name: '王梓涵',
    className: '三年级(2)班',
    grade: '三年级',
    studentNo: '20230201',
    allergies: [createAllergyTag('eggs', 'moderate'), createAllergyTag('wheat', 'mild')],
    guardianName: '王强',
    guardianPhone: '13900000003',
    guardianConfirmed: true,
    medicalCertificateUrl: '#',
    createdAt: '2024-09-05',
    updatedAt: '2025-01-20',
  },
  {
    id: 'stu-004',
    name: '赵雨萱',
    className: '二年级(1)班',
    grade: '二年级',
    studentNo: '20240101',
    allergies: [createAllergyTag('dairy', 'severe')],
    guardianName: '赵刚',
    guardianPhone: '13900000004',
    guardianConfirmed: true,
    createdAt: '2024-09-10',
    updatedAt: '2025-03-08',
  },
  {
    id: 'stu-005',
    name: '陈浩宇',
    className: '四年级(1)班',
    grade: '四年级',
    studentNo: '20220101',
    allergies: [createAllergyTag('soy', 'moderate'), createAllergyTag('nuts', 'severe')],
    guardianName: '陈军',
    guardianPhone: '13900000005',
    guardianConfirmed: false,
    medicalCertificateUrl: '#',
    notes: '需要监护人重新确认',
    createdAt: '2024-08-25',
    updatedAt: '2025-06-01',
  },
  {
    id: 'stu-006',
    name: '刘梦瑶',
    className: '五年级(1)班',
    grade: '五年级',
    studentNo: '20210101',
    allergies: [createAllergyTag('seafood', 'severe'), createAllergyTag('nuts', 'severe')],
    guardianName: '刘洋',
    guardianPhone: '13900000006',
    guardianConfirmed: true,
    medicalCertificateUrl: '#',
    notes: '多种严重过敏，每餐必须单独检查',
    createdAt: '2024-08-20',
    updatedAt: '2025-04-15',
  },
  {
    id: 'stu-007',
    name: '杨俊杰',
    className: '一年级(1)班',
    grade: '一年级',
    studentNo: '20250101',
    allergies: [createAllergyTag('eggs', 'severe')],
    guardianName: '杨辉',
    guardianPhone: '13900000007',
    guardianConfirmed: true,
    createdAt: '2025-02-15',
    updatedAt: '2025-06-10',
  },
  {
    id: 'stu-008',
    name: '黄思远',
    className: '六年级(1)班',
    grade: '六年级',
    studentNo: '20200101',
    allergies: [createAllergyTag('wheat', 'severe'), createAllergyTag('soy', 'moderate')],
    guardianName: '黄伟',
    guardianPhone: '13900000008',
    guardianConfirmed: true,
    medicalCertificateUrl: '#',
    createdAt: '2024-09-01',
    updatedAt: '2025-02-28',
  },
];

export const mockMenuItems: MenuItem[] = [
  { id: 'dish-001', name: '白米饭', category: 'staple', ingredients: ['大米', '水'], allergies: [] },
  { id: 'dish-002', name: '小米粥', category: 'staple', ingredients: ['小米', '水'], allergies: [] },
  { id: 'dish-003', name: '馒头', category: 'staple', ingredients: ['小麦粉', '酵母', '水'], allergies: ['wheat'] },
  { id: 'dish-004', name: '玉米饭', category: 'staple', ingredients: ['大米', '玉米粒'], allergies: [] },
  { id: 'dish-005', name: '宫保鸡丁', category: 'main', ingredients: ['鸡肉', '花生', '辣椒', '葱'], allergies: ['nuts'], replacementId: 'dish-006' },
  { id: 'dish-006', name: '清炒鸡丁(无花生)', category: 'main', ingredients: ['鸡肉', '辣椒', '葱'], allergies: [] },
  { id: 'dish-007', name: '红烧鱼', category: 'main', ingredients: ['草鱼', '酱油', '姜', '葱'], allergies: ['seafood'], replacementId: 'dish-008' },
  { id: 'dish-008', name: '红烧肉', category: 'main', ingredients: ['猪肉', '酱油', '冰糖'], allergies: [] },
  { id: 'dish-009', name: '番茄炒蛋', category: 'main', ingredients: ['番茄', '鸡蛋', '葱花'], allergies: ['eggs'], replacementId: 'dish-010' },
  { id: 'dish-010', name: '番茄豆腐', category: 'main', ingredients: ['番茄', '豆腐'], allergies: ['soy'] },
  { id: 'dish-011', name: '麻婆豆腐', category: 'main', ingredients: ['豆腐', '猪肉末', '豆瓣酱'], allergies: ['soy'], replacementId: 'dish-012' },
  { id: 'dish-012', name: '红烧茄子', category: 'main', ingredients: ['茄子', '酱油', '蒜'], allergies: [] },
  { id: 'dish-013', name: '清炒时蔬', category: 'side', ingredients: ['青菜', '蒜', '盐'], allergies: [] },
  { id: 'dish-014', name: '凉拌黄瓜', category: 'side', ingredients: ['黄瓜', '蒜', '醋'], allergies: [] },
  { id: 'dish-015', name: '紫菜蛋花汤', category: 'soup', ingredients: ['紫菜', '鸡蛋', '葱花'], allergies: ['eggs'], replacementId: 'dish-016' },
  { id: 'dish-016', name: '番茄蛋汤', category: 'soup', ingredients: ['番茄', '鸡蛋'], allergies: ['eggs'], replacementId: 'dish-017' },
  { id: 'dish-017', name: '冬瓜汤', category: 'soup', ingredients: ['冬瓜', '虾皮'], allergies: ['seafood'] },
  { id: 'dish-018', name: '白菜豆腐汤', category: 'soup', ingredients: ['白菜', '豆腐'], allergies: ['soy'] },
  { id: 'dish-019', name: '牛奶', category: 'soup', ingredients: ['牛奶'], allergies: ['dairy'], replacementId: 'dish-020' },
  { id: 'dish-020', name: '豆浆', category: 'soup', ingredients: ['大豆', '水'], allergies: ['soy'] },
  { id: 'dish-021', name: '苹果', category: 'fruit', ingredients: ['苹果'], allergies: [] },
  { id: 'dish-022', name: '香蕉', category: 'fruit', ingredients: ['香蕉'], allergies: [] },
  { id: 'dish-023', name: '橙子', category: 'fruit', ingredients: ['橙子'], allergies: [] },
  { id: 'dish-024', name: '坚果拼盘', category: 'fruit', ingredients: ['核桃', '杏仁', '腰果'], allergies: ['nuts'] },
];

export function generateDailyMenu(date: string): DailyMenu {
  return {
    date,
    breakfast: [
      mockMenuItems[1],
      mockMenuItems[2],
      mockMenuItems[8],
      mockMenuItems[18],
      mockMenuItems[21],
    ],
    lunch: [
      mockMenuItems[0],
      mockMenuItems[4],
      mockMenuItems[6],
      mockMenuItems[12],
      mockMenuItems[14],
      mockMenuItems[22],
    ],
    dinner: [
      mockMenuItems[3],
      mockMenuItems[10],
      mockMenuItems[8],
      mockMenuItems[13],
      mockMenuItems[17],
      mockMenuItems[23],
    ],
  };
}

export function generateWeekMenus(): DailyMenu[] {
  const weekDates = getWeekDates();
  return weekDates.map(d => generateDailyMenu(formatDate(d)));
}

export function generatePrepItems(date: string, mealType: 'breakfast' | 'lunch' | 'dinner'): PrepItem[] {
  const items: PrepItem[] = [];
  const selectedStudents = mockStudents.slice(0, Math.floor(Math.random() * 3) + 4);
  const replacements: { original: string; replacement: string }[] = [
    { original: '宫保鸡丁', replacement: '清炒鸡丁(无花生)' },
    { original: '红烧鱼', replacement: '红烧肉' },
    { original: '番茄炒蛋', replacement: '番茄豆腐' },
    { original: '麻婆豆腐', replacement: '红烧茄子' },
    { original: '牛奶', replacement: '豆浆' },
    { original: '紫菜蛋花汤', replacement: '冬瓜汤' },
  ];

  selectedStudents.forEach((student, idx) => {
    const repl = replacements[idx % replacements.length];
    items.push({
      id: `prep-${date}-${mealType}-${student.id}`,
      date,
      mealType,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      originalDish: repl.original,
      replacementDish: repl.replacement,
      allergies: student.allergies.map(a => a.type),
      qrCode: generateQrCodeData(`prep-${date}-${mealType}-${student.id}`, student.id),
      status: idx < 2 ? 'ready' : idx < 4 ? 'preparing' : 'pending',
    });
  });

  return items;
}

export function generatePickupRecords(): PickupRecord[] {
  const records: PickupRecord[] = [];
  const today = todayStr();
  const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

  for (let i = 0; i < 7; i++) {
    const date = addDays(today, -i);
    mealTypes.forEach(mealType => {
      const prepItems = generatePrepItems(date, mealType);
      prepItems.forEach((item, idx) => {
        let status: 'picked' | 'not_picked' | 'wrong_pick' | 'leave';
        const rand = Math.random();
        if (rand < 0.75) status = 'picked';
        else if (rand < 0.88) status = 'not_picked';
        else if (rand < 0.95) status = 'leave';
        else status = 'wrong_pick';

        records.push({
          id: `rec-${date}-${mealType}-${item.studentId}`,
          date,
          mealType,
          studentId: item.studentId,
          prepItemId: item.id,
          status,
          pickedBy: status === 'picked' ? (Math.random() > 0.5 ? 'student' : 'teacher') : undefined,
          pickedByName: status === 'picked' ? (Math.random() > 0.5 ? item.studentName : '张老师') : undefined,
          pickedAt: status === 'picked' ? `${date} ${mealType === 'breakfast' ? '07:30' : mealType === 'lunch' ? '12:00' : '18:00'}` : undefined,
          notes: status === 'wrong_pick' ? '被其他同学错拿，已找回' : status === 'leave' ? '请假未到校' : undefined,
        });
      });
    });
  }

  return records;
}

export { randomName, randomPhone, randomAllergies, CLASSES };
