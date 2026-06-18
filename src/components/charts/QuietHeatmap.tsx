interface QuietHeatmapProps {
  data: { day: number; hour: number; score: number }[][];
}

const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const hourLabels = Array.from({ length: 14 }, (_, i) => `${i + 8}时`);

function getColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-emerald-300';
  if (score >= 40) return 'bg-amber-300';
  if (score >= 20) return 'bg-orange-400';
  return 'bg-red-400';
}

export function QuietHeatmap({ data }: QuietHeatmapProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex">
          <div className="w-16 flex-shrink-0" />
          <div className="flex-1 flex">
            {hourLabels.map((hour, i) => (
            <div key={i} className="flex-1 text-center text-xs text-slate-500 pb-2">
              {hour}
            </div>
          ))}
          </div>
        </div>

        {data.map((row, dayIndex) => (
          <div key={dayIndex} className="flex items-center mb-1">
            <div className="w-16 flex-shrink-0 text-sm text-slate-600 pr-2 text-right">
              {dayLabels[dayIndex]}
            </div>
            <div className="flex-1 flex gap-0.5">
              {row.slice(8, 22).map((cell, hourIndex) => (
                <div
                  key={hourIndex}
                  className={`flex-1 h-8 rounded ${getColor(cell.score)} hover:scale-110 transition-transform cursor-pointer relative group`}
                  title={`${dayLabels[dayIndex]} ${hourIndex + 8}:00 - 安静指数 ${cell.score}`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    安静指数 {cell.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
          <span>安静程度：</span>
          <div className="flex gap-1">
            <div className="w-6 h-4 rounded bg-red-400" />
            <div className="w-6 h-4 rounded bg-orange-400" />
            <div className="w-6 h-4 rounded bg-amber-300" />
            <div className="w-6 h-4 rounded bg-emerald-300" />
            <div className="w-6 h-4 rounded bg-emerald-500" />
          </div>
          <span className="ml-1">安静</span>
        </div>
      </div>
    </div>
  );
}
