import type { WeatherData, RiskLevel, WeatherType } from "@/types";

export const getWeatherEmoji = (type: WeatherType): string => {
  const map: Record<WeatherType, string> = {
    sunny: "☀️",
    cloudy: "⛅",
    rainy: "🌧️",
    windy: "💨",
  };
  return map[type];
};

export const getWeatherText = (type: WeatherType): string => {
  const map: Record<WeatherType, string> = {
    sunny: "晴天",
    cloudy: "多云",
    rainy: "下雨",
    windy: "大风",
  };
  return map[type];
};

export const getRiskLevelText = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    1: "低风险",
    2: "中风险",
    3: "高风险",
  };
  return map[level];
};

export const getRiskLevelColor = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    1: "#1DD1A1",
    2: "#FECA57",
    3: "#EE5253",
  };
  return map[level];
};

export const getRiskLevelBgColor = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    1: "bg-warn-green/15 text-emerald-700 border-emerald-200",
    2: "bg-warn-yellow/20 text-amber-700 border-amber-200",
    3: "bg-warn-red/15 text-red-700 border-red-200",
  };
  return map[level];
};

export const generateWeatherRisk = (data: {
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  weatherType: WeatherType;
}): { level: RiskLevel; reasons: string[] } => {
  const reasons: string[] = [];
  let score = 0;

  if (data.weatherType === "rainy") {
    score += 3;
    reasons.push("正在下雨，请立即收衣！");
  } else if (data.rainProbability >= 60) {
    score += 2;
    reasons.push(`降雨概率${data.rainProbability}%，可能随时降雨`);
  } else if (data.rainProbability >= 40) {
    score += 1;
    reasons.push(`降雨概率${data.rainProbability}%，建议留意`);
  }

  if (data.windSpeed >= 15) {
    score += 2;
    reasons.push(`风力较大 (${data.windSpeed}m/s)，衣物可能被吹落`);
  } else if (data.windSpeed >= 10) {
    score += 1;
    reasons.push(`风力中等 (${data.windSpeed}m/s)，注意固定衣物`);
  }

  if (data.humidity >= 80) {
    score += 1;
    reasons.push(`湿度过高 (${data.humidity}%)，衣物难干透`);
  }

  if (data.weatherType === "windy") {
    score += 1;
  }

  let level: RiskLevel = 1;
  if (score >= 4) level = 3;
  else if (score >= 2) level = 2;

  if (reasons.length === 0) {
    reasons.push("天气良好，适合晾晒");
  }

  return { level, reasons };
};

export const createWeatherData = (overrides?: Partial<WeatherData>): WeatherData => {
  const base = {
    timestamp: new Date().toISOString(),
    temperature: 25,
    humidity: 60,
    windSpeed: 5,
    rainProbability: 20,
    weatherType: "sunny" as WeatherType,
    riskLevel: 1 as RiskLevel,
    riskReasons: ["天气良好，适合晾晒"],
  };
  const merged = { ...base, ...overrides };
  const { level, reasons } = generateWeatherRisk({
    humidity: merged.humidity,
    windSpeed: merged.windSpeed,
    rainProbability: merged.rainProbability,
    weatherType: merged.weatherType,
  });
  merged.riskLevel = level;
  merged.riskReasons = reasons;
  return merged;
};
