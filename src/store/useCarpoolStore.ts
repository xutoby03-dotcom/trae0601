import { create } from 'zustand';
import type { User, Route, Booking, RouteStatus, BookingStatus, DestinationStat, RouteFormData, BookingFormData } from '@/types';
import { generateId, isToday } from '@/utils/helpers';
import { loadRoutes, loadBookings, loadCurrentUser, saveRoutes, saveBookings, saveCurrentUser } from '@/utils/storage';
import { mockRoutes, mockBookings, defaultCurrentUser, mockUsers } from '@/utils/mockData';

interface CarpoolStore {
  routes: Route[];
  bookings: Booking[];
  currentUser: User;
  users: User[];

  initData: () => void;

  addRoute: (routeData: RouteFormData) => void;
  updateRouteStatus: (routeId: string, status: RouteStatus) => void;
  getRouteById: (id: string) => Route | undefined;
  getTodayRoutes: () => Route[];
  getOpenRoutes: () => Route[];
  getMyRoutes: () => Route[];

  addBooking: (routeId: string, bookingData: BookingFormData) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  confirmAllPassengers: (routeId: string) => void;
  markNoShow: (bookingId: string) => void;
  getPendingBookings: () => Booking[];
  getBookingsByRouteId: (routeId: string) => Booking[];
  getMyBookings: () => Booking[];

  getDestinationStats: () => DestinationStat[];
  getNoShowList: () => User[];
  getChildSeatBookings: () => Booking[];

  checkAndUpdateFullStatus: (routeId: string) => void;
  cancelRoute: (routeId: string) => void;
  cancelBooking: (bookingId: string) => void;
}

export const useCarpoolStore = create<CarpoolStore>((set, get) => ({
  routes: [],
  bookings: [],
  currentUser: defaultCurrentUser,
  users: mockUsers,

  initData: () => {
    const storedRoutes = loadRoutes<Route[]>([]);
    const storedBookings = loadBookings<Booking[]>([]);
    const storedUser = loadCurrentUser<User | null>(null);

    if (storedRoutes.length === 0 && storedBookings.length === 0) {
      set({
        routes: mockRoutes,
        bookings: mockBookings,
        currentUser: storedUser || defaultCurrentUser
      });
      saveRoutes(mockRoutes);
      saveBookings(mockBookings);
      if (!storedUser) {
        saveCurrentUser(defaultCurrentUser);
      }
    } else {
      set({
        routes: storedRoutes,
        bookings: storedBookings,
        currentUser: storedUser || defaultCurrentUser
      });
    }
  },

  addRoute: (routeData: RouteFormData) => {
    const { currentUser } = get();
    const newRoute: Route = {
      id: generateId(),
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ...routeData,
      availableSeats: routeData.totalSeats,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const newRoutes = [...state.routes, newRoute];
      saveRoutes(newRoutes);
      return { routes: newRoutes };
    });
  },

  updateRouteStatus: (routeId: string, status: RouteStatus) => {
    set((state) => {
      const newRoutes = state.routes.map((r) =>
        r.id === routeId ? { ...r, status } : r
      );
      saveRoutes(newRoutes);
      return { routes: newRoutes };
    });
  },

  getRouteById: (id: string) => {
    return get().routes.find((r) => r.id === id);
  },

  getTodayRoutes: () => {
    return get().routes.filter((r) => isToday(r.departureTime));
  },

  getOpenRoutes: () => {
    return get().routes.filter((r) => r.status === 'open');
  },

  getMyRoutes: () => {
    const { currentUser } = get();
    return get().routes.filter((r) => r.ownerId === currentUser.id);
  },

  addBooking: (routeId: string, bookingData: BookingFormData) => {
    const { currentUser } = get();
    const newBooking: Booking = {
      id: generateId(),
      routeId,
      passengerId: currentUser.id,
      passengerName: currentUser.name,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const newBookings = [...state.bookings, newBooking];
      saveBookings(newBookings);
      return { bookings: newBookings };
    });

    get().checkAndUpdateFullStatus(routeId);
  },

  updateBookingStatus: (bookingId: string, status: BookingStatus) => {
    set((state) => {
      const newBookings = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      );
      saveBookings(newBookings);
      return { bookings: newBookings };
    });

    const booking = get().bookings.find((b) => b.id === bookingId);
    if (booking) {
      get().checkAndUpdateFullStatus(booking.routeId);

      if (status === 'no_show') {
        set((state) => {
          const newUsers = state.users.map((u) =>
            u.id === booking.passengerId
              ? { ...u, noShowCount: u.noShowCount + 1 }
              : u
          );
          return { users: newUsers };
        });
      }
    }
  },

  confirmAllPassengers: (routeId: string) => {
    set((state) => {
      const newBookings = state.bookings.map((b) =>
        b.routeId === routeId && b.status === 'confirmed'
          ? { ...b, status: 'completed' as const }
          : b
      );
      saveBookings(newBookings);
      return { bookings: newBookings };
    });

    get().updateRouteStatus(routeId, 'completed');
  },

  markNoShow: (bookingId: string) => {
    get().updateBookingStatus(bookingId, 'no_show');
  },

  getPendingBookings: () => {
    const { currentUser, routes } = get();
    const myRouteIds = routes
      .filter((r) => r.ownerId === currentUser.id)
      .map((r) => r.id);

    return get().bookings.filter(
      (b) => b.status === 'pending' && myRouteIds.includes(b.routeId)
    );
  },

  getBookingsByRouteId: (routeId: string) => {
    return get().bookings.filter((b) => b.routeId === routeId);
  },

  getMyBookings: () => {
    const { currentUser } = get();
    return get().bookings.filter((b) => b.passengerId === currentUser.id);
  },

  getDestinationStats: () => {
    const { routes } = get();
    const stats: Record<string, number> = {};

    routes.forEach((r) => {
      stats[r.destination] = (stats[r.destination] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },

  getNoShowList: () => {
    return get().users.filter((u) => u.noShowCount > 0);
  },

  getChildSeatBookings: () => {
    return get().bookings.filter(
      (b) => b.hasElderlyOrChild && b.status !== 'cancelled' && b.status !== 'rejected'
    );
  },

  checkAndUpdateFullStatus: (routeId: string) => {
    const route = get().getRouteById(routeId);
    if (!route) return;

    const confirmedBookings = get()
      .getBookingsByRouteId(routeId)
      .filter((b) => b.status === 'confirmed');

    const totalPassengers = confirmedBookings.reduce(
      (sum, b) => sum + b.passengerCount,
      0
    );

    const newAvailableSeats = route.totalSeats - totalPassengers;

    set((state) => {
      const newRoutes = state.routes.map((r) => {
        if (r.id === routeId) {
          const updatedRoute = {
            ...r,
            availableSeats: Math.max(0, newAvailableSeats)
          };
          if (newAvailableSeats <= 0 && r.status === 'open') {
            updatedRoute.status = 'full';
          }
          return updatedRoute;
        }
        return r;
      });
      saveRoutes(newRoutes);
      return { routes: newRoutes };
    });
  },

  cancelRoute: (routeId: string) => {
    get().updateRouteStatus(routeId, 'cancelled');

    set((state) => {
      const newBookings = state.bookings.map((b) =>
        b.routeId === routeId &&
        (b.status === 'pending' || b.status === 'confirmed')
          ? { ...b, status: 'cancelled' as const }
          : b
      );
      saveBookings(newBookings);
      return { bookings: newBookings };
    });
  },

  cancelBooking: (bookingId: string) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (booking) {
      get().updateBookingStatus(bookingId, 'cancelled');
    }
  }
}));
