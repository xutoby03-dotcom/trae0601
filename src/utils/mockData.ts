import type { User, Route, Booking } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: '张师傅',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsf',
    noShowCount: 0,
    isOwner: true
  },
  {
    id: 'user2',
    name: '李女士',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lins',
    noShowCount: 0,
    isOwner: true
  },
  {
    id: 'user3',
    name: '王先生',
    phone: '13800138003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangxs',
    noShowCount: 1,
    isOwner: false
  },
  {
    id: 'user4',
    name: '赵阿姨',
    phone: '13800138004',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoay',
    noShowCount: 2,
    isOwner: false
  },
  {
    id: 'user5',
    name: '孙同学',
    phone: '13800138005',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suntx',
    noShowCount: 3,
    isOwner: false
  },
  {
    id: 'user6',
    name: '周先生',
    phone: '13800138006',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouxs',
    noShowCount: 0,
    isOwner: false
  }
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const formatDateForInput = (date: Date, hour: number, minute: number): string => {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const mockRoutes: Route[] = [
  {
    id: 'route1',
    ownerId: 'user1',
    ownerName: '张师傅',
    departure: '阳光花园小区',
    destination: '市第一人民医院',
    departureTime: formatDateForInput(today, 8, 0),
    totalSeats: 4,
    availableSeats: 2,
    hasChildSeat: true,
    luggageSpace: 'medium',
    plateNumber: '京A·88888',
    status: 'open',
    createdAt: formatDateForInput(today, 7, 0)
  },
  {
    id: 'route2',
    ownerId: 'user2',
    ownerName: '李女士',
    departure: '阳光花园小区',
    destination: '实验小学',
    departureTime: formatDateForInput(today, 7, 30),
    totalSeats: 3,
    availableSeats: 1,
    hasChildSeat: true,
    luggageSpace: 'small',
    plateNumber: '京B·66666',
    status: 'open',
    createdAt: formatDateForInput(today, 6, 30)
  },
  {
    id: 'route3',
    ownerId: 'user1',
    ownerName: '张师傅',
    departure: '阳光花园小区',
    destination: '地铁站A口',
    departureTime: formatDateForInput(today, 8, 30),
    totalSeats: 4,
    availableSeats: 0,
    hasChildSeat: false,
    luggageSpace: 'medium',
    plateNumber: '京A·88888',
    status: 'full',
    createdAt: formatDateForInput(today, 7, 30)
  },
  {
    id: 'route4',
    ownerId: 'user2',
    ownerName: '李女士',
    departure: '阳光花园小区',
    destination: '市第一人民医院',
    departureTime: formatDateForInput(tomorrow, 9, 0),
    totalSeats: 3,
    availableSeats: 3,
    hasChildSeat: false,
    luggageSpace: 'large',
    plateNumber: '京B·66666',
    status: 'open',
    createdAt: formatDateForInput(today, 10, 0)
  },
  {
    id: 'route5',
    ownerId: 'user1',
    ownerName: '张师傅',
    departure: '阳光花园小区',
    destination: '购物中心',
    departureTime: formatDateForInput(tomorrow, 14, 0),
    totalSeats: 4,
    availableSeats: 4,
    hasChildSeat: false,
    luggageSpace: 'medium',
    plateNumber: '京A·88888',
    status: 'open',
    createdAt: formatDateForInput(today, 11, 0)
  },
  {
    id: 'route6',
    ownerId: 'user2',
    ownerName: '李女士',
    departure: '阳光花园小区',
    destination: '地铁站B口',
    departureTime: formatDateForInput(yesterday, 8, 0),
    totalSeats: 3,
    availableSeats: 0,
    hasChildSeat: false,
    luggageSpace: 'small',
    plateNumber: '京B·66666',
    status: 'completed',
    createdAt: formatDateForInput(yesterday, 7, 0)
  },
  {
    id: 'route7',
    ownerId: 'user1',
    ownerName: '张师傅',
    departure: '阳光花园小区',
    destination: '高铁站',
    departureTime: formatDateForInput(tomorrow, 6, 0),
    totalSeats: 4,
    availableSeats: 2,
    hasChildSeat: false,
    luggageSpace: 'large',
    plateNumber: '京A·88888',
    status: 'open',
    createdAt: formatDateForInput(today, 12, 0)
  },
  {
    id: 'route8',
    ownerId: 'user2',
    ownerName: '李女士',
    departure: '阳光花园小区',
    destination: '公园东门',
    departureTime: formatDateForInput(tomorrow, 9, 30),
    totalSeats: 3,
    availableSeats: 3,
    hasChildSeat: true,
    luggageSpace: 'small',
    plateNumber: '京B·66666',
    status: 'open',
    createdAt: formatDateForInput(today, 13, 0)
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'booking1',
    routeId: 'route1',
    passengerId: 'user3',
    passengerName: '王先生',
    passengerCount: 1,
    pickupPoint: '小区北门',
    contactPhone: '13800138003',
    hasElderlyOrChild: false,
    remarks: '请准时',
    status: 'confirmed',
    createdAt: formatDateForInput(today, 7, 10)
  },
  {
    id: 'booking2',
    routeId: 'route1',
    passengerId: 'user6',
    passengerName: '周先生',
    passengerCount: 1,
    pickupPoint: '小区南门',
    contactPhone: '13800138006',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'pending',
    createdAt: formatDateForInput(today, 7, 20)
  },
  {
    id: 'booking3',
    routeId: 'route2',
    passengerId: 'user4',
    passengerName: '赵阿姨',
    passengerCount: 2,
    pickupPoint: '小区东门',
    contactPhone: '13800138004',
    hasElderlyOrChild: true,
    remarks: '带一个小孩，需要儿童座椅',
    status: 'confirmed',
    createdAt: formatDateForInput(today, 6, 45)
  },
  {
    id: 'booking4',
    routeId: 'route3',
    passengerId: 'user3',
    passengerName: '王先生',
    passengerCount: 2,
    pickupPoint: '小区北门',
    contactPhone: '13800138003',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'confirmed',
    createdAt: formatDateForInput(today, 7, 45)
  },
  {
    id: 'booking5',
    routeId: 'route3',
    passengerId: 'user6',
    passengerName: '周先生',
    passengerCount: 2,
    pickupPoint: '小区西门',
    contactPhone: '13800138006',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'confirmed',
    createdAt: formatDateForInput(today, 7, 50)
  },
  {
    id: 'booking6',
    routeId: 'route6',
    passengerId: 'user5',
    passengerName: '孙同学',
    passengerCount: 1,
    pickupPoint: '小区南门',
    contactPhone: '13800138005',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'no_show',
    createdAt: formatDateForInput(yesterday, 7, 10)
  },
  {
    id: 'booking7',
    routeId: 'route6',
    passengerId: 'user3',
    passengerName: '王先生',
    passengerCount: 1,
    pickupPoint: '小区北门',
    contactPhone: '13800138003',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'completed',
    createdAt: formatDateForInput(yesterday, 7, 15)
  },
  {
    id: 'booking8',
    routeId: 'route2',
    passengerId: 'user5',
    passengerName: '孙同学',
    passengerCount: 1,
    pickupPoint: '小区南门',
    contactPhone: '13800138005',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'pending',
    createdAt: formatDateForInput(today, 6, 50)
  },
  {
    id: 'booking9',
    routeId: 'route7',
    passengerId: 'user4',
    passengerName: '赵阿姨',
    passengerCount: 1,
    pickupPoint: '小区东门',
    contactPhone: '13800138004',
    hasElderlyOrChild: false,
    remarks: '有一个行李箱',
    status: 'confirmed',
    createdAt: formatDateForInput(today, 12, 30)
  },
  {
    id: 'booking10',
    routeId: 'route7',
    passengerId: 'user6',
    passengerName: '周先生',
    passengerCount: 1,
    pickupPoint: '小区北门',
    contactPhone: '13800138006',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'pending',
    createdAt: formatDateForInput(today, 12, 45)
  },
  {
    id: 'booking11',
    routeId: 'route8',
    passengerId: 'user3',
    passengerName: '王先生',
    passengerCount: 3,
    pickupPoint: '小区南门',
    contactPhone: '13800138003',
    hasElderlyOrChild: true,
    remarks: '带老人和小孩，需要儿童座椅',
    status: 'pending',
    createdAt: formatDateForInput(today, 13, 30)
  },
  {
    id: 'booking12',
    routeId: 'route4',
    passengerId: 'user5',
    passengerName: '孙同学',
    passengerCount: 1,
    pickupPoint: '小区西门',
    contactPhone: '13800138005',
    hasElderlyOrChild: false,
    remarks: '',
    status: 'rejected',
    createdAt: formatDateForInput(today, 10, 30)
  }
];

export const defaultCurrentUser: User = mockUsers[0];
