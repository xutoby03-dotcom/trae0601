import type { Table, Admin, Booking, DamageRecord } from '../types';
import { generateId, generateBookingCode } from '../utils/bookingUtils';
import { getTodayString } from '../utils/timeUtils';
import { addDays, format } from 'date-fns';

export const initialTables: Table[] = [
  {
    id: 'table-1',
    name: '1号球桌',
    location: '活动室东侧',
    openTimeStart: '08:00',
    openTimeEnd: '22:00',
    netStatus: 'good',
    racketCount: 8,
    status: 'available',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ping%20pong%20table%20in%20community%20activity%20room%20bright%20clean&image_size=square_hd',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'table-2',
    name: '2号球桌',
    location: '活动室西侧',
    openTimeStart: '08:00',
    openTimeEnd: '22:00',
    netStatus: 'good',
    racketCount: 6,
    status: 'available',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ping%20pong%20table%20blue%20surface%20with%20net%20indoor%20sports&image_size=square_hd',
    createdAt: new Date().toISOString(),
  },
];

export const initialAdmin: Admin[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
  },
];

function generateMockBookings(): Booking[] {
  const today = getTodayString();
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return [
    {
      id: generateId('booking'),
      tableId: 'table-1',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      playerCount: 2,
      racketBorrowed: 2,
      phone: '13800138001',
      bookingCode: generateBookingCode(),
      status: 'completed',
      checkedInAt: '09:00',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId('booking'),
      tableId: 'table-1',
      date: today,
      startTime: '10:30',
      endTime: '11:30',
      playerCount: 4,
      racketBorrowed: 4,
      phone: '13800138002',
      bookingCode: generateBookingCode(),
      status: 'checked-in',
      checkedInAt: '10:28',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId('booking'),
      tableId: 'table-1',
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      playerCount: 3,
      racketBorrowed: 2,
      phone: '13800138003',
      bookingCode: generateBookingCode(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId('booking'),
      tableId: 'table-2',
      date: today,
      startTime: '08:30',
      endTime: '09:30',
      playerCount: 2,
      racketBorrowed: 0,
      phone: '13800138004',
      bookingCode: generateBookingCode(),
      status: 'no-show',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId('booking'),
      tableId: 'table-2',
      date: today,
      startTime: '15:00',
      endTime: '17:00',
      playerCount: 2,
      racketBorrowed: 2,
      phone: '13800138005',
      bookingCode: generateBookingCode(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId('booking'),
      tableId: 'table-1',
      date: yesterday,
      startTime: '19:00',
      endTime: '21:00',
      playerCount: 4,
      racketBorrowed: 4,
      phone: '13800138006',
      bookingCode: generateBookingCode(),
      status: 'completed',
      checkedInAt: '19:05',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId('booking'),
      tableId: 'table-2',
      date: tomorrow,
      startTime: '10:00',
      endTime: '12:00',
      playerCount: 2,
      racketBorrowed: 2,
      phone: '13800138007',
      bookingCode: generateBookingCode(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId('booking'),
      tableId: 'table-1',
      date: tomorrow,
      startTime: '14:00',
      endTime: '15:30',
      playerCount: 3,
      racketBorrowed: 3,
      phone: '13800138001',
      bookingCode: generateBookingCode(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];
}

function generateMockDamageRecords(): DamageRecord[] {
  return [
    {
      id: generateId('damage'),
      tableId: 'table-1',
      type: 'racket',
      description: '球拍胶皮脱落，需要重新粘贴',
      status: 'pending',
      reportedAt: new Date().toISOString(),
    },
    {
      id: generateId('damage'),
      tableId: 'table-2',
      type: 'net',
      description: '球网中间有破洞',
      status: 'resolved',
      reportedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export const mockBookings = generateMockBookings();
export const mockDamageRecords = generateMockDamageRecords();
