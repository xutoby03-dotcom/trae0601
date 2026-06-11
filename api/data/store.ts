import type { Seat, Dispute, SeatStatus, BUILDINGS } from '../types';
import { SeatStatus as Status } from '../types';

const now = Date.now();

const generateId = () => Math.random().toString(36).slice(2, 10);

const roomsByBuilding: Record<string, string[]> = {
  '一教': ['101', '102', '103', '201', '202', '301'],
  '二教': ['101', '102', '201', '202', '301', '302'],
  '三教': ['101', '102', '201', '202'],
  '图书馆': ['A101', 'A201', 'B101', 'B201', 'C301'],
  '信息楼': ['101', '201', '301', '401'],
  '综合楼': ['101', '201', '301'],
};

function generateMockSeats(): Seat[] {
  const seats: Seat[] = [];
  const buildings = Object.keys(roomsByBuilding);
  const allStatuses: SeatStatus[] = [
    Status.EMPTY, Status.EMPTY, Status.EMPTY, Status.EMPTY,
    Status.IN_USE, Status.IN_USE, Status.IN_USE,
    Status.TEMP_LEAVE,
    Status.SUSPECTED,
  ];
  const names = ['张同学', '李同学', '王同学', '赵同学', '刘同学', '陈同学', '杨同学', '黄同学', '周同学', '吴同学'];

  buildings.forEach((building) => {
    const rooms = roomsByBuilding[building];
    rooms.forEach((room) => {
      const seatCount = 8 + Math.floor(Math.random() * 8);
      for (let i = 1; i <= seatCount; i++) {
        const seatNumber = String(i).padStart(2, '0');
        const status = allStatuses[Math.floor(Math.random() * allStatuses.length)];
        const seat: Seat = {
          id: generateId(),
          building,
          room,
          seatNumber,
          status,
          statusUpdatedAt: now - Math.floor(Math.random() * 3600000),
        };

        if (status !== Status.EMPTY) {
          seat.registeredBy = names[Math.floor(Math.random() * names.length)];
          seat.contact = `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
          seat.registeredAt = now - Math.floor(Math.random() * 7200000);
          seat.expectedLeaveAt = now + (30 + Math.floor(Math.random() * 180)) * 60000;

          if (status === Status.TEMP_LEAVE) {
            seat.tempLeaveUntil = now + (5 + Math.floor(Math.random() * 20)) * 60000;
          }
          if (status === Status.SUSPECTED) {
            seat.expectedLeaveAt = now - (10 + Math.floor(Math.random() * 60)) * 60000;
          }
        }
        seats.push(seat);
      }
    });
  });
  return seats;
}

function generateMockDisputes(seats: Seat[]): Dispute[] {
  const suspectedSeats = seats.filter((s) => s.status === Status.SUSPECTED);
  const disputes: Dispute[] = [];
  const reporters = ['举报者A', '热心同学', '路过的学长', '自律委员'];
  const remarks = [
    '座位上只有一个书包，很久没人了',
    '书本占座，离开超过1小时',
    '只有水杯在桌上，人一直没回来',
    '电脑锁着，但人走了很久了',
  ];

  suspectedSeats.slice(0, 6).forEach((seat, idx) => {
    disputes.push({
      id: generateId(),
      seatId: seat.id,
      reporterName: reporters[idx % reporters.length],
      remark: remarks[idx % remarks.length],
      createdAt: now - Math.floor(Math.random() * 1800000),
      status: idx < 3 ? 'pending' : 'resolved',
      resolvedAt: idx < 3 ? undefined : now - Math.floor(Math.random() * 600000),
      resolverNote: idx < 3 ? undefined : (idx % 2 === 0 ? '已确认占座，座位已释放' : '反馈不属实，登记人只是临时有事'),
    });
  });

  return disputes;
}

class DataStore {
  private seats: Seat[] = [];
  private disputes: Dispute[] = [];
  private recoveredCountByDay: Record<string, number> = {};
  private suspectedCountByHour: number[] = new Array(24).fill(0);

  constructor() {
    this.seats = generateMockSeats();
    this.disputes = generateMockDisputes(this.seats);

    this.seats.forEach((seat) => {
      if (seat.status === Status.SUSPECTED) {
        const hour = new Date(seat.statusUpdatedAt).getHours();
        this.suspectedCountByHour[hour]++;
      }
    });

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      this.recoveredCountByDay[key] = Math.floor(Math.random() * 10) + 1;
    }
  }

  getSeats(building?: string, room?: string): Seat[] {
    return this.seats.filter((s) => {
      if (building && s.building !== building) return false;
      if (room && s.room !== room) return false;
      return true;
    });
  }

  getSeatById(id: string): Seat | undefined {
    return this.seats.find((s) => s.id === id);
  }

  addSeat(seat: Omit<Seat, 'id' | 'statusUpdatedAt'>): Seat {
    const existing = this.seats.find(
      (s) => s.building === seat.building && s.room === seat.room && s.seatNumber === seat.seatNumber,
    );
    if (existing && existing.status !== Status.EMPTY) {
      throw new Error('该座位已被登记');
    }
    const newSeat: Seat = {
      ...seat,
      id: existing?.id || generateId(),
      statusUpdatedAt: Date.now(),
    };
    if (existing) {
      const idx = this.seats.indexOf(existing);
      this.seats[idx] = newSeat;
    } else {
      this.seats.push(newSeat);
    }
    return newSeat;
  }

  updateSeatStatus(id: string, status: SeatStatus, extra?: Partial<Seat>): Seat | undefined {
    const seat = this.seats.find((s) => s.id === id);
    if (!seat) return undefined;
    const now = Date.now();
    seat.status = status;
    seat.statusUpdatedAt = now;
    if (extra) {
      Object.assign(seat, extra);
    }
    if (status === Status.SUSPECTED) {
      const hour = new Date(now).getHours();
      this.suspectedCountByHour[hour]++;
    }
    return seat;
  }

  resetSeat(id: string, recordRecovery = true): Seat | undefined {
    const seat = this.seats.find((s) => s.id === id);
    if (!seat) return undefined;
    const wasSuspected = seat.status === Status.SUSPECTED;
    seat.status = Status.EMPTY;
    seat.registeredBy = undefined;
    seat.contact = undefined;
    seat.expectedLeaveAt = undefined;
    seat.tempLeaveUntil = undefined;
    seat.registeredAt = undefined;
    seat.statusUpdatedAt = Date.now();
    if (recordRecovery && wasSuspected) {
      const today = new Date().toISOString().slice(0, 10);
      this.recoveredCountByDay[today] = (this.recoveredCountByDay[today] || 0) + 1;
    }
    return seat;
  }

  getDisputes(status?: 'pending' | 'resolved' | 'rejected'): Dispute[] {
    return this.disputes
      .filter((d) => !status || d.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  addDispute(dispute: Omit<Dispute, 'id' | 'createdAt' | 'status'>): Dispute {
    const newDispute: Dispute = {
      ...dispute,
      id: generateId(),
      createdAt: Date.now(),
      status: 'pending',
    };
    this.disputes.unshift(newDispute);
    return newDispute;
  }

  resolveDispute(id: string, action: 'recover' | 'reject', note?: string): Dispute | undefined {
    const dispute = this.disputes.find((d) => d.id === id);
    if (!dispute) return undefined;
    dispute.status = action === 'recover' ? 'resolved' : 'rejected';
    dispute.resolvedAt = Date.now();
    dispute.resolverNote = note;
    if (action === 'recover') {
      this.resetSeat(dispute.seatId, true);
    }
    return dispute;
  }

  getStats() {
    const seatsByBuilding: Record<string, { total: number; inUse: number; suspected: number }> = {};
    this.seats.forEach((seat) => {
      if (!seatsByBuilding[seat.building]) {
        seatsByBuilding[seat.building] = { total: 0, inUse: 0, suspected: 0 };
      }
      seatsByBuilding[seat.building].total++;
      if (seat.status === Status.IN_USE || seat.status === Status.TEMP_LEAVE) {
        seatsByBuilding[seat.building].inUse++;
      }
      if (seat.status === Status.SUSPECTED) {
        seatsByBuilding[seat.building].suspected++;
      }
    });

    const recoveredByDay = Object.entries(this.recoveredCountByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const totalRecovered = recoveredByDay.reduce((sum, d) => sum + d.count, 0);

    return {
      totalSeats: this.seats.length,
      seatsByBuilding,
      suspectedByHour: [...this.suspectedCountByHour],
      recoveredByDay,
      totalRecovered,
    };
  }

  checkAndUpdateTimeouts() {
    const now = Date.now();
    this.seats.forEach((seat) => {
      if (seat.status === Status.IN_USE && seat.expectedLeaveAt && seat.expectedLeaveAt < now) {
        seat.status = Status.SUSPECTED;
        seat.statusUpdatedAt = now;
        const hour = new Date(now).getHours();
        this.suspectedCountByHour[hour]++;
      }
      if (seat.status === Status.TEMP_LEAVE && seat.tempLeaveUntil && seat.tempLeaveUntil < now) {
        seat.status = Status.SUSPECTED;
        seat.statusUpdatedAt = now;
        const hour = new Date(now).getHours();
        this.suspectedCountByHour[hour]++;
      }
    });
  }
}

export const db = new DataStore();
export const BUILDING_ROOMS = roomsByBuilding;
export type { BUILDINGS };
