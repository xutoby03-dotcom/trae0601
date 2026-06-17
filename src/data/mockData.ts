import type { Pet, Task, CheckItem, Abnormality, Report } from '../types';

export const mockPet: Pet = {
  id: 'pet-001',
  name: '橘子',
  breed: '英国短毛猫',
  age: 3,
  personality: ['粘人', '胆小', '爱吃', '喜欢晒太阳'],
  foodAmount: 60,
  dietaryRestrictions: ['不能吃海鲜', '不能喝牛奶', '少吃零食'],
  hospital: {
    name: '爱宠动物医院',
    phone: '010-88886666',
    address: '北京市朝阳区建国路88号SOHO现代城A座1层',
  },
  photos: [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20british%20shorthair%20cat%20sitting%20on%20sofa%20looking%20at%20camera%20warm%20lighting&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fluffy%20orange%20cat%20sleeping%20on%20windowsill%20sunlight&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=playful%20orange%20kitten%20chasing%20feather%20toy%20cozy%20living%20room&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20british%20shorthair%20cat%20eating%20from%20bowl%20cute%20expression&image_size=square_hd',
  ],
};

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    petId: 'pet-001',
    date: '2026-06-17',
    time: '09:00',
    accessMethod: '密码锁：8866#',
    keyLocation: '如果密码锁打不开，备用钥匙在门口消防栓后面的磁贴盒里',
    foodGrams: 60,
    medication: '益生菌半包，拌在猫粮里',
    playRequirements: '用逗猫棒陪玩10分钟，注意它喜欢扑跳，不要让它撞到家具',
    status: 'in-progress',
  },
  {
    id: 'task-002',
    petId: 'pet-001',
    date: '2026-06-17',
    time: '19:00',
    accessMethod: '密码锁：8866#',
    keyLocation: '备用钥匙在门口消防栓后面的磁贴盒里',
    foodGrams: 60,
    medication: '无需用药',
    playRequirements: '简单陪玩5分钟，晚上不要太兴奋影响睡眠',
    status: 'pending',
  },
  {
    id: 'task-003',
    petId: 'pet-001',
    date: '2026-06-18',
    time: '09:00',
    accessMethod: '密码锁：8866#',
    keyLocation: '备用钥匙在门口消防栓后面的磁贴盒里',
    foodGrams: 60,
    medication: '益生菌半包',
    playRequirements: '陪玩10分钟',
    status: 'pending',
  },
  {
    id: 'task-004',
    petId: 'pet-001',
    date: '2026-06-18',
    time: '19:00',
    accessMethod: '密码锁：8866#',
    keyLocation: '备用钥匙在门口消防栓后面的磁贴盒里',
    foodGrams: 60,
    medication: '无需用药',
    playRequirements: '简单陪玩5分钟',
    status: 'pending',
  },
  {
    id: 'task-005',
    petId: 'pet-001',
    date: '2026-06-16',
    time: '19:00',
    accessMethod: '密码锁：8866#',
    keyLocation: '备用钥匙在门口消防栓后面的磁贴盒里',
    foodGrams: 60,
    medication: '益生菌半包',
    playRequirements: '陪玩10分钟',
    status: 'completed',
  },
];

export const mockCheckItems: CheckItem[] = [
  {
    id: 'check-001',
    taskId: 'task-001',
    type: 'food',
    label: '喂食 60g 猫粮',
    completed: true,
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20food%20bowl%20filled%20with%20kibble%20on%20wooden%20floor&image_size=square',
    note: '吃得很香，全部吃完了',
    completedAt: '2026-06-17T09:05:00',
  },
  {
    id: 'check-002',
    taskId: 'task-001',
    type: 'water',
    label: '检查饮水，更换新鲜水',
    completed: true,
    completedAt: '2026-06-17T09:07:00',
  },
  {
    id: 'check-003',
    taskId: 'task-001',
    type: 'litter',
    label: '铲屎，清理猫砂盆',
    completed: false,
  },
  {
    id: 'check-004',
    taskId: 'task-001',
    type: 'medication',
    label: '益生菌半包拌猫粮',
    completed: true,
    note: '已经拌在猫粮里一起吃了',
    completedAt: '2026-06-17T09:05:00',
  },
  {
    id: 'check-005',
    taskId: 'task-001',
    type: 'play',
    label: '陪玩 10 分钟',
    completed: false,
  },
];

export const mockAbnormalities: Abnormality[] = [
  {
    id: 'abn-001',
    taskId: 'task-001',
    type: 'hiding',
    description: '刚进门时橘子躲在沙发底下，叫了半天才出来，可能是陌生人有点害怕',
    reportedAt: '2026-06-17T09:02:00',
  },
];

export const mockReport: Report = {
  id: 'report-001',
  taskId: 'task-005',
  remainingFood: 85,
  remainingLitter: 70,
  remainingMedicine: 60,
  nextReminder: '明天（6月17日）上午9点上门，记得带上备用钥匙以防密码锁没电',
  abnormalitySummary: '',
  summary: '今天橘子状态很好，食欲正常，玩得也很开心。猫砂盆清理干净了，水也换了新鲜的。晚上9点再来看它一次。',
  createdAt: '2026-06-16T19:30:00',
};

export const getInitialCheckItems = (taskId: string, task: Task): CheckItem[] => [
  {
    id: `check-${taskId}-food`,
    taskId,
    type: 'food',
    label: `喂食 ${task.foodGrams}g 猫粮`,
    completed: false,
  },
  {
    id: `check-${taskId}-water`,
    taskId,
    type: 'water',
    label: '检查饮水，更换新鲜水',
    completed: false,
  },
  {
    id: `check-${taskId}-litter`,
    taskId,
    type: 'litter',
    label: '铲屎，清理猫砂盆',
    completed: false,
  },
  {
    id: `check-${taskId}-medication`,
    taskId,
    type: 'medication',
    label: task.medication || '无需用药',
    completed: !task.medication || task.medication === '无需用药',
  },
  {
    id: `check-${taskId}-play`,
    taskId,
    type: 'play',
    label: `陪玩：${task.playRequirements}`,
    completed: false,
  },
];
