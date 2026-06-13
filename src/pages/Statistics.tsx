import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
  History,
  Copy,
  CheckCheck,
  ClipboardList,
  AlertCircle,
  BellRing,
} from 'lucide-react';
import { formatDate, daysFromToday } from '@/utils/date';
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
  const hasOriginalDates =
    (v.originalSuggestedDate && v.originalSuggestedDate !== v.suggestedDate) ||
    (v.originalLatestDate && v.originalLatestDate !== v.latestDate);

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
          <p className="text-sm text-slate-600 mb-2">原因：{v.delayedReason}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            建议：{formatDate(v.suggestedDate)}
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-danger-500" />
            最晚：{formatDate(v.latestDate)}
          </span>
        </div>
        {hasOriginalDates && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 flex-wrap">
            <History className="w-3 h-3 mt-0.5 shrink-0" />
            <span>家人对比：</span>
            {v.originalSuggestedDate &&
              v.originalSuggestedDate !== v.suggestedDate && (
                <span className="text-slate-500">
                  原建议
                  <span className="line-through mx-1">{v.originalSuggestedDate}</span>
                  →
                  <span className="text-info-600 font-medium ml-1">
                    {formatDate(v.suggestedDate)}
                  </span>
                </span>
              )}
            {v.originalLatestDate && v.originalLatestDate !== v.latestDate && (
              <span className="text-slate-500">
                原最晚
                <span className="line-through mx-1">{v.originalLatestDate}</span>
                →
                <span className="text-danger-600 font-medium ml-1">
                  {formatDate(v.latestDate)}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface FamilyReminderRowProps {
  v: Vaccine;
  childName?: string;
  site?: string;
  kind: 'overdue' | 'upcoming';
}

function FamilyReminderRow({ v, childName, site, kind }: FamilyReminderRowProps) {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const diff = daysFromToday(v.latestDate);
  const kindLabel = kind === 'overdue' ? `已逾期 ${Math.abs(diff)} 天` : `${daysFromToday(v.suggestedDate) >= 0 ? daysFromToday(v.suggestedDate) + '天后' : '待约'}`;

  const buildText = () => {
    const lines: string[] = [];
    if (childName) lines.push(`【${childName}】${kind === 'overdue' ? '逾期提醒' : '即将接种提醒'}`);
    lines.push(`疫苗：${v.name} 第${v.dose}剂`);
    lines.push(`推荐接种：${formatDate(v.suggestedDate)}`);
    lines.push(`最晚接种：${formatDate(v.latestDate)}`);
    if (site) lines.push(`接种点：${site}`);
    return lines.join('\n');
  };

  const copy = async () => {
    const text = buildText();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setToast(true);
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all">
      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
        kind === 'overdue'
          ? 'bg-danger-100 text-danger-600'
          : 'bg-info-100 text-info-600'
      }`}>
        {kind === 'overdue' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <BellRing className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-800 text-sm">
            {v.name} · 第{v.dose}剂
          </span>
          <span className={`chip text-[11px] ${kind === 'overdue' ? 'bg-danger-50 text-danger-600 border-danger-100' : 'bg-info-50 text-info-600 border-info-100'}`}>
            {kindLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            建议 {formatDate(v.suggestedDate)}
          </span>
          <span className={`flex items-center gap-1 ${kind === 'overdue' ? 'text-danger-600' : ''}`}>
            <AlertTriangle className="w-3 h-3" />
            最晚 {formatDate(v.latestDate)}
          </span>
        </div>
      </div>
      <button
        onClick={copy}
        className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-white group-hover:shadow-sm flex items-center justify-center transition-all"
        title="复制给家人"
      >
        <Copy className="w-4 h-4" />
      </button>
      {toast &&
        createPortal(
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white text-sm shadow-2xl backdrop-blur-md border border-white/10">
              <CheckCheck className="w-4 h-4 text-primary-400" />
              <span>已复制给家人 ✓</span>
            </div>
          </div>,
          document.body,
        )}
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

  // 家庭提醒清单：按孩子分组，逾期 + 未来 30 天待约
  interface ChildReminder {
    childId: string;
    childName: string;
    site?: string;
    overdue: Vaccine[];
    upcoming: Vaccine[];
  }
  const familyReminders = useMemo<ChildReminder[]>(() => {
    const map = new Map<string, ChildReminder>();
    children.forEach((c) => {
      map.set(c.id, {
        childId: c.id,
        childName: c.name,
        site: c.vaccinationSite,
        overdue: [],
        upcoming: [],
      });
    });
    vaccines.forEach((v) => {
      if (v.status === 'completed') return;
      const rem = map.get(v.childId);
      if (!rem) return;
      if (v.status === 'appointed') return;
      const diffLatest = daysFromToday(v.latestDate);
      if (diffLatest < 0) {
        rem.overdue.push(v);
        return;
      }
      const diffSuggest = daysFromToday(v.suggestedDate);
      if (diffSuggest >= 0 && diffSuggest <= 30) {
        rem.upcoming.push(v);
      }
    });
    return Array.from(map.values())
      .filter((r) => r.overdue.length + r.upcoming.length > 0)
      .map((r) => ({
        ...r,
        overdue: [...r.overdue].sort(
          (a, b) => daysFromToday(a.latestDate) - daysFromToday(b.latestDate),
        ),
        upcoming: [...r.upcoming].sort(
          (a, b) => daysFromToday(a.suggestedDate) - daysFromToday(b.suggestedDate),
        ),
      }));
  }, [children, vaccines]);

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

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="section-title !mb-0 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-accent-500" />
            家庭提醒清单
          </h2>
          <span className="text-xs text-slate-400">
            逾期针 + 未来 30 天待约针 · 按孩子分组
          </span>
        </div>
        {familyReminders.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <div className="w-16 h-16 rounded-3xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-sm">太棒了！所有宝贝近期都无需处理</p>
          </div>
        ) : (
          <div className="space-y-6">
            {familyReminders.map((rem) => (
              <div
                key={rem.childId}
                className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/40 p-4 animate-fade-in-up"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 text-white flex items-center justify-center text-sm font-medium">
                      {rem.childName.slice(0, 1)}
                    </div>
                    <span className="font-semibold text-slate-800">
                      {rem.childName}
                    </span>
                    {rem.site && (
                      <span className="chip bg-slate-100 text-slate-500 text-[11px]">
                        接种点：{rem.site}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {rem.overdue.length > 0 && (
                      <span className="chip bg-danger-50 text-danger-600 border-danger-100">
                        逾期 {rem.overdue.length}
                      </span>
                    )}
                    {rem.upcoming.length > 0 && (
                      <span className="chip bg-info-50 text-info-600 border-info-100">
                        即将 {rem.upcoming.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {rem.overdue.map((v) => (
                    <FamilyReminderRow
                      key={v.id}
                      v={v}
                      childName={rem.childName}
                      site={rem.site}
                      kind="overdue"
                    />
                  ))}
                  {rem.upcoming.map((v) => (
                    <FamilyReminderRow
                      key={v.id}
                      v={v}
                      childName={rem.childName}
                      site={rem.site}
                      kind="upcoming"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
