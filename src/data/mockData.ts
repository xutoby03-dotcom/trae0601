import { Customer, CreditRecord, PaymentRecord } from '../types';

const now = new Date();
const daysAgo = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: '张大哥',
    phone: '13800138001',
    frequentItems: ['矿泉水', '红塔山烟', '方便面'],
    creditLimit: 500,
    avatar: '',
    createdAt: daysAgo(90)
  },
  {
    id: 'c2',
    name: '李婶',
    phone: '13900139002',
    frequentItems: ['食用油', '酱油', '盐'],
    creditLimit: 300,
    avatar: '',
    createdAt: daysAgo(60)
  },
  {
    id: 'c3',
    name: '小王',
    phone: '13700137003',
    frequentItems: ['可乐', '薯片', '口香糖'],
    creditLimit: 200,
    avatar: '',
    createdAt: daysAgo(30)
  },
  {
    id: 'c4',
    name: '刘师傅',
    phone: '13600136004',
    frequentItems: ['啤酒', '花生米', '白酒'],
    creditLimit: 800,
    avatar: '',
    createdAt: daysAgo(120)
  },
  {
    id: 'c5',
    name: '陈阿姨',
    phone: '13500135005',
    frequentItems: ['牛奶', '面包', '鸡蛋'],
    creditLimit: 400,
    avatar: '',
    createdAt: daysAgo(45)
  }
];

export const mockCreditRecords: CreditRecord[] = [
  {
    id: 'r1',
    customerId: 'c1',
    items: [
      { productName: '矿泉水', quantity: 5, unitPrice: 2 },
      { productName: '红塔山烟', quantity: 2, unitPrice: 12 }
    ],
    totalAmount: 34,
    paidAmount: 0,
    handler: '老板',
    remark: '早上路过拿的',
    dueDays: 7,
    createdAt: daysAgo(15),
    isPaid: false
  },
  {
    id: 'r2',
    customerId: 'c1',
    items: [
      { productName: '方便面', quantity: 3, unitPrice: 5 }
    ],
    totalAmount: 15,
    paidAmount: 10,
    handler: '老板娘',
    remark: '',
    dueDays: 7,
    createdAt: daysAgo(10),
    isPaid: false
  },
  {
    id: 'r3',
    customerId: 'c2',
    items: [
      { productName: '食用油', quantity: 1, unitPrice: 68 },
      { productName: '酱油', quantity: 2, unitPrice: 15 }
    ],
    totalAmount: 98,
    paidAmount: 0,
    handler: '老板',
    remark: '月底一起结',
    dueDays: 30,
    createdAt: daysAgo(5),
    isPaid: false
  },
  {
    id: 'r4',
    customerId: 'c3',
    items: [
      { productName: '可乐', quantity: 6, unitPrice: 3 },
      { productName: '薯片', quantity: 2, unitPrice: 8 }
    ],
    totalAmount: 34,
    paidAmount: 0,
    handler: '老板',
    remark: '',
    dueDays: 3,
    createdAt: daysAgo(8),
    isPaid: false
  },
  {
    id: 'r5',
    customerId: 'c4',
    items: [
      { productName: '啤酒', quantity: 12, unitPrice: 5 },
      { productName: '花生米', quantity: 2, unitPrice: 6 }
    ],
    totalAmount: 72,
    paidAmount: 50,
    handler: '老板娘',
    remark: '先还50',
    dueDays: 15,
    createdAt: daysAgo(20),
    isPaid: false
  },
  {
    id: 'r6',
    customerId: 'c5',
    items: [
      { productName: '牛奶', quantity: 2, unitPrice: 12 },
      { productName: '面包', quantity: 3, unitPrice: 6 }
    ],
    totalAmount: 42,
    paidAmount: 42,
    handler: '老板',
    remark: '已结清',
    dueDays: 7,
    createdAt: daysAgo(25),
    paidAt: daysAgo(20),
    isPaid: true
  },
  {
    id: 'r7',
    customerId: 'c1',
    items: [
      { productName: '矿泉水', quantity: 2, unitPrice: 2 }
    ],
    totalAmount: 4,
    paidAmount: 0,
    handler: '老板',
    remark: '',
    dueDays: 7,
    createdAt: daysAgo(0),
    isPaid: false
  },
  {
    id: 'r8',
    customerId: 'c3',
    items: [
      { productName: '口香糖', quantity: 3, unitPrice: 3 }
    ],
    totalAmount: 9,
    paidAmount: 0,
    handler: '老板娘',
    remark: '',
    dueDays: 3,
    createdAt: daysAgo(0),
    isPaid: false
  },
  {
    id: 'r9',
    customerId: 'c4',
    items: [
      { productName: '白酒', quantity: 1, unitPrice: 88 },
      { productName: '花生米', quantity: 1, unitPrice: 6 }
    ],
    totalAmount: 94,
    paidAmount: 0,
    handler: '老板',
    remark: '刘师傅请客',
    dueDays: 15,
    createdAt: daysAgo(0),
    isPaid: false
  }
];

export const mockPaymentRecords: PaymentRecord[] = [
  {
    id: 'p1',
    creditRecordId: 'r2',
    customerId: 'c1',
    amount: 10,
    handler: '老板',
    remark: '先还一部分',
    createdAt: daysAgo(5)
  },
  {
    id: 'p2',
    creditRecordId: 'r5',
    customerId: 'c4',
    amount: 50,
    handler: '老板娘',
    remark: '刘师傅微信转账',
    createdAt: daysAgo(10)
  },
  {
    id: 'p3',
    creditRecordId: 'r6',
    customerId: 'c5',
    amount: 42,
    handler: '老板',
    remark: '全部结清',
    createdAt: daysAgo(20)
  }
];
