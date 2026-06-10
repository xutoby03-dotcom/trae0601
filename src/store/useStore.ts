import { create } from 'zustand';
import type { Route, Checkin, RideEvent, Participant, RouteCategory } from '@/types';
import { mockRoutes, mockCheckins, mockRideEvents } from '@/utils/mockData';
import { generateId } from '@/utils/formatters';

interface StoreState {
  routes: Route[];
  checkins: Checkin[];
  rideEvents: RideEvent[];
  searchQuery: string;
  activeCategory: RouteCategory | 'all';

  setSearchQuery: (q: string) => void;
  setActiveCategory: (c: RouteCategory | 'all') => void;

  addRoute: (route: Omit<Route, 'id' | 'createdAt'>) => void;
  getRouteById: (id: string) => Route | undefined;

  addCheckin: (checkin: Omit<Checkin, 'id' | 'date'>) => void;
  getCheckinsByRouteId: (routeId: string) => Checkin[];

  addRideEvent: (event: Omit<RideEvent, 'id' | 'participants' | 'createdAt'>) => void;
  addParticipant: (eventId: string, participant: Omit<Participant, 'id' | 'eventId'>) => void;
  getEventsByRouteId: (routeId: string) => RideEvent[];
  getEventById: (id: string) => RideEvent | undefined;
}

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* empty */
  }
  return fallback;
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* empty */
  }
};

export const useStore = create<StoreState>((set, get) => ({
  routes: loadFromStorage('bike_routes', mockRoutes),
  checkins: loadFromStorage('bike_checkins', mockCheckins),
  rideEvents: loadFromStorage('bike_events', mockRideEvents),
  searchQuery: '',
  activeCategory: 'all',

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategory: (c) => set({ activeCategory: c }),

  addRoute: (route) => {
    const newRoute: Route = {
      ...route,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const routes = [...get().routes, newRoute];
    saveToStorage('bike_routes', routes);
    set({ routes });
  },

  getRouteById: (id) => get().routes.find((r) => r.id === id),

  addCheckin: (checkin) => {
    const newCheckin: Checkin = {
      ...checkin,
      id: generateId(),
      date: new Date().toISOString(),
    };
    const checkins = [...get().checkins, newCheckin];
    saveToStorage('bike_checkins', checkins);
    set({ checkins });
  },

  getCheckinsByRouteId: (routeId) =>
    get()
      .checkins.filter((c) => c.routeId === routeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

  addRideEvent: (event) => {
    const newEvent: RideEvent = {
      ...event,
      id: generateId(),
      participants: [],
      createdAt: new Date().toISOString(),
    };
    const rideEvents = [...get().rideEvents, newEvent];
    saveToStorage('bike_events', rideEvents);
    set({ rideEvents });
  },

  addParticipant: (eventId, participant) => {
    const rideEvents = get().rideEvents.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          participants: [
            ...e.participants,
            { ...participant, id: generateId(), eventId },
          ],
        };
      }
      return e;
    });
    saveToStorage('bike_events', rideEvents);
    set({ rideEvents });
  },

  getEventsByRouteId: (routeId) =>
    get()
      .rideEvents.filter((e) => e.routeId === routeId)
      .sort((a, b) => new Date(a.meetTime).getTime() - new Date(b.meetTime).getTime()),

  getEventById: (id) => get().rideEvents.find((e) => e.id === id),
}));
