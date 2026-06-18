import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Measurement } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortMeasurementsByDateTimeDesc(
  measurements: Measurement[]
): Measurement[] {
  return [...measurements].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
}

export function getRecentMeasurements(
  measurements: Measurement[],
  count: number = 3
): Measurement[] {
  const sorted = sortMeasurementsByDateTimeDesc(measurements);
  return sorted.slice(0, count);
}

export function getTodayMeasurements(
  measurements: Measurement[]
): Measurement[] {
  const todayStr = new Date().toISOString().split("T")[0];
  return sortMeasurementsByDateTimeDesc(
    measurements.filter((m) => m.date === todayStr)
  );
}

export function getMeasurementsWithinDays(
  measurements: Measurement[],
  days: number
): Measurement[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];
  return sortMeasurementsByDateTimeDesc(
    measurements.filter((m) => m.date >= cutoffStr)
  );
}
