import { WindData24h, HourlyWindData } from '../types';

const generateHourlyData = (): HourlyWindData[] => {
  const hours: HourlyWindData[] = [];
  
  const basePattern = [
    { hour: 0, windDir: 270, windSpeed: 3.2, gust: 4.5, noise: 42 },
    { hour: 3, windDir: 285, windSpeed: 2.8, gust: 3.9, noise: 40 },
    { hour: 6, windDir: 300, windSpeed: 4.1, gust: 5.8, noise: 48 },
    { hour: 9, windDir: 330, windSpeed: 7.5, gust: 11.2, noise: 58 },
    { hour: 12, windDir: 0, windSpeed: 12.3, gust: 18.5, noise: 68 },
    { hour: 14, windDir: 30, windSpeed: 14.5, gust: 22.1, noise: 72 },
    { hour: 16, windDir: 60, windSpeed: 13.8, gust: 20.3, noise: 70 },
    { hour: 18, windDir: 90, windSpeed: 10.2, gust: 15.6, noise: 64 },
    { hour: 21, windDir: 180, windSpeed: 6.8, gust: 9.5, noise: 55 },
    { hour: 24, windDir: 270, windSpeed: 4.2, gust: 5.8, noise: 46 },
  ];

  for (let h = 0; h < 24; h++) {
    let prev = basePattern[0];
    let next = basePattern[1];
    for (let i = 0; i < basePattern.length - 1; i++) {
      if (h >= basePattern[i].hour && h < basePattern[i + 1].hour) {
        prev = basePattern[i];
        next = basePattern[i + 1];
        break;
      }
    }

    const t = next.hour > prev.hour 
      ? (h - prev.hour) / (next.hour - prev.hour) 
      : 0;

    const windDir = prev.windDir + (next.windDir - prev.windDir) * t + (Math.random() - 0.5) * 15;
    const windSpeed = prev.windSpeed + (next.windSpeed - prev.windSpeed) * t + (Math.random() - 0.5) * 1.5;
    const gust = prev.gust + (next.gust - prev.gust) * t + (Math.random() - 0.5) * 2;
    const noise = prev.noise + (next.noise - prev.noise) * t + (Math.random() - 0.5) * 3;
    
    const dirChangeFactor = Math.abs(Math.sin((h - 12) * Math.PI / 12)) * 0.6 + 0.4;
    const gustFactor = gust / windSpeed;
    const tanglingIndex = Math.min(100, Math.max(0,
      windSpeed * 3.5 * 0.35 +
      dirChangeFactor * 40 * 0.4 +
      (gustFactor - 1) * 30 * 0.2 +
      (Math.random() - 0.5) * 10
    ));

    hours.push({
      hour: h,
      windDirection: ((windDir % 360) + 360) % 360,
      windSpeed: Math.max(0, windSpeed),
      gustSpeed: Math.max(windSpeed, gust),
      noiseLevel: Math.max(35, noise),
      tanglingIndex,
    });
  }

  return hours;
};

export const mockWindData24h: WindData24h = {
  date: '2025-06-21',
  hours: generateHourlyData(),
};
