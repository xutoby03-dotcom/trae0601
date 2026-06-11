import { Room, Booking, PianoType } from '@/types';
import { generateTimeSlots, formatDate, generateId, getNext7Days } from '@/utils/bookingUtils';
import { addDays } from 'date-fns';

const pianoTypes: PianoType[] = ['grand', 'upright', 'digital', 'hybrid'];
const roomNumbers = ['A101', 'A102', 'A201', 'A202', 'A301', 'A302', 'A401', 'A402'];
const floors = [1, 1, 2, 2, 3, 3, 4, 4];
const hasStand = [true, true, true, false, true, true, false, true];

const photoPrompts = [
  'elegant grand piano in bright music practice room with wooden floor natural light',
  'upright piano in cozy music room with warm lighting and wooden floor',
  'digital piano in modern practice room with minimalist design',
  'hybrid piano in elegant music studio with soundproof walls',
  'grand piano in spacious practice room with large windows',
  'classic upright piano in traditional music room',
  'sleek digital piano in contemporary practice space',
  'premium hybrid piano in professional music room',
];

export const generateMockRooms = (): Room[] => {
  return roomNumbers.map((number, index) => ({
    id: `room-${index + 1}`,
    roomNumber: number,
    pianoType: pianoTypes[index],
    floor: floors[index],
    hasMusicStand: hasStand[index],
    photoUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(photoPrompts[index])}&image_size=square`,
    availableTimeSlots: generateTimeSlots(),
    status: index === 3 ? 'maintenance' : index === 6 ? 'temporarily_closed' : 'available',
    maintenanceReason: index === 3 ? '琴弦需要更换' : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

const studentNames = [
  '李明轩', '王雨涵', '张子琪', '刘诗韵', '陈嘉豪',
  '杨思远', '赵雅琴', '周浩然', '吴梦琳', '郑凯文',
  '孙艺菲', '黄俊熙', '徐婉清', '何志强', '马晓燕',
];

const majors = [
  '钢琴表演', '音乐教育', '作曲技术', '音乐学',
  '声乐表演', '器乐表演', '音乐治疗', '艺术管理',
];

const purposes = [
  '日常练习', '曲目备考', '技巧训练', '视奏练习',
  '伴奏练习', '新曲学习', '考级准备', '演出排练',
];

const phones = [
  '13800138001', '13800138002', '13800138003', '13800138004', '13800138005',
  '13800138006', '13800138007', '13800138008', '13800138009', '13800138010',
];

export const generateMockBookings = (rooms: Room[]): Booking[] => {
  const bookings: Booking[] = [];
  const days = getNext7Days();
  const timeSlots = generateTimeSlots();
  
  let idCounter = 1;
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = days[dayOffset];
    const isToday = dayOffset === 0;
    
    rooms.forEach((room, roomIndex) => {
      if (room.status !== 'available') return;
      
      const numBookings = isToday ? Math.floor(Math.random() * 8) + 3 : Math.floor(Math.random() * 6) + 2;
      const usedSlots = new Set<string>();
      
      for (let i = 0; i < numBookings; i++) {
        let slotIndex: number;
        do {
          slotIndex = Math.floor(Math.random() * timeSlots.length);
        } while (usedSlots.has(timeSlots[slotIndex]) && usedSlots.size < timeSlots.length);
        
        usedSlots.add(timeSlots[slotIndex]);
        
        const studentIndex = Math.floor(Math.random() * studentNames.length);
        const isWaitlist = i >= 1 && Math.random() > 0.7;
        
        const booking: Booking = {
          id: `booking-${idCounter++}`,
          roomId: room.id,
          studentName: studentNames[studentIndex],
          major: majors[Math.floor(Math.random() * majors.length)],
          phone: phones[studentIndex % phones.length],
          practicePurpose: purposes[Math.floor(Math.random() * purposes.length)],
          date,
          timeSlot: timeSlots[slotIndex],
          status: isWaitlist ? 'waitlist' : (dayOffset < 0 ? (Math.random() > 0.1 ? 'completed' : 'no_show') : 'confirmed'),
          isWaitlist,
          waitlistPosition: isWaitlist ? Math.floor(Math.random() * 3) + 1 : undefined,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          noShowRecorded: dayOffset < 0 && Math.random() > 0.9 ? true : undefined,
        };
        
        bookings.push(booking);
      }
    });
  }
  
  return bookings;
};

export const initializeMockData = (): { rooms: Room[]; bookings: Booking[] } => {
  const rooms = generateMockRooms();
  const bookings = generateMockBookings(rooms);
  return { rooms, bookings };
};
