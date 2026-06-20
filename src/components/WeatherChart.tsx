import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
} from 'recharts';
import type { WeatherHour } from '@/types';
import { getScoreLabel } from '@/utils/astro';
import { Cloud, Thermometer, Wind, Droplets } from 'lucide-react';

interface Props {
  data: WeatherHour[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: WeatherHour }[] }) {
  if (!active || !payload || !payload.length) return null;
  const w = payload[0].payload;
  const score = getScoreLabel(w.score);
  return (
    <div className="glass-card !rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/80 font-medium">{String(w.hour).padStart(2, '0')}:00</span>
        <span className={`chip chip-${score.color.includes('green') ? 'easy' : score.color.includes('cyan') ? 'medium' : 'hard'}`}>
          {score.label} {w.score}
        </span>
      </div>
      <div className="flex items-center gap-2 text-white/70">
        <Cloud className="w-3.5 h-3.5 text-nebula-cyan" />
        <span>云量 {w.cloudCover}%</span>
      </div>
      <div className="flex items-center gap-2 text-white/70">
        <Thermometer className="w-3.5 h-3.5 text-red-400" />
        <span>{w.temperature}°C</span>
      </div>
      <div className="flex items-center gap-2 text-white/70">
        <Wind className="w-3.5 h-3.5 text-nebula-purple" />
        <span>风速 {w.windSpeed} m/s</span>
      </div>
      <div className="flex items-center gap-2 text-white/70">
        <Droplets className="w-3.5 h-3.5 text-nebula-blue" />
        <span>湿度 {w.humidity}%</span>
      </div>
    </div>
  );
}

export default function WeatherChart({ data }: Props) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#4f46e5" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            tickFormatter={(v) => `${String(v).padStart(2, '0')}:00`}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(79,70,229,0.3)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="cloudCover"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#cloudGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
          />
          <Brush
            dataKey="hour"
            height={20}
            stroke="#4f46e5"
            fill="rgba(79,70,229,0.1)"
            travellerWidth={8}
            startIndex={18}
            endIndex={30}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
