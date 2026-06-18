import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import type { SoupType } from '@/types';
import { SOUP_TYPE_LABEL, SOUP_TYPE_CHART_COLOR } from '@/utils/soupConfig';

const SOUP_TYPES: SoupType[] = ['pork-bone', 'beef-bone', 'chicken', 'seafood', 'vegetarian'];
const TARGET_SALINITY = 0.85;
const TOLERANCE = 0.1;

export default function StabilityChart() {
  const [selected, setSelected] = useState<SoupType[]>(['pork-bone', 'chicken', 'beef-bone']);
  const batches = useBatchStore((s) => s.batches);

  const computeData = (soupType: SoupType) => {
    return batches
      .filter((b) => b.soupType === soupType && b.cookingRecords.length > 0)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(-8)
      .map((b) => ({
        label: new Date(b.startTime).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        salinity: b.cookingRecords[b.cookingRecords.length - 1]?.salinity || 0,
      }));
  };

  const allData = useMemo(
    () => selected.map((type) => ({ type, data: computeData(type) })).filter((d) => d.data.length > 0),
    [selected, batches]
  );

  const width = 560;
  const height = 260;
  const padding = { top: 30, right: 20, bottom: 40, left: 45 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxPoints = Math.max(1, ...allData.map((d) => d.data.length));

  const yMin = 0.5;
  const yMax = 1.2;
  const yScale = (v: number) => padding.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const xScale = (i: number, len: number) => {
    if (len <= 1) return padding.left + innerW / 2;
    const step = innerW / Math.max(1, maxPoints - 1);
    const startPad = (innerW - (len - 1) * step) / 2;
    return padding.left + startPad + i * step;
  };

  const yTicks = [0.6, 0.75, TARGET_SALINITY, 1.0, 1.15];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-broth-800">盐度稳定度趋势</h3>
            <p className="text-xs text-broth-500">目标盐度 {TARGET_SALINITY}% ±{TOLERANCE * 100}%</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {SOUP_TYPES.map((t) => {
          const isActive = selected.includes(t);
          return (
            <button
              key={t}
              onClick={() => {
                setSelected((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                );
              }}
              className="!px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                backgroundColor: isActive ? SOUP_TYPE_CHART_COLOR[t] + '20' : 'transparent',
                borderColor: isActive ? SOUP_TYPE_CHART_COLOR[t] : '#D7CCC8',
                color: isActive ? SOUP_TYPE_CHART_COLOR[t] : '#8D6E63',
              }}
            >
              {SOUP_TYPE_LABEL[t]}
            </button>
          );
        })}
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 500 }}>
          <defs>
            <linearGradient id="targetZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB300" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFB300" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {yTicks.map((y) => (
            <g key={y}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={yScale(y)}
                y2={yScale(y)}
                stroke="#EFEBE9"
                strokeDasharray={y === TARGET_SALINITY ? '4 4' : undefined}
                strokeWidth={y === TARGET_SALINITY ? 1.5 : 1}
              />
              <text
                x={padding.left - 8}
                y={yScale(y) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#A1887F"
              >
                {y.toFixed(2)}
              </text>
            </g>
          ))}

          <rect
            x={padding.left}
            y={yScale(TARGET_SALINITY + TOLERANCE)}
            width={innerW}
            height={yScale(TARGET_SALINITY - TOLERANCE) - yScale(TARGET_SALINITY + TOLERANCE)}
            fill="url(#targetZone)"
          />

          {allData.flatMap(({ type, data }) => {
            if (data.length === 0) return null;
            const pathD = data.map((d, i) => {
              const x = xScale(i, data.length);
              const y = yScale(d.salinity);
              return `${i === 0 ? 'M' : 'L'}${x},${y}`;
            }).join(' ');

            return (
              <g key={type}>
                <path d={pathD} fill="none" stroke={SOUP_TYPE_CHART_COLOR[type]} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {data.map((d, i) => (
                  <circle
                    key={i}
                    cx={xScale(i, data.length)}
                    cy={yScale(d.salinity)}
                    r={4}
                    fill="white"
                    stroke={SOUP_TYPE_CHART_COLOR[type]}
                    strokeWidth={2}
                  />
                ))}
              </g>
            );
          })}

          {allData.length > 0 && allData[0].data.map((d, i) => (
            <text
              key={i}
              x={xScale(i, allData[0].data.length)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#A1887F"
            >
              {d.label}
            </text>
          ))}

          <text
            x={padding.left - 35}
            y={padding.top - 12}
            fontSize="11"
            fill="#8D6E63"
          >
            盐度%
          </text>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-broth-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-soup-400 rounded" />
          目标带（合格范围）
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-broth-400" />
          目标值
        </span>
      </div>
    </div>
  );
}
