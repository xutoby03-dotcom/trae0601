import { create } from 'zustand';
import type {
  Device,
  Loan,
  Customer,
  Employee,
  Exception,
  Renewal,
  LoanAccessory,
  Accessory,
} from '../types';
import {
  mockDevices,
  mockCustomers,
  mockEmployees,
  mockLoans,
  mockExceptions,
} from '../mock/data';
import { generateId, addDays, getToday, isOverdue, isDueSoon } from '../utils';

interface AppState {
  devices: Device[];
  loans: Loan[];
  customers: Customer[];
  employees: Employee[];
  exceptions: Exception[];

  addDevice: (device: Omit<Device, 'id' | 'accessories'> & { accessories: Omit<Accessory, 'id' | 'deviceId'>[] }) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  getDeviceById: (id: string) => Device | undefined;

  addLoan: (loan: Omit<Loan, 'id' | 'loanAccessories' | 'renewals' | 'exceptions' | 'status'> & { accessories: { accessoryId: string; name: string; quantity: number }[] }) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  getLoanById: (id: string) => Loan | undefined;
  getActiveLoans: () => Loan[];
  getOverdueLoans: () => Loan[];
  getDueSoonLoans: () => Loan[];

  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  getCustomerById: (id: string) => Customer | undefined;

  getEmployeeById: (id: string) => Employee | undefined;

  addRenewal: (loanId: string, renewal: Omit<Renewal, 'id' | 'loanId' | 'status' | 'applyDate'>) => void;
  approveRenewal: (loanId: string, renewalId: string, note: string) => void;
  rejectRenewal: (loanId: string, renewalId: string, note: string) => void;

  addException: (exception: Omit<Exception, 'id' | 'status' | 'createDate'>) => string;
  updateException: (id: string, exception: Partial<Exception>) => void;
  resolveException: (id: string, solution: string) => void;
  deleteException: (id: string) => void;

  returnLoan: (loanId: string, returnedAccessories: { id: string; returnQuantity: number }[], exceptions?: Omit<Exception, 'id' | 'loanId' | 'status' | 'createDate'>[]) => void;

  getStatistics: () => {
    totalDevices: number;
    activeLoans: number;
    overdueLoans: number;
    returnedThisMonth: number;
    topOverdueCustomers: { customerId: string; customerName: string; count: number; days: number }[];
    deviceTurnover: { deviceId: string; deviceName: string; model: string; count: number; avgDays: number }[];
    exceptionByType: { type: string; count: number }[];
    exceptionBySeverity: { severity: string; count: number }[];
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: mockDevices,
  loans: mockLoans,
  customers: mockCustomers,
  employees: mockEmployees,
  exceptions: mockExceptions,

  addDevice: (deviceData) => {
    const deviceId = generateId();
    const accessories: Accessory[] = deviceData.accessories.map((acc, idx) => ({
      id: `${deviceId}-acc-${idx}`,
      deviceId,
      name: acc.name,
      quantity: acc.quantity,
      description: acc.description,
    }));
    const newDevice: Device = {
      ...deviceData,
      id: deviceId,
      accessories,
    };
    set((state) => ({ devices: [...state.devices, newDevice] }));
  },

  updateDevice: (id, device) => {
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, ...device } : d)),
    }));
  },

  deleteDevice: (id) => {
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    }));
  },

  getDeviceById: (id) => {
    return get().devices.find((d) => d.id === id);
  },

  addLoan: (loanData) => {
    const loanId = generateId();
    const loanAccessories: LoanAccessory[] = loanData.accessories.map((acc) => ({
      id: `${loanId}-la-${acc.accessoryId}`,
      loanId,
      accessoryId: acc.accessoryId,
      name: acc.name,
      quantity: acc.quantity,
      returned: false,
    }));
    const newLoan: Loan = {
      ...loanData,
      id: loanId,
      status: 'active',
      loanAccessories,
      renewals: [],
      exceptions: [],
    };
    set((state) => ({
      loans: [...state.loans, newLoan],
      devices: state.devices.map((d) =>
        d.id === loanData.deviceId ? { ...d, status: 'loaned' } : d
      ),
    }));
  },

  updateLoan: (id, loan) => {
    set((state) => ({
      loans: state.loans.map((l) => (l.id === id ? { ...l, ...loan } : l)),
    }));
  },

  getLoanById: (id) => {
    const loan = get().loans.find((l) => l.id === id);
    if (loan) {
      return {
        ...loan,
        device: get().devices.find((d) => d.id === loan.deviceId),
        customer: get().customers.find((c) => c.id === loan.customerId),
        employee: get().employees.find((e) => e.id === loan.employeeId),
      };
    }
    return undefined;
  },

  getActiveLoans: () => {
    return get().loans.filter((l) => l.status === 'active' || l.status === 'overdue');
  },

  getOverdueLoans: () => {
    return get().loans.filter((l) => l.status !== 'returned' && isOverdue(l.expectedReturnDate, l.status));
  },

  getDueSoonLoans: () => {
    return get().loans.filter((l) => l.status !== 'returned' && isDueSoon(l.expectedReturnDate, l.status));
  },

  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
    };
    set((state) => ({ customers: [...state.customers, newCustomer] }));
  },

  getCustomerById: (id) => {
    return get().customers.find((c) => c.id === id);
  },

  getEmployeeById: (id) => {
    return get().employees.find((e) => e.id === id);
  },

  addRenewal: (loanId, renewalData) => {
    const newRenewal: Renewal = {
      ...renewalData,
      id: generateId(),
      loanId,
      status: 'pending',
      applyDate: getToday(),
    };
    set((state) => ({
      loans: state.loans.map((l) =>
        l.id === loanId ? { ...l, renewals: [...l.renewals, newRenewal] } : l
      ),
    }));
  },

  approveRenewal: (loanId, renewalId, note) => {
    const loan = get().loans.find((l) => l.id === loanId);
    if (!loan) return;

    const renewal = loan.renewals.find((r) => r.id === renewalId);
    if (!renewal) return;

    const newReturnDate = addDays(loan.expectedReturnDate, renewal.extendDays);

    set((state) => ({
      loans: state.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              expectedReturnDate: newReturnDate,
              renewals: l.renewals.map((r) =>
                r.id === renewalId
                  ? {
                      ...r,
                      status: 'approved',
                      approvalNote: note,
                      approverId: 'emp-4',
                      approveDate: getToday(),
                      newReturnDate,
                    }
                  : r
              ),
            }
          : l
      ),
    }));
  },

  rejectRenewal: (loanId, renewalId, note) => {
    set((state) => ({
      loans: state.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              renewals: l.renewals.map((r) =>
                r.id === renewalId
                  ? {
                      ...r,
                      status: 'rejected',
                      approvalNote: note,
                      approverId: 'emp-4',
                      approveDate: getToday(),
                    }
                  : r
              ),
            }
          : l
      ),
    }));
  },

  addException: (exceptionData) => {
    const newException: Exception = {
      ...exceptionData,
      id: generateId(),
      status: 'open',
      createDate: getToday(),
    };
    set((state) => ({
      exceptions: [...state.exceptions, newException],
      loans: state.loans.map((l) =>
        l.id === exceptionData.loanId
          ? { ...l, exceptions: [...l.exceptions, newException] }
          : l
      ),
    }));
    return newException.id;
  },

  updateException: (id, exception) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) => (e.id === id ? { ...e, ...exception } : e)),
      loans: state.loans.map((l) => ({
        ...l,
        exceptions: l.exceptions.map((e) => (e.id === id ? { ...e, ...exception } : e)),
      })),
    }));
  },

  resolveException: (id, solution) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) =>
        e.id === id
          ? { ...e, status: 'resolved', solution, resolveDate: getToday() }
          : e
      ),
      loans: state.loans.map((l) => ({
        ...l,
        exceptions: l.exceptions.map((e) =>
          e.id === id
            ? { ...e, status: 'resolved', solution, resolveDate: getToday() }
            : e
        ),
      })),
    }));
  },

  deleteException: (id) => {
    set((state) => ({
      exceptions: state.exceptions.filter((e) => e.id !== id),
      loans: state.loans.map((l) => ({
        ...l,
        exceptions: l.exceptions.filter((e) => e.id !== id),
      })),
    }));
  },

  returnLoan: (loanId, returnedAccessories, exceptions = []) => {
    const loan = get().loans.find((l) => l.id === loanId);
    if (!loan) return;

    const updatedAccessories = loan.loanAccessories.map((acc) => {
      const returned = returnedAccessories.find((ra) => ra.id === acc.id);
      return {
        ...acc,
        returned: true,
        returnQuantity: returned ? returned.returnQuantity : acc.quantity,
      };
    });

    const newExceptions: Exception[] = exceptions.map((e) => ({
      ...e,
      id: generateId(),
      loanId,
      status: 'open' as const,
      createDate: getToday(),
    }));

    set((state) => ({
      loans: state.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'returned',
              actualReturnDate: getToday(),
              loanAccessories: updatedAccessories,
              exceptions: [...l.exceptions, ...newExceptions],
            }
          : l
      ),
      devices: state.devices.map((d) =>
        d.id === loan.deviceId ? { ...d, status: 'available' } : d
      ),
      exceptions: [...state.exceptions, ...newExceptions],
    }));
  },

  getStatistics: () => {
    const { devices, loans, exceptions, customers } = get();
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'overdue');
    const overdueLoans = loans.filter((l) => l.status !== 'returned' && isOverdue(l.expectedReturnDate, l.status));
    const returnedThisMonth = loans.filter((l) => {
      if (l.status !== 'returned' || !l.actualReturnDate) return false;
      const d = new Date(l.actualReturnDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const customerOverdueMap = new Map<string, { count: number; days: number; name: string }>();
    overdueLoans.forEach((loan) => {
      const customer = customers.find((c) => c.id === loan.customerId);
      if (!customer) return;
      const days = Math.abs(
        Math.ceil(
          (new Date(loan.expectedReturnDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      const existing = customerOverdueMap.get(loan.customerId) || { count: 0, days: 0, name: customer.name };
      customerOverdueMap.set(loan.customerId, {
        count: existing.count + 1,
        days: existing.days + days,
        name: customer.name,
      });
    });
    const topOverdueCustomers = Array.from(customerOverdueMap.entries())
      .map(([customerId, data]) => ({
        customerId,
        customerName: data.name,
        count: data.count,
        days: data.days,
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);

    const deviceLoanMap = new Map<string, { count: number; totalDays: number }>();
    loans.forEach((loan) => {
      const existing = deviceLoanMap.get(loan.deviceId) || { count: 0, totalDays: 0 };
      const endDate = loan.actualReturnDate ? new Date(loan.actualReturnDate) : today;
      const startDate = new Date(loan.loanDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      deviceLoanMap.set(loan.deviceId, {
        count: existing.count + 1,
        totalDays: existing.totalDays + days,
      });
    });
    const deviceTurnover = devices
      .map((d) => {
        const data = deviceLoanMap.get(d.id) || { count: 0, totalDays: 0 };
        return {
          deviceId: d.id,
          deviceName: d.name,
          model: d.model,
          count: data.count,
          avgDays: data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const exceptionTypeMap = new Map<string, number>();
    exceptions.forEach((e) => {
      const count = exceptionTypeMap.get(e.type) || 0;
      exceptionTypeMap.set(e.type, count + 1);
    });
    const exceptionByType = Array.from(exceptionTypeMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    const exceptionSeverityMap = new Map<string, number>();
    exceptions.forEach((e) => {
      const count = exceptionSeverityMap.get(e.severity) || 0;
      exceptionSeverityMap.set(e.severity, count + 1);
    });
    const exceptionBySeverity = Array.from(exceptionSeverityMap.entries()).map(
      ([severity, count]) => ({
        severity,
        count,
      })
    );

    return {
      totalDevices: devices.length,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      returnedThisMonth: returnedThisMonth.length,
      topOverdueCustomers,
      deviceTurnover,
      exceptionByType,
      exceptionBySeverity,
    };
  },
}));
