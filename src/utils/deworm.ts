import {
  addDays,
  formatDate,
  getReminderStatus,
  daysBetween,
  WEIGHT_CHANGE_THRESHOLD,
  calculateAge,
} from "./date";
import type {
  DewormRecord,
  DewormType,
  Pet,
  Species,
  WeightHistory,
} from "../types";

export const DEWORM_CYCLE_DAYS: Record<DewormType, number> = {
  internal: 90,
  external: 30,
};

export function getNextDewormDate(
  dateUsed: string,
  type: DewormType
): string {
  return formatDate(addDays(new Date(dateUsed), DEWORM_CYCLE_DAYS[type]));
}

export function getNextDewormByType(
  records: DewormRecord[],
  type: DewormType
): DewormRecord | undefined {
  const filtered = records.filter((r) => r.type === type);
  if (filtered.length === 0) return undefined;
  return filtered.reduce((latest, curr) =>
    new Date(curr.nextDate) > new Date(latest.nextDate) ? curr : latest
  );
}

export function getPetLatestRecords(petId: string, records: DewormRecord[]) {
  const petRecords = records.filter((r) => r.petId === petId);
  const nextInternal = getNextDewormByType(petRecords, "internal");
  const nextExternal = getNextDewormByType(petRecords, "external");

  return {
    nextInternalDate: nextInternal?.nextDate,
    nextExternalDate: nextExternal?.nextDate,
    nextInternalStatus: nextInternal
      ? getReminderStatus(nextInternal.nextDate)
      : undefined,
    nextExternalStatus: nextExternal
      ? getReminderStatus(nextExternal.nextDate)
      : undefined,
  };
}

export function getWorstStatus(
  s1?: "overdue" | "urgent" | "upcoming" | "normal",
  s2?: "overdue" | "urgent" | "upcoming" | "normal"
): "overdue" | "urgent" | "upcoming" | "normal" | undefined {
  const priority: Record<string, number> = {
    overdue: 4,
    urgent: 3,
    upcoming: 2,
    normal: 1,
  };
  if (!s1 && !s2) return undefined;
  if (!s1) return s2;
  if (!s2) return s1;
  return priority[s1] >= priority[s2] ? s1 : s2;
}

export function checkWeightSignificantChange(
  oldWeight: number,
  newWeight: number
): boolean {
  if (oldWeight <= 0) return false;
  const changeRate = Math.abs(newWeight - oldWeight) / oldWeight;
  return changeRate >= WEIGHT_CHANGE_THRESHOLD;
}

export function getWeightChangePercent(
  oldWeight: number,
  newWeight: number
): number {
  if (oldWeight <= 0) return 0;
  return Math.round(((newWeight - oldWeight) / oldWeight) * 100);
}

export function countRecordsThisYear(
  petId: string,
  records: DewormRecord[]
): { internal: number; external: number } {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const petRecords = records.filter(
    (r) => r.petId === petId && new Date(r.dateUsed) >= yearStart
  );
  return {
    internal: petRecords.filter((r) => r.type === "internal").length,
    external: petRecords.filter((r) => r.type === "external").length,
  };
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    overdue: "已逾期",
    urgent: "3天内到期",
    upcoming: "7天内到期",
    normal: "状态正常",
  };
  return map[status] || status;
}

export function getStatusColor(status?: string): string {
  const map: Record<string, string> = {
    overdue: "bg-alert-100 text-alert-600",
    urgent: "bg-warm-100 text-warm-600",
    upcoming: "bg-mint-100 text-mint-700",
    normal: "bg-ink-100 text-ink-500",
  };
  return map[status || "normal"] || map.normal;
}

export function getTypeLabel(type: DewormType): string {
  return type === "internal" ? "体内驱虫" : "体外驱虫";
}

export function getTypeColor(type: DewormType): string {
  return type === "internal"
    ? "bg-warm-500 text-white"
    : "bg-mint-500 text-white";
}

export function getTypeDotColor(type: DewormType): string {
  return type === "internal" ? "bg-warm-500" : "bg-mint-500";
}

export function getSpeciesLabel(species: Species): string {
  return species === "cat" ? "猫咪" : "狗狗";
}

export function getSpeciesEmoji(species: Species): string {
  return species === "cat" ? "🐱" : "🐶";
}

export function getAgeDisplay(birthDate: string): string {
  return calculateAge(birthDate);
}

export { daysBetween };
