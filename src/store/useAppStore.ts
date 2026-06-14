import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BookingFormData,
  Department,
  Employee,
  ParkingTicket,
  StatsData,
  TicketInventory,
  Visitor,
  VisitorWithRelations,
} from '@/types';
import { departments as defaultDepartments, employees as defaultEmployees, CURRENT_USER_ID } from '@/data/departments';
import { mockInventory, mockTickets, mockVisitors } from '@/data/mockData';
import { generateId, generateTicketNumber } from '@/utils/ticketGenerator';
import { computeStats, computeActualDuration } from '@/utils/statsEngine';
import { getBoardGroup, isWithinReminderWindow } from '@/utils/dateUtils';

interface AppState {
  visitors: Visitor[];
  tickets: ParkingTicket[];
  departments: Department[];
  employees: Employee[];
  ticketInventory: TicketInventory;
  currentUserId: string;
  addVisitor: (data: BookingFormData) => { visitor: Visitor; ticket: ParkingTicket };
  redeemTicket: (ticketId: string) => ParkingTicket | null;
  getVisitorRelations: (visitorId: string) => VisitorWithRelations | undefined;
  getVisitorsByGroup: () => Record<'today' | 'tomorrow' | 'overdue', VisitorWithRelations[]>;
  getStats: () => StatsData;
  getPendingReminders: () => VisitorWithRelations[];
  updateVisitorStatus: (visitorId: string, status: Visitor['status']) => void;
  resetMock: () => void;
}

function buildRelations(
  visitor: Visitor,
  tickets: ParkingTicket[],
  departments: Department[],
  employees: Employee[],
): VisitorWithRelations {
  const ticket = tickets.find((t) => t.visitorId === visitor.id);
  const department = departments.find((d) => d.id === visitor.departmentId);
  const host = employees.find((e) => e.id === visitor.hostId);
  const issuer = ticket ? employees.find((e) => e.id === ticket.issuerId) : undefined;
  return { ...visitor, department, host, ticket, issuer };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      visitors: mockVisitors,
      tickets: mockTickets,
      departments: defaultDepartments,
      employees: defaultEmployees,
      ticketInventory: mockInventory,
      currentUserId: CURRENT_USER_ID,

      addVisitor: (data: BookingFormData) => {
        const { tickets: existingTickets, currentUserId, ticketInventory } = get();

        const remaining = ticketInventory.total - ticketInventory.used;
        if (remaining <= 0) {
          throw new Error(`库存不足，当前剩余 ${remaining} 张，请联系管理员补充券库`);
        }

        const visitorId = generateId('v-');
        const ticketId = generateId('t-');
        const now = new Date().toISOString();
        const ticketNumber = generateTicketNumber(existingTickets.map((t) => t.ticketNumber));

        const visitor: Visitor = {
          id: visitorId,
          name: data.name.trim(),
          company: data.company.trim(),
          plateNumber: data.plateNumber.trim().toUpperCase(),
          departmentId: data.departmentId,
          meetingRoom: data.meetingRoom.trim(),
          expectedArrival: new Date(data.expectedArrival).toISOString(),
          expectedDeparture: new Date(data.expectedDeparture).toISOString(),
          hostId: data.hostId,
          status: 'pending',
          createdAt: now,
        };

        const ticket: ParkingTicket = {
          id: ticketId,
          ticketNumber,
          visitorId,
          validHours: data.validHours || 8,
          issuerId: currentUserId,
          issuedAt: now,
          isUsed: false,
        };

        set((s) => ({
          visitors: [visitor, ...s.visitors],
          tickets: [ticket, ...s.tickets],
          ticketInventory: {
            ...s.ticketInventory,
            used: s.ticketInventory.used + 1,
          },
        }));

        return { visitor, ticket };
      },

      redeemTicket: (ticketId: string) => {
        const state = get();
        const ticket = state.tickets.find((t) => t.id === ticketId);
        if (!ticket || ticket.isUsed) return null;

        const now = new Date().toISOString();
        const actualDuration = computeActualDuration(ticket.issuedAt, now);

        const updated: ParkingTicket = {
          ...ticket,
          isUsed: true,
          usedAt: now,
          actualDuration,
        };

        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === ticketId ? updated : t)),
          visitors: s.visitors.map((v) =>
            v.id === ticket.visitorId ? { ...v, status: 'left' } : v,
          ),
        }));
        return updated;
      },

      getVisitorRelations: (visitorId: string) => {
        const { visitors, tickets, departments, employees } = get();
        const v = visitors.find((x) => x.id === visitorId);
        if (!v) return undefined;
        return buildRelations(v, tickets, departments, employees);
      },

      getVisitorsByGroup: () => {
        const { visitors, tickets, departments, employees } = get();
        const result: Record<'today' | 'tomorrow' | 'overdue', VisitorWithRelations[]> = {
          today: [],
          tomorrow: [],
          overdue: [],
        };
        visitors.forEach((v) => {
          const ticket = tickets.find((t) => t.visitorId === v.id);
          const group = getBoardGroup(v, ticket?.isUsed ?? true);
          result[group].push(buildRelations(v, tickets, departments, employees));
        });
        const sortFn = (a: VisitorWithRelations, b: VisitorWithRelations) =>
          new Date(a.expectedArrival).getTime() - new Date(b.expectedArrival).getTime();
        result.today.sort(sortFn);
        result.tomorrow.sort(sortFn);
        result.overdue.sort((a, b) =>
          new Date(a.expectedDeparture).getTime() - new Date(b.expectedDeparture).getTime(),
        );
        return result;
      },

      getStats: () => {
        const { visitors, tickets, departments, ticketInventory } = get();
        return computeStats(visitors, tickets, departments, ticketInventory);
      },

      getPendingReminders: () => {
        const { visitors, tickets, departments, employees } = get();
        return visitors
          .map((v) => {
            const ticket = tickets.find((t) => t.visitorId === v.id);
            if (!ticket || ticket.isUsed) return null;
            if (!isWithinReminderWindow(v.expectedDeparture)) return null;
            return buildRelations(v, tickets, departments, employees);
          })
          .filter((x): x is VisitorWithRelations => x !== null);
      },

      updateVisitorStatus: (visitorId: string, status: Visitor['status']) => {
        set((s) => ({
          visitors: s.visitors.map((v) => (v.id === visitorId ? { ...v, status } : v)),
        }));
      },

      resetMock: () => {
        set({
          visitors: mockVisitors,
          tickets: mockTickets,
          ticketInventory: mockInventory,
        });
      },
    }),
    {
      name: 'parking-ticket-store',
      partialize: (state) => ({
        visitors: state.visitors,
        tickets: state.tickets,
        ticketInventory: state.ticketInventory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.departments?.length) state.departments = defaultDepartments;
          if (!state.employees?.length) state.employees = defaultEmployees;
          if (!state.currentUserId) state.currentUserId = CURRENT_USER_ID;
        }
      },
    },
  ),
);
