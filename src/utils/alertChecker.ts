import type { Alert, AlertType, Aquarium, FeedingRecord } from "@/types";
import { uid, todayStr, nowStr } from "./formatters";
import { parseISO, subDays, format, isBefore, startOfDay } from "date-fns";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";
import { useStockStore } from "@/store/useStockStore";

const MORNING_DEADLINE_HOUR = 13;
const EVENING_DEADLINE_HOUR = 22;

export const buildAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  const aquariums = useAquariumStore.getState().aquariums;
  const feeding = useFeedingStore.getState();
  const { stocks } = useStockStore.getState();

  if (aquariums.length === 0) {
    alerts.push({
      id: uid(),
      type: "no_aquarium",
      title: "还没有鱼缸档案",
      message: "先添加一个鱼缸档案，才能生成喂食计划哦 🐟",
      level: "info",
      created_at: nowStr(),
    });
    return alerts;
  }

  const today = todayStr();
  const h = new Date().getHours();

  aquariums.forEach((a) => {
    const plan = feeding.getPlanForDate(a.id, today);
    const todayRecords = feeding.getRecordsForDate(a.id, today);

    // 漏喂检测
    if (plan) {
      if (!plan.morning_done && h >= MORNING_DEADLINE_HOUR) {
        alerts.push({
          id: uid(),
          type: "missed_feeding",
          title: `「${a.name}」早上还没喂`,
          message: `已过建议喂食时间，请尽快喂食，建议份量 ${plan.morning_grams}g`,
          level: "warning",
          aquarium_id: a.id,
          created_at: nowStr(),
        });
      }
      if (!plan.evening_done && h >= EVENING_DEADLINE_HOUR) {
        alerts.push({
          id: uid(),
          type: "missed_feeding",
          title: `「${a.name}」傍晚还没喂`,
          message: `已过建议喂食时间，请尽快喂食，建议份量 ${plan.evening_grams}g`,
          level: "warning",
          aquarium_id: a.id,
          created_at: nowStr(),
        });
      }
    }

    // 重复喂检测
    ;(["morning", "evening"] as const).forEach((period) => {
      const samePeriodToday = todayRecords.filter((r) => r.period === period);
      if (samePeriodToday.length >= 2) {
        const periodCn = period === "morning" ? "早晨" : "傍晚";
        alerts.push({
          id: uid(),
          type: "duplicate_feeding",
          title: `「${a.name}」${periodCn}已喂 ${samePeriodToday.length} 次`,
          message: `同一时段重复喂食容易坏水，请确认是否误操作；总共 ${samePeriodToday.reduce(
            (s, r) => s + r.actual_grams,
            0
          ).toFixed(1)}g`,
          level: "danger",
          aquarium_id: a.id,
          created_at: nowStr(),
        });
      }
    });

    // 连续剩食检测（近 3 天）
    const leftoverDays = checkContinuousLeftover(a.id, 3);
    if (leftoverDays >= 3) {
      alerts.push({
        id: uid(),
        type: "continuous_leftover",
        title: `「${a.name}」连续 ${leftoverDays} 天有剩食`,
        message: "可能喂多了，建议减少 10~20% 份量或检查鱼的状态",
        level: "warning",
        aquarium_id: a.id,
        created_at: nowStr(),
      });
    }
  });

  // 库存不足检测
  const avgUsageByType = calcAvgDailyUsageByType();
  stocks.forEach((s) => {
    const avg = avgUsageByType[s.food_type] ?? 0;
    if (avg > 0) {
      const days = Math.floor(s.current_grams / avg);
      if (days <= 14) {
        alerts.push({
          id: uid(),
          type: "low_stock",
          title: `鱼粮「${s.food_name}」库存偏低`,
          message: `按当前用量大约还能撑 ${days} 天，建议尽快补货`,
          level: days <= 5 ? "danger" : "warning",
          created_at: nowStr(),
        });
      }
    } else if (s.current_grams < 100) {
      alerts.push({
        id: uid(),
        type: "low_stock",
        title: `鱼粮「${s.food_name}」库存不足`,
        message: `当前剩余 ${s.current_grams}g，建议尽快补货`,
        level: "warning",
        created_at: nowStr(),
      });
    }
  });

  return alerts;
};

export const checkContinuousLeftover = (
  aquarium_id: string,
  windowDays: number
): number => {
  const feeding = useFeedingStore.getState();
  let streak = 0;
  for (let i = 0; i < windowDays; i++) {
    const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
    const records = feeding.getRecordsForDate(aquarium_id, dateStr);
    if (records.length === 0) break;
    const hasLeftover = records.some(
      (r) => r.leftover_level === "medium" || r.leftover_level === "lots"
    );
    if (hasLeftover) streak++;
    else break;
  }
  return streak;
};

export const calcAvgDailyUsageByType = (): Record<string, number> => {
  const result: Record<string, number> = {};
  const aquariums = useAquariumStore.getState().aquariums;
  aquariums.forEach((a) => {
    const total = a.fish_species.reduce(
      (s, f) => s + f.count * f.daily_grams_per_fish,
      0
    );
    result[a.food_type] = (result[a.food_type] ?? 0) + total;
  });
  return result;
};

export const calcStockDaysLeft = (food_type: string): number | null => {
  const stock = useStockStore.getState().getStockByType(food_type);
  if (!stock) return null;
  const avg = calcAvgDailyUsageByType()[food_type] ?? 0;
  if (avg <= 0) return null;
  return Math.floor(stock.current_grams / avg);
};

export interface TimeframeStat {
  label: string;
  missed: number;
  total: number;
  rate: number;
}

export const findMostMissedTimeframes = (): TimeframeStat[] => {
  const aquariums = useAquariumStore.getState().aquariums;
  const feeding = useFeedingStore.getState();
  const daysBack = 14;

  const stats: Record<"morning" | "evening", { missed: number; total: number }> = {
    morning: { missed: 0, total: 0 },
    evening: { missed: 0, total: 0 },
  };

  for (let i = 0; i < daysBack; i++) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (isBefore(startOfDay(new Date(d)), startOfDay(new Date()))) {
      aquariums.forEach((a) => {
        const p = feeding.getPlanForDate(a.id, d);
        if (p) {
          stats.morning.total++;
          if (!p.morning_done) stats.morning.missed++;
          stats.evening.total++;
          if (!p.evening_done) stats.evening.missed++;
        }
      });
    }
  }

  return (["morning", "evening"] as const).map((k) => ({
    label: k === "morning" ? "早晨时段" : "傍晚时段",
    missed: stats[k].missed,
    total: stats[k].total,
    rate: stats[k].total === 0 ? 0 : stats[k].missed / stats[k].total,
  }));
};

export interface AppetiteAbnormal {
  aquarium_name: string;
  aquarium_id: string;
  total_records: number;
  leftover_records: number;
  status_sluggish_sick: number;
}

export const findAppetiteAbnormal = (days = 14): AppetiteAbnormal[] => {
  const aquariums = useAquariumStore.getState().aquariums;
  const feeding = useFeedingStore.getState();
  const cutoff = startOfDay(subDays(new Date(), days));

  return aquariums.map((a) => {
    const records = feeding
      .getAllRecords(a.id)
      .filter((r) => !isBefore(parseISO(r.datetime), cutoff));
    const leftover = records.filter(
      (r) => r.leftover_level === "medium" || r.leftover_level === "lots"
    ).length;
    const abnormal = records.filter(
      (r) => r.fish_status === "sluggish" || r.fish_status === "sick"
    ).length;
    return {
      aquarium_name: a.name,
      aquarium_id: a.id,
      total_records: records.length,
      leftover_records: leftover,
      status_sluggish_sick: abnormal,
    };
  });
};
