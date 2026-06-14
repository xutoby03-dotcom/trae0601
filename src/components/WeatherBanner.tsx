import React from 'react';
import { useStore } from '../store/useStore';
import { useWeatherEffect } from '../hooks/useWeatherEffect';
import { RefreshCw } from 'lucide-react';

export const WeatherBanner: React.FC = () => {
  const { weather, updateWeather } = useStore();
  const { raindrops, sunrays, bgGradient, textColor } = useWeatherEffect(weather.condition);

  const isWarning = weather.condition === 'rainy' || weather.condition === 'foggy' || weather.condition === 'night';

  return (
    <div className={`relative w-full rounded-2xl p-6 bg-gradient-to-r ${bgGradient} overflow-hidden transition-all duration-500 shadow-lg`}>
      {raindrops.map(drop => (
        <div
          key={drop.id}
          className="rain-drop animate-rain-fall"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration
          }}
        />
      ))}

      {sunrays.map(ray => (
        <div
          key={ray.id}
          className="sun-ray animate-pulse-slow"
          style={{
            left: ray.left,
            transform: `rotate(${ray.rotate})`,
            animationDelay: ray.delay
          }}
        />
      ))}

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`text-5xl ${weather.condition === 'night' ? 'animate-pulse-slow' : 'animate-float'}`}>
            {weather.icon}
          </div>
          <div>
            <div className={`text-2xl font-bold ${textColor} font-display`}>
              {weather.temperature}°C
            </div>
            <div className={`text-sm ${textColor} opacity-80`}>
              湿度 {weather.humidity}%
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-lg font-semibold ${textColor} font-display`}>
            {weather.forecast}
          </div>
          <button
            onClick={() => updateWeather()}
            className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
              isWarning 
                ? 'bg-white/30 text-white hover:bg-white/50' 
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            <RefreshCw size={14} />
            刷新天气
          </button>
        </div>
      </div>

      {isWarning && (
        <div className={`relative z-10 mt-4 p-3 rounded-xl ${
          weather.condition === 'rainy' 
            ? 'bg-blue-500/30 border border-blue-400/50' 
            : weather.condition === 'foggy'
            ? 'bg-gray-500/30 border border-gray-400/50'
            : 'bg-purple-500/30 border border-purple-400/50'
        }`}>
          <span className="text-white font-medium">
            {weather.condition === 'rainy' && '🌧️ 下雨预警：请尽快收回阳台衣物！'}
            {weather.condition === 'foggy' && '🌫️ 起雾高湿：衣物易返潮，建议提前收衣'}
            {weather.condition === 'night' && '🌙 夜间提醒：已到收衣时间，避免夜间返潮'}
          </span>
        </div>
      )}
    </div>
  );
};
