import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Area, Vehicle, Patrol, Disposal, DashboardData, VehicleStatus } from "../../shared/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

const PENDING_DAYS_THRESHOLD = 15;

type DataKey = "areas" | "vehicles" | "patrols" | "disposals";

function readData<T>(key: DataKey): T[] {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeData<T>(key: DataKey, data: T[]): void {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function getAreas(): Area[] {
  return readData<Area>("areas");
}

export function getAreaById(id: string): Area | undefined {
  return getAreas().find((a) => a.id === id);
}

export function createArea(data: Omit<Area, "id" | "createdAt">): Area {
  const areas = getAreas();
  const newArea: Area = {
    ...data,
    id: genId("area"),
    createdAt: new Date().toISOString(),
  };
  areas.push(newArea);
  writeData("areas", areas);
  return newArea;
}

export function updateArea(id: string, data: Partial<Omit<Area, "id" | "createdAt">>): Area | undefined {
  const areas = getAreas();
  const idx = areas.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  areas[idx] = { ...areas[idx], ...data };
  writeData("areas", areas);
  return areas[idx];
}

export function deleteArea(id: string): boolean {
  const areas = getAreas();
  const filtered = areas.filter((a) => a.id !== id);
  if (filtered.length === areas.length) return false;
  writeData("areas", filtered);
  return true;
}

export function getVehicles(): Vehicle[] {
  return readData<Vehicle>("vehicles");
}

export function getVehicleById(id: string): Vehicle | undefined {
  return getVehicles().find((v) => v.id === id);
}

export function getVehiclesByArea(areaId: string): Vehicle[] {
  return getVehicles().filter((v) => v.areaId === areaId);
}

export function createVehicle(data: Omit<Vehicle, "id" | "createdAt">): Vehicle {
  const vehicles = getVehicles();
  const newVehicle: Vehicle = {
    ...data,
    id: genId("veh"),
    createdAt: new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  writeData("vehicles", vehicles);
  return newVehicle;
}

export function updateVehicle(id: string, data: Partial<Omit<Vehicle, "id" | "createdAt">>): Vehicle | undefined {
  const vehicles = getVehicles();
  const idx = vehicles.findIndex((v) => v.id === id);
  if (idx === -1) return undefined;
  vehicles[idx] = { ...vehicles[idx], ...data };
  writeData("vehicles", vehicles);
  return vehicles[idx];
}

export function deleteVehicle(id: string): boolean {
  const vehicles = getVehicles();
  const filtered = vehicles.filter((v) => v.id !== id);
  if (filtered.length === vehicles.length) return false;
  writeData("vehicles", filtered);
  return true;
}

export function getPatrols(): Patrol[] {
  return readData<Patrol>("patrols").sort(
    (a, b) => new Date(b.patrolTime).getTime() - new Date(a.patrolTime).getTime(),
  );
}

export function createPatrol(data: Omit<Patrol, "id">): Patrol {
  const patrols = readData<Patrol>("patrols");
  const newPatrol: Patrol = {
    ...data,
    id: genId("patrol"),
  };
  patrols.push(newPatrol);
  writeData("patrols", patrols);

  const vehicles = getVehicles();
  const idx = vehicles.findIndex((v) => v.id === data.vehicleId);
  if (idx !== -1) {
    const now = new Date().toISOString();
    const shouldUpdateMoved =
      data.status === "normal" || data.status === "contacted";
    vehicles[idx] = {
      ...vehicles[idx],
      status: data.status as VehicleStatus,
      lastMovedAt: shouldUpdateMoved ? now : vehicles[idx].lastMovedAt,
    };
    writeData("vehicles", vehicles);
  }

  return newPatrol;
}

export function getDisposals(): Disposal[] {
  return readData<Disposal>("disposals").sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createDisposal(data: Omit<Disposal, "id" | "createdAt">): Disposal {
  const disposals = readData<Disposal>("disposals");
  const newDisposal: Disposal = {
    ...data,
    id: genId("disp"),
    createdAt: new Date().toISOString(),
  };
  disposals.push(newDisposal);
  writeData("disposals", disposals);
  return newDisposal;
}

export function getPendingDisposals(): Vehicle[] {
  const vehicles = getVehicles();
  const now = new Date();
  const thresholdMs = PENDING_DAYS_THRESHOLD * 24 * 60 * 60 * 1000;
  const processedIds = new Set(getDisposals().map((d) => d.vehicleId));

  return vehicles.filter((v) => {
    if (processedIds.has(v.id)) return false;
    const lastMoved = new Date(v.lastMovedAt).getTime();
    return now.getTime() - lastMoved >= thresholdMs;
  });
}

export function getDashboardData(): DashboardData {
  const areas = getAreas();
  const vehicles = getVehicles();
  const pendingCount = getPendingDisposals().length;

  const areaStats = areas.map((area) => {
    const areaVehicles = vehicles.filter((v) => v.areaId === area.id);
    const used = areaVehicles.length;
    const suspiciousCount = areaVehicles.filter(
      (v) => v.status === "suspicious" || v.status === "contacted",
    ).length;
    const chargingUsed = areaVehicles.filter(
      (v) => v.status === "charging_occupied",
    ).length;

    return {
      id: area.id,
      name: area.name,
      capacity: area.capacity,
      used,
      remaining: Math.max(0, area.capacity - used),
      chargingUsed,
      chargingCapacity: area.chargingCapacity,
      suspiciousCount,
    };
  });

  const totalSuspicious = vehicles.filter(
    (v) => v.status === "suspicious" || v.status === "contacted",
  ).length;

  return {
    areas: areaStats,
    totalVehicles: vehicles.length,
    totalSuspicious,
    pendingDisposals: pendingCount,
  };
}
