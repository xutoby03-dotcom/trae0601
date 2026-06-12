import type { MonthlyDistribution, PerChildStat } from '@/types';
import { getMonthLabel } from '@/utils/date';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface MonthlyChartProps {
  data: MonthlyDistribution[];
  busiestMonth: string;
}

export function MonthlyChart({ data, busiestMonth }: MonthlyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <TrendingUp className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">暂无接种记录</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const displayData = data.slice(-12);

  return (
    <div>
      <div className="flex items-end justify-between gap-2 h-48 mb-4">
        {displayData.map((d) => {
          const height = (d.count / maxCount) * 100;
          const isBusiest = d.month === busiestMonth;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={`text-xs font-medium ${isBusiest ? 'text-accent-600' : 'text-slate-500'}`}>
                {d.count}
              </span>
              <div className="w-full relative flex items-end h-full">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isBusiest
                      ? 'bg-gradient-to-t from-accent-500 to-accent-400 shadow-soft'
                      : 'bg-gradient-to-t from-primary-300 to-primary-200 hover:from-primary-400 hover:to-primary-300'
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${getMonthLabel(d.month)}: ${d.count}针`}
                />
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {d.month.split('-')[1]}月
              </span>
            </div>
          );
        })}
      </div>
      {busiestMonth && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-50/60 border border-accent-100">
          <TrendingUp className="w-4 h-4 text-accent-600" />
          <span className="text-sm text-accent-700">
            最忙月份：<span className="font-medium">{getMonthLabel(busiestMonth)}</span>，共{' '}
            {data.find((d) => d.month === busiestMonth)?.count} 针
          </span>
        </div>
      )}
    </div>
  );
}

interface PerChildProgressProps {
  stats: PerChildStat[];
}

export function PerChildProgress({ stats }: PerChildProgressProps) {
  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <p className="text-sm">暂无孩子档案</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats.map((s) => {
        const total = s.total || 1;
        const progress = Math.round((s.completed / total) * 100);
        return (
          <div key={s.childId} className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">{s.childName}</span>
              <span className="text-sm text-slate-500">
                {s.completed}/{s.total} · {progress}%
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="relative flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute inset-y-0 rounded-full bg-danger-400/80 transition-all duration-500"
                  style={{
                    left: `${progress + ((s.pending - s.overdue) / total) * 100}%`,
                    width: `${(s.overdue / total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 pl-1">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500" /> 完成 {s.completed}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-info-400" /> 待处理 {s.pending}
              </span>
              {s.overdue > 0 && (
                <span className="inline-flex items-center gap-1 text-danger-600">
                  <AlertTriangle className="w-3 h-3" /> 逾期 {s.overdue}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
