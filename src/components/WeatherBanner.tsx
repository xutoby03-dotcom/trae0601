import { CloudRain, Cloud, Sun } from 'lucide-react'
import type { WeatherData } from '@/types'

interface Props {
  weather: WeatherData
  loading: boolean
}

export default function WeatherBanner({ weather, loading }: Props) {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse h-20" />
    )
  }

  if (!weather.isRainy) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sun className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">{weather.description}</p>
            <p className="text-xs text-amber-600/70">降雨概率 {weather.precipitationProbability}%</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B3A5C] to-[#2D5F8B] px-5 py-4 shadow-lg shadow-blue-900/20">
      <div className="rain-drops absolute inset-0 pointer-events-none opacity-30" />
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
          {weather.precipitationProbability >= 70 ? (
            <CloudRain className="w-5 h-5 text-blue-200" />
          ) : (
            <Cloud className="w-5 h-5 text-blue-200" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{weather.description}</p>
          <p className="text-xs text-blue-200/80">降雨概率 {weather.precipitationProbability}% · 可借雨伞已排在前面</p>
        </div>
      </div>
      <style>{`
        .rain-drops {
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(147,197,253,0.4), transparent),
            radial-gradient(2px 2px at 40% 70%, rgba(147,197,253,0.3), transparent),
            radial-gradient(1px 1px at 60% 20%, rgba(147,197,253,0.5), transparent),
            radial-gradient(2px 2px at 80% 50%, rgba(147,197,253,0.3), transparent),
            radial-gradient(1px 1px at 10% 80%, rgba(147,197,253,0.4), transparent),
            radial-gradient(2px 2px at 50% 10%, rgba(147,197,253,0.3), transparent),
            radial-gradient(1px 1px at 90% 90%, rgba(147,197,253,0.5), transparent);
          animation: rainMove 2s linear infinite;
        }
        @keyframes rainMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
