import { useMemo } from 'react';
import { WeatherCondition } from '../types';

interface Raindrop {
  id: number;
  left: string;
  delay: string;
  duration: string;
}

interface Sunray {
  id: number;
  left: string;
  rotate: string;
  delay: string;
}

export const useWeatherEffect = (condition: WeatherCondition) => {
  const raindrops = useMemo<Raindrop[]>(() => {
    if (condition !== 'rainy') return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1}s`,
      duration: `${0.5 + Math.random() * 0.5}s`
    }));
  }, [condition]);

  const sunrays = useMemo<Sunray[]>(() => {
    if (condition !== 'sunny') return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${50 + Math.cos((i * 45 * Math.PI) / 180) * 30}%`,
      rotate: `${i * 45}deg`,
      delay: `${i * 0.1}s`
    }));
  }, [condition]);

  const bgGradient = useMemo(() => {
    switch (condition) {
      case 'sunny':
        return 'from-yellow-100 via-sky-100 to-blue-50';
      case 'cloudy':
        return 'from-gray-100 via-slate-100 to-gray-200';
      case 'rainy':
        return 'from-slate-300 via-blue-200 to-slate-400';
      case 'foggy':
        return 'from-gray-200 via-slate-200 to-gray-300';
      case 'night':
        return 'from-indigo-900 via-purple-900 to-slate-900';
      default:
        return 'from-sky-50 via-blue-50 to-emerald-50';
    }
  }, [condition]);

  const textColor = condition === 'night' ? 'text-white' : 'text-gray-800';

  return {
    raindrops,
    sunrays,
    bgGradient,
    textColor
  };
};
