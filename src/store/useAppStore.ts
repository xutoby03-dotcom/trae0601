import { create } from 'zustand';
import type { Cable, BorrowRecord, Employee, Alert, Statistics, InterfaceType, CableStatus, BorrowStatus, ReturnStatus, DamageType } from '@/types';
import { INTERFACE_TYPE_LABELS } from '@/types';
import { storage } from '@/utils/storage';
import { generateId } from '@/utils/idGenerator';
import { getNow, isOverdue } from '@/utils/dateUtils';
import { generateMockEmployees, generateMockCables, generateMockBorrowRecords, generateMockAlerts } from '@/utils/mockData';

interface AppState {
  cables: Cable[];
  borrowRecords: BorrowRecord[];
  employees: Employee[];
  alerts: Alert[];
  currentUser: Employee | null;
  isInitialized: boolean;
  isLoading: boolean;
  initApp: () => Promise<void>;
  setCurrentUser: (user: Employee | null) => void;
  login: (employeeNo: string, password?: string) => Promise<Employee | null>;
  logout: () => void;
  addCable: (cable: Omit<Cable, 'id' | 'createdAt' | 'updatedAt' | 'borrowCount'>) => Cable;
  updateCable: (id: string, updates: Partial<Cable>) => Cable | null;
  deleteCable: (id: string) => boolean;
  borrowCable: (cableId: string, data: Omit<BorrowRecord, 'id' | 'cableId' | 'borrowTime' | 'status'>) => BorrowRecord | null;
  returnCable: (borrowId: string, checks: { skin: boolean; interface: boolean; charging: boolean }, damageReport?: string, damageType?: DamageType) => BorrowRecord | null;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  getStatistics: () => Statistics;
  getBorrowedCablesByEmployee: (employeeNo: string) => BorrowRecord[];
  getCableById: (id: string) => Cable | undefined;
  getBorrowRecordById: (id: string) => BorrowRecord | undefined;
  getUnreadAlertsCount: () => number;
  checkAndCreateAlerts: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  cables: [],
  borrowRecords: [],
  employees: [],
  alerts: [],
  currentUser: null,
  isInitialized: false,
  isLoading: true,

  initApp: async () => {
    const recoverInterfaceType = (message: string): InterfaceType | null => {
      const types: InterfaceType[] = ['USB-C', 'Lightning', 'Micro-USB'];
      for (const t of types) {
        if (message.includes(t)) return t;
      }
      return null;
    };

    const deduplicateAlerts = (alerts: Alert[]): Alert[] => {
      const repaired: Alert[] = alerts.map(alert => {
        if (alert.type === 'low_stock' && !alert.interfaceType) {
          const recovered = recoverInterfaceType(alert.message);
          if (recovered) {
            return { ...alert, interfaceType: recovered };
          }
        }
        return alert;
      });

      const seen = new Map<string, Alert>();
      
      for (const alert of repaired) {
        let key: string;
        if (alert.type === 'low_stock') {
          const it = alert.interfaceType || recoverInterfaceType(alert.message) || 'unknown';
          key = `low_stock-${it}`;
        } else {
          key = `${alert.type}-${alert.cableId || ''}-${alert.borrowId || ''}`;
        }
        
        const existing = seen.get(key);
        if (!existing || alert.createdAt > existing.createdAt) {
          seen.set(key, alert);
        }
      }
      
      return Array.from(seen.values());
    };

    if (storage.isInitialized()) {
      let alerts = storage.getAlerts();
      const deduplicatedAlerts = deduplicateAlerts(alerts);
      const needsUpdate = deduplicatedAlerts.length !== alerts.length
        || alerts.some((a, i) => a.interfaceType !== deduplicatedAlerts[i]?.interfaceType);
      if (needsUpdate) {
        storage.setAlerts(deduplicatedAlerts);
      }
      alerts = deduplicatedAlerts;
      
      set({
        cables: storage.getCables(),
        borrowRecords: storage.getBorrowRecords(),
        employees: storage.getEmployees(),
        alerts,
        currentUser: storage.getCurrentUser(),
        isInitialized: true,
        isLoading: false,
      });
    } else {
      const employees = generateMockEmployees();
      const cables = generateMockCables();
      const borrowRecords = generateMockBorrowRecords(cables, employees);
      const alerts = generateMockAlerts(cables, borrowRecords);

      storage.setEmployees(employees);
      storage.setCables(cables);
      storage.setBorrowRecords(borrowRecords);
      storage.setAlerts(alerts);
      storage.setInitialized(true);

      set({
        cables,
        borrowRecords,
        employees,
        alerts,
        currentUser: null,
        isInitialized: true,
        isLoading: false,
      });
    }

    get().checkAndCreateAlerts();
  },

  setCurrentUser: (user) => {
    storage.setCurrentUser(user);
    set({ currentUser: user });
  },

  login: async (employeeNo, password) => {
    const { employees } = get();
    const employee = employees.find(e => e.employeeNo === employeeNo);
    
    if (!employee) return null;
    
    if (employee.isAdmin && password !== 'admin123') {
      return null;
    }
    
    get().setCurrentUser(employee);
    return employee;
  },

  logout: () => {
    get().setCurrentUser(null);
  },

  addCable: (cableData) => {
    const newCable: Cable = {
      ...cableData,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
      borrowCount: 0,
    };
    
    const cables = [...get().cables, newCable];
    storage.setCables(cables);
    set({ cables });
    
    get().checkAndCreateAlerts();
    return newCable;
  },

  updateCable: (id, updates) => {
    const cables = get().cables.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: getNow() } : c
    );
    storage.setCables(cables);
    set({ cables });
    
    get().checkAndCreateAlerts();
    return cables.find(c => c.id === id) || null;
  },

  deleteCable: (id) => {
    const activeBorrow = get().borrowRecords.find(
      r => r.cableId === id && r.status === 'borrowing'
    );
    if (activeBorrow) return false;

    const cables = get().cables.filter(c => c.id !== id);
    storage.setCables(cables);
    set({ cables });
    
    get().checkAndCreateAlerts();
    return true;
  },

  borrowCable: (cableId, data) => {
    const { cables, borrowRecords, currentUser } = get();
    const config = storage.getSystemConfig();
    
    const cable = cables.find(c => c.id === cableId);
    if (!cable || cable.status !== 'available') return null;
    
    if (currentUser) {
      const activeBorrows = borrowRecords.filter(
        r => r.employeeNo === currentUser.employeeNo && r.status === 'borrowing'
      ).length;
      if (activeBorrows >= config.maxBorrowPerPerson) return null;
    }
    
    const newRecord: BorrowRecord = {
      ...data,
      id: generateId(),
      cableId,
      borrowTime: getNow(),
      status: 'borrowing',
    };
    
    const updatedRecords = [...borrowRecords, newRecord];
    const updatedCables = cables.map(c =>
      c.id === cableId
        ? { ...c, status: 'borrowed' as CableStatus, borrowCount: c.borrowCount + 1, updatedAt: getNow() }
        : c
    );
    
    storage.setBorrowRecords(updatedRecords);
    storage.setCables(updatedCables);
    set({ borrowRecords: updatedRecords, cables: updatedCables });
    
    get().checkAndCreateAlerts();
    return newRecord;
  },

  returnCable: (borrowId, checks, damageReport, damageType) => {
    const { borrowRecords, cables } = get();
    const record = borrowRecords.find(r => r.id === borrowId);
    if (!record || record.status !== 'borrowing') return null;

    const allGood = checks.skin && checks.interface && checks.charging;
    let returnStatus: ReturnStatus = 'normal';
    let cableStatus: CableStatus = 'available';

    if (!allGood) {
      if (damageType === 'charging') {
        returnStatus = 'scrapped';
        cableStatus = 'scrapped';
      } else {
        returnStatus = 'damaged';
        cableStatus = 'maintaining';
      }
    }

    const updatedRecords = borrowRecords.map(r =>
      r.id === borrowId
        ? {
            ...r,
            returnTime: getNow(),
            status: 'returned' as BorrowStatus,
            damageReport,
            damageType,
            returnStatus,
          }
        : r
    );

    const updatedCables = cables.map(c =>
      c.id === record.cableId
        ? { ...c, status: cableStatus, updatedAt: getNow() }
        : c
    );

    storage.setBorrowRecords(updatedRecords);
    storage.setCables(updatedCables);
    set({ borrowRecords: updatedRecords, cables: updatedCables });

    if (!allGood) {
      const newAlert: Alert = {
        id: generateId(),
        type: 'damaged',
        cableId: record.cableId,
        borrowId,
        message: `线材 ${cables.find(c => c.id === record.cableId)?.code} 归还时发现损坏`,
        level: 'warning',
        isRead: false,
        createdAt: getNow(),
      };
      const alerts = [...get().alerts, newAlert];
      storage.setAlerts(alerts);
      set({ alerts });
    }

    get().checkAndCreateAlerts();
    return updatedRecords.find(r => r.id === borrowId) || null;
  },

  markAlertRead: (alertId) => {
    const alerts = get().alerts.map(a =>
      a.id === alertId ? { ...a, isRead: true } : a
    );
    storage.setAlerts(alerts);
    set({ alerts });
  },

  markAllAlertsRead: () => {
    const alerts = get().alerts.map(a => ({ ...a, isRead: true }));
    storage.setAlerts(alerts);
    set({ alerts });
  },

  getStatistics: () => {
    const { cables, borrowRecords, employees } = get();
    const config = storage.getSystemConfig();

    const totalCables = cables.length;
    const availableCables = cables.filter(c => c.status === 'available').length;
    const borrowedCables = cables.filter(c => c.status === 'borrowed').length;
    
    const overdueRecords = borrowRecords.filter(
      r => r.status === 'borrowing' && isOverdue(r.expectedReturn, config.overdueHours)
    );
    const overdueCount = overdueRecords.length;
    
    const totalBorrowCount = borrowRecords.length;
    
    const damagedOrScrapped = cables.filter(c => c.status === 'maintaining' || c.status === 'scrapped').length;
    const lossRate = totalCables > 0 ? (damagedOrScrapped / totalCables) * 100 : 0;

    const floorMap = new Map<string, number>();
    borrowRecords.forEach(record => {
      const employee = employees.find(e => e.employeeNo === record.employeeNo);
      if (employee) {
        floorMap.set(employee.floor, (floorMap.get(employee.floor) || 0) + 1);
      }
    });
    const floorDemand = Array.from(floorMap.entries())
      .map(([floor, count]) => ({ floor, count }))
      .sort((a, b) => b.count - a.count);

    const interfaceMap = new Map<InterfaceType, number>();
    borrowRecords.forEach(record => {
      const cable = cables.find(c => c.id === record.cableId);
      if (cable) {
        interfaceMap.set(cable.interfaceType, (interfaceMap.get(cable.interfaceType) || 0) + 1);
      }
    });
    const interfaceDemand = Array.from(interfaceMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const interfaceTypes: InterfaceType[] = ['USB-C', 'Lightning', 'Micro-USB'];
    const interfaceStock = interfaceTypes.map(type => {
      const total = cables.filter(c => c.interfaceType === type).length;
      const available = cables.filter(c => c.interfaceType === type && c.status === 'available').length;
      return { type, available, total, safeStock: config.safeStock };
    });

    const topBorrowed = [...cables]
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 10)
      .map(cable => ({ cable, count: cable.borrowCount }));

    const monthMap = new Map<string, { borrowCount: number; returnCount: number }>();
    borrowRecords.forEach(record => {
      const borrowMonth = record.borrowTime.substring(0, 7);
      const current = monthMap.get(borrowMonth) || { borrowCount: 0, returnCount: 0 };
      current.borrowCount++;
      monthMap.set(borrowMonth, current);
      
      if (record.returnTime) {
        const returnMonth = record.returnTime.substring(0, 7);
        const currentReturn = monthMap.get(returnMonth) || { borrowCount: 0, returnCount: 0 };
        currentReturn.returnCount++;
        monthMap.set(returnMonth, currentReturn);
      }
    });
    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const damageMap = new Map<DamageType, number>();
    borrowRecords
      .filter(r => r.damageType)
      .forEach(r => {
        if (r.damageType) {
          damageMap.set(r.damageType, (damageMap.get(r.damageType) || 0) + 1);
        }
      });
    const damageDistribution = Array.from(damageMap.entries())
      .map(([type, count]) => ({ type, count }));

    return {
      totalCables,
      availableCables,
      borrowedCables,
      overdueCount,
      totalBorrowCount,
      lossRate,
      floorDemand,
      interfaceDemand,
      interfaceStock,
      topBorrowed,
      monthlyTrend,
      damageDistribution,
    };
  },

  getBorrowedCablesByEmployee: (employeeNo) => {
    return get().borrowRecords.filter(
      r => r.employeeNo === employeeNo && r.status === 'borrowing'
    );
  },

  getCableById: (id) => {
    return get().cables.find(c => c.id === id);
  },

  getBorrowRecordById: (id) => {
    return get().borrowRecords.find(r => r.id === id);
  },

  getUnreadAlertsCount: () => {
    return get().alerts.filter(a => !a.isRead).length;
  },

  checkAndCreateAlerts: () => {
    const { cables, borrowRecords, alerts } = get();
    const config = storage.getSystemConfig();
    const newAlerts: Alert[] = [];

    const getAlertKey = (a: Alert): string => {
      if (a.type === 'low_stock' && a.interfaceType) {
        return `${a.type}-${a.interfaceType}`;
      }
      return `${a.type}-${a.cableId || ''}-${a.borrowId || ''}`;
    };

    const existingAlertKeys = new Set(alerts.map(getAlertKey));

    borrowRecords.forEach(record => {
      if (record.status === 'borrowing' && isOverdue(record.expectedReturn, config.overdueHours)) {
        const key = `overdue-${record.cableId}-${record.id}`;
        if (!existingAlertKeys.has(key)) {
          newAlerts.push({
            id: generateId(),
            type: 'overdue',
            cableId: record.cableId,
            borrowId: record.id,
            message: `${record.employeeName} 借用的线材已逾期未还`,
            level: 'danger',
            isRead: false,
            createdAt: getNow(),
          });
        }
      }
    });

    const typeCounts: Record<string, number> = {};
    const interfaceTypes: InterfaceType[] = ['USB-C', 'Lightning', 'Micro-USB'];

    interfaceTypes.forEach(type => {
      typeCounts[type] = cables.filter(
        c => c.interfaceType === type && c.status === 'available'
      ).length;
    });

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count < config.safeStock) {
        const interfaceType = type as InterfaceType;
        const key = `low_stock-${interfaceType}`;
        if (!existingAlertKeys.has(key)) {
          newAlerts.push({
            id: generateId(),
            type: 'low_stock',
            interfaceType,
            message: `${INTERFACE_TYPE_LABELS[interfaceType]} 接口库存不足（当前${count}条）`,
            level: count === 0 ? 'danger' : 'warning',
            isRead: false,
            createdAt: getNow(),
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      const updatedAlerts = [...alerts, ...newAlerts];
      storage.setAlerts(updatedAlerts);
      set({ alerts: updatedAlerts });
    }
  },
}));
