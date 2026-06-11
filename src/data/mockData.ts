import type { HaircutEvent, Appointment } from '@/types';
import { generateId, formatDate, addMinutes } from '@/utils/time';

function getTodayDate(): string {
  return formatDate(new Date());
}

function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export const mockEvents: HaircutEvent[] = [
  {
    id: 'event-today',
    location: '社区活动中心一楼大厅',
    date: getTodayDate(),
    startTime: '09:00',
    endTime: '11:30',
    barberCount: 3,
    durationPerPerson: 20,
    totalCapacity: 24,
    status: 'ongoing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'event-next',
    location: '社区活动中心一楼大厅',
    date: getFutureDate(7),
    startTime: '09:00',
    endTime: '11:30',
    barberCount: 3,
    durationPerPerson: 20,
    totalCapacity: 24,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'event-past',
    location: '社区活动中心一楼大厅',
    date: getFutureDate(-7),
    startTime: '09:00',
    endTime: '11:30',
    barberCount: 3,
    durationPerPerson: 20,
    totalCapacity: 24,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const elderNames = [
  '张大爷', '李奶奶', '王爷爷', '赵阿姨', '刘大伯',
  '陈奶奶', '杨爷爷', '黄阿姨', '周大爷', '吴奶奶',
  '徐爷爷', '孙阿姨', '马大伯', '朱奶奶', '胡爷爷',
];

function getRandomElder() {
  const name = elderNames[Math.floor(Math.random() * elderNames.length)];
  const age = 60 + Math.floor(Math.random() * 30);
  const phone = '138' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  const mobilityIssue = Math.random() > 0.7;
  return { name, age, phone, mobilityIssue };
}

export const mockAppointments: Appointment[] = [];

const today = getTodayDate();
const eventId = 'event-today';

const statuses: Array<{ status: Appointment['status']; count: number }> = [
  { status: 'serving', count: 2 },
  { status: 'checked-in', count: 5 },
  { status: 'booked', count: 8 },
  { status: 'completed', count: 6 },
  { status: 'no-show', count: 2 },
  { status: 'waitlist', count: 3 },
];

let queueNum = 1;
statuses.forEach(({ status, count }) => {
  for (let i = 0; i < count; i++) {
    const elder = getRandomElder();
    const slotIndex = Math.floor(Math.random() * 8);
    const slotTime = addMinutes('09:00', slotIndex * 20);
    
    const appt: Appointment = {
      id: generateId(),
      eventId,
      slotId: status === 'waitlist' ? null : `slot-${eventId}-${slotIndex}`,
      elderName: elder.name,
      age: elder.age,
      phone: elder.phone,
      mobilityIssue: elder.mobilityIssue,
      preferredTime: slotTime,
      status,
      queueNumber: ['serving', 'checked-in', 'completed', 'no-show'].includes(status) 
        ? queueNum++ 
        : null,
      postponeCount: 0,
      checkInTime: ['serving', 'checked-in', 'completed', 'no-show'].includes(status)
        ? new Date().toISOString()
        : null,
      startTime: status === 'serving' || status === 'completed'
        ? new Date().toISOString()
        : null,
      endTime: status === 'completed'
        ? new Date().toISOString()
        : null,
      createdAt: new Date().toISOString(),
    };
    mockAppointments.push(appt);
  }
});

const pastEventId = 'event-past';
for (let i = 0; i < 20; i++) {
  const elder = getRandomElder();
  const isNoShow = Math.random() > 0.85;
  const appt: Appointment = {
    id: generateId(),
    eventId: pastEventId,
    slotId: `slot-${pastEventId}-${Math.floor(Math.random() * 8)}`,
    elderName: elder.name,
    age: elder.age,
    phone: elder.phone,
    mobilityIssue: elder.mobilityIssue,
    preferredTime: addMinutes('09:00', Math.floor(Math.random() * 8) * 20),
    status: isNoShow ? 'no-show' : 'completed',
    queueNumber: i + 1,
    postponeCount: 0,
    checkInTime: isNoShow ? null : new Date().toISOString(),
    startTime: isNoShow ? null : new Date().toISOString(),
    endTime: isNoShow ? null : new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  mockAppointments.push(appt);
}
