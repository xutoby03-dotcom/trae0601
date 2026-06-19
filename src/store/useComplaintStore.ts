import { create } from 'zustand';
import type { Complaint } from '@/types';
import { mockComplaints } from '@/utils/mockData';
import { persist } from 'zustand/middleware';

interface ComplaintState {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id'>) => Complaint;
  updateComplaint: (id: string, complaint: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;
  getComplaint: (id: string) => Complaint | undefined;
  getComplaintsByRoom: (roomId: string) => Complaint[];
  getRecentComplaints: (days: number) => Complaint[];
}

export const useComplaintStore = create<ComplaintState>()(
  persist(
    (set, get) => ({
      complaints: mockComplaints,
      addComplaint: (complaintData) => {
        const newComplaint: Complaint = {
          ...complaintData,
          id: `comp-${Date.now()}`,
        };
        set((state) => ({ complaints: [newComplaint, ...state.complaints] }));
        return newComplaint;
      },
      updateComplaint: (id, complaintData) => {
        set((state) => ({
          complaints: state.complaints.map((complaint) =>
            complaint.id === id ? { ...complaint, ...complaintData } : complaint
          ),
        }));
      },
      deleteComplaint: (id) => {
        set((state) => ({
          complaints: state.complaints.filter((complaint) => complaint.id !== id),
        }));
      },
      getComplaint: (id) => {
        return get().complaints.find((complaint) => complaint.id === id);
      },
      getComplaintsByRoom: (roomId) => {
        return get()
          .complaints.filter((complaint) => complaint.roomId === roomId)
          .sort(
            (a, b) =>
              new Date(b.complaintDate).getTime() - new Date(a.complaintDate).getTime()
          );
      },
      getRecentComplaints: (days) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return get()
          .complaints.filter(
            (complaint) => new Date(complaint.complaintDate) >= cutoffDate
          )
          .sort(
            (a, b) =>
              new Date(b.complaintDate).getTime() - new Date(a.complaintDate).getTime()
          );
      },
    }),
    {
      name: 'water-heater-complaints',
    }
  )
);
