import type { MoonData, MoonPhase, WeatherHour } from '@/types';

const PHASE_NAMES: Record<MoonPhase, string> = {
  new: '新月',
  waxing_crescent: '蛾眉月',
  first_quarter: '上弦月',
  waxing_gibbous: '盈凸月',
  full: '满月',
  waning_gibbous: '亏凸月',
  last_quarter: '下弦月',
  waning_crescent: '残月',
};

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateChinese(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

export function getNext7Days(): { date: string; label: string; weekday: string }[] {
  const result = [];
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      date: formatDate(d),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: i === 0 ? '今天' : i === 1 ? '明天' : weekdays[d.getDay()],
    });
  }
  return result;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function dateSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, v) => acc + parseInt(v, 10) * 37, 0);
}

export function calculateMoonData(dateStr: string): MoonData {
  const knownNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const targetDate = new Date(dateStr).getTime();
  const lunarCycle = 29.530588853 * 24 * 60 * 60 * 1000;
  const diff = targetDate - knownNewMoon;
  const cycles = diff / lunarCycle;
  const phaseProgress = (cycles - Math.floor(cycles));
  const age = phaseProgress * 29.53;
  const illumination = (1 - Math.cos(2 * Math.PI * phaseProgress)) / 2;

  let phase: MoonPhase;
  if (phaseProgress < 0.0625 || phaseProgress >= 0.9375) phase = 'new';
  else if (phaseProgress < 0.1875) phase = 'waxing_crescent';
  else if (phaseProgress < 0.3125) phase = 'first_quarter';
  else if (phaseProgress < 0.4375) phase = 'waxing_gibbous';
  else if (phaseProgress < 0.5625) phase = 'full';
  else if (phaseProgress < 0.6875) phase = 'waning_gibbous';
  else if (phaseProgress < 0.8125) phase = 'last_quarter';
  else phase = 'waning_crescent';

  const seed = dateSeed(dateStr);
  const rand = seededRandom(seed);
  const riseHour = 12 + phaseProgress * 24 + (rand() - 0.5) * 2;
  const setHour = (riseHour + 12) % 24;
  const toTimeStr = (h: number): string => {
    const hour = Math.floor(h) % 24;
    const minute = Math.floor((h % 1) * 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  return {
    phase,
    phaseName: PHASE_NAMES[phase],
    illumination: Math.round(illumination * 100),
    moonRise: toTimeStr(riseHour),
    moonSet: toTimeStr(setHour),
    age: Math.round(age * 10) / 10,
  };
}

export function generateWeatherData(dateStr: string): WeatherHour[] {
  const seed = dateSeed(dateStr);
  const rand = seededRandom(seed);
  const hours: WeatherHour[] = [];

  for (let h = 0; h < 24; h++) {
    const timeFactor = h >= 19 || h <= 5 ? 0.7 : 1.3;
    const cloudBase = 30 + rand() * 40;
    const cloudVar = Math.sin((h / 24) * Math.PI * 2) * 15;
    const cloudCover = Math.max(0, Math.min(100, Math.round((cloudBase + cloudVar) * timeFactor + (rand() - 0.5) * 20)));

    const tempBase = 15;
    const tempVar = -Math.sin((h / 24) * Math.PI * 2) * 8;
    const temperature = Math.round((tempBase + tempVar + (rand() - 0.5) * 4) * 10) / 10;

    const windSpeed = Math.round((5 + rand() * 15 + (h > 10 && h < 16 ? 5 : 0)) * 10) / 10;
    const humidity = Math.round(50 + rand() * 35 - (cloudCover > 70 ? 10 : 0));
    const visibility = Math.round((10 - cloudCover / 15 + (rand() - 0.5) * 2) * 10) / 10;

    let score = 100;
    score -= cloudCover * 0.7;
    score -= windSpeed * 1.5;
    score -= Math.abs(humidity - 50) * 0.3;
    score += visibility * 2;
    if (h < 6 || h > 20) score += 10;
    score = Math.max(0, Math.min(100, Math.round(score)));

    hours.push({
      hour: h,
      cloudCover,
      temperature,
      windSpeed,
      humidity,
      visibility: Math.max(0, visibility),
      score,
    });
  }
  return hours;
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: '极佳', color: 'text-aurora-green' };
  if (score >= 60) return { label: '良好', color: 'text-nebula-cyan' };
  if (score >= 40) return { label: '一般', color: 'text-moonlight' };
  if (score >= 20) return { label: '较差', color: 'text-orange-400' };
  return { label: '不宜', color: 'text-red-400' };
}

export function getBestObservationHours(weather: WeatherHour[]): WeatherHour[] {
  return weather
    .filter(w => (w.hour >= 20 || w.hour <= 4) && w.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
