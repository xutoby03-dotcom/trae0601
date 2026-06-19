import type { Session, InventoryItem, Registration, InventoryType, AreaType } from '../shared/types';

const genId = () => Math.random().toString(36).substring(2, 10);

const now = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const defaultSessions: Session[] = [
  {
    id: 'sess-001',
    title: '千与千寻',
    date: formatDate(addDays(now, 2)),
    time: '19:30',
    venue: '社区中心广场',
    expectedPeople: 120,
    weather: '晴 26°C',
    screenPosition: '广场北侧大银幕',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20cinema%20at%20dusk%20with%20warm%20string%20lights%20and%20chairs%20in%20a%20community%20square%20cozy%20atmosphere&image_size=landscape_16_9',
    status: 'upcoming',
    createdAt: now.toISOString(),
  },
  {
    id: 'sess-002',
    title: '流浪地球2',
    date: formatDate(addDays(now, 5)),
    time: '19:00',
    venue: '滨江公园草坪',
    expectedPeople: 200,
    weather: '多云 24°C',
    screenPosition: '公园中心喷水池旁',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=open%20air%20movie%20screening%20in%20a%20park%20at%20night%20with%20stars%20and%20audience%20sitting%20on%20blankets&image_size=landscape_16_9',
    status: 'upcoming',
    createdAt: now.toISOString(),
  },
  {
    id: 'sess-003',
    title: '你好，李焕英',
    date: formatDate(addDays(now, 9)),
    time: '19:30',
    venue: '幸福里小区花园',
    expectedPeople: 80,
    weather: '阴 22°C',
    screenPosition: '小区花园凉亭前',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=neighborhood%20outdoor%20movie%20night%20with%20families%20gathered%20warm%20lighting%20cozy%20community%20vibe&image_size=landscape_16_9',
    status: 'upcoming',
    createdAt: now.toISOString(),
  },
];

const defaultInventory: InventoryItem[] = [
  { type: 'folding', name: '折叠椅', total: 150, used: 0, storage: '社区仓库 A 区 3 排', warningThreshold: 20 },
  { type: 'child', name: '儿童椅', total: 40, used: 0, storage: '社区仓库 A 区 4 排', warningThreshold: 10 },
  { type: 'wheelchair', name: '轮椅位', total: 12, used: 0, storage: '广场入口处（预留位）', warningThreshold: 3 },
  { type: 'picnic', name: '野餐垫', total: 60, used: 0, storage: '社区仓库 B 区 1 排', warningThreshold: 15 },
];

const defaultRegistrations: Registration[] = [
  {
    id: 'reg-001',
    sessionId: 'sess-001',
    name: '张阿姨',
    phone: '138****1234',
    peopleCount: 3,
    elderlyCount: 2,
    childCount: 0,
    needWheelchair: false,
    area: 'A',
    status: 'registered',
    registeredAt: now.toISOString(),
  },
  {
    id: 'reg-002',
    sessionId: 'sess-001',
    name: '李先生',
    phone: '139****5678',
    peopleCount: 4,
    elderlyCount: 0,
    childCount: 2,
    needWheelchair: false,
    area: 'B',
    status: 'registered',
    registeredAt: now.toISOString(),
  },
  {
    id: 'reg-003',
    sessionId: 'sess-001',
    name: '王奶奶',
    phone: '137****9012',
    peopleCount: 2,
    elderlyCount: 1,
    childCount: 0,
    needWheelchair: true,
    area: 'wheelchair',
    status: 'checked_in',
    registeredAt: now.toISOString(),
    checkedInAt: now.toISOString(),
  },
  {
    id: 'reg-004',
    sessionId: 'sess-001',
    name: '陈女士',
    phone: '136****3456',
    peopleCount: 5,
    elderlyCount: 1,
    childCount: 1,
    needWheelchair: false,
    area: 'A',
    status: 'registered',
    registeredAt: now.toISOString(),
  },
  {
    id: 'reg-005',
    sessionId: 'sess-002',
    name: '赵大哥',
    phone: '135****7890',
    peopleCount: 6,
    elderlyCount: 0,
    childCount: 3,
    needWheelchair: false,
    area: 'C',
    status: 'registered',
    registeredAt: now.toISOString(),
  },
  {
    id: 'reg-006',
    sessionId: 'sess-001',
    name: '刘叔叔',
    phone: '134****2345',
    peopleCount: 2,
    elderlyCount: 2,
    childCount: 0,
    needWheelchair: true,
    area: 'wheelchair',
    status: 'registered',
    registeredAt: now.toISOString(),
  },
];

class DataStore {
  sessions: Session[] = [...defaultSessions];
  inventory: InventoryItem[] = JSON.parse(JSON.stringify(defaultInventory));
  registrations: Registration[] = [...defaultRegistrations];

  getSessions(): Session[] {
    return [...this.sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getSession(id: string): Session | undefined {
    return this.sessions.find(s => s.id === id);
  }

  addSession(data: Omit<Session, 'id' | 'createdAt' | 'status'>): Session {
    const session: Session = {
      ...data,
      id: 'sess-' + genId(),
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    this.sessions.push(session);
    return session;
  }

  updateSession(id: string, data: Partial<Session>): Session | undefined {
    const idx = this.sessions.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.sessions[idx] = { ...this.sessions[idx], ...data };
      return this.sessions[idx];
    }
    return undefined;
  }

  deleteSession(id: string): boolean {
    const before = this.sessions.length;
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.registrations = this.registrations.filter(r => r.sessionId !== id);
    return this.sessions.length < before;
  }

  getInventory(): InventoryItem[] {
    return JSON.parse(JSON.stringify(this.inventory));
  }

  updateInventory(type: InventoryType, data: Partial<InventoryItem>): InventoryItem | undefined {
    const idx = this.inventory.findIndex(i => i.type === type);
    if (idx >= 0) {
      this.inventory[idx] = { ...this.inventory[idx], ...data };
      return this.inventory[idx];
    }
    return undefined;
  }

  getRegistrations(sessionId?: string): Registration[] {
    let list = [...this.registrations];
    if (sessionId) {
      list = list.filter(r => r.sessionId === sessionId);
    }
    return list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  }

  addRegistration(data: Omit<Registration, 'id' | 'registeredAt' | 'status' | 'area'>): Registration {
    let area: AreaType = 'C';
    if (data.needWheelchair) {
      area = 'wheelchair';
    } else if (data.elderlyCount > 0 || data.childCount > 0) {
      area = 'A';
    } else {
      area = 'B';
    }

    const reg: Registration = {
      ...data,
      id: 'reg-' + genId(),
      area,
      status: 'registered',
      registeredAt: new Date().toISOString(),
    };
    this.registrations.push(reg);
    return reg;
  }

  checkIn(id: string): Registration | undefined {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'checked_in';
      reg.checkedInAt = new Date().toISOString();
      return reg;
    }
    return undefined;
  }

  releaseSeat(id: string): Registration | undefined {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'released';
      return reg;
    }
    return undefined;
  }
}

export const store = new DataStore();
