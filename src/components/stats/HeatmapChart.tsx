import { useMemo } from 'react';
import { getHeatmapData } from '@/utils/statistics';
import { SizeCode, ProblemType, ProblemTypeLabel } from '@/types';

interface HeatmapChartProps {
  sampleId?: string;
}

const SIZE_CODES: SizeCode[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PROBLEM_TYPES: ProblemType[] = ['pattern', 'fabric', 'workmanship', 'comfort'];

function getHeatColor(count: number, max: number): string {
  if (count === 0) return 'bg-cream-100';
  if (max === 0) return 'bg-cream-100';
  const ratio = count / max;
  if (ratio < 0.25) return 'bg-terracotta-100';
  if (ratio < 0.5) return 'bg-terracotta-200';
  if (ratio < 0.75) return 'bg-terracotta-300';
  return 'bg-terracotta-500';
}

function getTextColor(count: number, max: number): string {
  if (max === 0) return 'text-charcoal-400';
  const ratio = count / max;
  if (ratio >= 0.75) return 'text-white';
  return 'text-charcoal-700';
}

export default function HeatmapChart({ sampleId }: HeatmapChartProps) {
  const rawData = useMemo(() => getHeatmapData(sampleId), [sampleId]);

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    rawData.forEach((item) => {
      map.set(`${item.size}-${item.problemType}`, item.count);
    });
    return map;
  }, [rawData]);

  const maxCount = useMemo(() => {
    return Math.max(...rawData.map((item) => item.count), 1);
  }, [rawData]);

  const total = rawData.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-charcoal-400 text-sm">
        暂无热力图数据
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-charcoal-800 font-display">尺码 × 问题类型 热力图</h3>
        <div className="flex items-center gap-2 text-xs text-charcoal-500">
          <span className="w-3 h-3 rounded bg-cream-100 border border-cream-200" />
          <span>少</span>
          <span className="w-3 h-3 rounded bg-terracotta-200" />
          <span className="w-3 h-3 rounded bg-terracotta-300" />
          <span className="w-3 h-3 rounded bg-terracotta-500" />
          <span>多</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-charcoal-500 w-16"></th>
              {PROBLEM_TYPES.map((type) => (
                <th key={type} className="p-2 text-center text-xs font-medium text-charcoal-600">
                  {ProblemTypeLabel[type]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_CODES.map((size) => (
              <tr key={size}>
                <td className="p-2 text-sm font-medium text-charcoal-600 w-16">{size}</td>
                {PROBLEM_TYPES.map((type) => {
                  const count = dataMap.get(`${size}-${type}`) || 0;
                  const bgColor = getHeatColor(count, maxCount);
                  const txtColor = getTextColor(count, maxCount);
                  return (
                    <td key={type} className="p-1">
                      <div
                        className={`
                          h-12 flex items-center justify-center rounded-md transition-all duration-200
                          ${bgColor} ${txtColor} font-semibold text-sm
                          hover:ring-2 hover:ring-terracotta-400 hover:scale-105 cursor-default
                        `}
                        title={`${size} - ${ProblemTypeLabel[type]}: ${count}`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
