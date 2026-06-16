import type { FeedingRecord, Aquarium } from "@/types";
import { parseISO, subDays, eachDayOfInterval, format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";

export interface WeeklyUsagePoint {
  date: string;
  label: string;
  total_grams: number;
  [aquariumName: string]: string | number;
}

export const calcWeeklyUsage = (): {
  labels: string[];
  aquariums: Aquarium[];
  series: Array<{ name: string; data: number[] }>;
  total: number;
  avgDaily: number;
} => {
  const aquariums = useAquariumStore.getState().aquariums;
  const feeding = useFeedingStore.getState();

  const days = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const labels = days.map((d) => format(d, "EEE", { locale: zhCN }));
  const dateStrs = days.map((d) => format(d, "yyyy-MM-dd"));

  const series = aquariums.map((a) => {
    const data = dateStrs.map((ds) => {
      const records = feeding.getRecordsForDate(a.id, ds);
      return Math.round(
        records.reduce((s, r) => s + r.actual_grams, 0) * 10
      ) / 10;
    });
    return { name: a.name, data };
  });

  const totalAll = series.reduce(
    (s, ser) => s + ser.data.reduce((a, b) => a + b, 0),
    0
  );
  const nonZeroDays = series[0]?.data.filter((x) => x > 0).length || 1;

  return {
    labels,
    aquariums,
    series,
    total: Math.round(totalAll * 10) / 10,
    avgDaily: Math.round((totalAll / Math.max(1, nonZeroDays)) * 10) / 10,
  };
};

export interface RecentFeedingLog {
  id: string;
  aquarium_name: string;
  period_cn: string;
  time: string;
  date_label: string;
  feeder: string;
  actual_grams: number;
  leftover_level: string;
  fish_status: string;
  notes?: string;
}

export const getRecentFeedingLogs = (
  limit = 20
): RecentFeedingLog[] => {
  const aquariums = useAquariumStore.getState().aquariums;
  const all = useFeedingStore.getState().getAllRecords();
  return all.slice(0, limit).map((r) => {
    const a = aquariums.find((x) => x.id === r.aquarium_id);
    return {
      id: r.id,
      aquarium_name: a?.name ?? "未知鱼缸",
      period_cn: r.period === "morning" ? "早晨" : "傍晚",
      time: format(parseISO(r.datetime), "HH:mm"),
      date_label: format(parseISO(r.datetime), "M月d日"),
      feeder: r.feeder,
      actual_grams: r.actual_grams,
      leftover_level: r.leftover_level,
      fish_status: r.fish_status,
      notes: r.notes,
    };
  });
};

export interface FeederRanking {
  name: string;
  count: number;
  total_grams: number;
}

export const calcFeederRanking = (days = 30): FeederRanking[] => {
  const cutoff = subDays(new Date(), days);
  const map = new Map<string, { count: number; total: number }>();
  useFeedingStore
    .getState()
    .getAllRecords()
    .forEach((r) => {
      if (parseISO(r.datetime) < cutoff) return;
      const cur = map.get(r.feeder) ?? { count: 0, total: 0 };
      cur.count++;
      cur.total += r.actual_grams;
      map.set(r.feeder, cur);
    });
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      count: v.count,
      total_grams: Math.round(v.total * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);
};
