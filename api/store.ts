import type { FittingRoom, QueueItem, FittingRecord, Assistant, ConversionStats, HourlyStat, AssistantStat } from '../shared/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

class DataStore {
  private rooms: FittingRoom[] = [];
  private queue: QueueItem[] = [];
  private records: FittingRecord[] = [];
  private assistants: Assistant[] = [];
  private queueCounter = 100;
  private timeoutThreshold = 120;

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    this.assistants = [
      { id: generateId(), name: '张美丽', employeeId: 'A001' },
      { id: generateId(), name: '李优雅', employeeId: 'A002' },
      { id: generateId(), name: '王时尚', employeeId: 'A003' },
      { id: generateId(), name: '陈品味', employeeId: 'A004' },
    ];

    this.rooms = [
      { id: generateId(), number: 'A01', floor: 1, hasMirrorLight: true, cleanStatus: 'clean', maxItems: 5, status: 'available', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20fitting%20room%20with%20mirror%20and%20warm%20lighting&image_size=square' },
      { id: generateId(), number: 'A02', floor: 1, hasMirrorLight: true, cleanStatus: 'clean', maxItems: 5, status: 'available', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20fitting%20room%20interior%20design&image_size=square' },
      { id: generateId(), number: 'A03', floor: 1, hasMirrorLight: false, cleanStatus: 'clean', maxItems: 3, status: 'available', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20clothing%20store%20fitting%20room&image_size=square' },
      { id: generateId(), number: 'B01', floor: 2, hasMirrorLight: true, cleanStatus: 'clean', maxItems: 8, status: 'available', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20vip%20fitting%20room%20with%20sofa&image_size=square' },
      { id: generateId(), number: 'B02', floor: 2, hasMirrorLight: true, cleanStatus: 'dirty', maxItems: 5, status: 'available', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20fitting%20room%20with%20gold%20accents&image_size=square' },
      { id: generateId(), number: 'B03', floor: 2, hasMirrorLight: false, cleanStatus: 'cleaning', maxItems: 3, status: 'maintenance', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20boutique%20fitting%20room&image_size=square' },
    ];

    const now = Date.now();
    this.queue = [
      {
        id: generateId(), queueNumber: 101, customerName: '王小姐', phoneLast4: '8821',
        peopleCount: 1, itemsCount: 4, keySizes: ['S', 'M'],
        assistantId: this.assistants[0].id, assistantName: this.assistants[0].name,
        status: 'waiting', createdAt: now - 300000,
      },
      {
        id: generateId(), queueNumber: 102, customerName: '李先生', phoneLast4: '6633',
        peopleCount: 2, itemsCount: 6, keySizes: ['L', 'XL'],
        assistantId: this.assistants[1].id, assistantName: this.assistants[1].name,
        status: 'waiting', createdAt: now - 180000,
      },
      {
        id: generateId(), queueNumber: 103, phoneLast4: '9912',
        peopleCount: 1, itemsCount: 2, keySizes: ['M'],
        assistantId: this.assistants[2].id, assistantName: this.assistants[2].name,
        status: 'waiting', createdAt: now - 60000,
      },
    ];
    this.queueCounter = 104;

    this.records = [
      {
        id: generateId(), queueId: generateId(), roomId: this.rooms[0].id,
        purchasedCount: 2, exchangedCount: 0, leftItems: [], cleaned: true,
        createdAt: now - 7200000, customerName: '刘女士', queueNumber: 98,
        roomNumber: 'A01', assistantName: this.assistants[0].name,
      },
      {
        id: generateId(), queueId: generateId(), roomId: this.rooms[1].id,
        purchasedCount: 0, exchangedCount: 1, leftItems: [], cleaned: true,
        createdAt: now - 5400000, customerName: '赵先生', queueNumber: 99,
        roomNumber: 'A02', assistantName: this.assistants[1].name,
      },
      {
        id: generateId(), queueId: generateId(), roomId: this.rooms[3].id,
        purchasedCount: 3, exchangedCount: 0, leftItems: ['口红'], cleaned: false,
        createdAt: now - 3600000, customerName: '孙女士', queueNumber: 100,
        roomNumber: 'B01', assistantName: this.assistants[3].name,
      },
    ];
  }

  getRooms(): FittingRoom[] {
    return this.rooms.map(room => ({
      ...room,
      currentItemsCount: this.queue.find(q => q.roomId === room.id && (q.status === 'called' || q.status === 'fitting'))?.itemsCount,
    }));
  }

  addRoom(room: Omit<FittingRoom, 'id'>): FittingRoom {
    const newRoom = { ...room, id: generateId() };
    this.rooms.push(newRoom);
    return newRoom;
  }

  updateRoom(id: string, data: Partial<FittingRoom>): FittingRoom | null {
    const index = this.rooms.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.rooms[index] = { ...this.rooms[index], ...data };
    return this.rooms[index];
  }

  deleteRoom(id: string): boolean {
    const index = this.rooms.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.rooms.splice(index, 1);
    return true;
  }

  getQueue(): QueueItem[] {
    return [...this.queue];
  }

  addQueueItem(data: Omit<QueueItem, 'id' | 'queueNumber' | 'status' | 'createdAt'>): QueueItem {
    const newItem: QueueItem = {
      ...data,
      id: generateId(),
      queueNumber: this.queueCounter++,
      status: 'waiting',
      createdAt: Date.now(),
    };
    this.queue.push(newItem);
    return newItem;
  }

  callNext(): { queue: QueueItem; room: FittingRoom } | null {
    const waitingItem = this.queue
      .filter(q => q.status === 'waiting')
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    
    if (!waitingItem) return null;

    const availableRoom = this.rooms.find(
      r => r.status === 'available' && r.cleanStatus === 'clean' && !this.queue.some(q => q.roomId === r.id && (q.status === 'called' || q.status === 'fitting'))
    );

    if (!availableRoom) return null;

    waitingItem.status = 'called';
    waitingItem.roomId = availableRoom.id;
    waitingItem.roomNumber = availableRoom.number;
    waitingItem.calledAt = Date.now();
    availableRoom.status = 'occupied';
    availableRoom.currentQueueId = waitingItem.id;

    return { queue: waitingItem, room: availableRoom };
  }

  confirmEnter(queueId: string): QueueItem | null {
    const item = this.queue.find(q => q.id === queueId);
    if (!item || item.status !== 'called') return null;
    
    item.status = 'fitting';
    item.enteredAt = Date.now();
    return item;
  }

  completeFitting(queueId: string, recordData: Partial<FittingRecord>): { queue: QueueItem; record: FittingRecord } | null {
    const queueItem = this.queue.find(q => q.id === queueId);
    if (!queueItem || !queueItem.roomId) return null;

    queueItem.status = 'completed';
    queueItem.completedAt = Date.now();

    const room = this.rooms.find(r => r.id === queueItem.roomId);
    if (room) {
      room.status = 'available';
      room.cleanStatus = recordData.cleaned ? 'clean' : 'dirty';
      room.currentQueueId = undefined;
    }

    const record: FittingRecord = {
      id: generateId(),
      queueId,
      roomId: queueItem.roomId,
      purchasedCount: recordData.purchasedCount ?? 0,
      exchangedCount: recordData.exchangedCount ?? 0,
      leftItems: recordData.leftItems ?? [],
      cleaned: recordData.cleaned ?? false,
      createdAt: Date.now(),
      customerName: queueItem.customerName,
      queueNumber: queueItem.queueNumber,
      roomNumber: queueItem.roomNumber!,
      assistantName: queueItem.assistantName,
    };
    this.records.push(record);

    return { queue: queueItem, record };
  }

  markTimeout(queueId: string): QueueItem | null {
    const item = this.queue.find(q => q.id === queueId);
    if (!item || item.status !== 'called') return null;

    item.status = 'timeout';
    item.completedAt = Date.now();

    const room = this.rooms.find(r => r.id === item.roomId);
    if (room) {
      room.status = 'available';
      room.currentQueueId = undefined;
    }

    return item;
  }

  checkTimeouts(): QueueItem[] {
    const now = Date.now();
    const timedOut: QueueItem[] = [];

    this.queue.forEach(item => {
      if (item.status === 'called' && item.calledAt && (now - item.calledAt) > this.timeoutThreshold * 1000) {
        this.markTimeout(item.id);
        timedOut.push(item);
      }
    });

    return timedOut;
  }

  getRecords(): FittingRecord[] {
    return [...this.records];
  }

  getConversionStats(period: 'today' | 'week' | 'month'): ConversionStats {
    const now = Date.now();
    let startTime = now;
    
    switch (period) {
      case 'today':
        startTime = new Date().setHours(0, 0, 0, 0);
        break;
      case 'week':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const periodQueue = this.queue.filter(q => q.createdAt >= startTime);
    const periodRecords = this.records.filter(r => r.createdAt >= startTime);

    const totalQueue = periodQueue.length;
    const totalEntered = periodQueue.filter(q => q.status === 'fitting' || q.status === 'completed').length;
    const totalPurchased = periodRecords.filter(r => r.purchasedCount > 0).length;

    const hourlyMap = new Map<string, HourlyStat>();
    for (let h = 10; h <= 22; h++) {
      hourlyMap.set(`${h.toString().padStart(2, '0')}:00`, {
        hour: `${h.toString().padStart(2, '0')}:00`,
        queueCount: 0,
        enteredCount: 0,
        purchasedCount: 0,
      });
    }

    periodQueue.forEach(q => {
      const hour = new Date(q.createdAt).getHours();
      const key = `${hour.toString().padStart(2, '0')}:00`;
      const stat = hourlyMap.get(key);
      if (stat) stat.queueCount++;
      if (q.status === 'fitting' || q.status === 'completed') {
        if (stat) stat.enteredCount++;
      }
    });

    periodRecords.forEach(r => {
      const hour = new Date(r.createdAt).getHours();
      const key = `${hour.toString().padStart(2, '0')}:00`;
      const stat = hourlyMap.get(key);
      if (stat && r.purchasedCount > 0) stat.purchasedCount++;
    });

    const assistantMap = new Map<string, AssistantStat>();
    this.assistants.forEach(a => {
      assistantMap.set(a.id, {
        assistantId: a.id,
        assistantName: a.name,
        queueCount: 0,
        enteredCount: 0,
        purchasedCount: 0,
        conversionRate: 0,
      });
    });

    periodQueue.forEach(q => {
      const stat = assistantMap.get(q.assistantId);
      if (stat) {
        stat.queueCount++;
        if (q.status === 'fitting' || q.status === 'completed') stat.enteredCount++;
      }
    });

    periodRecords.forEach(r => {
      const a = this.assistants.find(as => as.name === r.assistantName);
      if (a) {
        const stat = assistantMap.get(a.id);
        if (stat && r.purchasedCount > 0) stat.purchasedCount++;
      }
    });

    assistantMap.forEach(stat => {
      stat.conversionRate = stat.enteredCount > 0 ? (stat.purchasedCount / stat.enteredCount) * 100 : 0;
    });

    return {
      period,
      totalQueue,
      totalEntered,
      totalPurchased,
      fittingRate: totalQueue > 0 ? (totalEntered / totalQueue) * 100 : 0,
      purchaseRate: totalEntered > 0 ? (totalPurchased / totalEntered) * 100 : 0,
      overallRate: totalQueue > 0 ? (totalPurchased / totalQueue) * 100 : 0,
      hourlyData: Array.from(hourlyMap.values()),
      assistantStats: Array.from(assistantMap.values()),
    };
  }

  getAssistants(): Assistant[] {
    return [...this.assistants];
  }

  getTimeoutThreshold(): number {
    return this.timeoutThreshold;
  }

  setTimeoutThreshold(seconds: number): void {
    this.timeoutThreshold = seconds;
  }

  getLeftItems(): { roomNumber: string; items: string[]; queueNumber: number }[] {
    return this.records
      .filter(r => r.leftItems.length > 0)
      .map(r => ({
        roomNumber: r.roomNumber,
        items: r.leftItems,
        queueNumber: r.queueNumber,
      }));
  }
}

export const store = new DataStore();
