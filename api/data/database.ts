import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GardenBed, Volunteer, Schedule, CheckIn, Anomaly, Weather } from '../../shared/types.js';
import {
  generateGardenBeds,
  generateVolunteers,
  generateSchedules,
  generateCheckIns,
  generateAnomalies,
  generateWeather,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

interface Database {
  gardenBeds: GardenBed[];
  volunteers: Volunteer[];
  schedules: Schedule[];
  checkIns: CheckIn[];
  anomalies: Anomaly[];
  weather: Weather;
}

const initDatabase = (): Database => {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch {
      console.error('Failed to read database, regenerating...');
    }
  }
  
  const initialData: Database = {
    gardenBeds: generateGardenBeds(),
    volunteers: generateVolunteers(),
    schedules: generateSchedules(),
    checkIns: generateCheckIns(),
    anomalies: generateAnomalies(),
    weather: generateWeather(),
  };
  
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  return initialData;
};

let db: Database = initDatabase();

const saveDatabase = (): void => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

export const getGardenBeds = (): GardenBed[] => db.gardenBeds;

export const getGardenBedById = (id: string): GardenBed | undefined => {
  return db.gardenBeds.find(bed => bed.id === id);
};

export const createGardenBed = (bed: Omit<GardenBed, 'id'>): GardenBed => {
  const newBed: GardenBed = {
    ...bed,
    id: `gb-${String(db.gardenBeds.length + 1).padStart(3, '0')}`,
  };
  db.gardenBeds.push(newBed);
  saveDatabase();
  return newBed;
};

export const updateGardenBed = (id: string, updates: Partial<GardenBed>): GardenBed | undefined => {
  const index = db.gardenBeds.findIndex(bed => bed.id === id);
  if (index === -1) return undefined;
  
  db.gardenBeds[index] = { ...db.gardenBeds[index], ...updates };
  saveDatabase();
  return db.gardenBeds[index];
};

export const deleteGardenBed = (id: string): boolean => {
  const index = db.gardenBeds.findIndex(bed => bed.id === id);
  if (index === -1) return false;
  
  db.gardenBeds.splice(index, 1);
  saveDatabase();
  return true;
};

export const getVolunteers = (): Volunteer[] => db.volunteers;

export const getVolunteerById = (id: string): Volunteer | undefined => {
  return db.volunteers.find(v => v.id === id);
};

export const getSchedules = (date?: string): Schedule[] => {
  if (!date) return db.schedules;
  return db.schedules.filter(s => s.scheduledDate === date);
};

export const getScheduleById = (id: string): Schedule | undefined => {
  return db.schedules.find(s => s.id === id);
};

export const createSchedule = (schedule: Omit<Schedule, 'id'>): Schedule => {
  const newSchedule: Schedule = {
    ...schedule,
    id: `sch-${String(db.schedules.length + 1).padStart(3, '0')}`,
  };
  db.schedules.push(newSchedule);
  saveDatabase();
  return newSchedule;
};

export const claimSchedule = (scheduleId: string, volunteerId: string): Schedule | undefined => {
  const schedule = db.schedules.find(s => s.id === scheduleId);
  if (!schedule || schedule.status !== 'unclaimed') return undefined;
  
  schedule.volunteerId = volunteerId;
  schedule.status = 'claimed';
  saveDatabase();
  return schedule;
};

export const updateSchedule = (id: string, updates: Partial<Schedule>): Schedule | undefined => {
  const index = db.schedules.findIndex(s => s.id === id);
  if (index === -1) return undefined;
  
  db.schedules[index] = { ...db.schedules[index], ...updates };
  saveDatabase();
  return db.schedules[index];
};

export const getCheckIns = (gardenBedId?: string): CheckIn[] => {
  if (!gardenBedId) return db.checkIns;
  return db.checkIns.filter(c => c.gardenBedId === gardenBedId);
};

export const getCheckInById = (id: string): CheckIn | undefined => {
  return db.checkIns.find(c => c.id === id);
};

export const createCheckIn = (checkIn: Omit<CheckIn, 'id'>): CheckIn => {
  const newCheckIn: CheckIn = {
    ...checkIn,
    id: `chk-${String(db.checkIns.length + 1).padStart(3, '0')}`,
  };
  db.checkIns.push(newCheckIn);
  
  const gardenBed = db.gardenBeds.find(b => b.id === checkIn.gardenBedId);
  if (gardenBed) {
    gardenBed.lastWateredAt = checkIn.checkInTime;
  }
  
  const volunteer = db.volunteers.find(v => v.id === checkIn.volunteerId);
  if (volunteer) {
    volunteer.totalWaterings++;
  }
  
  if (checkIn.scheduleId) {
    const schedule = db.schedules.find(s => s.id === checkIn.scheduleId);
    if (schedule) {
      schedule.status = 'completed';
    }
  }
  
  saveDatabase();
  return newCheckIn;
};

export const getAnomalies = (resolved?: boolean): Anomaly[] => {
  if (resolved === undefined) return db.anomalies;
  return db.anomalies.filter(a => a.resolved === resolved);
};

export const getAnomalyById = (id: string): Anomaly | undefined => {
  return db.anomalies.find(a => a.id === id);
};

export const createAnomaly = (anomaly: Omit<Anomaly, 'id'>): Anomaly => {
  const newAnomaly: Anomaly = {
    ...anomaly,
    id: `anm-${String(db.anomalies.length + 1).padStart(3, '0')}`,
  };
  db.anomalies.push(newAnomaly);
  saveDatabase();
  return newAnomaly;
};

export const resolveAnomaly = (id: string, resolvedBy: string): Anomaly | undefined => {
  const anomaly = db.anomalies.find(a => a.id === id);
  if (!anomaly) return undefined;
  
  anomaly.resolved = true;
  anomaly.resolvedAt = new Date().toISOString();
  anomaly.resolvedBy = resolvedBy;
  saveDatabase();
  return anomaly;
};

export const getWeather = (): Weather => db.weather;

export const updateWeather = (weather: Partial<Weather>): Weather => {
  db.weather = { ...db.weather, ...weather };
  saveDatabase();
  return db.weather;
};

export const getRecentCheckInsForGardenBed = (gardenBedId: string, hours: number): CheckIn[] => {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  return db.checkIns.filter(
    c => c.gardenBedId === gardenBedId && c.checkInTime >= cutoffTime
  ).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
};

export const resetDatabase = (): void => {
  fs.unlinkSync(DB_PATH);
  db = initDatabase();
};
