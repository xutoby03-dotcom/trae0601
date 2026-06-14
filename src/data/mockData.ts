import { Remote, BorrowRecord, PurchaseOrder, Notification } from './types';

const now = new Date();
const formatDate = (d: Date) => d.toISOString();
const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};
const addHours = (d: Date, hours: number) => {
  const result = new Date(d);
  result.setHours(result.getHours() + hours);
  return result;
};

const photoUrls = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20black%20projector%20remote%20control%20on%20white%20background%20product%20photo&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20slim%20projector%20remote%20control%20professional%20photo&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20gray%20projector%20remote%20control%20studio%20shot&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20minimalist%20projector%20remote%20control%20top%20view&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20metallic%20projector%20remote%20control%20photography&image_size=square_hd',
];

export const mockRemotes: Remote[] = [
  { id: 'r1', code: 'RC-001', conferenceRoom: '1楼-培训室', batteryModel: 'AA', storageLocation: '1楼前台', photoUrl: photoUrls[0], status: 'available', batteryLevel: 85, lastBatteryChange: formatDate(addDays(now, -30)), createdAt: formatDate(addDays(now, -180)) },
  { id: 'r2', code: 'RC-002', conferenceRoom: '1楼-培训室', batteryModel: 'AA', storageLocation: '1楼前台', photoUrl: photoUrls[1], status: 'borrowed', batteryLevel: 45, lastBatteryChange: formatDate(addDays(now, -45)), createdAt: formatDate(addDays(now, -180)) },
  { id: 'r3', code: 'RC-003', conferenceRoom: '2楼-大会议室', batteryModel: 'AAA', storageLocation: '2楼会议室门口', photoUrl: photoUrls[2], status: 'available', batteryLevel: 92, lastBatteryChange: formatDate(addDays(now, -15)), createdAt: formatDate(addDays(now, -150)) },
  { id: 'r4', code: 'RC-004', conferenceRoom: '2楼-大会议室', batteryModel: 'AAA', storageLocation: '2楼会议室门口', photoUrl: photoUrls[3], status: 'borrowed', batteryLevel: 15, lastBatteryChange: formatDate(addDays(now, -90)), createdAt: formatDate(addDays(now, -150)) },
  { id: 'r5', code: 'RC-005', conferenceRoom: '2楼-小会议室', batteryModel: 'CR2032', storageLocation: '2楼小会议室抽屉', photoUrl: photoUrls[4], status: 'available', batteryLevel: 78, lastBatteryChange: formatDate(addDays(now, -60)), createdAt: formatDate(addDays(now, -120)) },
  { id: 'r6', code: 'RC-006', conferenceRoom: '2楼-小会议室', batteryModel: 'CR2032', storageLocation: '2楼小会议室抽屉', photoUrl: photoUrls[0], status: 'maintenance', batteryLevel: 30, lastBatteryChange: formatDate(addDays(now, -100)), createdAt: formatDate(addDays(now, -120)) },
  { id: 'r7', code: 'RC-007', conferenceRoom: '3楼-董事会议室', batteryModel: 'AA', storageLocation: '3楼董事会议室柜子', photoUrl: photoUrls[1], status: 'available', batteryLevel: 88, lastBatteryChange: formatDate(addDays(now, -25)), createdAt: formatDate(addDays(now, -100)) },
  { id: 'r8', code: 'RC-008', conferenceRoom: '3楼-董事会议室', batteryModel: 'AA', storageLocation: '3楼董事会议室柜子', photoUrl: photoUrls[2], status: 'borrowed', batteryLevel: 65, lastBatteryChange: formatDate(addDays(now, -50)), createdAt: formatDate(addDays(now, -100)) },
  { id: 'r9', code: 'RC-009', conferenceRoom: '3楼-洽谈室', batteryModel: 'AAA', storageLocation: '3楼前台', photoUrl: photoUrls[3], status: 'available', batteryLevel: 12, lastBatteryChange: formatDate(addDays(now, -120)), createdAt: formatDate(addDays(now, -90)) },
  { id: 'r10', code: 'RC-010', conferenceRoom: '3楼-洽谈室', batteryModel: 'AAA', storageLocation: '3楼前台', photoUrl: photoUrls[4], status: 'available', batteryLevel: 95, lastBatteryChange: formatDate(addDays(now, -5)), createdAt: formatDate(addDays(now, -90)) },
  { id: 'r11', code: 'RC-011', conferenceRoom: '5楼-多功能厅', batteryModel: 'AA', storageLocation: '5楼多功能厅控制室', photoUrl: photoUrls[0], status: 'borrowed', batteryLevel: 55, lastBatteryChange: formatDate(addDays(now, -70)), createdAt: formatDate(addDays(now, -60)) },
  { id: 'r12', code: 'RC-012', conferenceRoom: '5楼-多功能厅', batteryModel: 'AA', storageLocation: '5楼多功能厅控制室', photoUrl: photoUrls[1], status: 'available', batteryLevel: 72, lastBatteryChange: formatDate(addDays(now, -40)), createdAt: formatDate(addDays(now, -60)) },
  { id: 'r13', code: 'RC-013', conferenceRoom: '5楼-多功能厅', batteryModel: 'AA', storageLocation: '5楼多功能厅控制室', photoUrl: photoUrls[2], status: 'lost', batteryLevel: 45, lastBatteryChange: formatDate(addDays(now, -80)), createdAt: formatDate(addDays(now, -60)) },
  { id: 'r14', code: 'RC-014', conferenceRoom: '1楼-培训室', batteryModel: 'AA', storageLocation: '1楼前台', photoUrl: photoUrls[3], status: 'available', batteryLevel: 18, lastBatteryChange: formatDate(addDays(now, -110)), createdAt: formatDate(addDays(now, -30)) },
  { id: 'r15', code: 'RC-015', conferenceRoom: '2楼-大会议室', batteryModel: 'AAA', storageLocation: '2楼会议室门口', photoUrl: photoUrls[4], status: 'borrowed', batteryLevel: 38, lastBatteryChange: formatDate(addDays(now, -55)), createdAt: formatDate(addDays(now, -30)) },
];

const borrowers = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十', '郑十一', '孙十二'];
const departments = ['技术部', '产品部', '运营部', '市场部', '人事部', '财务部'];
const purposes = ['项目周会', '客户演示', '培训讲座', '团队讨论', '产品评审', '技术分享', '面试会议', '季度总结'];

export const mockBorrowRecords: BorrowRecord[] = [
  { id: 'br1', remoteId: 'r2', borrower: '张三', department: '技术部', conferenceRoom: '2楼-大会议室', borrowTime: formatDate(addDays(now, -3)), expectedReturn: formatDate(addDays(now, -1)), purpose: '项目周会', status: 'overdue', notes: '逾期2天未还' },
  { id: 'br2', remoteId: 'r4', borrower: '李四', department: '产品部', conferenceRoom: '3楼-洽谈室', borrowTime: formatDate(addDays(now, -5)), expectedReturn: formatDate(addDays(now, -2)), purpose: '客户演示', status: 'overdue', notes: '逾期3天未还' },
  { id: 'br3', remoteId: 'r8', borrower: '王五', department: '运营部', conferenceRoom: '1楼-培训室', borrowTime: formatDate(addHours(now, -48)), expectedReturn: formatDate(addHours(now, 24)), purpose: '培训讲座', status: 'borrowing' },
  { id: 'br4', remoteId: 'r11', borrower: '赵六', department: '市场部', conferenceRoom: '5楼-多功能厅', borrowTime: formatDate(addHours(now, -24)), expectedReturn: formatDate(addHours(now, 48)), purpose: '产品发布会', status: 'borrowing' },
  { id: 'br5', remoteId: 'r15', borrower: '陈七', department: '技术部', conferenceRoom: '2楼-小会议室', borrowTime: formatDate(addHours(now, -2)), expectedReturn: formatDate(addHours(now, 6)), purpose: '代码评审', status: 'borrowing' },
  { id: 'br6', remoteId: 'r1', borrower: '刘八', department: '人事部', conferenceRoom: '1楼-培训室', borrowTime: formatDate(addDays(now, -10)), expectedReturn: formatDate(addDays(now, -8)), actualReturn: formatDate(addDays(now, -8)), returnBatteryLevel: 75, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '新员工培训' },
  { id: 'br7', remoteId: 'r3', borrower: '周九', department: '财务部', conferenceRoom: '2楼-大会议室', borrowTime: formatDate(addDays(now, -8)), expectedReturn: formatDate(addDays(now, -7)), actualReturn: formatDate(addDays(now, -7)), returnBatteryLevel: 15, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '季度财报会议' },
  { id: 'br8', remoteId: 'r5', borrower: '吴十', department: '技术部', conferenceRoom: '2楼-小会议室', borrowTime: formatDate(addDays(now, -7)), expectedReturn: formatDate(addDays(now, -6)), actualReturn: formatDate(addDays(now, -6)), returnBatteryLevel: 68, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '技术方案讨论' },
  { id: 'br9', remoteId: 'r7', borrower: '郑十一', department: '产品部', conferenceRoom: '3楼-董事会议室', borrowTime: formatDate(addDays(now, -6)), expectedReturn: formatDate(addDays(now, -5)), actualReturn: formatDate(addDays(now, -5)), returnBatteryLevel: 82, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '产品路线图评审' },
  { id: 'br10', remoteId: 'r9', borrower: '孙十二', department: '运营部', conferenceRoom: '3楼-洽谈室', borrowTime: formatDate(addDays(now, -5)), expectedReturn: formatDate(addDays(now, -4)), actualReturn: formatDate(addDays(now, -4)), returnBatteryLevel: 18, hasDamage: false, inOriginalBox: false, status: 'returned', purpose: '客户沟通' },
  { id: 'br11', remoteId: 'r10', borrower: '张三', department: '技术部', conferenceRoom: '3楼-洽谈室', borrowTime: formatDate(addDays(now, -12)), expectedReturn: formatDate(addDays(now, -10)), actualReturn: formatDate(addDays(now, -10)), returnBatteryLevel: 90, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '技术面试' },
  { id: 'br12', remoteId: 'r12', borrower: '李四', department: '市场部', conferenceRoom: '5楼-多功能厅', borrowTime: formatDate(addDays(now, -15)), expectedReturn: formatDate(addDays(now, -13)), actualReturn: formatDate(addDays(now, -13)), returnBatteryLevel: 65, hasDamage: true, inOriginalBox: true, status: 'returned', purpose: '市场活动' },
  { id: 'br13', remoteId: 'r1', borrower: '王五', department: '产品部', conferenceRoom: '1楼-培训室', borrowTime: formatDate(addDays(now, -18)), expectedReturn: formatDate(addDays(now, -17)), actualReturn: formatDate(addDays(now, -17)), returnBatteryLevel: 78, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '产品培训' },
  { id: 'br14', remoteId: 'r3', borrower: '赵六', department: '运营部', conferenceRoom: '2楼-大会议室', borrowTime: formatDate(addDays(now, -20)), expectedReturn: formatDate(addDays(now, -19)), actualReturn: formatDate(addDays(now, -19)), returnBatteryLevel: 85, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '运营复盘会' },
  { id: 'br15', remoteId: 'r5', borrower: '陈七', department: '人事部', conferenceRoom: '2楼-小会议室', borrowTime: formatDate(addDays(now, -22)), expectedReturn: formatDate(addDays(now, -21)), actualReturn: formatDate(addDays(now, -21)), returnBatteryLevel: 72, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '绩效面谈' },
  { id: 'br16', remoteId: 'r7', borrower: '刘八', department: '财务部', conferenceRoom: '3楼-董事会议室', borrowTime: formatDate(addDays(now, -25)), expectedReturn: formatDate(addDays(now, -24)), actualReturn: formatDate(addDays(now, -24)), returnBatteryLevel: 88, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '预算评审' },
  { id: 'br17', remoteId: 'r9', borrower: '周九', department: '技术部', conferenceRoom: '3楼-洽谈室', borrowTime: formatDate(addDays(now, -28)), expectedReturn: formatDate(addDays(now, -27)), actualReturn: formatDate(addDays(now, -27)), returnBatteryLevel: 22, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '架构讨论' },
  { id: 'br18', remoteId: 'r10', borrower: '吴十', department: '产品部', conferenceRoom: '3楼-洽谈室', borrowTime: formatDate(addDays(now, -30)), expectedReturn: formatDate(addDays(now, -29)), actualReturn: formatDate(addDays(now, -29)), returnBatteryLevel: 76, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '需求评审' },
  { id: 'br19', remoteId: 'r12', borrower: '郑十一', department: '市场部', conferenceRoom: '5楼-多功能厅', borrowTime: formatDate(addDays(now, -32)), expectedReturn: formatDate(addDays(now, -30)), actualReturn: formatDate(addDays(now, -30)), returnBatteryLevel: 68, hasDamage: false, inOriginalBox: false, status: 'returned', purpose: '品牌发布会' },
  { id: 'br20', remoteId: 'r14', borrower: '孙十二', department: '运营部', conferenceRoom: '1楼-培训室', borrowTime: formatDate(addDays(now, -35)), expectedReturn: formatDate(addDays(now, -34)), actualReturn: formatDate(addDays(now, -34)), returnBatteryLevel: 45, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '运营培训' },
  { id: 'br21', remoteId: 'r2', borrower: '张三', department: '技术部', conferenceRoom: '2楼-大会议室', borrowTime: formatDate(addDays(now, -38)), expectedReturn: formatDate(addDays(now, -37)), actualReturn: formatDate(addDays(now, -37)), returnBatteryLevel: 58, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: 'Sprint规划会' },
  { id: 'br22', remoteId: 'r4', borrower: '李四', department: '产品部', conferenceRoom: '2楼-小会议室', borrowTime: formatDate(addDays(now, -40)), expectedReturn: formatDate(addDays(now, -39)), actualReturn: formatDate(addDays(now, -39)), returnBatteryLevel: 12, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '原型评审' },
  { id: 'br23', remoteId: 'r6', borrower: '王五', department: '运营部', conferenceRoom: '2楼-小会议室', borrowTime: formatDate(addDays(now, -42)), expectedReturn: formatDate(addDays(now, -41)), actualReturn: formatDate(addDays(now, -41)), returnBatteryLevel: 30, hasDamage: true, inOriginalBox: true, status: 'returned', purpose: '用户访谈' },
  { id: 'br24', remoteId: 'r8', borrower: '赵六', department: '市场部', conferenceRoom: '3楼-董事会议室', borrowTime: formatDate(addDays(now, -45)), expectedReturn: formatDate(addDays(now, -44)), actualReturn: formatDate(addDays(now, -44)), returnBatteryLevel: 72, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '董事会汇报' },
  { id: 'br25', remoteId: 'r11', borrower: '陈七', department: '技术部', conferenceRoom: '5楼-多功能厅', borrowTime: formatDate(addDays(now, -48)), expectedReturn: formatDate(addDays(now, -47)), actualReturn: formatDate(addDays(now, -47)), returnBatteryLevel: 65, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '全员大会' },
  { id: 'br26', remoteId: 'r15', borrower: '刘八', department: '人事部', conferenceRoom: '2楼-大会议室', borrowTime: formatDate(addDays(now, -50)), expectedReturn: formatDate(addDays(now, -49)), actualReturn: formatDate(addDays(now, -49)), returnBatteryLevel: 55, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '全员培训' },
  { id: 'br27', remoteId: 'r13', borrower: '周九', department: '技术部', conferenceRoom: '5楼-多功能厅', borrowTime: formatDate(addDays(now, -55)), expectedReturn: formatDate(addDays(now, -53)), status: 'lost', purpose: '技术分享', notes: '借出后未归还，确认丢失' },
  { id: 'br28', remoteId: 'r1', borrower: '吴十', department: '产品部', conferenceRoom: '1楼-培训室', borrowTime: formatDate(addDays(now, -60)), expectedReturn: formatDate(addDays(now, -59)), actualReturn: formatDate(addDays(now, -59)), returnBatteryLevel: 82, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '产品宣讲' },
  { id: 'br29', remoteId: 'r3', borrower: '郑十一', department: '运营部', conferenceRoom: '2楼-大会议室', borrowTime: formatDate(addDays(now, -62)), expectedReturn: formatDate(addDays(now, -61)), actualReturn: formatDate(addDays(now, -61)), returnBatteryLevel: 75, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '月度总结' },
  { id: 'br30', remoteId: 'r5', borrower: '孙十二', department: '财务部', conferenceRoom: '2楼-小会议室', borrowTime: formatDate(addDays(now, -65)), expectedReturn: formatDate(addDays(now, -64)), actualReturn: formatDate(addDays(now, -64)), returnBatteryLevel: 68, hasDamage: false, inOriginalBox: true, status: 'returned', purpose: '财务培训' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'po1', remoteId: 'r13', reason: '遥控器RC-013在5楼多功能厅丢失，需补购', applicant: '周九', applyDate: formatDate(addDays(now, -10)), approver: '管理部', approveDate: formatDate(addDays(now, -8)), status: 'approved', purchaseChannel: '京东', cost: 199, purchaseDate: formatDate(addDays(now, -7)) },
  { id: 'po2', reason: '新增备用遥控器，应对高峰使用', applicant: '行政部', applyDate: formatDate(addDays(now, -30)), approver: '管理部', approveDate: formatDate(addDays(now, -28)), status: 'stocked', purchaseChannel: '淘宝', cost: 398, purchaseDate: formatDate(addDays(now, -25)), stockDate: formatDate(addDays(now, -20)), newRemoteId: 'r14' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'overdue', title: '遥控器逾期未还', message: '遥控器RC-001已逾期2天，借用人：张三（技术部），请尽快归还', remoteId: 'r2', recordId: 'br1', timestamp: formatDate(addDays(now, -1)), read: false },
  { id: 'n2', type: 'overdue', title: '遥控器逾期未还', message: '遥控器RC-004已逾期3天，借用人：李四（产品部），请尽快归还', remoteId: 'r4', recordId: 'br2', timestamp: formatDate(addDays(now, -2)), read: false },
  { id: 'n3', type: 'lowBattery', title: '电池电量低', message: '遥控器RC-004电量仅15%，请及时更换电池（型号：AAA）', remoteId: 'r4', timestamp: formatDate(addDays(now, 0)), read: false },
  { id: 'n4', type: 'lowBattery', title: '电池电量低', message: '遥控器RC-009电量仅12%，请及时更换电池（型号：AAA）', remoteId: 'r9', timestamp: formatDate(addHours(now, -2)), read: true },
  { id: 'n5', type: 'lowBattery', title: '电池电量低', message: '遥控器RC-014电量仅18%，请及时更换电池（型号：AA）', remoteId: 'r14', timestamp: formatDate(addHours(now, -5)), read: true },
  { id: 'n6', type: 'maintenance', title: '设备维修中', message: '遥控器RC-006因外壳破损正在维修中', remoteId: 'r6', timestamp: formatDate(addDays(now, -3)), read: true },
];
