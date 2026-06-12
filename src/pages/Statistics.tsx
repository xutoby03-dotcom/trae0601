import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MonthlyChart, PerChildProgress } from '@/components/statistics/Charts';
import {
  BarChart3,
  TrendingUp,
  Syringe,
  AlertTriangle,
  Clock,
  CalendarCheck,
  CheckCircle,
  Users,
  Calendar,
  FileWarning,
} from 'lucide-react';
import { formatDate } from '@/utils/date';
import type { Vaccine } from '@/types';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  bg: string;
}

function StatCard({ label, value, sub, icon: Icon, bg }: StatCardProps) {
  return (
    <div className="card p-5 relative overflow-hidden animate-fade-in-up">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${bg} opacity-10 -translate-y-10 translate-x-10`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center text-white shadow-soft`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
    </div>
  );
}

interface DelayedRowProps {
  v: Vaccine;
  childName?: string;
}

function DelayedRow({ v, childName }: DelayedRowProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-danger-200 hover:bg-danger-50/30 transition-all">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center">
        <FileWarning className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-slate-800">
            {v.name} 第{v.dose}剂
          </span>
          {childName && (
            <span className="chip bg-slate-100 text-slate-600">{childName}</span>
          )}
          <span className="chip bg-danger-50 text-danger-600 border border-danger-100">
            延期 {v.delayedCount} 次
          </span>
        </div>
        {v.delayedReason && (
          <p className="text-sm text-slate-600 mb-1">原因：{v.delayedReason}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            建议：{formatDate(v.suggestedDate)}
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-danger-500" />
            最晚：{formatDate(v.latestDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Statistics() {
  const initialize = useAppStore((s) => s.initialize);
  const getStatistics = useAppStore((s) => s.getStatistics);
  const vaccines = useAppStore((s) => s.vaccines);
  const children = useAppStore((s) => s.children);
  const getChildById = useAppStore((s) => s.getChildById);
  const updateVaccineStatus = useAppStore((s) => s.updateVaccineStatus);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    updateVaccineStatus();
  }, [updateVaccineStatus, initialize]);

  const stats = useMemo(
    () => getStatistics(),
    [getStatistics, vaccines, children],
  );

  const completionRate =
    stats.totalVaccines > 0
      ? Math.round((stats.completedVaccines / stats.totalVaccines) * 100)
      : 0;

  // 疫苗分类统计
  const vaccineTypeStats = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; name: string }>();
    vaccines.forEach((v) => {
      const key = v.name;
      const cur = map.get(key) || { total: 0, completed: 0, name: key };
      cur.total++;
      if (v.status === 'completed') cur.completed++;
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [vaccines]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl text-slate-800 mb-1 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          数据统计
        </h1>
        <p className="text-sm text-slate-500">全面掌握疫苗接种进度和趋势</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="孩子总数"
          value={stats.totalChildren}
          sub="位宝贝"
          icon={Users}
          bg="from-sky-400 to-sky-500"
        />
        <StatCard
          label="已完成接种"
          value={stats.completedVaccines}
          sub="针"
          icon={CheckCircle}
          bg="from-primary-400 to-primary-500"
        />
        <StatCard
          label="待预约"
          value={stats.pendingVaccines}
          sub="针"
          icon={Clock}
          bg="from-info-400 to-info-500"
        />
        <StatCard
          label="已逾期"
          value={stats.overdueVaccines}
          sub="针"
          icon={AlertTriangle}
          bg="from-danger-400 to-danger-500"
        />
        <StatCard
          label="总完成率"
          value={`${completionRate}%`}
          sub={`共 ${stats.totalVaccines} 针`}
          icon={TrendingUp}
          bg="from-violet-400 to-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-accent-500" />
                月度接种分布
              </h2>
              <span className="text-xs text-slate-400">最近 12 个月</span>
            </div>
            <MonthlyChart
              data={stats.monthlyDistribution}
              busiestMonth={stats.busiestMonth}
            />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-primary-500" />
                疫苗类型统计
              </h2>
              <span className="text-xs text-slate-400">
                共 {vaccineTypeStats.length} 种疫苗
              </span>
            </div>
            {vaccineTypeStats.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">暂无疫苗数据</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {vaccineTypeStats.map((t) => {
                  const pct = Math.round((t.completed / t.total) * 100);
                  return (
                    <div key={t.name} className="animate-fade-in-up">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">{t.name}</span>
                        <span className="text-sm text-slate-500">
                          {t.completed}/{t.total} 完成 · {pct}%
                        </span>
                      </div>
                      <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="section-title !mb-4">每位宝贝进度</h2>
            <PerChildProgress stats={stats.perChildStats} />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger-500" />
                延期接种记录
              </h2>
              <span className="text-xs text-slate-400">
                共 {stats.delayedVaccines.length} 条
              </span>
            </div>
            {stats.delayedVaccines.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-primary-400" />
                </div>
                <p className="text-sm">太棒了！没有延期记录</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {stats.delayedVaccines.map((v) => (
                  <DelayedRow
                    key={v.id}
                    v={v}
                    childName={getChildById(v.childId)?.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
