import { Wind, Thermometer, Eye } from 'lucide-react';
import GlassCard from './GlassCard';
import { useFlightStore } from '@/store/useFlightStore';

function WindCompass({ direction, speed }: { direction: number; speed: number }) {
  const rad = (direction - 90) * (Math.PI / 180);
  const x = 50 + 28 * Math.cos(rad);
  const y = 50 + 28 * Math.sin(rad);

  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <text x="50" y="12" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">N</text>
        <text x="90" y="53" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">E</text>
        <text x="50" y="95" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">S</text>
        <text x="10" y="53" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">W</text>
        <line x1="50" y1="50" x2={x} y2={y} stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" />
        <circle cx={x} cy={y} r="3" fill="#00E5A0" />
        <circle cx="50" cy="50" r="3" fill="rgba(255,255,255,0.3)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="mt-1 text-[10px] font-mono font-bold text-white/70">{speed}</span>
      </div>
    </div>
  );
}

const windStatusConfig: Record<string, { label: string; color: string }> = {
  safe: { label: '适宜飞行', color: 'text-[#00E5A0]' },
  caution: { label: '风速偏大', color: 'text-[#FFB800]' },
  danger: { label: '风速超标', color: 'text-[#FF4757]' },
};

export default function WeatherCard() {
  const { weather } = useFlightStore();
  if (!weather) return null;

  const { label, color } = windStatusConfig[weather.windStatus];
  const isWindDanger = weather.windStatus === 'danger';

  return (
    <GlassCard status={weather.windStatus} delay={200}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">气象信息</h3>
          <span className={`text-xs font-mono font-bold ${color} ${isWindDanger ? 'animate-pulse' : ''}`}>
            {label}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <WindCompass direction={weather.windDirection} speed={weather.windSpeed} />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Wind size={14} className="text-white/30" />
              <div>
                <div className="text-[10px] text-white/30">风速</div>
                <div className={`text-sm font-mono font-bold ${color}`}>{weather.windSpeed} m/s</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer size={14} className="text-white/30" />
              <div>
                <div className="text-[10px] text-white/30">温度</div>
                <div className="text-sm font-mono text-white/70">{weather.temperature}°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-white/30" />
              <div>
                <div className="text-[10px] text-white/30">能见度</div>
                <div className="text-sm font-mono text-white/70">{weather.visibility} km</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
