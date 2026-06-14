import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Umbrella,
  ArrowRightLeft,
  Undo2,
  AlertTriangle,
  Plus,
  ArrowRightLeft as SwapIcon,
  RotateCcw,
  FileWarning,
  History,
  BarChart3,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { computeDashboardStats, computeRecentActivities } from '@/utils/statsUtils';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import type { RecentActivity } from '@/types';

const typeIcon: Record<RecentActivity['type'], typeof SwapIcon> = {
  lend: ArrowRightLeft,
  return: Undo2,
  overdue: AlertTriangle,
  damage: FileWarning,
};
const typeColor: Record<RecentActivity['type'], string> = {
  lend: 'bg-sky-100 text-sky-600',
  return: 'bg-emerald-100 text-emerald-600',
  overdue: 'bg-orange-100 text-orange-600',
  damage: 'bg-rose-100 text-rose-600',
};

export default function Dashboard() {
  const stores = useUmbrellaStore((s) => s.stores);
  const stats = useMemo(() => computeDashboardStats(), []);
  const activities = useMemo(() => computeRecentActivities(), []);

  const quickActions = [
    { to: '/lend', icon: SwapIcon, label: '雨伞借出', desc: '选择雨伞并登记', color: 'from-teal-500 to-teal-700' },
    { to: '/return', icon: RotateCcw, label: '雨伞归还', desc: '扫码归还并质检', color: 'from-sky-500 to-sky-700' },
    { to: '/umbrellas/new', icon: Plus, label: '新增档案', desc: '雨伞入库建档', color: 'from-violet-500 to-violet-700' },
    { to: '/overdue', icon: FileWarning, label: '逾期清单', desc: `${stats.overdue} 把待提醒`, color: 'from-orange-500 to-orange-700' },
  ];

  return (
    <div className="space-y-7">
      <div className="animate-fadeInUp">
        <h1 className="font-serif-sc text-3xl font-bold text-slate-900">
          欢迎回来，李明
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          · 全部门店共 {stores.length} 家
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 animate-fadeInUp">
        <StatCard
          label="可借雨伞"
          value={stats.available}
          total={stats.total}
          gradient="bg-gradient-to-br from-teal-600 to-teal-800"
          icon={<Umbrella className="h-5 w-5" />}
          trend={{ dir: 'up', text: '较昨日 +3' }}
        />
        <StatCard
          label="借出中"
          value={stats.lent}
          gradient="bg-gradient-to-br from-sky-600 to-sky-800"
          icon={<ArrowRightLeft className="h-5 w-5" />}
          trend={{ dir: 'flat', text: '今日借出 8' }}
        />
        <StatCard
          label="逾期未还"
          value={stats.overdue}
          gradient="bg-gradient-to-br from-orange-500 to-orange-700"
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{ dir: 'up', text: '较昨日 +1' }}
        />
        <StatCard
          label="破损待修"
          value={stats.damaged}
          gradient="bg-gradient-to-br from-rose-500 to-rose-700"
          icon={<FileWarning className="h-5 w-5" />}
          trend={{ dir: 'down', text: '本周修复 2' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="animate-fadeInUp">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              快捷操作
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map(({ to, icon: Icon, label, desc, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 card-hover animate-fadeInUp"
                >
                  <div
                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
                  />
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4">
                    <div className="font-serif-sc text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {label}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{desc}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal-600 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    立即处理 <ArrowRightLeft className="h-3.5 w-3.5 rotate-[-45deg]" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="animate-fadeInUp">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <History className="h-5 w-5 text-teal-600" />
              最近动态
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
              {activities.map((a, idx) => {
                const Icon = typeIcon[a.type];
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-4 p-4 hover:bg-slate-50/60 transition-colors animate-fadeInUp"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeColor[a.type]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {a.umbrellaCode}
                        </span>
                      </div>
                      <div className="mt-0.5 text-sm text-slate-600">{a.description}</div>
                    </div>
                    <div className="shrink-0 text-xs text-slate-400">{a.time}</div>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">暂无动态</div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 animate-fadeInUp">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <Umbrella className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">今日借伞提示</div>
                <div className="text-xs text-slate-500">气象预报今日有小雨</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-xl bg-gradient-to-br from-sky-50 to-teal-50 p-4 text-sm">
              <div className="flex items-center gap-2 text-sky-800">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                今日预计借伞量比平日高 40%
              </div>
              <div className="flex items-center gap-2 text-teal-800">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                建议提前备足 10 把应急雨伞
              </div>
              <div className="flex items-center gap-2 text-orange-800">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                17-19 点为借伞高峰时段
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-sc text-base font-semibold text-slate-900">门店概览</h3>
              <Link to="/statistics" className="text-xs text-teal-600 hover:underline">
                查看详情
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {stores.slice(0, 4).map((s, idx) => {
                const percent = 50 + idx * 10;
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-slate-700 max-w-[60%]">{s.name}</span>
                      <span className="font-mono text-slate-500">{percent}% 可用</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
