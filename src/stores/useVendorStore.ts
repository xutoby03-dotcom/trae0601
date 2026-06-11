import { create } from 'zustand';
import type { Vendor, AuditRecord, AuditAction, AuditStatus, FollowUpStatus } from '@/types';
import { mockVendors, mockAuditRecords } from '@/data/vendors';
import { generateId } from '@/utils/date';

interface VendorState {
  vendors: Vendor[];
  auditRecords: AuditRecord[];
  isLoaded: boolean;
  initData: () => void;
  getVendor: (id: string) => Vendor | undefined;
  getVendorAuditRecords: (vendorId: string) => AuditRecord[];
  getLatestMaterialRecord: (vendorId: string) => AuditRecord | undefined;
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'auditStatus'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  performAudit: (
    vendorId: string,
    action: AuditAction,
    reason: string,
    operator: string,
    followUpStatus?: FollowUpStatus,
    nextReminderDate?: string
  ) => void;
  updateAuditFollowUp: (
    recordId: string,
    followUpStatus: FollowUpStatus,
    nextReminderDate?: string
  ) => void;
}

const actionToStatusMap: Record<AuditAction, AuditStatus> = {
  approve: 'approved',
  reject: 'rejected',
  material_request: 'material_required',
};

const STORAGE_KEY_VENDORS = 'vendor_management_vendors';
const STORAGE_KEY_RECORDS = 'vendor_management_records';

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: [],
  auditRecords: [],
  isLoaded: false,

  initData: () => {
    if (get().isLoaded) return;

    const shouldReset = new URLSearchParams(window.location.search).get('resetData') === 'true';

    if (shouldReset) {
      localStorage.removeItem(STORAGE_KEY_VENDORS);
      localStorage.removeItem(STORAGE_KEY_RECORDS);
    }

    const savedVendors = localStorage.getItem(STORAGE_KEY_VENDORS);
    const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);

    if (savedVendors && savedRecords && !shouldReset) {
      set({
        vendors: JSON.parse(savedVendors),
        auditRecords: JSON.parse(savedRecords),
        isLoaded: true,
      });
    } else {
      set({
        vendors: mockVendors,
        auditRecords: mockAuditRecords,
        isLoaded: true,
      });
      localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(mockVendors));
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(mockAuditRecords));
    }
  },

  getVendor: (id: string) => {
    return get().vendors.find(v => v.id === id);
  },

  getVendorAuditRecords: (vendorId: string) => {
    return get().auditRecords
      .filter(r => r.vendorId === vendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getLatestMaterialRecord: (vendorId: string) => {
    return get().auditRecords
      .filter(r => r.vendorId === vendorId && r.action === 'material_request')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  addVendor: (vendorData) => {
    const now = new Date().toISOString();
    const newVendor: Vendor = {
      ...vendorData,
      id: generateId(),
      auditStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const newVendors = [newVendor, ...get().vendors];
    set({ vendors: newVendors });
    localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(newVendors));
  },

  updateVendor: (id: string, updates: Partial<Vendor>) => {
    const now = new Date().toISOString();
    const newVendors = get().vendors.map(v =>
      v.id === id ? { ...v, ...updates, updatedAt: now } : v
    );
    set({ vendors: newVendors });
    localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(newVendors));
  },

  deleteVendor: (id: string) => {
    const newVendors = get().vendors.filter(v => v.id !== id);
    const newRecords = get().auditRecords.filter(r => r.vendorId !== id);
    set({ vendors: newVendors, auditRecords: newRecords });
    localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(newVendors));
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(newRecords));
  },

  performAudit: (
    vendorId: string,
    action: AuditAction,
    reason: string,
    operator: string,
    followUpStatus?: FollowUpStatus,
    nextReminderDate?: string
  ) => {
    const now = new Date().toISOString();
    const newRecord: AuditRecord = {
      id: generateId(),
      vendorId,
      action,
      reason,
      operator,
      createdAt: now,
      ...(action === 'material_request' && followUpStatus !== undefined
        ? { followUpStatus }
        : {}),
      ...(action === 'material_request' && nextReminderDate
        ? { nextReminderDate }
        : {}),
    };

    const newRecords = [newRecord, ...get().auditRecords];
    const newStatus = actionToStatusMap[action];
    const newVendors = get().vendors.map(v =>
      v.id === vendorId ? { ...v, auditStatus: newStatus, updatedAt: now } : v
    );

    set({ vendors: newVendors, auditRecords: newRecords });
    localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(newVendors));
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(newRecords));
  },

  updateAuditFollowUp: (
    recordId: string,
    followUpStatus: FollowUpStatus,
    nextReminderDate?: string
  ) => {
    const newRecords = get().auditRecords.map(r => {
      if (r.id !== recordId) return r;
      const next: AuditRecord = { ...r, followUpStatus };
      if (nextReminderDate) {
        next.nextReminderDate = nextReminderDate;
      } else {
        delete next.nextReminderDate;
      }
      return next;
    });
    set({ auditRecords: newRecords });
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(newRecords));
  },
}));
