import { useWeatherStore } from "@/store/weatherStore";
import {
  getWeatherEmoji,
  getWeatherText,
  getRiskLevelText,
  getRiskLevelColor,
  getRiskLevelBgColor,
} from "@/utils/weather";
import { formatDateTime } from "@/utils/time";
import { Thermometer, Droplets, Wind, CloudRain, AlertTriangle, RefreshCw } from "lucide-react";

export default function WeatherCard() {
  const { weather, simulateChange } = useWeatherStore();

  const riskColor = getRiskLevelColor(weather.riskLevel);
  const isHighRisk = weather.riskLevel >= 2;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 shadow-lg border-2 transition-all duration-500 ${
        isHighRisk
          ? "bg-gradient-to-br from-warn-red/10 via-warn-yellow/20 to-sun-400/20 border-warn-yellow/40"
          : "bg-gradient-to-br from-sky-50 via-white to-warn-green/10 border-sky-100"
      } ${isHighRisk ? "animate-pulse-slow" : ""}`}
    >
      <div className="absolute -top-10 -right-10 text-8xl opacity-20 select-none pointer-events-none">
        {getWeatherEmoji(weather.weatherType)}
      </div>

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-5xl drop-shadow-sm">{getWeatherEmoji(weather.weatherType)}</span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display text-sky-800">{weather.temperature}</span>
                <span className="text-2xl text-sky-500 font-light">°C</span>
              </div>
              <p className="text-sm text-sky-600 font-medium">{getWeatherText(weather.weatherType)}</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`chip border ${getRiskLevelBgClass(weather.riskLevel)}`}
            style={{ boxShadow: `0 0 20px ${riskColor}30` }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{getRiskLevelText(weather.riskLevel)}</span>
          </div>
          <button
            onClick={simulateChange}
            className="mt-2 flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700 transition-colors ml-auto"
            title="模拟天气变化"
          >
            <RefreshCw className="w-3 h-3" />
            切换天气场景
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 relative z-10">
        <InfoItem icon={<Droplets className="w-4 h-4" />} label="湿度" value={`${weather.humidity}%`} highlight={weather.humidity >= 70} />
        <InfoItem icon={<Wind className="w-4 h-4" />} label="风速" value={`${weather.windSpeed} m/s`} highlight={weather.windSpeed >= 10} />
        <InfoItem icon={<CloudRain className="w-4 h-4" />} label="降雨概率" value={`${weather.rainProbability}%`} highlight={weather.rainProbability >= 50} />
        <InfoItem icon={<Thermometer className="w-4 h-4" />} label="体感" value={`${weather.temperature + (weather.humidity > 70 ? -2 : 2)}°C`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-full h-2 rounded-full bg-white/60 overflow-hidden">
            <span
              className="block h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (weather.riskLevel / 3) * 100)}%`,
                background: `linear-gradient(90deg, #1DD1A1, #FECA57 60%, #EE5253)`,
              }}
            />
          </span>
        </div>
        <ul className="space-y-1.5">
          {weather.riskReasons.map((r, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 text-sm ${
                weather.riskLevel >= 2 ? "text-warn-red" : "text-emerald-700"
              }`}
            >
              <span className="mt-0.5">{weather.riskLevel >= 2 ? "⚠️" : "✅"}</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-sky-400/70 mt-3 text-right">
          最后更新：{formatDateTime(weather.timestamp)}
        </p>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 transition-all ${
        highlight
          ? "bg-warn-red/10 border border-warn-red/30"
          : "bg-white/50 border border-white/60"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-xs mb-1 ${
          highlight ? "text-warn-red" : "text-sky-500"
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-xl font-semibold ${highlight ? "text-warn-red" : "text-sky-800"}`}>
        {value}
      </div>
    </div>
  );
}

function getRiskLevelBgClass(level: number) {
  const map: Record<number, string> = {
    1: "bg-warn-green/15 text-emerald-700 border-emerald-200",
    2: "bg-warn-yellow/20 text-amber-700 border-amber-200",
    3: "bg-warn-red/15 text-red-700 border-red-200",
  };
  return map[level] || map[1];
}
