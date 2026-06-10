import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room, Inspection, Ticket, TicketLog, RoomStatus, TicketStatus, DeviceType } from '@/types';
import { mockRooms, mockInspections, mockTickets, mockTicketLogs, generateId } from '@/utils/mock';

interface AppState {
  rooms: Room[];
  inspections: Inspection[];
  tickets: Ticket[];
  ticketLogs: TicketLog[];
  currentUser: { name: string; role: 'admin' | 'employee' };
  
  setCurrentUser: (user: { name: string; role: 'admin' | 'employee' }) => void;
  
  addRoom: (room: Omit<Room, 'id' | 'createdAt' | 'status' | 'lastInspectedAt'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  
  addTicket: (ticket: Omit<Ticket, 'id' | 'status' | 'createdAt'>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, assignee?: string) => void;
  addTicketLog: (log: Omit<TicketLog, 'id' | 'createdAt'>) => void;
  
  getRoomsByStatus: (status: RoomStatus) => Room[];
  getRoomById: (id: string) => Room | undefined;
  getInspectionsByRoomId: (roomId: string) => Inspection[];
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  getTicketLogs: (ticketId: string) => TicketLog[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      rooms: mockRooms,
      inspections: mockInspections,
      tickets: mockTickets,
      ticketLogs: mockTicketLogs,
      currentUser: { name: '管理员', role: 'admin' },
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      addRoom: (roomData) => {
        const newRoom: Room = {
          ...roomData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          status: 'not_inspected',
          lastInspectedAt: null,
        };
        set((state) => ({ rooms: [...state.rooms, newRoom] }));
      },
      
      updateRoom: (id, updates) => {
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },
      
      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
          inspections: state.inspections.filter((i) => i.roomId !== id),
          tickets: state.tickets.filter((t) => t.roomId !== id),
        }));
      },
      
      addInspection: (inspectionData) => {
        const newInspection: Inspection = {
          ...inspectionData,
          id: generateId(),
        };
        
        set((state) => {
          let newStatus: RoomStatus = 'normal';
          if (inspectionData.result === 'needs_repair') {
            newStatus = 'repairing';
          } else if (inspectionData.result === 'missing_parts') {
            newStatus = 'missing_parts';
          }
          
          return {
            inspections: [...state.inspections, newInspection],
            rooms: state.rooms.map((r) =>
              r.id === inspectionData.roomId
                ? { ...r, status: newStatus, lastInspectedAt: inspectionData.inspectedAt }
                : r
            ),
          };
        });
      },
      
      addTicket: (ticketData) => {
        const newTicket: Ticket = {
          ...ticketData,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          tickets: [...state.tickets, newTicket],
        }));
        
        get().addTicketLog({
          ticketId: newTicket.id,
          action: '创建工单',
          operator: ticketData.reporterName,
        });
      },
      
      updateTicketStatus: (ticketId, status, assignee) => {
        const now = new Date().toISOString();
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket) return;
        
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            const updates: Partial<Ticket> = { status };
            if (status === 'assigned' && assignee) {
              updates.assignee = assignee;
              updates.assignedAt = now;
            }
            if (status === 'completed') {
              updates.completedAt = now;
            }
            return { ...t, ...updates };
          }),
        }));
        
        const actionMap: Record<TicketStatus, string> = {
          pending: '创建工单',
          assigned: '派单',
          processing: '开始处理',
          completed: '完成维修',
        };
        
        get().addTicketLog({
          ticketId,
          action: actionMap[status],
          operator: get().currentUser.name,
          note: assignee ? `指派给 ${assignee}` : undefined,
        });
        
        if (status === 'completed') {
          const updatedTicket = get().tickets.find((t) => t.id === ticketId);
          if (updatedTicket) {
            get().updateRoom(updatedTicket.roomId, { status: 'normal' });
          }
        }
      },
      
      addTicketLog: (logData) => {
        const newLog: TicketLog = {
          ...logData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          ticketLogs: [...state.ticketLogs, newLog],
        }));
      },
      
      getRoomsByStatus: (status) => {
        const { rooms, isToday } = get() as AppState & { isToday: (d: string | null) => boolean };
        if (status === 'not_inspected') {
          return rooms.filter((r) => {
            const lastInsp = r.lastInspectedAt;
            if (!lastInsp) return true;
            const lastDate = new Date(lastInsp);
            const today = new Date();
            return !(
              lastDate.getFullYear() === today.getFullYear() &&
              lastDate.getMonth() === today.getMonth() &&
              lastDate.getDate() === today.getDate()
            );
          });
        }
        return rooms.filter((r) => r.status === status);
      },
      
      getRoomById: (id) => get().rooms.find((r) => r.id === id),
      
      getInspectionsByRoomId: (roomId) =>
        get()
          .inspections.filter((i) => i.roomId === roomId)
          .sort((a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime()),
      
      getTicketsByStatus: (status) =>
        get()
          .tickets.filter((t) => t.status === status)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      
      getTicketLogs: (ticketId) =>
        get()
          .ticketLogs.filter((l) => l.ticketId === ticketId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }),
    {
      name: 'room-inspection-storage',
    }
  )
);
