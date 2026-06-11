import { create } from 'zustand';
import type { HaircutEvent, TimeSlot } from '@/types';
import { generateId, generateTimeSlots } from '@/utils/time';
import { getFromStorage, setToStorage } from '@/utils/storage';
import { mockEvents } from '@/data/mockData';

interface EventState {
  events: HaircutEvent[];
  timeSlots: Record<string, TimeSlot[]>;
  currentEventId: string | null;
  
  initEvents: () => void;
  getEvent: (id: string) => HaircutEvent | undefined;
  getTimeSlots: (eventId: string) => TimeSlot[];
  createEvent: (data: Omit<HaircutEvent, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => HaircutEvent;
  updateEvent: (id: string, data: Partial<HaircutEvent>) => void;
  deleteEvent: (id: string) => void;
  setCurrentEvent: (id: string | null) => void;
  getTodayEvents: () => HaircutEvent[];
  getUpcomingEvents: () => HaircutEvent[];
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  timeSlots: {},
  currentEventId: null,

  initEvents: () => {
    const storedEvents = getFromStorage<HaircutEvent[]>('events', []);
    const storedSlots = getFromStorage<Record<string, TimeSlot[]>>('timeSlots', {});
    
    if (storedEvents.length === 0) {
      const events = mockEvents;
      const slots: Record<string, TimeSlot[]> = {};
      
      events.forEach(event => {
        const generatedSlots = generateTimeSlots(
          event.startTime,
          event.endTime,
          event.durationPerPerson,
          event.barberCount
        );
        slots[event.id] = generatedSlots.map((s, index) => ({
          id: `slot-${event.id}-${index}`,
          eventId: event.id,
          time: s.time,
          capacity: s.capacity,
          bookedCount: 0,
        }));
      });
      
      set({ events, timeSlots: slots });
      setToStorage('events', events);
      setToStorage('timeSlots', slots);
      
      const todayEvents = events.filter(e => {
        const today = new Date().toISOString().split('T')[0];
        return e.date === today;
      });
      if (todayEvents.length > 0) {
        set({ currentEventId: todayEvents[0].id });
      }
    } else {
      set({ events: storedEvents, timeSlots: storedSlots });
      
      const todayEvents = storedEvents.filter(e => {
        const today = new Date().toISOString().split('T')[0];
        return e.date === today;
      });
      if (todayEvents.length > 0) {
        set({ currentEventId: todayEvents[0].id });
      }
    }
  },

  getEvent: (id: string) => {
    return get().events.find(e => e.id === id);
  },

  getTimeSlots: (eventId: string) => {
    return get().timeSlots[eventId] || [];
  },

  createEvent: (data) => {
    const newEvent: HaircutEvent = {
      ...data,
      id: generateId(),
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const slots = generateTimeSlots(
      data.startTime,
      data.endTime,
      data.durationPerPerson,
      data.barberCount
    ).map((s, index) => ({
      id: `slot-${newEvent.id}-${index}`,
      eventId: newEvent.id,
      time: s.time,
      capacity: s.capacity,
      bookedCount: 0,
    }));

    const newEvents = [...get().events, newEvent];
    const newTimeSlots = { ...get().timeSlots, [newEvent.id]: slots };

    set({ events: newEvents, timeSlots: newTimeSlots });
    setToStorage('events', newEvents);
    setToStorage('timeSlots', newTimeSlots);

    return newEvent;
  },

  updateEvent: (id: string, data: Partial<HaircutEvent>) => {
    const updatedEvents = get().events.map(e =>
      e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
    );
    set({ events: updatedEvents });
    setToStorage('events', updatedEvents);
  },

  deleteEvent: (id: string) => {
    const newEvents = get().events.filter(e => e.id !== id);
    const newTimeSlots = { ...get().timeSlots };
    delete newTimeSlots[id];
    
    set({ events: newEvents, timeSlots: newTimeSlots });
    setToStorage('events', newEvents);
    setToStorage('timeSlots', newTimeSlots);
    
    if (get().currentEventId === id) {
      set({ currentEventId: null });
    }
  },

  setCurrentEvent: (id: string | null) => {
    set({ currentEventId: id });
  },

  getTodayEvents: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().events.filter(e => e.date === today);
  },

  getUpcomingEvents: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().events
      .filter(e => e.date >= today && e.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date));
  },
}));
