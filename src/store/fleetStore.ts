import { create } from 'zustand';
import { Vehicle, Person, Passenger, Equipment, ItineraryStep, EventRecord, Expense, Warning, PersonSettlement } from '../types';
import { mockVehicles, mockPeople, mockPassengers, mockEquipment, mockItinerary, mockEvents, mockExpenses } from '../utils/mockData';

const STORAGE_KEY = 'fleet_planner_data';

interface FleetState {
  vehicles: Vehicle[];
  people: Person[];
  passengers: Passenger[];
  equipment: Equipment[];
  itinerary: ItineraryStep[];
  events: EventRecord[];
  expenses: Expense[];

  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;

  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  removePerson: (id: string) => void;

  addPassenger: (passenger: Omit<Passenger, 'id'>) => void;
  updatePassenger: (id: string, passenger: Partial<Passenger>) => void;
  removePassenger: (id: string) => void;
  assignPassenger: (personId: string, vehicleId: string | null) => void;

  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  assignEquipment: (equipmentId: string, vehicleId: string | null) => void;

  addItineraryStep: (step: Omit<ItineraryStep, 'id'>) => void;
  updateItineraryStep: (id: string, step: Partial<ItineraryStep>) => void;
  removeItineraryStep: (id: string) => void;
  reorderItinerary: (fromIndex: number, toIndex: number) => void;

  addEvent: (event: Omit<EventRecord, 'id'>) => void;
  updateEvent: (id: string, event: Partial<EventRecord>) => void;
  removeEvent: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  removeExpense: (id: string) => void;

  getWarnings: () => Warning[];
  getVehiclePassengers: (vehicleId: string) => Person[];
  getVehicleEquipment: (vehicleId: string) => Equipment[];
  getUsedSeats: (vehicleId: string) => number;
  getUsedTrunkSpace: (vehicleId: string) => number;
  getPersonSettlement: () => PersonSettlement[];
  getTotalExpenses: () => number;
  resetAll: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 11);

const loadInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // ignore
  }
  return {
    vehicles: mockVehicles,
    people: mockPeople,
    passengers: mockPassengers,
    equipment: mockEquipment,
    itinerary: mockItinerary,
    events: mockEvents,
    expenses: mockExpenses,
  };
};

const saveState = (state: Partial<FleetState>) => {
  try {
    const data = {
      vehicles: state.vehicles,
      people: state.people,
      passengers: state.passengers,
      equipment: state.equipment,
      itinerary: state.itinerary,
      events: state.events,
      expenses: state.expenses,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
};

export const useFleetStore = create<FleetState>((set, get) => {
  const initial = loadInitialState();
  return {
    vehicles: initial.vehicles,
    people: initial.people,
    passengers: initial.passengers,
    equipment: initial.equipment,
    itinerary: initial.itinerary,
    events: initial.events,
    expenses: initial.expenses,

    addVehicle: (vehicle) => set((s) => {
      const newVehicle = { ...vehicle, id: generateId() };
      const newVehicles = [...s.vehicles, newVehicle];
      saveState({ ...s, vehicles: newVehicles });
      return { vehicles: newVehicles };
    }),
    updateVehicle: (id, vehicle) => set((s) => {
      const newVehicles = s.vehicles.map((v) => (v.id === id ? { ...v, ...vehicle } : v));
      saveState({ ...s, vehicles: newVehicles });
      return { vehicles: newVehicles };
    }),
    removeVehicle: (id) => set((s) => {
      const newVehicles = s.vehicles.filter((v) => v.id !== id);
      const newPassengers = s.passengers.filter((p) => p.vehicleId !== id);
      const newEquipment = s.equipment.map((e) => (e.vehicleId === id ? { ...e, vehicleId: null } : e));
      saveState({ ...s, vehicles: newVehicles, passengers: newPassengers, equipment: newEquipment });
      return { vehicles: newVehicles, passengers: newPassengers, equipment: newEquipment };
    }),

    addPerson: (person) => set((s) => {
      const newPerson = { ...person, id: generateId() };
      const newPeople = [...s.people, newPerson];
      saveState({ ...s, people: newPeople });
      return { people: newPeople };
    }),
    updatePerson: (id, person) => set((s) => {
      const newPeople = s.people.map((p) => (p.id === id ? { ...p, ...person } : p));
      saveState({ ...s, people: newPeople });
      return { people: newPeople };
    }),
    removePerson: (id) => set((s) => {
      const newPeople = s.people.filter((p) => p.id !== id);
      const newPassengers = s.passengers.filter((p) => p.personId !== id);
      const newExpenses = s.expenses.map((e) => (e.payerId === id ? { ...e, payerId: '' } : e));
      saveState({ ...s, people: newPeople, passengers: newPassengers, expenses: newExpenses });
      return { people: newPeople, passengers: newPassengers, expenses: newExpenses };
    }),

    addPassenger: (passenger) => set((s) => {
      const newPassenger = { ...passenger, id: generateId() };
      const newPassengers = [...s.passengers, newPassenger];
      saveState({ ...s, passengers: newPassengers });
      return { passengers: newPassengers };
    }),
    updatePassenger: (id, passenger) => set((s) => {
      const newPassengers = s.passengers.map((p) => (p.id === id ? { ...p, ...passenger } : p));
      saveState({ ...s, passengers: newPassengers });
      return { passengers: newPassengers };
    }),
    removePassenger: (id) => set((s) => {
      const newPassengers = s.passengers.filter((p) => p.id !== id);
      saveState({ ...s, passengers: newPassengers });
      return { passengers: newPassengers };
    }),
    assignPassenger: (personId, vehicleId) => set((s) => {
      const existing = s.passengers.find((p) => p.personId === personId);
      let newPassengers;
      if (vehicleId === null) {
        newPassengers = s.passengers.filter((p) => p.personId !== personId);
      } else if (existing) {
        newPassengers = s.passengers.map((p) =>
          p.personId === personId ? { ...p, vehicleId } : p
        );
      } else {
        newPassengers = [
          ...s.passengers,
          { id: generateId(), personId, vehicleId, isDriver: false },
        ];
      }
      saveState({ ...s, passengers: newPassengers });
      return { passengers: newPassengers };
    }),

    addEquipment: (equipment) => set((s) => {
      const newEquipment = { ...equipment, id: generateId() };
      const newEquipments = [...s.equipment, newEquipment];
      saveState({ ...s, equipment: newEquipments });
      return { equipment: newEquipments };
    }),
    updateEquipment: (id, equipment) => set((s) => {
      const newEquipments = s.equipment.map((e) => (e.id === id ? { ...e, ...equipment } : e));
      saveState({ ...s, equipment: newEquipments });
      return { equipment: newEquipments };
    }),
    removeEquipment: (id) => set((s) => {
      const newEquipments = s.equipment.filter((e) => e.id !== id);
      saveState({ ...s, equipment: newEquipments });
      return { equipment: newEquipments };
    }),
    assignEquipment: (equipmentId, vehicleId) => set((s) => {
      const newEquipments = s.equipment.map((e) =>
        e.id === equipmentId ? { ...e, vehicleId } : e
      );
      saveState({ ...s, equipment: newEquipments });
      return { equipment: newEquipments };
    }),

    addItineraryStep: (step) => set((s) => {
      const newStep = { ...step, id: generateId() };
      const newItinerary = [...s.itinerary, newStep].sort((a, b) => a.order - b.order);
      saveState({ ...s, itinerary: newItinerary });
      return { itinerary: newItinerary };
    }),
    updateItineraryStep: (id, step) => set((s) => {
      const newItinerary = s.itinerary.map((i) => (i.id === id ? { ...i, ...step } : i));
      saveState({ ...s, itinerary: newItinerary });
      return { itinerary: newItinerary };
    }),
    removeItineraryStep: (id) => set((s) => {
      const newItinerary = s.itinerary.filter((i) => i.id !== id);
      saveState({ ...s, itinerary: newItinerary });
      return { itinerary: newItinerary };
    }),
    reorderItinerary: (fromIndex, toIndex) => set((s) => {
      const items = [...s.itinerary.sort((a, b) => a.order - b.order)];
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      const newItinerary = items.map((item, idx) => ({ ...item, order: idx }));
      saveState({ ...s, itinerary: newItinerary });
      return { itinerary: newItinerary };
    }),

    addEvent: (event) => set((s) => {
      const newEvent = { ...event, id: generateId() };
      const newEvents = [...s.events, newEvent];
      saveState({ ...s, events: newEvents });
      return { events: newEvents };
    }),
    updateEvent: (id, event) => set((s) => {
      const newEvents = s.events.map((e) => (e.id === id ? { ...e, ...event } : e));
      saveState({ ...s, events: newEvents });
      return { events: newEvents };
    }),
    removeEvent: (id) => set((s) => {
      const newEvents = s.events.filter((e) => e.id !== id);
      saveState({ ...s, events: newEvents });
      return { events: newEvents };
    }),

    addExpense: (expense) => set((s) => {
      const newExpense = { ...expense, id: generateId() };
      const newExpenses = [...s.expenses, newExpense];
      saveState({ ...s, expenses: newExpenses });
      return { expenses: newExpenses };
    }),
    updateExpense: (id, expense) => set((s) => {
      const newExpenses = s.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e));
      saveState({ ...s, expenses: newExpenses });
      return { expenses: newExpenses };
    }),
    removeExpense: (id) => set((s) => {
      const newExpenses = s.expenses.filter((e) => e.id !== id);
      saveState({ ...s, expenses: newExpenses });
      return { expenses: newExpenses };
    }),

    getWarnings: () => {
      const state = get();
      const warnings: Warning[] = [];

      state.vehicles.forEach((v) => {
        const used = state.passengers.filter((p) => p.vehicleId === v.id).length;
        if (used > v.totalSeats) {
          warnings.push({
            id: `overload-${v.id}`,
            type: 'overload',
            level: 'error',
            message: `${v.carModel} (${v.driverName}) 超载！已分配${used}人，限额${v.totalSeats}座`,
            vehicleId: v.id,
          });
        }

        const usedSpace = state.equipment
          .filter((e) => e.vehicleId === v.id)
          .reduce((sum, e) => sum + e.size, 0);
        if (usedSpace > v.trunkSpace) {
          warnings.push({
            id: `trunk-${v.id}`,
            type: 'trunk_full',
            level: 'warning',
            message: `${v.carModel} 后备箱空间不足！已用${usedSpace}L，容量${v.trunkSpace}L`,
            vehicleId: v.id,
          });
        }
      });

      state.equipment
        .filter((e) => e.isCritical && e.vehicleId === null)
        .forEach((e) => {
          warnings.push({
            id: `equip-${e.id}`,
            type: 'critical_equipment',
            level: 'error',
            message: `关键装备「${e.name}」未分配到任何车辆！`,
            equipmentId: e.id,
          });
        });

      return warnings;
    },

    getVehiclePassengers: (vehicleId) => {
      const state = get();
      const passengerRecords = state.passengers.filter((p) => p.vehicleId === vehicleId);
      return passengerRecords
        .map((pr) => state.people.find((p) => p.id === pr.personId))
        .filter(Boolean) as Person[];
    },

    getVehicleEquipment: (vehicleId) => {
      const state = get();
      return state.equipment.filter((e) => e.vehicleId === vehicleId);
    },

    getUsedSeats: (vehicleId) => {
      const state = get();
      return state.passengers.filter((p) => p.vehicleId === vehicleId).length;
    },

    getUsedTrunkSpace: (vehicleId) => {
      const state = get();
      return state.equipment
        .filter((e) => e.vehicleId === vehicleId)
        .reduce((sum, e) => sum + e.size, 0);
    },

    getPersonSettlement: () => {
      const state = get();
      const total = state.expenses.reduce((sum, e) => sum + e.amount, 0);
      const personCount = state.people.length;
      const perPerson = personCount > 0 ? total / personCount : 0;

      return state.people.map((p) => {
        const paid = state.expenses
          .filter((e) => e.payerId === p.id)
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          personId: p.id,
          name: p.name,
          paid,
          shouldPay: perPerson,
          balance: paid - perPerson,
        };
      });
    },

    getTotalExpenses: () => {
      return get().expenses.reduce((sum, e) => sum + e.amount, 0);
    },

    resetAll: () => {
      localStorage.removeItem(STORAGE_KEY);
      const initial = loadInitialState();
      set(initial);
    },
  };
});
