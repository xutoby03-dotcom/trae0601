import { create } from 'zustand';
import { Complaint, ProcessRecord, Attachment } from '@/types';
import { getInitialComplaints, saveComplaints } from '@/utils/mockData';
import { updateOverdueStatus } from '@/utils/statistics';
import { generateId } from '@/utils/dateUtils';

interface ComplaintStore {
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  isLoading: boolean;

  initComplaints: () => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'processRecords' | 'status' | 'createdAt' | 'updatedAt' | 'attachments'>, attachments: Attachment[]) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  addProcessRecord: (complaintId: string, record: Omit<ProcessRecord, 'id' | 'complaintId' | 'createdAt'>) => void;
  completeVisit: (complaintId: string, recordId: string) => void;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  checkOverdue: () => void;
}

export const useComplaintStore = create<ComplaintStore>((set, get) => ({
  complaints: [],
  selectedComplaint: null,
  isLoading: true,

  initComplaints: () => {
    const complaints = updateOverdueStatus(getInitialComplaints());
    set({ complaints, isLoading: false });
  },

  addComplaint: (complaintData, attachments) => {
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      ...complaintData,
      id: generateId(),
      attachments,
      processRecords: [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    const complaints = [...get().complaints, newComplaint];
    saveComplaints(complaints);
    set({ complaints });
  },

  updateComplaint: (id, updates) => {
    const complaints = get().complaints.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveComplaints(complaints);
    set({ complaints });
  },

  addProcessRecord: (complaintId, recordData) => {
    const now = new Date().toISOString();
    const newRecord: ProcessRecord = {
      ...recordData,
      id: generateId(),
      complaintId,
      createdAt: now,
    };

    let complaints = get().complaints.map((c): Complaint =>
      c.id === complaintId
        ? {
            ...c,
            processRecords: [...c.processRecords, newRecord],
            status: 'processing' as const,
            updatedAt: now,
          }
        : c
    );
    complaints = updateOverdueStatus(complaints);
    saveComplaints(complaints);
    set({ complaints });
  },

  completeVisit: (complaintId, recordId) => {
    const now = new Date().toISOString();
    const complaints = get().complaints.map((c): Complaint =>
      c.id === complaintId
        ? {
            ...c,
            processRecords: c.processRecords.map((r) =>
              r.id === recordId ? { ...r, actualVisitTime: now } : r
            ),
            status: 'completed' as const,
            updatedAt: now,
          }
        : c
    );
    saveComplaints(complaints);
    set({ complaints });
  },

  setSelectedComplaint: (complaint) => {
    set({ selectedComplaint: complaint });
  },

  getComplaintById: (id) => {
    return get().complaints.find((c) => c.id === id);
  },

  checkOverdue: () => {
    const complaints = updateOverdueStatus(get().complaints);
    saveComplaints(complaints);
    set({ complaints });
  },
}));
