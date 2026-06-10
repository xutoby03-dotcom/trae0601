import { ArrowUpRight, Trophy, Medal, Award } from 'lucide-react';

export interface StatCardData {
  label: string;
  value: number | string;
  icon: typeof ArrowUpRight;
  gradient: string;
  iconBg: string;
  trend?: string;
}

export const StatCard = ({ data }: { data: StatCardData }) => {
  const { label, value, icon: Icon, gradient, iconBg, trend } = data;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-paper-raised bg-gradient-to-br ${gradient} transition-transform duration-300 hover:-translate-y-1 group`}>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-inner`}>
            <Icon className="w-5.5 h-5.5 text-white" strokeWidth={2.2} />
          </div>
          {trend && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
              {trend}
            </span>
          )}
        </div>
        <p className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight mb-1">
          {value}
        </p>
        <p className="text-sm text-white/85 font-medium">{label}</p>
      </div>
    </div>
  );
};

export interface BarChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export const BarChart = ({ data, title }: { data: BarChartData[]; title: string }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="card-paper p-5 md:p-6">
      <h3 className="text-lg font-bold text-wood-800 font-serif mb-5">{title}</h3>
      <div className="space-y-3.5">
        {data.map((item, i) => (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-wood-700 flex items-center gap-2">
                {i < 3 && (
                  <span className="inline-flex w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {i + 1}
                  </span>
                )}
                {item.label}
              </span>
              <span className="text-xs text-wood-600 font-mono tabular-nums">
                <span className="font-bold text-wood-800">{item.value}</span> 热度 · {item.percentage}%
              </span>
            </div>
            <div className="h-7 rounded-lg bg-paper-200 overflow-hidden relative shadow-inner">
              <div
                className={`h-full rounded-lg ${item.color} transition-all duration-700 ease-out flex items-center justify-end pr-3 shadow-md relative group-hover:brightness-105`}
                style={{ width: `${Math.max(item.percentage, 3)}%`, animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="py-12 text-center text-wood-400 text-sm">暂无数据</div>
        )}
      </div>
    </div>
  );
};

export interface RankingRow {
  rank: number;
  name: string;
  primary: number | string;
  secondary?: number | string;
  avatar?: string;
}

export const RankingTable = ({
  title,
  rows,
  primaryLabel,
  secondaryLabel,
}: {
  title: string;
  rows: RankingRow[];
  primaryLabel: string;
  secondaryLabel?: string;
}) => {
  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" fill="currentColor" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-400" fill="currentColor" />;
    if (rank === 3) return <Award className="w-4 h-4 text-amber-600" fill="currentColor" />;
    return <span className="w-4 h-4 text-xs font-bold text-wood-500 inline-flex items-center justify-center">{rank}</span>;
  };

  return (
    <div className="card-paper overflow-hidden">
      <div className="px-5 py-4 border-b border-wood-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-wood-800 font-serif">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-200/50 text-wood-600 text-xs uppercase tracking-wide">
              <th className="text-left py-3 px-5 font-semibold w-14">排名</th>
              <th className="text-left py-3 px-2 font-semibold">用户</th>
              <th className="text-right py-3 px-5 font-semibold">{primaryLabel}</th>
              {secondaryLabel && (
                <th className="text-right py-3 px-5 font-semibold">{secondaryLabel}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.name + row.rank}
                className={`border-t border-wood-50 hover:bg-paper-200/60 transition-colors ${
                  row.rank <= 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : ''
                }`}
              >
                <td className="py-3 px-5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-paper-200">
                    {rankIcon(row.rank)}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-olive to-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {row.avatar || row.name.charAt(0)}
                    </div>
                    <span className="font-medium text-wood-800">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 px-5 text-right">
                  <span className={`font-mono font-bold ${
                    row.rank === 1 ? 'text-accent-brick text-base' : 'text-wood-700'
                  }`}>
                    {row.primary}
                  </span>
                </td>
                {secondaryLabel && (
                  <td className="py-3 px-5 text-right text-wood-600 font-mono">{row.secondary}</td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-wood-400">
                  暂无排行数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
