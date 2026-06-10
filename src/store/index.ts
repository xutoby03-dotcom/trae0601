import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room, Booking, Feedback, EquipmentIssue, Notification, PracticeType, RoomType } from '../types';
import { format, addDays, isToday, isBefore, isAfter, parseISO, addMinutes } from 'date-fns';

interface StoreState {
  rooms: Room[];
  bookings: Booking[];
  feedbacks: Feedback[];
  equipmentIssues: EquipmentIssue[];
  notifications: Notification[];
  currentUser: string;
  isAdmin: boolean;

  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => { success: boolean; message: string; booking?: Booking };
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  checkInBooking: (bookingId: string) => void;
  checkOutBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;

  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;

  addEquipmentIssue: (issue: Omit<EquipmentIssue, 'id' | 'reportedAt' | 'resolved'>) => void;
  resolveEquipmentIssue: (issueId: string, note: string) => void;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  checkOverdueBookings: () => void;

  checkTimeConflict: (roomId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;
  getRoomBookingsByDate: (roomId: string, date: string) => Booking[];
  getRoomCurrentStatus: (roomId: string) => 'available' | 'in_use' | 'upcoming' | 'needs_cleaning';
  getBookingsGroupedByStatus: () => {
    availableToday: Room[];
    upcoming: Booking[];
    inUse: Booking[];
    needsCleaning: Booking[];
  };

  getStatistics: () => {
    roomPopularity: { roomId: string; roomName: string; count: number }[];
    cancellationRate: { total: number; cancelled: number; rate: number };
    equipmentFaultCount: { roomId: string; roomName: string; count: number }[];
    totalBookings: number;
    completedBookings: number;
    avgRatings: { noise: number; cleanliness: number; equipment: number; overall: number };
  };

  setAdminMode: (isAdmin: boolean) => void;
}

const initialRooms: Room[] = [
  { id: 'r1', name: '钢琴房 A101', type: 'piano', capacity: 2, hasMusicStand: true, hasExternalSpeaker: false, floor: '1楼' },
  { id: 'r2', name: '钢琴房 A102', type: 'piano', capacity: 2, hasMusicStand: true, hasExternalSpeaker: false, floor: '1楼' },
  { id: 'r3', name: '钢琴房 A103', type: 'piano', capacity: 4, hasMusicStand: true, hasExternalSpeaker: true, floor: '1楼' },
  { id: 'r4', name: '鼓房 B201', type: 'drum', capacity: 3, hasMusicStand: true, hasExternalSpeaker: true, floor: '2楼' },
  { id: 'r5', name: '鼓房 B202', type: 'drum', capacity: 2, hasMusicStand: true, hasExternalSpeaker: true, floor: '2楼' },
  { id: 'r6', name: '声乐间 C301', type: 'vocal', capacity: 3, hasMusicStand: true, hasExternalSpeaker: true, floor: '3楼' },
  { id: 'r7', name: '声乐间 C302', type: 'vocal', capacity: 6, hasMusicStand: true, hasExternalSpeaker: true, floor: '3楼' },
];

const today = format(new Date(), 'yyyy-MM-dd');
const now = new Date();

const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  
  bookings.push({
    id: 'b1', roomId: 'r1', userId: 'u1', userName: '张三',
    date: today,
    startTime: format(addMinutes(now, -30), 'HH:mm'),
    endTime: format(addMinutes(now, 30), 'HH:mm'),
    practiceType: 'piano_solo', peopleCount: 1, needMusicStand: true, hasExternalSpeaker: false,
    status: 'in_use', checkInTime: format(addMinutes(now, -25), 'HH:mm'),
    createdAt: new Date().toISOString(),
  });

  bookings.push({
    id: 'b2', roomId: 'r4', userId: 'u2', userName: '李四',
    date: today,
    startTime: format(addMinutes(now, 45), 'HH:mm'),
    endTime: format(addMinutes(now, 105), 'HH:mm'),
    practiceType: 'drum_practice', peopleCount: 2, needMusicStand: true, hasExternalSpeaker: true,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  bookings.push({
    id: 'b3', roomId: 'r6', userId: 'u3', userName: '王五',
    date: today,
    startTime: format(addMinutes(now, -120), 'HH:mm'),
    endTime: format(addMinutes(now, -60), 'HH:mm'),
    practiceType: 'vocal_solo', peopleCount: 1, needMusicStand: true, hasExternalSpeaker: false,
    status: 'needs_cleaning',
    checkInTime: format(addMinutes(now, -115), 'HH:mm'),
    checkOutTime: format(addMinutes(now, -60), 'HH:mm'),
    createdAt: new Date().toISOString(),
  });

  bookings.push({
    id: 'b4', roomId: 'r3', userId: 'u1', userName: '张三',
    date: today,
    startTime: format(addMinutes(now, 15), 'HH:mm'),
    endTime: format(addMinutes(now, 75), 'HH:mm'),
    practiceType: 'piano_duet', peopleCount: 2, needMusicStand: true, hasExternalSpeaker: false,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  bookings.push({
    id: 'b5', roomId: 'r2', userId: 'u4', userName: '赵六',
    date: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
    startTime: '14:00', endTime: '15:00',
    practiceType: 'piano_solo', peopleCount: 1, needMusicStand: true, hasExternalSpeaker: false,
    status: 'cancelled',
    createdAt: new Date().toISOString(),
  });

  return bookings;
};

const generateMockFeedbacks = (): Feedback[] => [
  {
    id: 'f1', bookingId: 'b_old1', roomId: 'r1',
    noiseRating: 4, cleanlinessRating: 5, equipmentRating: 4, overallRating: 4,
    comments: '整体不错，琴键有一点点涩',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'f2', bookingId: 'b_old2', roomId: 'r4',
    noiseRating: 5, cleanlinessRating: 4, equipmentRating: 3, overallRating: 4,
    equipmentIssue: '鼓皮有点松了',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'f3', bookingId: 'b_old3', roomId: 'r6',
    noiseRating: 5, cleanlinessRating: 5, equipmentRating: 5, overallRating: 5,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const generateMockEquipmentIssues = (): EquipmentIssue[] => [
  {
    id: 'e1', roomId: 'r1', reportedBy: '管理员',
    category: 'keyboard', description: '中C区域3个琴键回弹不灵敏',
    severity: 'medium', resolved: false,
    reportedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'e2', roomId: 'r4', reportedBy: '李四',
    category: 'drum', description: '地鼓鼓皮松动，需要调音',
    severity: 'low', resolved: false,
    reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      rooms: initialRooms,
      bookings: generateMockBookings(),
      feedbacks: generateMockFeedbacks(),
      equipmentIssues: generateMockEquipmentIssues(),
      notifications: [],
      currentUser: '当前用户',
      isAdmin: false,

      setAdminMode: (isAdmin) => set({ isAdmin }),

      checkTimeConflict: (roomId, date, startTime, endTime, excludeBookingId) => {
        const state = get();
        const roomBookings = state.bookings.filter(
          b => b.roomId === roomId 
            && b.date === date 
            && b.status !== 'cancelled'
            && (excludeBookingId ? b.id !== excludeBookingId : true)
        );

        const newStart = parseISO(`${date}T${startTime}:00`);
        const newEnd = parseISO(`${date}T${endTime}:00`);

        return roomBookings.some(booking => {
          const existStart = parseISO(`${booking.date}T${booking.startTime}:00`);
          const existEnd = parseISO(`${booking.date}T${booking.endTime}:00`);
          return (isBefore(newStart, existEnd) && isAfter(newEnd, existStart));
        });
      },

      addBooking: (bookingData) => {
        const state = get();
        
        if (state.checkTimeConflict(bookingData.roomId, bookingData.date, bookingData.startTime, bookingData.endTime)) {
          return { success: false, message: '该时间段与已有预约冲突，请选择其他时间' };
        }

        const start = parseISO(`${bookingData.date}T${bookingData.startTime}:00`);
        const end = parseISO(`${bookingData.date}T${bookingData.endTime}:00`);
        if (!isAfter(end, start)) {
          return { success: false, message: '结束时间必须晚于开始时间' };
        }

        const room = state.rooms.find(r => r.id === bookingData.roomId);
        if (room && bookingData.peopleCount > room.capacity) {
          return { success: false, message: `人数超过房间容量限制（最多${room.capacity}人）` };
        }

        const newBooking: Booking = {
          ...bookingData,
          id: 'b' + Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set({ bookings: [...state.bookings, newBooking] });
        return { success: true, message: '预约成功！', booking: newBooking };
      },

      updateBookingStatus: (bookingId, status) => {
        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === bookingId ? { ...b, status } : b
          ),
        }));
      },

      checkInBooking: (bookingId) => {
        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'in_use', checkInTime: format(new Date(), 'HH:mm') } : b
          ),
        }));
      },

      checkOutBooking: (bookingId) => {
        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'needs_cleaning', checkOutTime: format(new Date(), 'HH:mm') } : b
          ),
        }));
      },

      cancelBooking: (bookingId) => {
        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          ),
        }));
      },

      addFeedback: (feedbackData) => {
        const state = get();
        const newFeedback: Feedback = {
          ...feedbackData,
          id: 'f' + Date.now(),
          createdAt: new Date().toISOString(),
        };
        set({ feedbacks: [...state.feedbacks, newFeedback] });

        const completedBooking = state.bookings.find(b => b.id === feedbackData.bookingId);
        if (completedBooking && feedbackData.roomId) {
          if (feedbackData.equipmentIssue || feedbackData.equipmentRating <= 2) {
            const issue: Omit<EquipmentIssue, 'id' | 'reportedAt' | 'resolved'> = {
              roomId: feedbackData.roomId,
              reportedBy: completedBooking.userName,
              category: 'other',
              description: feedbackData.equipmentIssue || `设备评分较低 (${feedbackData.equipmentRating}分)`,
              severity: feedbackData.equipmentRating <= 1 ? 'high' : 'medium',
            };
            state.addEquipmentIssue(issue);
          }
        }
      },

      addEquipmentIssue: (issueData) => {
        const state = get();
        const newIssue: EquipmentIssue = {
          ...issueData,
          id: 'e' + Date.now(),
          reportedAt: new Date().toISOString(),
          resolved: false,
        };
        set({ equipmentIssues: [...state.equipmentIssues, newIssue] });
      },

      resolveEquipmentIssue: (issueId, note) => {
        set(state => ({
          equipmentIssues: state.equipmentIssues.map(e =>
            e.id === issueId ? { ...e, resolved: true, resolvedAt: new Date().toISOString(), resolvedNote: note } : e
          ),
        }));
      },

      addNotification: (notifData) => {
        const state = get();
        const newNotif: Notification = {
          ...notifData,
          id: 'n' + Date.now() + Math.random(),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set({ notifications: [newNotif, ...state.notifications].slice(0, 50) });
      },

      markNotificationRead: (notificationId) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }));
      },

      checkOverdueBookings: () => {
        const state = get();
        const nowTime = new Date();

        state.bookings.forEach(booking => {
          if (booking.status === 'pending' && isToday(parseISO(booking.date))) {
            const endDateTime = parseISO(`${booking.date}T${booking.endTime}:00`);
            const startDateTime = parseISO(`${booking.date}T${booking.startTime}:00`);
            
            if (isAfter(nowTime, endDateTime) && booking.status === 'pending') {
              state.addNotification({
                bookingId: booking.id,
                type: 'overdue_checkout',
                message: `预约 ${booking.startTime}-${booking.endTime} (${state.rooms.find(r => r.id === booking.roomId)?.name}) 已超过结束时间但未使用，系统将自动取消`,
              });
              state.updateBookingStatus(booking.id, 'cancelled');
            }
            
            if (isAfter(nowTime, addMinutes(startDateTime, 15)) && booking.status === 'pending') {
              state.addNotification({
                bookingId: booking.id,
                type: 'overdue_checkout',
                message: `⚠️ ${state.rooms.find(r => r.id === booking.roomId)?.name} 的预约（${booking.startTime}）已超过15分钟未签到，请尽快处理`,
              });
            }
          }
        });
      },

      getRoomBookingsByDate: (roomId, date) => {
        return get().bookings.filter(b => b.roomId === roomId && b.date === date && b.status !== 'cancelled');
      },

      getRoomCurrentStatus: (roomId) => {
        const state = get();
        const nowTime = new Date();
        const todayStr = format(nowTime, 'yyyy-MM-dd');

        const todayBookings = state.bookings.filter(
          b => b.roomId === roomId && b.date === todayStr && b.status !== 'cancelled'
        );

        const inUse = todayBookings.find(b => {
          if (b.status !== 'in_use') return false;
          const start = parseISO(`${b.date}T${b.startTime}:00`);
          const end = parseISO(`${b.date}T${b.endTime}:00`);
          return isAfter(nowTime, start) && isBefore(nowTime, end);
        });
        if (inUse) return 'in_use';

        const needCleaning = todayBookings.find(b => b.status === 'needs_cleaning');
        if (needCleaning) return 'needs_cleaning';

        const upcoming = todayBookings.find(b => {
          if (b.status !== 'pending') return false;
          const start = parseISO(`${b.date}T${b.startTime}:00`);
          const diff = start.getTime() - nowTime.getTime();
          return diff > 0 && diff <= 3600000;
        });
        if (upcoming) return 'upcoming';

        return 'available';
      },

      getBookingsGroupedByStatus: () => {
        const state = get();
        const nowTime = new Date();
        const todayStr = format(nowTime, 'yyyy-MM-dd');

        const inUse: Booking[] = [];
        const upcoming: Booking[] = [];
        const needsCleaning: Booking[] = [];

        state.bookings.forEach(b => {
          if (b.status === 'cancelled') return;
          if (b.status === 'completed') return;
          if (b.date !== todayStr && b.status !== 'needs_cleaning') return;

          if (b.status === 'needs_cleaning') {
            needsCleaning.push(b);
          } else if (b.status === 'in_use') {
            inUse.push(b);
          } else if (b.status === 'pending') {
            const start = parseISO(`${b.date}T${b.startTime}:00`);
            const end = parseISO(`${b.date}T${b.endTime}:00`);
            
            if (isAfter(nowTime, start) && isBefore(nowTime, end)) {
              inUse.push(b);
            } else if (isAfter(start, nowTime)) {
              upcoming.push(b);
            }
          }
        });

        const busyRoomIds = new Set([...inUse, ...upcoming, ...needsCleaning].map(b => b.roomId));
        const availableToday = state.rooms.filter(r => !busyRoomIds.has(r.id));

        return {
          availableToday: availableToday.sort((a, b) => a.name.localeCompare(b.name)),
          upcoming: upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime)),
          inUse: inUse.sort((a, b) => a.endTime.localeCompare(b.endTime)),
          needsCleaning: needsCleaning.sort((a, b) => (b.checkOutTime || '').localeCompare(a.checkOutTime || '')),
        };
      },

      getStatistics: () => {
        const state = get();
        
        const roomMap: Record<string, string> = {};
        state.rooms.forEach(r => { roomMap[r.id] = r.name; });

        const bookingCountByRoom: Record<string, number> = {};
        let totalBookings = 0;
        let cancelledBookings = 0;
        let completedBookings = 0;

        state.bookings.forEach(b => {
          if (b.status !== 'cancelled') {
            bookingCountByRoom[b.roomId] = (bookingCountByRoom[b.roomId] || 0) + 1;
          }
          totalBookings++;
          if (b.status === 'cancelled') cancelledBookings++;
          if (b.status === 'completed' || b.status === 'needs_cleaning' || (b.checkOutTime && b.status === 'in_use')) {
            completedBookings++;
          }
        });

        const roomPopularity = state.rooms.map(r => ({
          roomId: r.id,
          roomName: r.name,
          count: bookingCountByRoom[r.id] || 0,
        })).sort((a, b) => b.count - a.count);

        const issueCountByRoom: Record<string, number> = {};
        state.equipmentIssues.forEach(e => {
          issueCountByRoom[e.roomId] = (issueCountByRoom[e.roomId] || 0) + 1;
        });

        const equipmentFaultCount = state.rooms.map(r => ({
          roomId: r.id,
          roomName: r.name,
          count: issueCountByRoom[r.id] || 0,
        })).sort((a, b) => b.count - a.count);

        let noiseSum = 0, cleanSum = 0, equipSum = 0, overallSum = 0;
        state.feedbacks.forEach(f => {
          noiseSum += f.noiseRating;
          cleanSum += f.cleanlinessRating;
          equipSum += f.equipmentRating;
          overallSum += f.overallRating;
        });
        const count = state.feedbacks.length || 1;

        return {
          roomPopularity,
          cancellationRate: {
            total: totalBookings,
            cancelled: cancelledBookings,
            rate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
          },
          equipmentFaultCount,
          totalBookings,
          completedBookings,
          avgRatings: {
            noise: noiseSum / count,
            cleanliness: cleanSum / count,
            equipment: equipSum / count,
            overall: overallSum / count,
          },
        };
      },
    }),
    {
      name: 'practice-room-store',
    }
  )
);

export const practiceTypeLabels: Record<PracticeType, string> = {
  piano_solo: '钢琴独奏',
  piano_duet: '钢琴四手联弹',
  drum_practice: '架子鼓练习',
  vocal_solo: '声乐独唱',
  vocal_group: '声乐小组',
  band_practice: '乐队排练',
  other: '其他',
};

export const roomTypeLabels: Record<RoomType, string> = {
  piano: '钢琴房',
  drum: '鼓房',
  vocal: '声乐间',
};

export const roomTypeColors: Record<RoomType, string> = {
  piano: 'bg-amber-100 text-amber-700 border-amber-200',
  drum: 'bg-purple-100 text-purple-700 border-purple-200',
  vocal: 'bg-sky-100 text-sky-700 border-sky-200',
};
