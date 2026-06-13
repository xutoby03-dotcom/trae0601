import { Complaint, NoiseType } from '@/types';
import { getDaysAgo, getHoursLater, getDaysLater, generateId } from './dateUtils';

const createComplaint = (
  building: string,
  unit: string,
  noiseType: NoiseType,
  timePeriod: string,
  complainant: string,
  phone: string,
  description: string,
  daysAgo: number,
  status: Complaint['status'],
  hasProcessRecord: boolean = true,
  isOverdue: boolean = false
): Complaint => {
  const id = generateId();
  const createdAt = getDaysAgo(daysAgo);

  const processRecords = hasProcessRecord
    ? [
        {
          id: generateId(),
          complaintId: id,
          contactPerson: '张师傅',
          persuasionResult: '已联系业主，业主承诺注意',
          needHomeVisit: false,
          promisedTime: isOverdue ? getDaysAgo(1) : getDaysLater(2),
          actualVisitTime: status === 'completed' ? getHoursLater(48) : undefined,
          remark: '业主表示会提醒装修工人注意施工时间',
          createdAt: getDaysAgo(daysAgo - 0.5),
        },
      ]
    : [];

  return {
    id,
    building,
    unit,
    timePeriod,
    noiseType,
    complainant,
    phone,
    description,
    attachments: [],
    processRecords,
    status,
    createdAt,
    updatedAt: createdAt,
  };
};

export const mockComplaints: Complaint[] = [
  createComplaint('3号楼', '1203', 'decoration', '上午8:00-10:00', '李明', '13800138001', '楼上装修电钻声音太大，影响孩子上网课', 1, 'processing'),
  createComplaint('5号楼', '805', 'square_dance', '晚上19:00-21:00', '王芳', '13800138002', '小区广场广场舞音响音量过大，老人无法休息', 2, 'overdue', true, true),
  createComplaint('2号楼', '1502', 'furniture', '凌晨01:00-02:00', '张伟', '13800138003', '半夜有人搬家具，声音很大被吵醒', 3, 'completed'),
  createComplaint('3号楼', '1203', 'decoration', '下午14:00-16:00', '李明', '13800138001', '午休时间还在钻墙，严重影响休息', 4, 'completed'),
  createComplaint('1号楼', '501', 'pet', '全天', '刘洋', '13800138004', '邻居家狗经常叫，特别是晚上', 5, 'processing'),
  createComplaint('6号楼', '2201', 'decoration', '周末全天', '陈静', '13800138005', '周末装修不停止，投诉多次无果', 6, 'overdue', true, true),
  createComplaint('4号楼', '1008', 'other', '晚上22:00-23:00', '赵强', '13800138006', '楼上经常有高跟鞋走路的声音，还有拖拉椅子声', 2, 'pending', false),
  createComplaint('7号楼', '305', 'square_dance', '早上06:30-07:30', '孙丽', '13800138007', '早上晨练音乐太吵，周末也不消停', 7, 'completed'),
  createComplaint('5号楼', '1806', 'furniture', '晚上23:00-00:00', '周杰', '13800138008', '经常半夜听到楼上搬东西的声音', 1, 'pending', false),
  createComplaint('3号楼', '702', 'decoration', '上午9:00-11:00', '吴敏', '13800138009', '装修冲击钻声音刺耳，老人心脏不好', 8, 'completed'),
  createComplaint('8号楼', '1103', 'pet', '晚上20:00-22:00', '郑军', '13800138010', '楼下宠物店寄养的狗晚上叫个不停', 3, 'processing'),
  createComplaint('2号楼', '901', 'other', '下午15:00-17:00', '钱红', '13800138011', '有人在家弹钢琴，声音太大影响学习', 4, 'completed'),
  createComplaint('6号楼', '1405', 'decoration', '中午12:00-14:00', '冯磊', '13800138012', '午休时间装修，完全无法休息', 1, 'processing'),
  createComplaint('4号楼', '1608', 'furniture', '凌晨00:30-01:30', '许梅', '13800138013', '楼上邻居半夜回家，拖拉行李箱声音很大', 5, 'completed'),
  createComplaint('1号楼', '2003', 'square_dance', '晚上18:30-20:30', '何刚', '13800138014', '小区广场舞队伍太多，各个方向都有音响', 6, 'processing'),
];

export const getInitialComplaints = (): Complaint[] => {
  const stored = localStorage.getItem('complaints');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('complaints', JSON.stringify(mockComplaints));
  return mockComplaints;
};

export const saveComplaints = (complaints: Complaint[]): void => {
  localStorage.setItem('complaints', JSON.stringify(complaints));
};
