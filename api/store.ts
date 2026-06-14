import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Register, Handover, Transaction } from '../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

interface DataStore {
  registers: Register[];
  handovers: Handover[];
  transactions: Transaction[];
}

const DATA_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getDefaultData(): DataStore {
  const now = new Date().toISOString();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return {
    registers: [
      {
        id: 'reg001',
        code: 'A01',
        shift: 'morning',
        defaultAmount: 500,
        managerName: '张敏',
        managerPhoto: '',
        threshold: 30,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'reg002',
        code: 'A02',
        shift: 'evening',
        defaultAmount: 500,
        managerName: '李强',
        managerPhoto: '',
        threshold: 30,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'reg003',
        code: 'B01',
        shift: 'all',
        defaultAmount: 800,
        managerName: '王芳',
        managerPhoto: '',
        threshold: 50,
        createdAt: now,
        updatedAt: now,
      },
    ],
    handovers: [
      {
        id: generateId(),
        registerId: 'reg001',
        registerCode: 'A01',
        shift: 'morning',
        shiftDate: formatDate(today),
        defaultAmount: 500,
        denominations: [
          { denomination: 100, count: 2 },
          { denomination: 50, count: 4 },
          { denomination: 20, count: 5 },
          { denomination: 10, count: 10 },
          { denomination: 5, count: 20 },
          { denomination: 1, count: 50 },
          { denomination: 0.5, count: 40 },
          { denomination: 0.1, count: 100 },
        ],
        actualAmount: 500,
        difference: 0,
        scanCodeStatus: 'normal',
        pendingItems: '无',
        handoverPerson: '张敏',
        handoverSignature: '',
        successorPerson: '刘晨',
        successorSignature: '',
        handoverTime: new Date().toISOString(),
        scheduledTime: formatDate(today) + 'T08:30:00',
        isOnTime: true,
        status: 'normal',
        createdAt: now,
      },
      {
        id: generateId(),
        registerId: 'reg002',
        registerCode: 'A02',
        shift: 'evening',
        shiftDate: formatDate(yesterday),
        defaultAmount: 500,
        denominations: [
          { denomination: 100, count: 2 },
          { denomination: 50, count: 3 },
          { denomination: 20, count: 5 },
          { denomination: 10, count: 8 },
          { denomination: 5, count: 18 },
          { denomination: 1, count: 45 },
          { denomination: 0.5, count: 30 },
          { denomination: 0.1, count: 80 },
        ],
        actualAmount: 480,
        difference: -20,
        differenceReason: '找零时少了两张10元，可能是顾客多拿了',
        scanCodeStatus: 'normal',
        pendingItems: '记得补充10元零钱',
        handoverPerson: '李强',
        handoverSignature: '',
        successorPerson: '赵雪',
        successorSignature: '',
        handoverTime: new Date(yesterday).toISOString(),
        scheduledTime: formatDate(yesterday) + 'T18:30:00',
        isOnTime: false,
        status: 'warning',
        createdAt: new Date(yesterday).toISOString(),
      },
      {
        id: generateId(),
        registerId: 'reg003',
        registerCode: 'B01',
        shift: 'morning',
        shiftDate: formatDate(twoDaysAgo),
        defaultAmount: 800,
        denominations: [
          { denomination: 100, count: 3 },
          { denomination: 50, count: 6 },
          { denomination: 20, count: 10 },
          { denomination: 10, count: 15 },
          { denomination: 5, count: 30 },
          { denomination: 1, count: 80 },
          { denomination: 0.5, count: 60 },
          { denomination: 0.1, count: 150 },
        ],
        actualAmount: 730,
        difference: -70,
        differenceReason: '昨日晚班有一笔临时借出未登记，金额70元',
        scanCodeStatus: 'damaged',
        scanCodeNote: '收款码边缘有磨损，建议更换',
        pendingItems: '1. 需申请更换收款码\n2. 追查70元借出情况',
        handoverPerson: '王芳',
        handoverSignature: '',
        successorPerson: '陈浩',
        successorSignature: '',
        handoverTime: new Date(twoDaysAgo).toISOString(),
        scheduledTime: formatDate(twoDaysAgo) + 'T08:45:00',
        isOnTime: true,
        status: 'danger',
        createdAt: new Date(twoDaysAgo).toISOString(),
      },
    ],
    transactions: [
      {
        id: generateId(),
        type: 'replenish',
        registerId: 'reg001',
        amount: 100,
        operator: '张敏',
        note: '补充1元和5角零钱',
        createdAt: new Date(yesterday).toISOString(),
      },
      {
        id: generateId(),
        type: 'loan',
        registerId: 'reg003',
        amount: 70,
        operator: '王芳',
        note: '临时借出去买办公用品，待报销',
        createdAt: new Date(twoDaysAgo).toISOString(),
      },
      {
        id: generateId(),
        type: 'deposit',
        registerId: 'reg002',
        amount: 2000,
        operator: '李强',
        note: '昨日营业款存入银行',
        createdAt: new Date(today).toISOString(),
      },
    ],
  };
}

export function readStore(): DataStore {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = getDefaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as DataStore;
  } catch {
    const defaultData = getDefaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

export function writeStore(data: DataStore): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export { generateId };
