import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PatrolRoute,
  PatrolPoint,
  PatrolRecord,
  CheckInRecord,
  ExceptionEvent,
  PatrolOfficer,
  RiskLevel,
  ExceptionStatus,
  AssigneeType,
} from '@/types/patrol';
import { generateId } from '@/utils/helpers';
import {
  mockRoutes,
  mockOfficers,
  mockPatrolRecords,
  mockCheckInRecords,
  mockExceptionEvents,
} from '@/utils/mock';

interface PatrolState {
  routes: PatrolRoute[];
  patrolRecords: PatrolRecord[];
  checkInRecords: CheckInRecord[];
  exceptionEvents: ExceptionEvent[];
  officers: PatrolOfficer[];
  currentOfficerId: string;
  activePatrolRecordId: string | null;

  addRoute: (name: string, description: string) => string;
  updateRoute: (id: string, name: string, description: string) => void;
  deleteRoute: (id: string) => void;

  addPoint: (
    routeId: string,
    data: {
      name: string;
      riskLevel: RiskLevel;
      suggestedTime: string;
      photoUrl: string;
    }
  ) => void;
  updatePoint: (
    pointId: string,
    data: {
      name: string;
      riskLevel: RiskLevel;
      suggestedTime: string;
      photoUrl: string;
    }
  ) => void;
  deletePoint: (pointId: string) => void;

  startPatrol: (routeId: string, officerId: string) => string;
  completePatrol: (patrolRecordId: string) => void;
  checkInPoint: (
    patrolRecordId: string,
    pointId: string,
    data: {
      isAbnormal: boolean;
      abnormalDescription?: string;
      handlingResult?: string;
      photoUrl?: string;
    }
  ) => void;
  markMissed: (patrolRecordId: string, pointId: string) => void;

  assignException: (
    eventId: string,
    assigneeType: AssigneeType,
    assigneeId: string
  ) => void;
  updateExceptionStatus: (
    eventId: string,
    status: ExceptionStatus,
    handlingResult?: string
  ) => void;

  getRouteById: (id: string) => PatrolRoute | undefined;
  getPointById: (id: string) => PatrolPoint | undefined;
  getOfficerById: (id: string) => PatrolOfficer | undefined;
  getMissedCheckIns: () => Array<{
    checkIn: CheckInRecord;
    point: PatrolPoint;
    route: PatrolRoute;
    officer: PatrolOfficer;
    record: PatrolRecord;
  }>;
  getCheckInsByRecord: (patrolRecordId: string) => CheckInRecord[];
}

export const usePatrolStore = create<PatrolState>()(
  persist(
    (set, get) => ({
      routes: mockRoutes,
      patrolRecords: mockPatrolRecords,
      checkInRecords: mockCheckInRecords,
      exceptionEvents: mockExceptionEvents,
      officers: mockOfficers,
      currentOfficerId: 'off1',
      activePatrolRecordId: null,

      addRoute: (name, description) => {
        const id = generateId();
        set((state) => ({
          routes: [
            ...state.routes,
            {
              id,
              name,
              description,
              points: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      updateRoute: (id, name, description) => {
        set((state) => ({
          routes: state.routes.map((r) =>
            r.id === id ? { ...r, name, description } : r
          ),
        }));
      },

      deleteRoute: (id) => {
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id),
        }));
      },

      addPoint: (routeId, data) => {
        set((state) => {
          const route = state.routes.find((r) => r.id === routeId);
          if (!route) return state;
          const newPoint: PatrolPoint = {
            id: generateId(),
            routeId,
            ...data,
            orderIndex: route.points.length,
          };
          return {
            routes: state.routes.map((r) =>
              r.id === routeId ? { ...r, points: [...r.points, newPoint] } : r
            ),
          };
        });
      },

      updatePoint: (pointId, data) => {
        set((state) => ({
          routes: state.routes.map((r) => ({
            ...r,
            points: r.points.map((p) =>
              p.id === pointId ? { ...p, ...data } : p
            ),
          })),
        }));
      },

      deletePoint: (pointId) => {
        set((state) => ({
          routes: state.routes.map((r) => ({
            ...r,
            points: r.points.filter((p) => p.id !== pointId),
          })),
        }));
      },

      startPatrol: (routeId, officerId) => {
        const id = generateId();
        set((state) => ({
          patrolRecords: [
            ...state.patrolRecords,
            {
              id,
              routeId,
              patrolOfficerId: officerId,
              startTime: new Date().toISOString(),
              status: 'in_progress',
            },
          ],
          activePatrolRecordId: id,
        }));
        return id;
      },

      completePatrol: (patrolRecordId) => {
        set((state) => ({
          patrolRecords: state.patrolRecords.map((r) =>
            r.id === patrolRecordId
              ? { ...r, status: 'completed', endTime: new Date().toISOString() }
              : r
          ),
          activePatrolRecordId: null,
        }));
      },

      checkInPoint: (patrolRecordId, pointId, data) => {
        const checkInId = generateId();
        const now = new Date().toISOString();

        set((state) => {
          const newCheckIn: CheckInRecord = {
            id: checkInId,
            patrolRecordId,
            pointId,
            arrivalTime: now,
            isMissed: false,
            ...data,
          };

          let newException: ExceptionEvent | null = null;
          if (data.isAbnormal && data.abnormalDescription) {
            const stateNow = get();
            const point = stateNow.getPointById(pointId);
            const record = stateNow.patrolRecords.find(
              (r) => r.id === patrolRecordId
            );
            const route = record ? stateNow.getRouteById(record.routeId) : undefined;

            newException = {
              id: generateId(),
              checkInRecordId: checkInId,
              pointId,
              pointName: point?.name || '',
              routeName: route?.name || '',
              description: data.abnormalDescription,
              status: 'pending',
              createdAt: now,
            };
          }

          return {
            checkInRecords: [...state.checkInRecords, newCheckIn],
            exceptionEvents: newException
              ? [...state.exceptionEvents, newException]
              : state.exceptionEvents,
          };
        });
      },

      markMissed: (patrolRecordId, pointId) => {
        set((state) => ({
          checkInRecords: [
            ...state.checkInRecords,
            {
              id: generateId(),
              patrolRecordId,
              pointId,
              isMissed: true,
              isAbnormal: false,
            },
          ],
        }));
      },

      assignException: (eventId, assigneeType, assigneeId) => {
        set((state) => {
          const officer = state.officers.find((o) => o.id === assigneeId);
          return {
            exceptionEvents: state.exceptionEvents.map((e) =>
              e.id === eventId
                ? {
                    ...e,
                    assigneeType,
                    assigneeId,
                    assigneeName: officer?.name,
                    status: 'assigned',
                  }
                : e
            ),
          };
        });
      },

      updateExceptionStatus: (eventId, status, handlingResult) => {
        set((state) => ({
          exceptionEvents: state.exceptionEvents.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  status,
                  handlingResult: handlingResult || e.handlingResult,
                  resolvedAt:
                    status === 'resolved' ? new Date().toISOString() : e.resolvedAt,
                }
              : e
          ),
        }));
      },

      getRouteById: (id) => get().routes.find((r) => r.id === id),
      getPointById: (id) => {
        const state = get();
        for (const route of state.routes) {
          const point = route.points.find((p) => p.id === id);
          if (point) return point;
        }
        return undefined;
      },
      getOfficerById: (id) => get().officers.find((o) => o.id === id),

      getMissedCheckIns: () => {
        const state = get();
        const result: Array<{
          checkIn: CheckInRecord;
          point: PatrolPoint;
          route: PatrolRoute;
          officer: PatrolOfficer;
          record: PatrolRecord;
        }> = [];

        for (const checkIn of state.checkInRecords) {
          if (!checkIn.isMissed) continue;
          const point = state.getPointById(checkIn.pointId);
          const record = state.patrolRecords.find(
            (r) => r.id === checkIn.patrolRecordId
          );
          if (!point || !record) continue;
          const route = state.getRouteById(record.routeId);
          const officer = state.getOfficerById(record.patrolOfficerId);
          if (!route || !officer) continue;
          result.push({ checkIn, point, route, officer, record });
        }
        return result;
      },

      getCheckInsByRecord: (patrolRecordId) =>
        get().checkInRecords.filter((c) => c.patrolRecordId === patrolRecordId),
    }),
    {
      name: 'patrol-store',
    }
  )
);
