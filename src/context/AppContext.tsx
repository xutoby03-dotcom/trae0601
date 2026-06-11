import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, CreditRecord, PaymentRecord, CreditItem } from '../types';
import { mockCustomers, mockCreditRecords, mockPaymentRecords } from '../data/mockData';
import { genId } from '../utils/helpers';

interface AppContextType {
  customers: Customer[];
  creditRecords: CreditRecord[];
  paymentRecords: PaymentRecord[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addCreditRecord: (record: Omit<CreditRecord, 'id' | 'createdAt' | 'paidAmount' | 'isPaid'>) => void;
  addPayment: (creditRecordId: string, amount: number, handler: string, remark: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerDebt: (customerId: string) => number;
  getCustomerOverdueCount: (customerId: string) => number;
  getCustomerPayments: (customerId: string) => PaymentRecord[];
  getCustomerRecords: (customerId: string) => CreditRecord[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'credit-book-data';

interface StoredData {
  customers: Customer[];
  creditRecords: CreditRecord[];
  paymentRecords: PaymentRecord[];
}

const loadData = (): StoredData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data from localStorage', e);
  }
  return {
    customers: mockCustomers,
    creditRecords: mockCreditRecords,
    paymentRecords: mockPaymentRecords
  };
};

const saveData = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage', e);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = loadData();
  const [customers, setCustomers] = useState<Customer[]>(initial.customers);
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>(initial.creditRecords);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(initial.paymentRecords);

  useEffect(() => {
    saveData({ customers, creditRecords, paymentRecords });
  }, [customers, creditRecords, paymentRecords]);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: genId(),
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setCreditRecords(prev => prev.filter(r => r.customerId !== id));
    setPaymentRecords(prev => prev.filter(p => p.customerId !== id));
  };

  const addCreditRecord = (record: Omit<CreditRecord, 'id' | 'createdAt' | 'paidAmount' | 'isPaid'>) => {
    const newRecord: CreditRecord = {
      ...record,
      id: genId(),
      createdAt: new Date().toISOString(),
      paidAmount: 0,
      isPaid: false
    };
    setCreditRecords(prev => [...prev, newRecord]);
  };

  const addPayment = (creditRecordId: string, amount: number, handler: string, remark: string) => {
    const record = creditRecords.find(r => r.id === creditRecordId);
    if (!record) return;

    const newPaidAmount = record.paidAmount + amount;
    const isPaid = newPaidAmount >= record.totalAmount;

    const payment: PaymentRecord = {
      id: genId(),
      creditRecordId,
      customerId: record.customerId,
      amount,
      handler,
      remark,
      createdAt: new Date().toISOString()
    };

    setPaymentRecords(prev => [...prev, payment]);
    setCreditRecords(prev => prev.map(r =>
      r.id === creditRecordId
        ? { ...r, paidAmount: Math.min(newPaidAmount, r.totalAmount), isPaid, paidAt: isPaid ? new Date().toISOString() : r.paidAt }
        : r
    ));
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id);

  const getCustomerDebt = (customerId: string): number => {
    return creditRecords
      .filter(r => r.customerId === customerId && !r.isPaid)
      .reduce((sum, r) => sum + (r.totalAmount - r.paidAmount), 0);
  };

  const getCustomerOverdueCount = (customerId: string): number => {
    return creditRecords.filter(r => {
      if (r.customerId !== customerId || r.isPaid) return false;
      const created = new Date(r.createdAt);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return daysPassed > r.dueDays;
    }).length;
  };

  const getCustomerPayments = (customerId: string) => {
    return paymentRecords.filter(p => p.customerId === customerId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getCustomerRecords = (customerId: string) => {
    return creditRecords.filter(r => r.customerId === customerId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return (
    <AppContext.Provider value={{
      customers,
      creditRecords,
      paymentRecords,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addCreditRecord,
      addPayment,
      getCustomerById,
      getCustomerDebt,
      getCustomerOverdueCount,
      getCustomerPayments,
      getCustomerRecords
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
