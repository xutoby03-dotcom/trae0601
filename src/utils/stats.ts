import type { DryingRecord, FamilyMember, MemberStats, WeatherData } from "@/types";

export type NeedCollectReason =
  | "overdue24h"
  | "pastExpected"
  | "rainy"
  | "highRainProb"
  | "windy"
  | "highHumidity";

export const getNeedCollectReasons = (
  record: DryingRecord,
  weather: WeatherData
): NeedCollectReason[] => {
  const reasons: NeedCollectReason[] = [];
  if (record.status !== "drying") return reasons;

  const now = Date.now();
  if (now - new Date(record.startTime).getTime() > 24 * 3600000) {
    reasons.push("overdue24h");
  }
  if (now > new Date(record.expectedTime).getTime()) {
    reasons.push("pastExpected");
  }
  if (weather.weatherType === "rainy") {
    reasons.push("rainy");
  }
  if (weather.rainProbability >= 60) {
    reasons.push("highRainProb");
  }
  if (weather.weatherType === "windy" || weather.windSpeed >= 10) {
    reasons.push("windy");
  }
  if (weather.humidity >= 80) {
    reasons.push("highHumidity");
  }

  return reasons;
};

export const isNeedCollect = (record: DryingRecord, weather: WeatherData): boolean => {
  return getNeedCollectReasons(record, weather).length > 0;
};

export const getPrimaryReason = (
  record: DryingRecord,
  weather: WeatherData
): NeedCollectReason | null => {
  const reasons = getNeedCollectReasons(record, weather);
  if (reasons.length === 0) return null;
  const priority: NeedCollectReason[] = [
    "overdue24h",
    "rainy",
    "windy",
    "highRainProb",
    "highHumidity",
    "pastExpected",
  ];
  return priority.find((r) => reasons.includes(r)) || reasons[0];
};

export const getReasonText = (reason: NeedCollectReason): string => {
  const map: Record<NeedCollectReason, string> = {
    overdue24h: "超24小时",
    pastExpected: "已过预计时间",
    rainy: "正在下雨",
    highRainProb: "降雨概率高",
    windy: "大风天气",
    highHumidity: "湿度过高",
  };
  return map[reason];
};

export const getReasonColorClass = (reason: NeedCollectReason): string => {
  if (reason === "overdue24h") return "bg-warn-red/20 text-warn-red animate-pulse";
  if (reason === "rainy" || reason === "highRainProb" || reason === "windy")
    return "bg-warn-red/15 text-warn-red";
  if (reason === "highHumidity") return "bg-sky-200/50 text-sky-700";
  return "bg-warn-yellow/30 text-amber-700";
};

export const getReasonEmoji = (reason: NeedCollectReason): React.ReactNode => {
  if (reason === "overdue24h") return "⏰";
  if (reason === "rainy" || reason === "highRainProb") return "🌧️";
  if (reason === "windy") return "💨";
  if (reason === "highHumidity") return "💧";
  return "⌛";
};

export const hasWeatherWarning = (weather: WeatherData): boolean => {
  return (
    weather.weatherType === "rainy" ||
    weather.weatherType === "windy" ||
    weather.rainProbability >= 60 ||
    weather.humidity >= 80 ||
    weather.windSpeed >= 10
  );
};

export const getMemberStats = (
  records: DryingRecord[],
  members: FamilyMember[]
): MemberStats[] => {
  return members.map((m) => {
    const dryCount = records.filter((r) => r.ownerId === m.id).length;
    const collectCount = records.filter(
      (r) => r.status !== "drying" && r.collectedAt
    ).length;
    const totalCollects = records.filter((r) => r.status !== "drying").length;
    const shareCollects = totalCollects > 0 ? Math.round((collectCount / totalCollects) * dryCount) : 0;
    return {
      memberId: m.id,
      memberName: m.name,
      avatar: m.avatar,
      color: m.color,
      dryCount,
      collectCount: shareCollects || dryCount,
    };
  });
};

export const getActiveDryingCount = (records: DryingRecord[]): number => {
  return records.filter((r) => r.status === "drying").length;
};

export const getOverdueCount = (records: DryingRecord[]): number => {
  return records.filter(
    (r) => r.status === "drying" && new Date().getTime() - new Date(r.startTime).getTime() > 24 * 3600000
  ).length;
};

export const getUrgentCount = (records: DryingRecord[], weather: WeatherData): number => {
  return getNeedCollectRecords(records, weather).length;
};

export const getNeedCollectRecords = (
  records: DryingRecord[],
  weather: WeatherData
): DryingRecord[] => {
  return records.filter((r) => isNeedCollect(r, weather));
};

export const getNeedCollectCount = (
  records: DryingRecord[],
  weather: WeatherData
): number => {
  return getNeedCollectRecords(records, weather).length;
};

export const sortByUrgency = (records: DryingRecord[]): DryingRecord[] => {
  return [...records]
    .filter((r) => r.status === "drying")
    .sort((a, b) => {
      const aOverdue = new Date().getTime() - new Date(a.startTime).getTime() > 24 * 3600000 ? 1 : 0;
      const bOverdue = new Date().getTime() - new Date(b.startTime).getTime() > 24 * 3600000 ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      return new Date(a.expectedTime).getTime() - new Date(b.expectedTime).getTime();
    });
};

export const sortNeedCollectByUrgency = (
  records: DryingRecord[],
  weather: WeatherData
): DryingRecord[] => {
  return getNeedCollectRecords(records, weather).sort((a, b) => {
    const priority: NeedCollectReason[] = [
      "overdue24h",
      "rainy",
      "windy",
      "highRainProb",
      "highHumidity",
      "pastExpected",
    ];
    const aReason = getPrimaryReason(a, weather);
    const bReason = getPrimaryReason(b, weather);
    const aRank = aReason ? priority.indexOf(aReason) : 99;
    const bRank = bReason ? priority.indexOf(bReason) : 99;
    if (aRank !== bRank) return aRank - bRank;

    const aOverdue = new Date().getTime() - new Date(a.startTime).getTime() > 24 * 3600000 ? 1 : 0;
    const bOverdue = new Date().getTime() - new Date(b.startTime).getTime() > 24 * 3600000 ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    return new Date(a.expectedTime).getTime() - new Date(b.expectedTime).getTime();
  });
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    drying: "晾晒中",
    collected: "已收衣",
    rewash: "需重洗",
  };
  return map[status] || status;
};

export const getStatusChipClass = (status: string): string => {
  const map: Record<string, string> = {
    drying: "bg-sky-100 text-sky-700",
    collected: "bg-emerald-100 text-emerald-700",
    rewash: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};
