import { BorrowRecord } from '@/types';

const now = new Date();

const formatDate = (date: Date) => date.toISOString();

const addHours = (date: Date, hours: number) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const subtractDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

export const borrowRecords: BorrowRecord[] = [
  {
    id: 'br1',
    deviceId: 'd2',
    borrowerName: '张三',
    borrowerDept: '产品部',
    startTime: formatDate(subtractDays(now, 0)),
    endTime: formatDate(addHours(now, 2)),
    purpose: '产品评审会议',
    status: 'borrowed',
  },
  {
    id: 'br2',
    deviceId: 'd6',
    borrowerName: '李四',
    borrowerDept: '技术部',
    startTime: formatDate(subtractDays(now, 1)),
    endTime: formatDate(addHours(subtractDays(now, 1), 3)),
    actualReturnTime: formatDate(addHours(subtractDays(now, 1), 2.5)),
    purpose: '技术分享会',
    status: 'returned',
    appearanceCheck: 'good',
    projectionOK: true,
    pouchPresent: true,
  },
  {
    id: 'br3',
    deviceId: 'd9',
    borrowerName: '王五',
    borrowerDept: '市场部',
    startTime: formatDate(subtractDays(now, 2)),
    endTime: formatDate(addHours(subtractDays(now, 2), 4)),
    actualReturnTime: formatDate(addHours(subtractDays(now, 2), 5)),
    purpose: '客户演示',
    status: 'returned',
    appearanceCheck: 'minor-damage',
    projectionOK: true,
    pouchPresent: false,
    returnNotes: '收纳袋遗失，已登记',
  },
  {
    id: 'br4',
    deviceId: 'd12',
    borrowerName: '赵六',
    borrowerDept: '设计部',
    startTime: formatDate(subtractDays(now, 1)),
    endTime: formatDate(addHours(subtractDays(now, 1), 1)),
    purpose: '设计评审',
    status: 'overdue',
  },
  {
    id: 'br5',
    deviceId: 'd15',
    borrowerName: '钱七',
    borrowerDept: '运营部',
    startTime: formatDate(addDays(now, 1)),
    endTime: formatDate(addHours(addDays(now, 1), 2)),
    purpose: '运营周会',
    status: 'pending',
  },
  {
    id: 'br6',
    deviceId: 'd3',
    borrowerName: '孙八',
    borrowerDept: '人力资源部',
    startTime: formatDate(subtractDays(now, 3)),
    endTime: formatDate(addHours(subtractDays(now, 3), 2)),
    actualReturnTime: formatDate(addHours(subtractDays(now, 3), 2)),
    purpose: '面试',
    status: 'returned',
    appearanceCheck: 'good',
    projectionOK: true,
    pouchPresent: true,
  },
  {
    id: 'br7',
    deviceId: 'd7',
    borrowerName: '周九',
    borrowerDept: '财务部',
    startTime: formatDate(subtractDays(now, 5)),
    endTime: formatDate(addHours(subtractDays(now, 5), 3)),
    actualReturnTime: formatDate(addHours(subtractDays(now, 5), 3)),
    purpose: '财务报表会议',
    status: 'returned',
    appearanceCheck: 'good',
    projectionOK: true,
    pouchPresent: true,
  },
  {
    id: 'br8',
    deviceId: 'd1',
    borrowerName: '吴十',
    borrowerDept: '技术部',
    startTime: formatDate(addDays(now, 2)),
    endTime: formatDate(addHours(addDays(now, 2), 6)),
    purpose: '项目启动会',
    status: 'pending',
  },
];
