import type { Cable, BorrowRecord, Employee, Alert, InterfaceType } from '@/types';
import { INTERFACE_TYPE_LABELS } from '@/types';
import { generateId, generateCableCode } from './idGenerator';
import { addHoursToNow, getNow } from './dateUtils';
import { getPlaceholderImage } from './imageUtils';

const floors = ['1楼', '2楼', '3楼', '4楼', '5楼'];
const departments = ['研发部', '产品部', '设计部', '市场部', '行政部', '财务部', '人事部'];
const locations = ['前台接待区', '会议室A', '会议室B', '开放办公区', '休息区', '茶水间'];

export const generateMockEmployees = (): Employee[] => {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];
  
  return names.map((name, index) => ({
    id: generateId(),
    name,
    employeeNo: `EMP${String(index + 1).padStart(4, '0')}`,
    department: departments[index % departments.length],
    floor: floors[index % floors.length],
    isAdmin: index === 0,
  }));
};

export const generateMockCables = (): Cable[] => {
  const interfaceTypes: Cable['interfaceType'][] = ['USB-C', 'USB-C', 'USB-C', 'USB-C', 'USB-C', 'USB-C', 'Lightning', 'Lightning', 'Lightning', 'Micro-USB'];
  const lengths = [1, 1.5, 2, 1, 1.5, 2, 1, 1.5, 2, 1];
  const powers = [25, 65, 100, 25, 65, 100, 20, 30, 20, 18];
  const statuses: Cable['status'][] = ['available', 'available', 'borrowed', 'available', 'borrowed', 'available', 'available', 'borrowed', 'maintaining', 'available'];
  
  const cables: Cable[] = [];
  
  for (let i = 0; i < 30; i++) {
    const typeIndex = i % interfaceTypes.length;
    const floor = floors[i % floors.length];
    const location = locations[i % locations.length];
    
    cables.push({
      id: generateId(),
      code: generateCableCode('CBL', i + 1),
      interfaceType: interfaceTypes[typeIndex],
      length: lengths[typeIndex],
      power: powers[typeIndex],
      defaultLocation: `${floor}${location}`,
      status: statuses[i % statuses.length],
      photoUrl: getPlaceholderImage(`cable-${i + 1}-${interfaceTypes[typeIndex]}`),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      borrowCount: Math.floor(Math.random() * 20) + 1,
    });
  }
  
  return cables;
};

export const generateMockBorrowRecords = (cables: Cable[], employees: Employee[]): BorrowRecord[] => {
  const borrowedCables = cables.filter(c => c.status === 'borrowed');
  const devices = ['iPhone 15', 'MacBook Pro', 'iPad Pro', 'Samsung Galaxy', '小米14', '华为Mate 60', 'ThinkPad', 'Switch'];
  const purposes = ['临时办公', '会议使用', '出差携带', '个人使用', '客户演示', '测试设备'];
  
  const records: BorrowRecord[] = [];
  
  borrowedCables.forEach((cable, index) => {
    const employee = employees[index % employees.length];
    const borrowTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    records.push({
      id: generateId(),
      cableId: cable.id,
      employeeName: employee.name,
      employeeNo: employee.employeeNo,
      department: employee.department,
      device: devices[index % devices.length],
      expectedReturn: addHoursToNow(Math.floor(Math.random() * 48) - 24),
      purpose: purposes[index % purposes.length],
      borrowTime: borrowTime.toISOString(),
      status: 'borrowing',
    });
  });
  
  for (let i = 0; i < 15; i++) {
    const cable = cables[Math.floor(Math.random() * cables.length)];
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const borrowTime = new Date(Date.now() - (30 + Math.random() * 60) * 24 * 60 * 60 * 1000);
    const returnTime = new Date(borrowTime.getTime() + (Math.random() * 3 + 0.5) * 24 * 60 * 60 * 1000);
    const hasDamage = Math.random() > 0.7;
    const damageTypes: BorrowRecord['damageType'][] = ['skin', 'interface', 'charging'];
    
    records.push({
      id: generateId(),
      cableId: cable.id,
      employeeName: employee.name,
      employeeNo: employee.employeeNo,
      department: employee.department,
      device: devices[i % devices.length],
      expectedReturn: new Date(borrowTime.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: purposes[i % purposes.length],
      borrowTime: borrowTime.toISOString(),
      returnTime: returnTime.toISOString(),
      status: 'returned',
      ...(hasDamage ? {
        damageReport: '使用中发现外皮有破损，接口有些松动',
        damageType: damageTypes[i % damageTypes.length],
        returnStatus: 'damaged' as const,
      } : {
        returnStatus: 'normal' as const,
      }),
    });
  }
  
  return records;
};

export const generateMockAlerts = (cables: Cable[], borrowRecords: BorrowRecord[]): Alert[] => {
  const alerts: Alert[] = [];
  const overdueRecords = borrowRecords.filter(r => r.status === 'borrowing');
  
  overdueRecords.slice(0, 2).forEach(record => {
    alerts.push({
      id: generateId(),
      type: 'overdue',
      cableId: record.cableId,
      borrowId: record.id,
      message: `${record.employeeName} 借用的线材已逾期未还`,
      level: 'danger',
      isRead: false,
      createdAt: getNow(),
    });
  });
  
  const damagedCables = cables.filter(c => c.status === 'maintaining');
  damagedCables.forEach(cable => {
    alerts.push({
      id: generateId(),
      type: 'damaged',
      cableId: cable.id,
      message: `线材 ${cable.code} 损坏待处理`,
      level: 'warning',
      isRead: false,
      createdAt: getNow(),
    });
  });
  
  const typeCounts: Record<string, number> = {};
  const interfaceTypes: InterfaceType[] = ['USB-C', 'Lightning', 'Micro-USB'];
  
  interfaceTypes.forEach(type => {
    typeCounts[type] = cables.filter(
      c => c.interfaceType === type && c.status === 'available'
    ).length;
  });
  
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count < 2) {
      const interfaceType = type as InterfaceType;
      alerts.push({
        id: generateId(),
        type: 'low_stock',
        interfaceType,
        message: `${INTERFACE_TYPE_LABELS[interfaceType]} 接口库存不足（当前${count}条）`,
        level: count === 0 ? 'danger' : 'warning',
        isRead: false,
        createdAt: getNow(),
      });
    }
  });
  
  return alerts;
};
