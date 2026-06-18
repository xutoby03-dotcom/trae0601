import { useState, useMemo } from 'react';
import { TrendingUp, Droplet, Activity } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import { SOUP_TYPES } from '@/types';
import type { SoupType } from '@/types';
import { SOUP_TYPE_LABEL, SOUP_TYPE_CHART_COLOR, SOUP_TARGET_SALINITY, SOUP_SALINITY_TOLERANCE } from '@/utils/soupConfig';
import { calculateStability, getBatchFinalSalinity, round } from '@/utils/helpers';

type ChartMode = 'salinity' | 'stability' | 'both';

export default function StabilityChart() {
  const [selected, setSelected] = useState<SoupType[]>(['pork-bone', 'chicken', 'beef-bone']);
  const [mode, setMode] = useState<ChartMode>('both');
  const batches = useBatchStore((s) => s.batches);

  const computeData = (soupType: SoupType) => {
    const target = SOUP_TARGET_SALINITY[soupType];
    const tolerance = SOUP_SALINITY_TOLERANCE;

    return batches
      .filter((b) => b.soupType === soupType && b.cookingRecords.length > 0)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(-8)
      .map((b) => {
        const salinity = getBatchFinalSalinity(b) || 0;
        const stability = calculateStability(salinity, target, tolerance);
        return {
          label: new Date(b.startTime).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
          salinity,
          stability,
          target,
        };
      });
  };

  const allData = useMemo(
    () => selected.map((type) => ({ type, data: computeData(type) })).filter((d) => d.data.length > 0),
    [selected, batches]
  );

  const width = 560;
  const height = 280;
  const padding = { top: 30, right: 55, bottom: 40, left: 45 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxPoints = Math.max(1, ...allData.map((d) => d.data.length));

  const yMinSalinity = 0.5;
  const yMaxSalinity = 1.2;
  const yMinStability = 60;
  const yMaxStability = 100;

  const yScaleSalinity = (v: number) => padding.top + innerH - ((v - yMinSalinity) / (yMaxSalinity - yMinSalinity)) * innerH;
  const yScaleStability = (v: number) => padding.top + innerH - ((v - yMinStability) / (yMaxStability - yMinStability)) * innerH;

  const xScale = (i: number, len: number) => {
    if (len <= 1) return padding.left + innerW / 2;
    const step = innerW / Math.max(1, maxPoints - 1);
    const startPad = (innerW - (len - 1) * step) / 2;
    return padding.left + startPad + i * step;
  };

  const yTicksSalinity = [0.6, 0.75, 1.0, 1.15];
  const yTicksStability = [70, 80, 90, 100];

  const showSalinity = mode === 'salinity' || mode === 'both';
  const showStability = mode === 'stability' || mode === 'both';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-broth-800">品质稳定度趋势</h3>
            <p className="text-xs text-broth-500">按汤底目标盐度计算稳定度百分比</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-broth-50 rounded-lg p-1">
          <button
            onClick={() => setMode('salinity')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              mode === 'salinity' ? 'bg-white shadow text-broth-800' : 'text-broth-500 hover:text-broth-700'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            盐度
          </button>
          <button
            onClick={() => setMode('stability')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              mode === 'stability' ? 'bg-white shadow text-broth-800' : 'text-broth-500 hover:text-broth-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            稳定度
          </button>
          <button
            onClick={() => setMode('both')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'both' ? 'bg-white shadow text-broth-800' : 'text-broth-500 hover:text-broth-700'
            }`}
          >
            双轴
          </button>
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
            <linearGradient id="stabilityZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {showSalinity && (
            <>
              {yTicksSalinity.map((y) => (
                <g key={`sal-${y}`}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={yScaleSalinity(y)}
                    y2={yScaleSalinity(y)}
                    stroke="#EFEBE9"
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 8}
                    y={yScaleSalinity(y) + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#A1887F"
                  >
                    {y.toFixed(2)}
                  </text>
                </g>
              ))}
            </>
          )}

          {showStability && (
            <>
              {yTicksStability.map((y) => (
                <g key={`stab-${y}`}>
                  <text
                    x={width - padding.right + 8}
                    y={yScaleStability(y) + 4}
                    textAnchor="start"
                    fontSize="11"
                    fill="#16A34A"
                  >
                    {y}%
                  </text>
                </g>
              ))}
              <rect
                x={padding.left}
                y={yScaleStability(85)}
                width={innerW}
                height={yScaleStability(100) - yScaleStability(85)}
                fill="url(#stabilityZone)"
              />
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={yScaleStability(85)}
                y2={yScaleStability(85)}
                stroke="#22C55E"
                strokeDasharray="4 4"
                strokeWidth={1}
                opacity={0.5}
              />
            </>
          )}

          {showSalinity && allData.flatMap(({ type, data }) => {
            if (data.length === 0) return null;
            const target = data[0].target;
            const tolerance = SOUP_SALINITY_TOLERANCE;
            const upperTarget = target * (1 + tolerance);
            const lowerTarget = target * (1 - tolerance);

            return (
              <g key={`salinity-${type}`}>
                <rect
                  x={padding.left}
                  y={yScaleSalinity(upperTarget)}
                  width={innerW}
                  height={yScaleSalinity(lowerTarget) - yScaleSalinity(upperTarget)}
                  fill="url(#targetZone)"
                  opacity={0.5}
                />
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={yScaleSalinity(target)}
                  y2={yScaleSalinity(target)}
                  stroke={SOUP_TYPE_CHART_COLOR[type]}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  opacity={0.4}
                />
                <path
                  d={data.map((d, i) => {
                    const x = xScale(i, data.length);
                    const y = yScaleSalinity(d.salinity);
                    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={SOUP_TYPE_CHART_COLOR[type]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {data.map((d, i) => (
                  <circle
                    key={i}
                    cx={xScale(i, data.length)}
                    cy={yScaleSalinity(d.salinity)}
                    r={4}
                    fill="white"
                    stroke={SOUP_TYPE_CHART_COLOR[type]}
                    strokeWidth={2}
                  />
                ))}
              </g>
            );
          })}

          {showStability && allData.flatMap(({ type, data }) => {
            if (data.length === 0) return null;

            return (
              <g key={`stability-${type}`}>
                <path
                  d={data.map((d, i) => {
                    const x = xScale(i, data.length);
                    const y = yScaleStability(d.stability);
                    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={SOUP_TYPE_CHART_COLOR[type]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 3"
                  opacity={0.85}
                />
                {data.map((d, i) => (
                  <rect
                    key={i}
                    x={xScale(i, data.length) - 3}
                    y={yScaleStability(d.stability) - 3}
                    width={6}
                    height={6}
                    fill="white"
                    stroke={SOUP_TYPE_CHART_COLOR[type]}
                    strokeWidth={2}
                    transform={`rotate(45 ${xScale(i, data.length)} ${yScaleStability(d.stability)})`}
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

          {showSalinity && (
            <text
              x={padding.left - 35}
              y={padding.top - 12}
              fontSize="11"
              fill="#8D6E63"
            >
              盐度%
            </text>
          )}
          {showStability && (
            <text
              x={width - padding.right + 8}
              y={padding.top - 12}
              fontSize="11"
              fill="#16A34A"
            >
              稳定度%
            </text>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-broth-500">
        {showSalinity && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-soup-400 rounded" />
              盐度目标带（±10%）
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-broth-400" />
              目标盐度
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-broth-500 rounded" />
              盐度趋势（实线）
            </span>
          </>
        )}
        {showStability && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-green-500" />
              稳定度趋势（虚线）
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-100 border border-green-400" style={{ transform: 'rotate(45deg)' }} />
              85% 合格线
            </span>
          </>
        )}
      </div>

      {allData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-broth-100">
          <div className="text-xs font-medium text-broth-600 mb-2">各汤底最近稳定度</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allData.map(({ type, data }) => {
              const latest = data[data.length - 1];
              const avg = round(data.reduce((sum, d) => sum + d.stability, 0) / data.length, 1);
              const isGood = latest.stability >= 85;
              return (
                <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-broth-50/50">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: SOUP_TYPE_CHART_COLOR[type] }}
                    />
                    <span className="text-xs text-broth-700">{SOUP_TYPE_LABEL[type]}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${isGood ? 'text-green-600' : 'text-orange-500'}`}>
                      {latest.stability}%
                    </span>
                    <span className="text-xs text-broth-400 ml-1">/ 均{avg}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
