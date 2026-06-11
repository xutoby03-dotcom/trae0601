import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  AlertOctagon,
  Baby,
  ShieldAlert,
  Clock,
  Search,
  PhoneOff,
} from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import StrollerCard from '@/components/StrollerCard';
import StrollerForm from '@/components/StrollerForm';
import PatrolModal from '@/components/PatrolModal';
import StrollerDetail from '@/components/StrollerDetail';
import { useStrollerStore } from '@/store/useStrollerStore';
import { sortStrollersByPriority, cn } from '@/utils/helpers';

export default function DashboardPage() {
  const {
    getFilteredStrollers,
    getTotalStats,
    getFireExitBlockingCount,
    setActiveForm,
    filters,
  } = useStrollerStore();

  const stats = getTotalStats();
  const fireBlocking = getFireExitBlockingCount();

  const filteredStrollers = useMemo(() => {
    return sortStrollersByPriority(getFilteredStrollers());
  }, [getFilteredStrollers]);

  const hasActiveFilters =
    filters.building !== 'all' || filters.location !== 'all' || filters.status !== 'all';

  return (
    <div className="min-h-screen pb-32">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent pb-4 pt-1">
        <div className="container">
          <header className="flex flex-wrap items-center justify-between gap-4 py-5 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">大厅婴儿车管理</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  共登记 <span className="font-semibold text-brand-700">{stats.total}</span> 辆 ·
                  最后巡查时间由每条记录独立显示
                </p>
              </div>
            </div>
            <Link to="/stats" className="btn-secondary group">
              <BarChart3 className="w-4 h-4 transition-transform group-hover:rotate-6" />
              月度统计看板
            </Link>
          </header>

          {(fireBlocking > 0 || stats.blocking > 0) && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20 animate-fade-in-up">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      消防通道紧急警示：{fireBlocking} 辆车占道挡门！
                    </div>
                    <div className="text-sm text-white/80">
                      另有 {stats.blocking - fireBlocking} 辆在其他位置挡路，请优先处理
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span className="text-sm font-medium">已置顶显示</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <StatCard
              label="登记总数"
              value={stats.total}
              icon={<Baby className="w-5 h-5" />}
              color="brand"
              delay={0}
            />
            <StatCard
              label="挡路占道"
              value={stats.blocking}
              icon={<AlertOctagon className="w-5 h-5" />}
              color="red"
              delay={60}
              highlight={stats.blocking > 0}
            />
            <StatCard
              label="待联系"
              value={stats.pending}
              icon={<PhoneOff className="w-5 h-5" />}
              color="amber"
              delay={120}
            />
            <StatCard
              label="消防通道"
              value={stats.fireExit}
              icon={<ShieldAlert className="w-5 h-5" />}
              color="orange"
              delay={180}
              highlight={stats.fireExit > 0}
            />
            <StatCard
              label="长期未认领"
              value={stats.unclaimed}
              icon={<Clock className="w-5 h-5" />}
              color="purple"
              delay={240}
              highlight={stats.unclaimed > 0}
            />
          </div>
        </div>
      </div>

      <div className="container space-y-5">
        <FilterBar />

        {hasActiveFilters && (
          <div className="text-sm text-slate-500 animate-fade-in-up">
            <Search className="inline w-4 h-4 mr-1.5 -mt-0.5" />
            筛选结果：共 <span className="font-semibold text-slate-700">{filteredStrollers.length}</span> 辆车
            {filters.building !== 'all' && (
              <span className="ml-2 text-brand-700">· {filters.building}</span>
            )}
            {filters.location !== 'all' && (
              <span className="ml-2 text-brand-700">· {filters.location}</span>
            )}
            {filters.status !== 'all' && (
              <span className="ml-2 text-brand-700">· 状态筛选已启用</span>
            )}
          </div>
        )}

        {filteredStrollers.length === 0 ? (
          <div className="card p-16 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Baby className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              {hasActiveFilters ? '没有符合条件的车辆' : '暂无登记车辆'}
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              {hasActiveFilters ? '请尝试调整筛选条件' : '点击右下角「登记新车」开始录入信息'}
            </p>
            {!hasActiveFilters && (
              <button onClick={() => setActiveForm('')} className="btn-primary">
                <Plus className="w-4 h-4" />
                立即登记第一辆车
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredStrollers.map((s, i) => (
              <StrollerCard key={s.id} stroller={s} index={i} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setActiveForm('')}
        className="fixed bottom-8 right-8 z-40 group"
      >
        <div className="flex items-center gap-2 px-5 py-4 rounded-full bg-brand-700 text-white shadow-2xl shadow-brand-700/40 hover:shadow-brand-700/60 hover:bg-brand-800 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="font-medium">登记新车</span>
        </div>
      </button>

      <StrollerForm />
      <PatrolModal />
      <StrollerDetail />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  delay = 0,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'brand' | 'red' | 'amber' | 'orange' | 'purple';
  delay?: number;
  highlight?: boolean;
}) {
  const colorMap = {
    brand: {
      icon: 'bg-brand-50 text-brand-600',
      value: 'text-brand-700',
      border: highlight ? 'border-brand-300 ring-2 ring-brand-100' : 'border-slate-100',
    },
    red: {
      icon: 'bg-red-50 text-red-600',
      value: 'text-red-600',
      border: highlight ? 'border-red-300 ring-2 ring-red-100 animate-pulse' : 'border-slate-100',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-600',
      value: 'text-amber-700',
      border: highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100',
    },
    orange: {
      icon: 'bg-orange-50 text-orange-600',
      value: 'text-orange-600',
      border: highlight ? 'border-orange-300 ring-2 ring-orange-100 animate-pulse' : 'border-slate-100',
    },
    purple: {
      icon: 'bg-purple-50 text-purple-600',
      value: 'text-purple-700',
      border: highlight ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-100',
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={cn(
        'card p-4 animate-fade-in-up border-2',
        c.border
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', c.icon)}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className={cn('text-2xl font-bold leading-tight', c.value)}>{value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  );
}
