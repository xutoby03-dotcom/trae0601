import { format, addMinutes, differenceInMinutes, startOfDay, addDays, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { ElderProfile, BloodPressureRecord, TimeSlot, TimeSlotData, DailyAbnormalData, RetestStats } from "@/types";

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const isBloodPressureAbnormal = (
  systolic: number,
  diastolic: number,
  targetRange: ElderProfile["targetRange"]
): boolean => {
  return (
    systolic >= targetRange.systolicMax ||
    diastolic >= targetRange.diastolicMax ||
    systolic < targetRange.systolicMin ||
    diastolic < targetRange.diastolicMin
  );
};

export const isRetestOverdue = (record: BloodPressureRecord): boolean => {
  if (!record.needsRetest || record.retestCompleted) return false;
  const deadline = addMinutes(parseISO(record.measureTime), 30);
  return new Date() > deadline;
};

export const getRetestRemainingMinutes = (record: BloodPressureRecord): number => {
  const deadline = addMinutes(parseISO(record.measureTime), 30);
  return Math.max(0, differenceInMinutes(deadline, new Date()));
};

export const formatDateTime = (dateStr: string): string => {
  return format(parseISO(dateStr), "yyyy-MM-dd HH:mm", { locale: zhCN });
};

export const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), "MM月dd日", { locale: zhCN });
};

export const formatTime = (dateStr: string): string => {
  return format(parseISO(dateStr), "HH:mm", { locale: zhCN });
};

export const getTimeSlot = (dateStr: string): TimeSlot => {
  const hour = parseISO(dateStr).getHours();
  if (hour >= 5 && hour < 9) return "morning";
  if (hour >= 9 && hour < 12) return "forenoon";
  if (hour >= 12 && hour < 14) return "noon";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "清晨 5-9",
  forenoon: "上午 9-12",
  noon: "午间 12-14",
  afternoon: "下午 14-17",
  evening: "傍晚 17-21",
  night: "夜间 21-5",
};

export const getTimeSlotDistribution = (records: BloodPressureRecord[]): TimeSlotData[] => {
  const abnormalRecords = records.filter((r) => r.isAbnormal && !r.originalRecordId);
  const slots: TimeSlot[] = ["morning", "forenoon", "noon", "afternoon", "evening", "night"];

  return slots.map((slot) => ({
    slot,
    label: TIME_SLOT_LABELS[slot],
    count: abnormalRecords.filter((r) => getTimeSlot(r.measureTime) === slot).length,
  }));
};

export const getWeeklyAbnormalData = (records: BloodPressureRecord[]): DailyAbnormalData[] => {
  const data: DailyAbnormalData[] = [];
  const today = startOfDay(new Date());

  for (let i = 6; i >= 0; i--) {
    const day = addDays(today, -i);
    const dayEnd = addDays(day, 1);
    const dayRecords = records.filter(
      (r) => !r.originalRecordId && parseISO(r.measureTime) >= day && parseISO(r.measureTime) < dayEnd && r.isAbnormal
    );
    data.push({
      date: format(day, "MM/dd", { locale: zhCN }),
      count: dayRecords.length,
    });
  }

  return data;
};

export const getRetestStats = (records: BloodPressureRecord[]): RetestStats => {
  const needsRetestRecords = records.filter((r) => r.needsRetest && !r.originalRecordId);
  const total = needsRetestRecords.length;
  const completed = needsRetestRecords.filter((r) => r.retestCompleted).length;

  return {
    total,
    completed,
    rate: total === 0 ? 100 : Math.round((completed / total) * 100),
  };
};

export const getTodayRecords = (records: BloodPressureRecord[]): BloodPressureRecord[] => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  return records.filter(
    (r) => !r.originalRecordId && parseISO(r.measureTime) >= today && parseISO(r.measureTime) < tomorrow
  );
};

export const getPendingRetestRecords = (records: BloodPressureRecord[]): BloodPressureRecord[] => {
  return records.filter((r) => r.needsRetest && !r.retestCompleted && !r.originalRecordId);
};

export const getFeelingEmoji = (feeling: string): string => {
  const feelingMap: Record<string, string> = {
    "无不适": "😊",
    "头晕": "😵",
    "头痛": "🤕",
    "胸闷": "😣",
    "心悸": "💓",
    "乏力": "😮‍💨",
    "恶心": "🤢",
  };
  return feelingMap[feeling] || "😐";
};

export const FEELING_OPTIONS = ["无不适", "头晕", "头痛", "胸闷", "心悸", "乏力", "恶心"];
