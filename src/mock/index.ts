import { Vehicle, Seat, Installation, Inspection, Task, Reminder, ChildProfile } from '@/types';
import { addDays, calculateExpiryDate } from '@/utils/date';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    brand: '大众',
    model: '迈腾 2023款',
    plateNumber: '京A·12345',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volkswagen%20magotan%202023%20black%20sedan%20side%20view&image_size=square',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'v2',
    brand: '特斯拉',
    model: 'Model Y',
    plateNumber: '京B·67890',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tesla%20model%20y%20white%20suv%20side%20view&image_size=square',
    createdAt: '2024-03-20T00:00:00.000Z',
    updatedAt: '2024-03-20T00:00:00.000Z'
  }
];

export const mockSeats: Seat[] = [
  {
    id: 's1',
    brand: '宝得适',
    model: '百变骑士 IV',
    weightRange: '9-36kg',
    installationType: 'isofix',
    manufactureDate: '2022-05-10',
    expiryDate: calculateExpiryDate('2022-05-10'),
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=britax%20child%20car%20seat%20blue%20color%20product%20photo&image_size=square',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: 's2',
    brand: 'Cybex',
    model: 'Solution S-Fix',
    weightRange: '15-50kg',
    installationType: 'both',
    manufactureDate: '2023-08-15',
    expiryDate: calculateExpiryDate('2023-08-15'),
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cybex%20child%20car%20seat%20grey%20color%20product%20photo&image_size=square',
    createdAt: '2024-04-10T00:00:00.000Z',
    updatedAt: '2024-04-10T00:00:00.000Z'
  }
];

export const mockInstallations: Installation[] = [
  {
    id: 'i1',
    vehicleId: 'v1',
    seatId: 's1',
    orientation: 'backward',
    installationMethod: 'isofix',
    lastInspectionDate: addDays(new Date(), -15),
    createdAt: '2024-01-25T00:00:00.000Z'
  },
  {
    id: 'i2',
    vehicleId: 'v2',
    seatId: 's2',
    orientation: 'forward',
    installationMethod: 'isofix',
    lastInspectionDate: addDays(new Date(), -40),
    createdAt: '2024-04-15T00:00:00.000Z'
  }
];

export const mockInspections: Inspection[] = [
  {
    id: 'ins1',
    installationId: 'i1',
    date: addDays(new Date(), -15),
    seatbeltLocked: { name: '安全带锁定', checked: true },
    isofixLocked: { name: 'ISOFIX 接口锁定', checked: true },
    supportLeg: { name: '支撑腿', checked: true },
    headrestHeight: { name: '头枕高度', checked: true },
    harnessPosition: { name: '肩带位置', checked: true, notes: '肩带位置正确，松紧合适' },
    wobbleAmount: { name: '晃动幅度', checked: true },
    manualPage: '15',
    passed: true,
    notes: '安装状态良好'
  },
  {
    id: 'ins2',
    installationId: 'i2',
    date: addDays(new Date(), -40),
    seatbeltLocked: { name: '安全带锁定', checked: true },
    isofixLocked: { name: 'ISOFIX 接口锁定', checked: true },
    supportLeg: { name: '支撑腿', checked: false, notes: '支撑腿未完全展开，需要调整' },
    headrestHeight: { name: '头枕高度', checked: true },
    harnessPosition: { name: '肩带位置', checked: true },
    wobbleAmount: { name: '晃动幅度', checked: false, notes: '座椅有轻微晃动，约3厘米' },
    manualPage: '18',
    passed: false,
    notes: '需要调整支撑腿并重新检查稳固性'
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    inspectionId: 'ins2',
    itemKey: 'supportLeg',
    title: '调整支撑腿高度',
    description: '展开支撑腿并调节高度，使其与车底紧密接触，锁止开关应处于锁定位置。参考说明书第 18 页。',
    status: 'pending',
    dueDate: addDays(new Date(), 3)
  },
  {
    id: 't2',
    inspectionId: 'ins2',
    itemKey: 'wobbleAmount',
    title: '检查座椅晃动幅度',
    description: '在座椅前后左右方向用力摇晃，晃动幅度不应超过 2.5 厘米。参考说明书第 18 页。',
    status: 'pending',
    dueDate: addDays(new Date(), 3)
  }
];

export const mockReminders: Reminder[] = [
  {
    id: 'r1',
    type: 'recheck',
    title: '安全座椅复查提醒',
    description: '距离上次安全座椅检查已接近30天，请进行复查确保安装状态良好。',
    date: addDays(new Date(), 2),
    enabled: true,
    relatedId: 'ins1',
    dismissed: false
  },
  {
    id: 'r2',
    type: 'child_growth',
    title: '孩子成长检查提醒',
    description: '小明已经6个月没有检查身高体重了，请确认是否需要调整安全座椅的肩带高度和头枕位置。',
    date: addDays(new Date(), -5),
    enabled: true,
    dismissed: false
  }
];

export const mockChildProfile: ChildProfile = {
  id: 'c1',
  name: '小明',
  birthDate: '2022-03-15',
  weight: 15,
  height: 95,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: addDays(new Date(), -190)
};

export const initMockData = (
  setVehicles: (v: Vehicle[]) => void,
  setSeats: (s: Seat[]) => void,
  setInstallations: (i: Installation[]) => void,
  setInspections: (i: Inspection[]) => void,
  setTasks: (t: Task[]) => void,
  setReminders: (r: Reminder[]) => void,
  setChildProfile: (c: ChildProfile) => void
): void => {
  setVehicles(mockVehicles);
  setSeats(mockSeats);
  setInstallations(mockInstallations);
  setInspections(mockInspections);
  setTasks(mockTasks);
  setReminders(mockReminders);
  setChildProfile(mockChildProfile);
};
