import React from 'react';
import { CloudRain, Sun, Cloud, ThermometerSun, Droplets, RefreshCw } from 'lucide-react';
import type { Weather } from '@shared/types.js';

interface WeatherBannerProps {
  weather: Weather | null;
  onRefresh?: () => void;
  loading?: boolean;
}

const WeatherBanner: React.FC<WeatherBannerProps> = ({ weather, onRefresh, loading }) => {
  if (!weather) return null;

  const conditionConfig = {
    sunny: {
      icon: Sun,
      bg: 'bg-gradient-to-r from-sun-100 to-sun-50',
      border: 'border-sun-300',
      text: 'text-sun-800',
      emoji: '☀️',
    },
    cloudy: {
      icon: Cloud,
      bg: 'bg-gradient-to-r from-sky-100 to-sky-50',
      border: 'border-sky-300',
      text: 'text-sky-800',
      emoji: '⛅',
    },
    rainy: {
      icon: CloudRain,
      bg: 'bg-gradient-to-r from-sky-200 to-sky-100',
      border: 'border-sky-400',
      text: 'text-sky-900',
      emoji: '🌧️',
    },
    hot: {
      icon: ThermometerSun,
      bg: 'bg-gradient-to-r from-sun-200 to-sun-100',
      border: 'border-sun-400',
      text: 'text-sun-900',
      emoji: '🔥',
    },
  };

  const config = conditionConfig[weather.condition];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-2 rounded-2xl p-5 mb-6 animate-slide-up`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{config.emoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <Icon size={20} className={config.text} />
              <span className={`font-semibold ${config.text}`}>{weather.forecast}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <ThermometerSun size={16} className={config.text} />
                <span className="text-sm font-medium">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets size={16} className="text-sky-600" />
                <span className="text-sm font-medium">湿度 {weather.humidity}%</span>
              </div>
              {weather.consecutiveHotDays > 0 && (
                <div className="flex items-center gap-1.5">
                  <Sun size={16} className="text-sun-600" />
                  <span className="text-sm font-medium text-sun-700">
                    连续高温 {weather.consecutiveHotDays} 天
                  </span>
                </div>
              )}
            </div>
            {weather.shouldSkipWatering && (
              <div className="mt-3 px-3 py-2 bg-white/60 rounded-lg inline-flex items-center gap-2">
                <CloudRain size={16} className="text-sky-600" />
                <span className="text-sm font-medium text-sky-700">{weather.skipReason}</span>
              </div>
            )}
            {weather.shouldIncreaseWatering && (
              <div className="mt-3 px-3 py-2 bg-white/60 rounded-lg inline-flex items-center gap-2 ml-2">
                <Sun size={16} className="text-sun-600" />
                <span className="text-sm font-medium text-sun-700">{weather.increaseReason}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={`${config.text} ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {weather.wateringAdvice && weather.wateringAdvice.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/40">
          <p className="text-sm font-medium mb-2">💡 浇水建议：</p>
          <ul className="space-y-1">
            {weather.wateringAdvice.map((advice, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WeatherBanner;
