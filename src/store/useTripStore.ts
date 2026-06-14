import { create } from 'zustand';
import type { Trip, Passenger, Expense, TripSettings, ExpenseType } from '@/types';
import { loadTripsFromStorage, saveTripsToStorage } from '@/utils/storage';
import { generateId } from '@/utils/calculation';
import { mockTrips } from '@/data/mockData';

interface TripState {
  trips: Trip[];
  isLoaded: boolean;
  
  loadTrips: () => void;
  getTrip: (id: string) => Trip | undefined;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'passengers' | 'expenses' | 'settings'> & { passengers?: Passenger[] }) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  
  addPassenger: (tripId: string, passenger: Omit<Passenger, 'id' | 'shareRatio'>) => void;
  updatePassenger: (tripId: string, passengerId: string, updates: Partial<Passenger>) => void;
  deletePassenger: (tripId: string, passengerId: string) => void;
  
  addExpense: (tripId: string, expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (tripId: string, expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  
  updateSettings: (tripId: string, updates: Partial<TripSettings>) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  isLoaded: false,

  loadTrips: () => {
    let stored = loadTripsFromStorage();
    if (stored.length === 0) {
      stored = mockTrips;
      saveTripsToStorage(stored);
    }
    set({ trips: stored, isLoaded: true });
  },

  getTrip: (id: string) => {
    return get().trips.find(t => t.id === id);
  },

  addTrip: (tripData) => {
    const newTrip: Trip = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      passengers: tripData.passengers || [],
      expenses: [],
      settings: {
        tripId: '',
        hasDriverSubsidy: false,
        driverSubsidyAmount: 0,
        driverSubsidyType: 'fixed',
        childFree: true,
        halfWayRatio: 0.5,
      },
      destination: tripData.destination,
      departureTime: tripData.departureTime,
      driverName: tripData.driverName,
      vehicleInfo: tripData.vehicleInfo,
      kilometers: tripData.kilometers,
      photoUrl: tripData.photoUrl,
    };
    newTrip.settings.tripId = newTrip.id;
    
    set((state) => {
      const newTrips = [newTrip, ...state.trips];
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
    
    return newTrip.id;
  },

  updateTrip: (id, updates) => {
    set((state) => {
      const newTrips = state.trips.map(trip =>
        trip.id === id ? { ...trip, ...updates } : trip
      );
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  deleteTrip: (id) => {
    set((state) => {
      const newTrips = state.trips.filter(trip => trip.id !== id);
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  addPassenger: (tripId, passenger) => {
    set((state) => {
      const newTrips = state.trips.map(trip => {
        if (trip.id !== tripId) return trip;
        const newPassenger: Passenger = {
          id: generateId(),
          shareRatio: 1,
          ...passenger,
        };
        return {
          ...trip,
          passengers: [...trip.passengers, newPassenger],
        };
      });
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  updatePassenger: (tripId, passengerId, updates) => {
    set((state) => {
      const newTrips = state.trips.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          passengers: trip.passengers.map(p =>
            p.id === passengerId ? { ...p, ...updates } : p
          ),
        };
      });
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  deletePassenger: (tripId, passengerId) => {
    set((state) => {
      const newTrips = state.trips.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          passengers: trip.passengers.filter(p => p.id !== passengerId),
        };
      });
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  addExpense: (tripId, expense) => {
    set((state) => {
      const newTrips = state.trips.map(trip => {
        if (trip.id !== tripId) return trip;
        const newExpense: Expense = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...expense,
        };
        return {
          ...trip,
          expenses: [newExpense, ...trip.expenses],
        };
      });
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  updateExpense: (tripId, expenseId, updates) => {
    set((state) => {
      const newTrips = state.trips.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          expenses: trip.expenses.map(e =>
            e.id === expenseId ? { ...e, ...updates } : e
          ),
        };
      });
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  deleteExpense: (tripId, expenseId) => {
    set((state) => {
      const newTrips = state.trips.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          expenses: trip.expenses.filter(e => e.id !== expenseId),
        };
      });
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },

  updateSettings: (tripId, updates) => {
    set((state) => {
      const newTrips = state.trips.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          settings: { ...trip.settings, ...updates },
        };
      });
      saveTripsToStorage(newTrips);
      return { trips: newTrips };
    });
  },
}));
