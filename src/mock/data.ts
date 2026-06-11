import type { Device, Customer, Employee, Loan, Exception, Renewal } from '../types';

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: '张伟', department: '销售部', role: '商务经理' },
  { id: 'emp-2', name: '李娜', department: '销售部', role: '商务专员' },
  { id: 'emp-3', name: '王强', department: '技术部', role: '设备管理员' },
  { id: 'emp-4', name: '刘洋', department: '销售部', role: '部门经理' },
];

export const mockCustomers: Customer[] = [
  { id: 'cus-1', name: '陈总', company: '北京科技有限公司', phone: '13800138001', email: 'chen@bjtech.com' },
  { id: 'cus-2', name: '王经理', company: '上海创新集团', phone: '13900139002', email: 'wang@shcx.com' },
  { id: 'cus-3', name: '李工', company: '深圳智造科技', phone: '13700137003', email: 'li@szzz.com' },
  { id: 'cus-4', name: '张主任', company: '广州研究院', phone: '13600136004', email: 'zhang@gzyjy.com' },
  { id: 'cus-5', name: '刘总', company: '杭州数字科技', phone: '13500135005', email: 'liu@hzsz.com' },
];

export const mockDevices: Device[] = [
  {
    id: 'dev-1',
    deviceNo: 'YJ-2024-001',
    name: '高端示波器',
    model: 'DSO-X 3024T',
    serialNo: 'SN202401001',
    status: 'loaned',
    location: 'A楼3层设备间',
    purchaseDate: '2024-01-15',
    description: '四通道数字示波器，200MHz带宽',
    accessories: [
      { id: 'acc-1', deviceId: 'dev-1', name: '探头', quantity: 4, description: '100MHz无源探头' },
      { id: 'acc-2', deviceId: 'dev-1', name: '电源线', quantity: 1, description: '国标三插电源线' },
      { id: 'acc-3', deviceId: 'dev-1', name: 'USB数据线', quantity: 1, description: 'USB-B型数据线' },
    ],
  },
  {
    id: 'dev-2',
    deviceNo: 'YJ-2024-002',
    name: '频谱分析仪',
    model: 'N9320B',
    serialNo: 'SN202401002',
    status: 'available',
    location: 'A楼3层设备间',
    purchaseDate: '2024-02-20',
    description: '9kHz至3GHz频谱分析仪',
    accessories: [
      { id: 'acc-4', deviceId: 'dev-2', name: '天线', quantity: 1, description: '3GHz全向天线' },
      { id: 'acc-5', deviceId: 'dev-2', name: '电源线', quantity: 1, description: '国标三插电源线' },
    ],
  },
  {
    id: 'dev-3',
    deviceNo: 'YJ-2024-003',
    name: '信号发生器',
    model: 'AFG-31021',
    serialNo: 'SN202402003',
    status: 'loaned',
    location: 'B楼2层实验室',
    purchaseDate: '2024-03-10',
    description: '双通道任意波形信号发生器',
    accessories: [
      { id: 'acc-6', deviceId: 'dev-3', name: 'BNC连接线', quantity: 2, description: '50欧姆同轴电缆' },
      { id: 'acc-7', deviceId: 'dev-3', name: '电源线', quantity: 1, description: '国标三插电源线' },
    ],
  },
  {
    id: 'dev-4',
    deviceNo: 'YJ-2024-004',
    name: '万用表',
    model: 'Fluke 87V',
    serialNo: 'SN202403004',
    status: 'available',
    location: 'A楼3层设备间',
    purchaseDate: '2024-01-05',
    description: '工业级真有效值数字万用表',
    accessories: [
      { id: 'acc-8', deviceId: 'dev-4', name: '表笔', quantity: 2, description: '10A万用表表笔' },
      { id: 'acc-9', deviceId: 'dev-4', name: '电池', quantity: 1, description: '9V叠层电池' },
    ],
  },
  {
    id: 'dev-5',
    deviceNo: 'YJ-2024-005',
    name: '电源供应器',
    model: 'DP832',
    serialNo: 'SN202403005',
    status: 'maintenance',
    location: '维修中心',
    purchaseDate: '2023-12-01',
    description: '三路输出可编程直流电源',
    accessories: [
      { id: 'acc-10', deviceId: 'dev-5', name: '输出线', quantity: 3, description: '香蕉插头测试线' },
      { id: 'acc-11', deviceId: 'dev-5', name: '电源线', quantity: 1, description: '国标三插电源线' },
    ],
  },
  {
    id: 'dev-6',
    deviceNo: 'YJ-2024-006',
    name: '逻辑分析仪',
    model: 'LA-3164',
    serialNo: 'SN202404006',
    status: 'loaned',
    location: 'A楼3层设备间',
    purchaseDate: '2024-04-15',
    description: '16通道500MHz逻辑分析仪',
    accessories: [
      { id: 'acc-12', deviceId: 'dev-6', name: '测试夹', quantity: 16, description: '微型测试钩夹' },
      { id: 'acc-13', deviceId: 'dev-6', name: 'USB数据线', quantity: 1, description: 'USB3.0高速数据线' },
    ],
  },
];

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const addDays = (date: string, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const mockLoans: Loan[] = [
  {
    id: 'loan-1',
    deviceId: 'dev-1',
    customerId: 'cus-1',
    employeeId: 'emp-1',
    loanDate: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
    expectedReturnDate: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
    deposit: 5000,
    status: 'overdue',
    notes: '客户项目测试使用',
    loanAccessories: [
      { id: 'la-1', loanId: 'loan-1', accessoryId: 'acc-1', name: '探头', quantity: 4, returned: false },
      { id: 'la-2', loanId: 'loan-1', accessoryId: 'acc-2', name: '电源线', quantity: 1, returned: false },
      { id: 'la-3', loanId: 'loan-1', accessoryId: 'acc-3', name: 'USB数据线', quantity: 1, returned: false },
    ],
    renewals: [],
    exceptions: [],
  },
  {
    id: 'loan-2',
    deviceId: 'dev-3',
    customerId: 'cus-2',
    employeeId: 'emp-2',
    loanDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
    expectedReturnDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
    deposit: 3000,
    status: 'active',
    notes: '产品研发测试',
    loanAccessories: [
      { id: 'la-4', loanId: 'loan-2', accessoryId: 'acc-6', name: 'BNC连接线', quantity: 2, returned: false },
      { id: 'la-5', loanId: 'loan-2', accessoryId: 'acc-7', name: '电源线', quantity: 1, returned: false },
    ],
    renewals: [
      {
        id: 'ren-1',
        loanId: 'loan-2',
        extendDays: 7,
        newReturnDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
        reason: '测试项目延期，需要继续使用',
        status: 'approved',
        approverId: 'emp-4',
        approvalNote: '同意续借，请按时归还',
        applyDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
        approveDate: formatDate(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)),
      },
    ],
    exceptions: [],
  },
  {
    id: 'loan-3',
    deviceId: 'dev-6',
    customerId: 'cus-3',
    employeeId: 'emp-1',
    loanDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
    expectedReturnDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
    deposit: 8000,
    status: 'active',
    notes: '芯片验证项目使用',
    loanAccessories: [
      { id: 'la-6', loanId: 'loan-3', accessoryId: 'acc-12', name: '测试夹', quantity: 16, returned: false },
      { id: 'la-7', loanId: 'loan-3', accessoryId: 'acc-13', name: 'USB数据线', quantity: 1, returned: false },
    ],
    renewals: [],
    exceptions: [],
  },
  {
    id: 'loan-4',
    deviceId: 'dev-2',
    customerId: 'cus-4',
    employeeId: 'emp-2',
    loanDate: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
    expectedReturnDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
    actualReturnDate: formatDate(new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000)),
    deposit: 4000,
    status: 'returned',
    notes: 'EMC测试使用',
    loanAccessories: [
      { id: 'la-8', loanId: 'loan-4', accessoryId: 'acc-4', name: '天线', quantity: 1, returned: true, returnQuantity: 1 },
      { id: 'la-9', loanId: 'loan-4', accessoryId: 'acc-5', name: '电源线', quantity: 1, returned: true, returnQuantity: 1 },
    ],
    renewals: [],
    exceptions: [
      {
        id: 'exc-1',
        loanId: 'loan-4',
        type: 'damage',
        description: '天线外壳有轻微划痕，不影响使用',
        severity: 'low',
        status: 'resolved',
        handlerId: 'emp-3',
        solution: '已记录，下次借出前检查',
        createDate: formatDate(new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000)),
        resolveDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
      },
    ],
  },
  {
    id: 'loan-5',
    deviceId: 'dev-5',
    customerId: 'cus-5',
    employeeId: 'emp-1',
    loanDate: formatDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)),
    expectedReturnDate: formatDate(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)),
    actualReturnDate: formatDate(new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000)),
    deposit: 2500,
    status: 'returned',
    notes: '电源测试项目',
    loanAccessories: [
      { id: 'la-10', loanId: 'loan-5', accessoryId: 'acc-10', name: '输出线', quantity: 3, returned: true, returnQuantity: 2 },
      { id: 'la-11', loanId: 'loan-5', accessoryId: 'acc-11', name: '电源线', quantity: 1, returned: true, returnQuantity: 1 },
    ],
    renewals: [],
    exceptions: [
      {
        id: 'exc-2',
        loanId: 'loan-5',
        type: 'accessory_missing',
        description: '缺少1根输出测试线',
        severity: 'medium',
        status: 'resolved',
        handlerId: 'emp-3',
        solution: '客户已赔偿，重新采购配件',
        createDate: formatDate(new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000)),
        resolveDate: formatDate(new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000)),
      },
      {
        id: 'exc-3',
        loanId: 'loan-5',
        type: 'malfunction',
        description: '第二路输出电压不稳定',
        severity: 'high',
        status: 'processing',
        handlerId: 'emp-3',
        createDate: formatDate(new Date(today.getTime() - 38 * 24 * 60 * 60 * 1000)),
      },
    ],
  },
  {
    id: 'loan-6',
    deviceId: 'dev-4',
    customerId: 'cus-1',
    employeeId: 'emp-2',
    loanDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
    expectedReturnDate: formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
    deposit: 1000,
    status: 'active',
    notes: '现场测试使用',
    loanAccessories: [
      { id: 'la-12', loanId: 'loan-6', accessoryId: 'acc-8', name: '表笔', quantity: 2, returned: false },
      { id: 'la-13', loanId: 'loan-6', accessoryId: 'acc-9', name: '电池', quantity: 1, returned: false },
    ],
    renewals: [
      {
        id: 'ren-2',
        loanId: 'loan-6',
        extendDays: 5,
        newReturnDate: '',
        reason: '现场测试未完成',
        status: 'pending',
        applyDate: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
      },
    ],
    exceptions: [],
  },
];

export const mockExceptions: Exception[] = mockLoans.flatMap(l => l.exceptions);

export const getDeviceById = (id: string) => mockDevices.find(d => d.id === id);
export const getCustomerById = (id: string) => mockCustomers.find(c => c.id === id);
export const getEmployeeById = (id: string) => mockEmployees.find(e => e.id === id);
export const getLoanById = (id: string) => mockLoans.find(l => l.id === id);
