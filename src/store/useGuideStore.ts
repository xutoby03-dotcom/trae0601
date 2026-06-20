import { create } from 'zustand';
import type {
  TourRoute,
  GuideSession,
  PointSession,
  RoutePoint,
} from '@/types';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '@/utils/storage';
import { compressDurations } from '@/utils/compression';
import { sampleRoutes } from '@/data/sampleRoutes';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createPointSession(point: RoutePoint): PointSession {
  return {
    pointId: point.id,
    plannedDuration: point.plannedDuration,
    adjustedDuration: point.plannedDuration,
    actualDuration: 0,
    startedAt: null,
    endedAt: null,
    timeAdded: 0,
    isCompleted: false,
  };
}

interface State {
  routes: TourRoute[];
  currentRoute: TourRoute | null;
  activeSession: GuideSession | null;
  pastSessions: GuideSession[];
}

interface Actions {
  loadRoutes: () => void;
  createRoute: (data: Omit<TourRoute, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateRoute: (id: string, data: Partial<TourRoute>) => void;
  deleteRoute: (id: string) => void;
  duplicateRoute: (id: string) => string;
  getRouteById: (id: string) => TourRoute | undefined;

  startSession: (routeId: string) => GuideSession | null;
  pauseSession: () => void;
  resumeSession: () => void;
  addTimeToCurrent: (seconds: number) => void;
  nextPoint: (currentSeconds?: number) => void;
  prevPoint: () => void;
  endSession: (currentSeconds?: number) => void;
  getSessionById: (sessionId: string) => GuideSession | undefined;
}

type GuideStore = State & Actions;

export const useGuideStore = create<GuideStore>((set, get) => ({
  routes: [],
  currentRoute: null,
  activeSession: null,
  pastSessions: [],

  loadRoutes: () => {
    const storedRoutes = loadFromStorage<TourRoute[]>(
      STORAGE_KEYS.ROUTES,
      []
    );
    const storedActiveSession = loadFromStorage<GuideSession | null>(
      STORAGE_KEYS.CURRENT_SESSION,
      null
    );
    const storedPastSessions = loadFromStorage<GuideSession[]>(
      STORAGE_KEYS.SESSION_HISTORY,
      []
    );

    const routes = storedRoutes.length > 0 ? storedRoutes : sampleRoutes;
    if (storedRoutes.length === 0) {
      saveToStorage(STORAGE_KEYS.ROUTES, routes);
    }

    set({
      routes,
      activeSession: storedActiveSession,
      pastSessions: storedPastSessions,
    });
  },

  createRoute: (data) => {
    const now = Date.now();
    const newRoute: TourRoute = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const routes = [...get().routes, newRoute];
    set({ routes });
    saveToStorage(STORAGE_KEYS.ROUTES, routes);
    return newRoute.id;
  },

  updateRoute: (id, data) => {
    const routes = get().routes.map((route) =>
      route.id === id
        ? { ...route, ...data, updatedAt: Date.now() }
        : route
    );
    set({ routes });
    saveToStorage(STORAGE_KEYS.ROUTES, routes);

    const { currentRoute } = get();
    if (currentRoute && currentRoute.id === id) {
      const updated = routes.find((r) => r.id === id) || null;
      set({ currentRoute: updated });
    }
  },

  deleteRoute: (id) => {
    const routes = get().routes.filter((route) => route.id !== id);
    set({ routes });
    saveToStorage(STORAGE_KEYS.ROUTES, routes);

    const { currentRoute, activeSession } = get();
    if (currentRoute && currentRoute.id === id) {
      set({ currentRoute: null });
    }
    if (activeSession && activeSession.routeId === id) {
      set({ activeSession: null });
      saveToStorage(STORAGE_KEYS.CURRENT_SESSION, null);
    }
  },

  duplicateRoute: (id) => {
    const route = get().routes.find((r) => r.id === id);
    if (!route) return '';

    const now = Date.now();
    const newRoute: TourRoute = {
      ...route,
      id: generateId(),
      name: `${route.name} (副本)`,
      createdAt: now,
      updatedAt: now,
      points: route.points.map((p) => ({
        ...p,
        id: generateId(),
      })),
    };
    const routes = [...get().routes, newRoute];
    set({ routes });
    saveToStorage(STORAGE_KEYS.ROUTES, routes);
    return newRoute.id;
  },

  getRouteById: (id) => {
    return get().routes.find((route) => route.id === id);
  },

  startSession: (routeId) => {
    const route = get().routes.find((r) => r.id === routeId);
    if (!route || route.points.length === 0) return null;

    const sortedPoints = [...route.points].sort((a, b) => a.order - b.order);
    const pointSessions = sortedPoints.map(createPointSession);
    const totalPlannedDuration = sortedPoints.reduce(
      (sum, p) => sum + p.plannedDuration,
      0
    );

    const now = Date.now();
    pointSessions[0].startedAt = now;

    const session: GuideSession = {
      id: generateId(),
      routeId: route.id,
      routeName: route.name,
      pointSessions,
      currentPointIndex: 0,
      status: 'running',
      startedAt: now,
      endedAt: null,
      totalPlannedDuration,
      totalActualDuration: 0,
    };

    set({
      activeSession: session,
      currentRoute: route,
    });
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, session);
    return session;
  },

  pauseSession: () => {
    const { activeSession } = get();
    if (!activeSession || activeSession.status !== 'running') return;

    const updated: GuideSession = {
      ...activeSession,
      status: 'paused',
    };
    set({ activeSession: updated });
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, updated);
  },

  resumeSession: () => {
    const { activeSession } = get();
    if (!activeSession || activeSession.status !== 'paused') return;

    const updated: GuideSession = {
      ...activeSession,
      status: 'running',
    };
    set({ activeSession: updated });
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, updated);
  },

  addTimeToCurrent: (seconds) => {
    const { activeSession, currentRoute } = get();
    if (
      !activeSession ||
      !currentRoute ||
      activeSession.status === 'completed' ||
      activeSession.status === 'idle'
    )
      return;

    const { pointSessions, currentPointIndex } = activeSession;
    const updatedSessions = pointSessions.map((ps, idx) => {
      if (idx === currentPointIndex) {
        return {
          ...ps,
          adjustedDuration: ps.adjustedDuration + seconds,
          timeAdded: ps.timeAdded + seconds,
        };
      }
      return ps;
    });

    const compressed = compressDurations(
      updatedSessions,
      currentRoute.points,
      currentPointIndex,
      seconds
    );

    const updated: GuideSession = {
      ...activeSession,
      pointSessions: compressed,
    };
    set({ activeSession: updated });
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, updated);
  },

  nextPoint: (currentSeconds) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const { pointSessions, currentPointIndex } = activeSession;
    if (currentPointIndex >= pointSessions.length - 1) {
      get().endSession(currentSeconds);
      return;
    }

    const now = Date.now();
    const updatedSessions = pointSessions.map((ps, idx) => {
      if (idx === currentPointIndex) {
        return {
          ...ps,
          isCompleted: true,
          endedAt: now,
          actualDuration: currentSeconds ?? ps.actualDuration,
        };
      }
      if (idx === currentPointIndex + 1) {
        return {
          ...ps,
          startedAt: now,
        };
      }
      return ps;
    });

    const totalActual = updatedSessions.reduce(
      (sum, ps) => sum + (ps.actualDuration || 0),
      0
    );

    const updated: GuideSession = {
      ...activeSession,
      pointSessions: updatedSessions,
      currentPointIndex: currentPointIndex + 1,
      totalActualDuration: totalActual,
    };
    set({ activeSession: updated });
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, updated);
  },

  prevPoint: () => {
    const { activeSession } = get();
    if (!activeSession || activeSession.currentPointIndex <= 0) return;

    const { pointSessions, currentPointIndex } = activeSession;
    const now = Date.now();
    const updatedSessions = pointSessions.map((ps, idx) => {
      if (idx === currentPointIndex) {
        return {
          ...ps,
          startedAt: null,
          endedAt: null,
          isCompleted: false,
          actualDuration: 0,
        };
      }
      if (idx === currentPointIndex - 1) {
        return {
          ...ps,
          startedAt: now,
          endedAt: null,
          isCompleted: false,
        };
      }
      return ps;
    });

    const totalActual = updatedSessions.reduce(
      (sum, ps) => sum + (ps.actualDuration || 0),
      0
    );

    const updated: GuideSession = {
      ...activeSession,
      pointSessions: updatedSessions,
      currentPointIndex: currentPointIndex - 1,
      totalActualDuration: totalActual,
    };
    set({ activeSession: updated });
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, updated);
  },

  endSession: (currentSeconds) => {
    const { activeSession, pastSessions } = get();
    if (!activeSession) return;

    const now = Date.now();
    const updatedSessions = activeSession.pointSessions.map((ps, idx) => {
      if (idx <= activeSession.currentPointIndex && !ps.isCompleted) {
        return {
          ...ps,
          isCompleted: true,
          endedAt: now,
          actualDuration:
            idx === activeSession.currentPointIndex
              ? currentSeconds ?? ps.actualDuration
              : ps.actualDuration,
        };
      }
      return ps;
    });

    const totalActual = updatedSessions.reduce(
      (sum, ps) => sum + (ps.actualDuration || 0),
      0
    );

    const finalSession: GuideSession = {
      ...activeSession,
      pointSessions: updatedSessions,
      status: 'completed',
      endedAt: now,
      totalActualDuration: totalActual,
    };

    const newPastSessions = [finalSession, ...pastSessions];
    set({
      activeSession: null,
      pastSessions: newPastSessions,
    });
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, null);
    saveToStorage(STORAGE_KEYS.SESSION_HISTORY, newPastSessions);
  },

  getSessionById: (sessionId) => {
    const { activeSession, pastSessions } = get();
    if (activeSession && activeSession.id === sessionId) {
      return activeSession;
    }
    return pastSessions.find((s) => s.id === sessionId);
  },
}));

export default useGuideStore;
