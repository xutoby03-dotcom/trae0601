import type { GroupBatch, CustomerOrder } from '../types';
import { generateId, generatePickupCode } from './pickupCode';

const customerNames = [
  '张伟', '王芳', '李娜', '刘洋', '陈明', '杨丽', '赵强', '黄敏',
  '周杰', '吴静', '徐磊', '孙艳', '马军', '朱琳', '胡斌', '郭琴',
  '林峰', '何丽', '高翔', '罗慧', '郑涛', '梁英', '谢鹏', '韩梅',
  '唐超', '冯燕', '董军', '程敏', '曹阳', '袁莉',
];

const productImages = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20strawberries%20in%20a%20plastic%20container%20on%20white%20background&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20milk%20bottles%20in%20a%20crate%20dairy%20product&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20chinese%20 dumplings%20frozen%20food%20package&image_size=square',
];

function generatePhone(): string {
  const prefixes = ['138', '139', '158', '159', '188', '189', '135', '136'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

function generateNotes(): string | undefined {
  const notes = [
    '请下午5点后取',
    '放在冷藏柜',
    '电话联系',
    '大客户，优先处理',
    '易碎品，小心轻放',
  ];
  if (Math.random() > 0.7) {
    return notes[Math.floor(Math.random() * notes.length)];
  }
  return undefined;
}

export function generateMockBatches(): GroupBatch[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      id: generateId(),
      productName: '有机草莓礼盒',
      arrivalTime: today.toISOString().slice(0, 16),
      totalQuantity: 50,
      needRefrigeration: true,
      productImage: productImages[0],
      status: 'arrived',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      productName: '鲜牛奶家庭装',
      arrivalTime: today.toISOString().slice(0, 16),
      totalQuantity: 30,
      needRefrigeration: true,
      productImage: productImages[1],
      status: 'arrived',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: generateId(),
      productName: '手工水饺套餐',
      arrivalTime: tomorrow.toISOString().slice(0, 16),
      totalQuantity: 40,
      needRefrigeration: false,
      productImage: productImages[2],
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

export function generateMockOrders(batches: GroupBatch[]): CustomerOrder[] {
  const orders: CustomerOrder[] = [];
  let queueNumber = 0;

  batches.forEach((batch) => {
    const orderCount = Math.floor(Math.random() * 11) + 15;
    const shuffledNames = [...customerNames].sort(() => Math.random() - 0.5);

    for (let i = 0; i < orderCount; i++) {
      const isQueued = batch.status === 'arrived' && Math.random() > 0.4;
      const isPicked = isQueued && Math.random() > 0.6;
      const isCalled = isQueued && !isPicked && Math.random() > 0.5;
      const isWaiting = isQueued && !isPicked && !isCalled;

      let queueStatus: CustomerOrder['queueStatus'] = 'not_queued';
      let queuedAt: string | undefined;
      let calledAt: string | undefined;
      let pickedAt: string | undefined;
      let currentQueueNumber: number | undefined;

      if (isPicked) {
        queueStatus = 'picked';
        queuedAt = new Date(Date.now() - Math.random() * 7200000).toISOString();
        calledAt = new Date(new Date(queuedAt).getTime() + Math.random() * 1800000).toISOString();
        pickedAt = new Date(new Date(calledAt).getTime() + Math.random() * 600000).toISOString();
        currentQueueNumber = ++queueNumber;
      } else if (isCalled) {
        queueStatus = 'called';
        queuedAt = new Date(Date.now() - Math.random() * 3600000).toISOString();
        calledAt = new Date(Date.now() - Math.random() * 120000).toISOString();
        currentQueueNumber = ++queueNumber;
      } else if (isWaiting) {
        queueStatus = 'waiting';
        queuedAt = new Date(Date.now() - Math.random() * 1800000).toISOString();
        currentQueueNumber = ++queueNumber;
      }

      orders.push({
        id: generateId(),
        batchId: batch.id,
        customerName: shuffledNames[i % shuffledNames.length],
        phone: generatePhone(),
        quantity: Math.floor(Math.random() * 3) + 1,
        paymentStatus: Math.random() > 0.1 ? 'paid' : 'unpaid',
        pickupCode: generatePickupCode(),
        notes: generateNotes(),
        queueNumber: currentQueueNumber,
        queueStatus,
        queuedAt,
        calledAt,
        pickedAt,
        callCount: isCalled ? 1 : 0,
        isPriority: batch.needRefrigeration,
      });
    }
  });

  return orders;
}
