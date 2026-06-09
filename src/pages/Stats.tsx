import { useMemo } from 'react';
import { Clock, PieChart, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { useComplaintStore } from '@/store/useComplaintStore';
import { NOISE_TYPE_LABELS, STATUS_LABELS } from '@/types';
import type { NoiseType } from '@/types';

const NOISE_TYPE_COLORS: Record<NoiseType, string> = {
  renovation: '#f59e0b',
  singing: '#8b5cf6',
  speaker: '#f43f5e',
  pet: '#0ea5e9',
  other: '#64748b',
};

export default function Stats() {
  const complaints = useComplaintStore((s) => s.complaints);

  const hourDistribution = useMemo(() => {
    const hours = Array.from({ length: 24 }, () => 0);
    complaints.forEach((c) => {
      const h = new Date(c.noiseTime).getHours();
      hours[h]++;
    });
    return hours;
  }, [complaints]);

  const peakHour = useMemo(() => {
    const max = Math.max(...hourDistribution);
    if (max === 0) return -1;
    return hourDistribution.indexOf(max);
  }, [hourDistribution]);

  const noiseTypeDistribution = useMemo(() => {
    const counts: Partial<Record<NoiseType, number>> = {};
    complaints.forEach((c) => {
      counts[c.noiseType] = (counts[c.noiseType] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type: type as NoiseType,
      count: count!,
    }));
  }, [complaints]);

  const locationDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.location] = (counts[c.location] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  const summary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = complaints.filter(
      (c) => new Date(c.createdAt) >= weekAgo
    ).length;
    const recurring = complaints.filter((c) => c.status === 'recurring').length;
    const totalSeconds = complaints.reduce(
      (sum, c) => sum + c.seconds.length,
      0
    );
    const avgSeconding =
      complaints.length > 0 ? (totalSeconds / complaints.length).toFixed(1) : '0';
    return {
      total: complaints.length,
      thisWeek,
      recurring,
      avgSeconding,
    };
  }, [complaints]);

  const maxHourCount = Math.max(...hourDistribution, 1);
  const maxLocationCount = Math.max(...locationDistribution.map((l) => l.count), 1);
  const totalForDonut = noiseTypeDistribution.reduce((s, d) => s + d.count, 0) || 1;
  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius;

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-teal-500" />
          <h2 className="font-semibold text-gray-800">时段分析</h2>
        </div>
        <div className="flex items-end gap-[2px] h-28">
          {hourDistribution.map((count, hour) => {
            const height = (count / maxHourCount) * 100;
            const isPeak = count > 0 && hour === peakHour;
            return (
              <div key={hour} className="flex flex-col items-center flex-1 relative">
                <div
                  className="w-full rounded-t-sm bg-teal-400"
                  style={{
                    height: `${height}%`,
                    opacity: count > 0 ? 0.4 + (count / maxHourCount) * 0.6 : 0.1,
                  }}
                />
                {isPeak && (
                  <div className="absolute -top-2 w-2 h-2 rounded-full bg-amber-400" />
                )}
                {hour % 3 === 0 && (
                  <span className="text-[9px] text-gray-400 mt-1">{hour}</span>
                )}
              </div>
            );
          })}
        </div>
        {peakHour >= 0 && (
          <div className="mt-3 text-sm text-gray-500">
            最吵时段：<span className="text-amber-500 font-medium">{peakHour}:00</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-teal-500" />
          <h2 className="font-semibold text-gray-800">噪音类型分布</h2>
        </div>
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 120 120" className="w-40 h-40">
            <circle cx="60" cy="60" r={donutRadius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
            {(() => {
              let offset = 0;
              return noiseTypeDistribution.map((d) => {
                const segLen = (d.count / totalForDonut) * donutCircumference;
                const el = (
                  <circle
                    key={d.type}
                    cx="60"
                    cy="60"
                    r={donutRadius}
                    fill="none"
                    stroke={NOISE_TYPE_COLORS[d.type]}
                    strokeWidth="14"
                    strokeDasharray={`${segLen} ${donutCircumference - segLen}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 60 60)"
                  />
                );
                offset += segLen;
                return el;
              });
            })()}
            <text x="60" y="56" textAnchor="middle" className="text-lg font-bold fill-gray-800" fontSize="18">
              {totalForDonut}
            </text>
            <text x="60" y="72" textAnchor="middle" className="fill-gray-400" fontSize="10">
              总计
            </text>
          </svg>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {noiseTypeDistribution.map((d) => (
            <div key={d.type} className="flex items-center gap-1.5 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: NOISE_TYPE_COLORS[d.type] }}
              />
              <span className="text-gray-600">{NOISE_TYPE_LABELS[d.type]}</span>
              <span className="text-gray-400">
                {d.count}({((d.count / totalForDonut) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-teal-500" />
          <h2 className="font-semibold text-gray-800">位置复发分析</h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {locationDistribution.map((l) => (
            <div key={l.location} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-28 shrink-0 truncate">
                {l.location}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(l.count / maxLocationCount) * 100}%`,
                    background: 'linear-gradient(to right, #2dd4bf, #0d9488)',
                  }}
                />
              </div>
              <span className="text-sm text-gray-500 w-6 text-right">{l.count}</span>
              {l.count >= 2 && (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-teal-500" />
          <h2 className="font-semibold text-gray-800">趋势概览</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{summary.total}</div>
            <div className="text-xs text-gray-400 mt-1">投诉总数</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{summary.thisWeek}</div>
            <div className="text-xs text-gray-400 mt-1">本周投诉</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-500">{summary.recurring}</div>
            <div className="text-xs text-gray-400 mt-1">反复出现</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{summary.avgSeconding}</div>
            <div className="text-xs text-gray-400 mt-1">平均声援数</div>
          </div>
        </div>
      </div>
    </div>
  );
}
