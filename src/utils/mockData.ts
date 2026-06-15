import type { Cabinet, Medicine, UsageRecord, SupplyRecord } from '@/types';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
const subtractDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const mockCabinets: Cabinet[] = [
  {
    id: 'cab-001',
    name: '运动场药箱',
    location: '操场入口处',
    building: 'sports',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=First%20aid%20kit%20box%20in%20sports%20field%20stadium%2C%20bright%20red%20medical%20box%20mounted%20on%20wall%2C%20clean%20and%20organized%20first%20aid%20supplies%20visible%20inside&image_size=square',
    ],
    createdAt: subtractDays(90),
  },
  {
    id: 'cab-002',
    name: '实验楼药箱',
    location: '实验楼1楼大厅',
    building: 'lab',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=First%20aid%20kit%20in%20laboratory%20building%2C%20white%20medical%20cabinet%20with%20glass%20door%2C%20organized%20medical%20supplies%20for%20lab%20emergencies&image_size=square',
    ],
    createdAt: subtractDays(85),
  },
  {
    id: 'cab-003',
    name: '宿舍楼药箱',
    location: '1号宿舍楼值班室',
    building: 'dormitory',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=First%20aid%20kit%20in%20dormitory%20building%2C%20wall-mounted%20medical%20box%20near%20reception%20desk%2C%20essential%20medicines%20and%20bandages%20inside&image_size=square',
    ],
    createdAt: subtractDays(80),
  },
];

export const mockMedicines: Medicine[] = [
  { id: 'med-001', cabinetId: 'cab-001', name: '创可贴', specification: '100片/盒', batchNumber: 'B20250301', expiryDate: addDays(60), currentQuantity: 8, minimumQuantity: 20, lastSupplier: '李医生', isExpired: false, createdAt: subtractDays(60) },
  { id: 'med-002', cabinetId: 'cab-001', name: '碘伏消毒液', specification: '100ml/瓶', batchNumber: 'B20250215', expiryDate: addDays(180), currentQuantity: 25, minimumQuantity: 10, lastSupplier: '王老师', isExpired: false, createdAt: subtractDays(55) },
  { id: 'med-003', cabinetId: 'cab-001', name: '云南白药气雾剂', specification: '85g/瓶', batchNumber: 'B20250120', expiryDate: addDays(270), currentQuantity: 15, minimumQuantity: 5, lastSupplier: '张主任', isExpired: false, createdAt: subtractDays(50) },
  { id: 'med-004', cabinetId: 'cab-001', name: '弹性绷带', specification: '5cm*4.5m', batchNumber: 'B20241201', expiryDate: addDays(-10), currentQuantity: 30, minimumQuantity: 10, lastSupplier: '李医生', isExpired: true, createdAt: subtractDays(45) },
  { id: 'med-005', cabinetId: 'cab-001', name: '清凉油', specification: '10g/盒', batchNumber: 'B20250401', expiryDate: addDays(365), currentQuantity: 3, minimumQuantity: 10, lastSupplier: '王老师', isExpired: false, createdAt: subtractDays(40) },
  { id: 'med-006', cabinetId: 'cab-002', name: '创可贴', specification: '100片/盒', batchNumber: 'B20250310', expiryDate: addDays(90), currentQuantity: 45, minimumQuantity: 20, lastSupplier: '李医生', isExpired: false, createdAt: subtractDays(35) },
  { id: 'med-007', cabinetId: 'cab-002', name: '碘伏消毒液', specification: '100ml/瓶', batchNumber: 'B20250220', expiryDate: addDays(15), currentQuantity: 8, minimumQuantity: 10, lastSupplier: '张主任', isExpired: false, createdAt: subtractDays(30) },
  { id: 'med-008', cabinetId: 'cab-002', name: '烫伤膏', specification: '20g/支', batchNumber: 'B20250115', expiryDate: addDays(200), currentQuantity: 5, minimumQuantity: 5, lastSupplier: '王老师', isExpired: false, createdAt: subtractDays(25) },
  { id: 'med-009', cabinetId: 'cab-002', name: '护目镜', specification: '防化学飞溅', batchNumber: 'B20241101', expiryDate: addDays(540), currentQuantity: 2, minimumQuantity: 5, lastSupplier: '李医生', isExpired: false, createdAt: subtractDays(20) },
  { id: 'med-010', cabinetId: 'cab-002', name: '无菌纱布', specification: '10cm*10cm, 5片/包', batchNumber: 'B20250305', expiryDate: addDays(120), currentQuantity: 12, minimumQuantity: 10, lastSupplier: '张主任', isExpired: false, createdAt: subtractDays(15) },
  { id: 'med-011', cabinetId: 'cab-003', name: '创可贴', specification: '100片/盒', batchNumber: 'B20250315', expiryDate: addDays(100), currentQuantity: 50, minimumQuantity: 20, lastSupplier: '王老师', isExpired: false, createdAt: subtractDays(10) },
  { id: 'med-012', cabinetId: 'cab-003', name: '碘伏消毒液', specification: '100ml/瓶', batchNumber: 'B20250225', expiryDate: addDays(200), currentQuantity: 15, minimumQuantity: 10, lastSupplier: '李医生', isExpired: false, createdAt: subtractDays(8) },
  { id: 'med-013', cabinetId: 'cab-003', name: '复方感冒药', specification: '12粒/盒', batchNumber: 'B20250210', expiryDate: addDays(25), currentQuantity: 2, minimumQuantity: 5, lastSupplier: '张主任', isExpired: false, createdAt: subtractDays(5) },
  { id: 'med-014', cabinetId: 'cab-003', name: '肠胃药', specification: '20粒/盒', batchNumber: 'B20250105', expiryDate: addDays(150), currentQuantity: 8, minimumQuantity: 5, lastSupplier: '王老师', isExpired: false, createdAt: subtractDays(3) },
  { id: 'med-015', cabinetId: 'cab-003', name: '布洛芬缓释胶囊', specification: '0.3g*20粒', batchNumber: 'B20241215', expiryDate: addDays(-5), currentQuantity: 10, minimumQuantity: 5, lastSupplier: '李医生', isExpired: true, createdAt: subtractDays(1) },
];

export const mockUsageRecords: UsageRecord[] = [
  { id: 'use-001', cabinetId: 'cab-001', medicineId: 'med-001', purpose: '运动擦伤', studentName: '张三', quantity: 5, needParentFollowUp: false, operator: '李老师', createdAt: subtractDays(1) },
  { id: 'use-002', cabinetId: 'cab-001', medicineId: 'med-003', purpose: '体育课扭伤脚踝', studentName: '李四', quantity: 1, needParentFollowUp: true, operator: '王老师', createdAt: subtractDays(2) },
  { id: 'use-003', cabinetId: 'cab-001', medicineId: 'med-001', purpose: '跑步擦伤膝盖', studentName: '王五', quantity: 3, needParentFollowUp: false, operator: '张老师', createdAt: subtractDays(3) },
  { id: 'use-004', cabinetId: 'cab-001', medicineId: 'med-002', purpose: '外伤消毒', studentName: '赵六', quantity: 1, needParentFollowUp: false, operator: '李老师', createdAt: subtractDays(4) },
  { id: 'use-005', cabinetId: 'cab-001', medicineId: 'med-005', purpose: '中暑不适', quantity: 2, needParentFollowUp: false, operator: '王老师', createdAt: subtractDays(5) },
  { id: 'use-006', cabinetId: 'cab-002', medicineId: 'med-006', purpose: '实验割伤手指', studentName: '陈七', quantity: 2, needParentFollowUp: false, operator: '刘老师', createdAt: subtractDays(1) },
  { id: 'use-007', cabinetId: 'cab-002', medicineId: 'med-008', purpose: '轻微烫伤', studentName: '周八', quantity: 1, needParentFollowUp: true, operator: '李老师', createdAt: subtractDays(3) },
  { id: 'use-008', cabinetId: 'cab-002', medicineId: 'med-007', purpose: '伤口消毒', studentName: '吴九', quantity: 1, needParentFollowUp: false, operator: '张老师', createdAt: subtractDays(6) },
  { id: 'use-009', cabinetId: 'cab-003', medicineId: 'med-011', purpose: '意外擦伤', studentName: '郑十', quantity: 2, needParentFollowUp: false, operator: '宿管阿姨', createdAt: subtractDays(2) },
  { id: 'use-010', cabinetId: 'cab-003', medicineId: 'med-013', purpose: '感冒发烧', quantity: 1, needParentFollowUp: true, operator: '宿管阿姨', createdAt: subtractDays(4) },
  { id: 'use-011', cabinetId: 'cab-003', medicineId: 'med-014', purpose: '肠胃不适', studentName: '孙一', quantity: 1, needParentFollowUp: false, operator: '宿管阿姨', createdAt: subtractDays(7) },
  { id: 'use-012', cabinetId: 'cab-001', medicineId: 'med-001', purpose: '篮球比赛擦伤', studentName: '钱二', quantity: 4, needParentFollowUp: false, operator: '体育老师', createdAt: subtractDays(8) },
  { id: 'use-013', cabinetId: 'cab-001', medicineId: 'med-003', purpose: '足球训练拉伤', studentName: '冯三', quantity: 1, needParentFollowUp: true, operator: '体育老师', createdAt: subtractDays(10) },
  { id: 'use-014', cabinetId: 'cab-002', medicineId: 'med-010', purpose: '化学实验外伤', studentName: '蒋四', quantity: 1, needParentFollowUp: false, operator: '实验老师', createdAt: subtractDays(12) },
  { id: 'use-015', cabinetId: 'cab-003', medicineId: 'med-012', purpose: '摔伤消毒', studentName: '韩五', quantity: 1, needParentFollowUp: false, operator: '宿管阿姨', createdAt: subtractDays(13) },
];

export const mockSupplyRecords: SupplyRecord[] = [
  { id: 'sup-001', cabinetId: 'cab-001', medicineId: 'med-001', source: '医务室统一采购', quantity: 50, supplier: '李医生', createdAt: subtractDays(30) },
  { id: 'sup-002', cabinetId: 'cab-001', medicineId: 'med-002', source: '医务室统一采购', quantity: 30, supplier: '王老师', createdAt: subtractDays(28) },
  { id: 'sup-003', cabinetId: 'cab-001', medicineId: 'med-003', source: '医务室统一采购', quantity: 20, supplier: '张主任', createdAt: subtractDays(25) },
  { id: 'sup-004', cabinetId: 'cab-002', medicineId: 'med-006', source: '医务室统一采购', quantity: 50, supplier: '李医生', createdAt: subtractDays(22) },
  { id: 'sup-005', cabinetId: 'cab-002', medicineId: 'med-008', source: '医务室统一采购', quantity: 10, supplier: '王老师', createdAt: subtractDays(20) },
  { id: 'sup-006', cabinetId: 'cab-003', medicineId: 'med-011', source: '医务室统一采购', quantity: 60, supplier: '张主任', createdAt: subtractDays(18) },
  { id: 'sup-007', cabinetId: 'cab-003', medicineId: 'med-013', source: '医务室统一采购', quantity: 10, supplier: '李医生', createdAt: subtractDays(15) },
  { id: 'sup-008', cabinetId: 'cab-001', medicineId: 'med-005', source: '医务室统一采购', quantity: 10, supplier: '王老师', createdAt: subtractDays(12) },
  { id: 'sup-009', cabinetId: 'cab-002', medicineId: 'med-007', source: '医务室统一采购', quantity: 15, supplier: '张主任', createdAt: subtractDays(10) },
  { id: 'sup-010', cabinetId: 'cab-003', medicineId: 'med-012', source: '医务室统一采购', quantity: 20, supplier: '李医生', createdAt: subtractDays(8) },
];
