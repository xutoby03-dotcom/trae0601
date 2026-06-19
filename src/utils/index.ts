import type { AvailableSlot, Weekday, TimeSlot, GameSession, Player } from "@/types";
import { weekdays, timeSlots } from "@/data/mock";

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${formatDate(dateStr)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function getRelativeDate(dateStr: string): string {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil(
    (target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff === 2) return "后天";
  if (diff < 7) return `${diff}天后`;
  return formatDate(dateStr);
}

export function getNextWeekDates(): { label: string; weekday: Weekday }[] {
  const result: { label: string; weekday: Weekday }[] = [];
  const weekdayMap: Weekday[] = [
    "周日",
    "周一",
    "周二",
    "周三",
    "周四",
    "周五",
    "周六",
  ];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: weekdayMap[d.getDay()],
    });
  }
  return result;
}

export function buildSlot(weekday: Weekday, slot: TimeSlot): AvailableSlot {
  return `${weekday}${slot}` as AvailableSlot;
}

export function parseSlot(slot: AvailableSlot): {
  weekday: Weekday;
  timeSlot: TimeSlot;
} {
  for (let i = weekdays.length - 1; i >= 0; i--) {
    if (slot.startsWith(weekdays[i])) {
      return {
        weekday: weekdays[i],
        timeSlot: slot.slice(weekdays[i].length) as TimeSlot,
      };
    }
  }
  return { weekday: "周一", timeSlot: "下午" };
}

export function getAvailabilityHeatmap(
  playerSlots: AvailableSlot[][]
): Record<Weekday, Record<TimeSlot, number>> {
  const heatmap: Record<Weekday, Record<TimeSlot, number>> = {} as Record<
    Weekday,
    Record<TimeSlot, number>
  >;
  weekdays.forEach((wd) => {
    heatmap[wd] = { 上午: 0, 下午: 0, 晚上: 0, 深夜: 0 };
  });
  playerSlots.forEach((slots) => {
    slots.forEach((s) => {
      const { weekday, timeSlot } = parseSlot(s);
      if (heatmap[weekday] && heatmap[weekday][timeSlot] !== undefined) {
        heatmap[weekday][timeSlot]++;
      }
    });
  });
  return heatmap;
}

export function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generatePaymentReminder(
  player: Player,
  session: GameSession
): string {
  const date = formatDateTime(session.scheduledAt);
  return [
    `【密室拼场催款】${player.nickname}您好👋`,
    ``,
    `场次：${session.theme}（${session.type}）`,
    `门店：${session.storeName}`,
    `时间：${date}`,
    `时长：${session.durationMinutes}分钟`,
    `金额：¥${session.price}/人`,
    ``,
    `麻烦确认后转一下～上车前会核对付款记录哒😉`,
  ].join("\n");
}
