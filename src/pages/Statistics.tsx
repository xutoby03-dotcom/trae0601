import { useMemo } from 'react';
import {
  BarChart3,
  MapPin,
  FileWarning,
  CloudRain,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  computeStoreStats,
  computeOverdueList,
  computeDamageRate,
  computeRainyDayPeak,
} from '@/utils/statsUtils';
import StoreBarChart from '@/components/charts/StoreBarChart';
import DamageLineChart from '@/components/charts/DamageLineChart';
import PeakBarChart from '@/components/charts/PeakBarChart';
import StatusBadge from '@/components/common/StatusBadge';
import { Link } from 'react-router-dom';
import { formatDateTime } from '@/utils/dateUtils';

export default function Statistics() {
  const storeStats = useMemo(() => computeStoreStats(), []);
  const overdueList = useMemo(() => computeOverdueList().slice(0, 10), []);
  const damageRate = useMemo(() => computeDamageRate(), []);
  const rainyPeak = useMemo(() => computeRainyDayPeak(), []);

  const totals = useMemo(() => {
    return storeStats.reduce(
      (acc, s) => {
        acc.total += s.total;
        acc.available += s.available;
        acc.lent += s.lent;
        acc.damaged += s.damaged;
        return acc;
      },
      { total: 0, available: 0, lent: 0, damaged: 0 }
    );
  }, [storeStats]);

  const avgDamageRate = totals.total > 0
    ? Math.round((totals.damaged / totals.total) * 1000) / 10
    : 0;

  const peakHour = useMemo(() => {
    const byHour = new Map<string, number>();
    for (let h = 6; h <= 22; h++) {
      byHour.set(h.toString().padStart(2, '0') + ':00', 0);
    }
    rainyPeak
      .filter((x) => x.isRainyDay)
      .forEach((x) => {
        if (byHour.has(x.hour)) byHour.set(x.hour, (byHour.get(x.hour) ?? 0) + x.count);
      });
    let max = { hour: '06:00', count: 0 };
    byHour.forEach((c, h) => {
      if (c > max.count) max = { hour: h, count: c };
    });
    return max;
  }, [rainyPeak]);

  return (
    <div className="space-y-6 animate-fadeInUp max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif-sc text-2xl font-bold text-slate-900">统计分析</h1>
            <p className="mt-0.5 text-sm text-slate-500">全部门店雨伞运营数据概览</p>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          数据更新于 {formatDateTime(new Date().toISOString())}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewTile
          icon={<MapPin className="h-5 w-5" />}
          label="门店覆盖"
          value={storeStats.length}
          unit="家"
          sub={`雨伞总数 ${totals.total} 把`}
          color="from-teal-500 to-teal-700"
          tone="teal"
        />
        <OverviewTile
          icon={<TrendingUp className="h-5 w-5" />}
          label="整体破损率"
          value={avgDamageRate}
          unit="%"
          sub={`破损 ${totals.damaged} / 总计 ${totals.total}`}
          color="from-rose-500 to-rose-700"
          tone="rose"
        />
        <OverviewTile
          icon={<AlertTriangle className="h-5 w-5" />}
          label="逾期雨伞数"
          value={overdueList.length}
          unit="把"
          sub={`严重逾期 ${overdueList.filter((x) => x.overdueDays >= 7).length} 把`}
          color="from-orange-500 to-orange-700"
          tone="orange"
        />
        <OverviewTile
          icon={<CloudRain className="h-5 w-5" />}
          label="雨天峰值时段"
          value={peakHour.hour}
          unit=""
          sub={`平均 ${peakHour.count} 把/小时`}
          color="from-sky-500 to-sky-700"
          tone="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 animate-fadeInUp">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif-sc text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" /> 各门店库存分布
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">可借 / 借出中 / 破损待修 数量对比</p>
            </div>
            <Link to="/umbrellas" className="inline-flex items-center gap-0.5 text-xs text-teal-600 hover:underline">
              查看档案 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <StoreBarChart data={storeStats} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-fadeInUp">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif-sc text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" /> 逾期 TOP 10
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">按逾期天数降序</p>
            </div>
            <Link to="/overdue" className="inline-flex items-center gap-0.5 text-xs text-orange-600 hover:underline">
              完整清单 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
            {overdueList.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">暂无逾期记录</div>
            ) : (
              overdueList.map((x, idx) => (
                <div
                  key={x.lendRecordId}
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors animate-fadeInUp"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="relative">
                    <img
                      src={x.umbrellaPhoto}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {x.umbrellaCode}
                      </span>
                      <StatusBadge status="lent" size="sm" />
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500 truncate">
                      尾号 {x.phoneLast4} · {x.lentStoreName}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-orange-600">{x.overdueDays}天</div>
                    <div className="text-[10px] text-slate-400">逾期</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-fadeInUp">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif-sc text-base font-bold text-slate-900 flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-rose-600" /> 月度破损率趋势
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">破损数量 / 归还总数量 百分比</p>
            </div>
          </div>
          <DamageLineChart data={damageRate} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-fadeInUp">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif-sc text-base font-bold text-slate-900 flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-sky-600" /> 雨天借伞时段峰值
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">雨天 vs 平日 借伞数量对比</p>
            </div>
          </div>
          <PeakBarChart data={rainyPeak} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-fadeInUp">
        <div className="mb-4">
          <h2 className="font-serif-sc text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600" /> 门店明细
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">各门店雨伞库存及状态详情</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">门店</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">总数</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">可借</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">借出中</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">破损</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">可用率</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">库存状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {storeStats.map((s, idx) => {
                const availableRate = s.total > 0 ? Math.round((s.available / s.total) * 100) : 0;
                const risk = s.available === 0 ? 'low' : availableRate >= 50 ? 'good' : 'warn';
                return (
                  <tr key={s.storeId} className="hover:bg-slate-50/60 transition-colors animate-fadeInUp" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-900">{s.storeName}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-800">{s.total}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-emerald-700">{s.available}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm text-sky-700">{s.lent}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm text-orange-700">{s.damaged}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-800">{availableRate}%</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div className="flex h-full">
                            <div className="bg-emerald-500" style={{ width: `${(s.available / (s.total || 1)) * 100}%` }} />
                            <div className="bg-sky-500" style={{ width: `${(s.lent / (s.total || 1)) * 100}%` }} />
                            <div className="bg-orange-500" style={{ width: `${(s.damaged / (s.total || 1)) * 100}%` }} />
                          </div>
                        </div>
                        <span className={
                          risk === 'good' ? 'text-xs font-medium text-emerald-700' :
                          risk === 'warn' ? 'text-xs font-medium text-amber-700' :
                          'text-xs font-medium text-rose-700'
                        }>
                          {risk === 'good' ? '充足' : risk === 'warn' ? '偏少' : '告急'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OverviewTile({
  icon, label, value, unit, sub, color, tone,
}: {
  icon: React.ReactNode; label: string; value: number | string; unit: string;
  sub: string; color: string; tone: 'teal' | 'rose' | 'orange' | 'sky';
}) {
  const toneText = {
    teal: 'text-teal-600',
    rose: 'text-rose-600',
    orange: 'text-orange-600',
    sky: 'text-sky-600',
  }[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 card-hover animate-fadeInUp">
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl`} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <div className={`font-serif-sc text-4xl font-bold ${toneText}`}>{value}</div>
            <div className={`text-base font-medium ${toneText} opacity-80`}>{unit}</div>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">{sub}</div>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
