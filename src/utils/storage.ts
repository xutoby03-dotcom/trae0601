import type { Trip, Expense, Passenger, TripSettings } from '@/types';

const STORAGE_KEY = 'carpool_trips';
const STORAGE_VERSION_KEY = 'carpool_trips_version';
const CURRENT_VERSION = 6;

function migratePassenger(p: any): Passenger {
  return {
    id: p.id,
    name: p.name ?? '',
    avatar: p.avatar,
    isChild: !!p.isChild,
    isHalfWay: !!p.isHalfWay,
    shareRatio: typeof p.shareRatio === 'number' ? p.shareRatio : p.isChild ? 0 : p.isHalfWay ? 0.5 : 1,
  };
}

function migrateExpense(e: any): Expense {
  return {
    id: e.id,
    tripId: e.tripId,
    type: e.type,
    amount: typeof e.amount === 'number' ? e.amount : 0,
    payerId: e.payerId,
    isSplit: e.isSplit !== false,
    receiptUrl: e.receiptUrl,
    note: e.note,
    createdAt: e.createdAt ?? new Date().toISOString(),
  };
}

function migrateSettings(s: any, tripId: string): TripSettings {
  const settings = s ?? {};
  return {
    tripId,
    hasDriverSubsidy: !!settings.hasDriverSubsidy,
    driverSubsidyAmount: typeof settings.driverSubsidyAmount === 'number' ? settings.driverSubsidyAmount : 0,
    driverSubsidyType: settings.driverSubsidyType === 'percentage' ? 'percentage' : 'fixed',
    childFree: settings.childFree !== false,
    halfWayRatio: typeof settings.halfWayRatio === 'number' ? settings.halfWayRatio : 0.5,
  };
}

function migrateTrip(raw: any): Trip {
  const id = raw.id;
  const passengers = Array.isArray(raw.passengers) ? raw.passengers.map(migratePassenger) : [];
  const expenses = Array.isArray(raw.expenses) ? raw.expenses.map(migrateExpense) : [];
  return {
    id,
    destination: raw.destination ?? '',
    departureTime: raw.departureTime ?? new Date().toISOString(),
    driverName: raw.driverName ?? '',
    vehicleInfo: raw.vehicleInfo ?? '',
    kilometers: typeof raw.kilometers === 'number' ? raw.kilometers : 0,
    photoUrl: raw.photoUrl,
    passengers,
    expenses,
    settings: migrateSettings(raw.settings, id),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export function loadTripsFromStorage(): Trip[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    const migrated = parsed
      .filter(t => t && t.id)
      .map(migrateTrip);

    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (storedVersion !== String(CURRENT_VERSION)) {
      saveTripsToStorage(migrated);
    }

    return migrated;
  } catch (e) {
    console.error('Failed to load trips from localStorage:', e);
    return [];
  }
}

export function saveTripsToStorage(trips: Trip[]): void {
  try {
    localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trips to localStorage:', e);
  }
}
